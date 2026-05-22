import { eq, and, desc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, agents, tickets, type Ticket, type Agent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ AGENTS ============

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).orderBy(agents.name);
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ TICKETS ============

export async function createTicket(data: {
  title: string;
  description: string;
  client: string;
  priority: "Bajo" | "Medio" | "Alto" | "Crítico";
  assignedAgentId?: number;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tickets).values({
    title: data.title,
    description: data.description,
    client: data.client,
    priority: data.priority,
    state: "Abierto",
    assignedAgentId: data.assignedAgentId,
    createdBy: data.createdBy,
  });

  const ticketId = result[0].insertId;
  return getTicketById(ticketId);
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByState(state: "Abierto" | "En progreso" | "Resuelto") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.state, state)).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByPriority(priority: "Bajo" | "Medio" | "Alto" | "Crítico") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.priority, priority)).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByClient(client: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.client, client)).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByAgent(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.assignedAgentId, agentId)).orderBy(desc(tickets.createdAt));
}

export async function updateTicketState(
  id: number,
  newState: "Abierto" | "En progreso" | "Resuelto"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const ticket = await getTicketById(id);
  if (!ticket) throw new Error("Ticket not found");

  // Validate state transition
  const validTransitions: Record<string, string[]> = {
    "Abierto": ["En progreso"],
    "En progreso": ["Resuelto"],
    "Resuelto": [], // No transitions allowed
  };

  if (!validTransitions[ticket.state]?.includes(newState)) {
    throw new Error(
      `Cannot transition from ${ticket.state} to ${newState}. Valid transitions: ${validTransitions[ticket.state]?.join(", ") || "none"}`
    );
  }

  const updateData: Record<string, unknown> = { state: newState };
  if (newState === "Resuelto") {
    updateData.resolvedAt = new Date();
  }

  await db.update(tickets).set(updateData).where(eq(tickets.id, id));
  return getTicketById(id);
}

export async function updateTicket(
  id: number,
  data: {
    title?: string;
    description?: string;
    client?: string;
    priority?: "Bajo" | "Medio" | "Alto" | "Crítico";
    assignedAgentId?: number | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const ticket = await getTicketById(id);
  if (!ticket) throw new Error("Ticket not found");

  // Prevent modifications to resolved tickets
  if (ticket.state === "Resuelto") {
    throw new Error("Cannot modify a resolved ticket");
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.client !== undefined) updateData.client = data.client;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.assignedAgentId !== undefined) updateData.assignedAgentId = data.assignedAgentId;

  await db.update(tickets).set(updateData).where(eq(tickets.id, id));
  return getTicketById(id);
}

export async function deleteTicket(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const ticket = await getTicketById(id);
  if (!ticket) throw new Error("Ticket not found");

  // Only allow deletion of open tickets
  if (ticket.state !== "Abierto") {
    throw new Error("Can only delete tickets in Abierto state");
  }

  await db.delete(tickets).where(eq(tickets.id, id));
  return { success: true };
}

export async function getTicketsSummary() {
  const db = await getDb();
  if (!db) return { Abierto: 0, "En progreso": 0, Resuelto: 0 };

  const allTickets = await db.select().from(tickets);

  return {
    Abierto: allTickets.filter((t) => t.state === "Abierto").length,
    "En progreso": allTickets.filter((t) => t.state === "En progreso").length,
    Resuelto: allTickets.filter((t) => t.state === "Resuelto").length,
  };
}

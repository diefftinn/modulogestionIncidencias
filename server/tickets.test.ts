import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("tickets", () => {
  describe("create", () => {
    it("should create a ticket with valid data", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tickets.create({
        title: "Test Ticket",
        description: "This is a test ticket",
        client: "Test Client",
        priority: "Alto",
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe("Test Ticket");
      expect(result?.state).toBe("Abierto");
      expect(result?.priority).toBe("Alto");
    });

    it("should fail without title", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.tickets.create({
          title: "",
          description: "This is a test ticket",
          client: "Test Client",
          priority: "Alto",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Title is required");
      }
    });

    it("should fail without client", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.tickets.create({
          title: "Test Ticket",
          description: "This is a test ticket",
          client: "",
          priority: "Alto",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Client is required");
      }
    });

    it("should fail without priority", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.tickets.create({
          title: "Test Ticket",
          description: "This is a test ticket",
          client: "Test Client",
          priority: "InvalidPriority" as any,
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("list", () => {
    it("should return a list of tickets", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.tickets.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("summary", () => {
    it("should return ticket counts by state", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.tickets.summary();

      expect(result).toHaveProperty("Abierto");
      expect(result).toHaveProperty("En progreso");
      expect(result).toHaveProperty("Resuelto");
      expect(typeof result.Abierto).toBe("number");
      expect(typeof result["En progreso"]).toBe("number");
      expect(typeof result.Resuelto).toBe("number");
    });
  });

  describe("updateState", () => {
    it("should transition from Abierto to En progreso", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a ticket
      const ticket = await caller.tickets.create({
        title: "Test Ticket",
        description: "This is a test ticket",
        client: "Test Client",
        priority: "Alto",
      });

      if (!ticket?.id) throw new Error("Failed to create ticket");

      // Update state
      const updated = await caller.tickets.updateState({
        id: ticket.id,
        newState: "En progreso",
      });

      expect(updated?.state).toBe("En progreso");
    });

    it("should fail to transition from Resuelto", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create and resolve a ticket
      const ticket = await caller.tickets.create({
        title: "Test Ticket",
        description: "This is a test ticket",
        client: "Test Client",
        priority: "Alto",
      });

      if (!ticket?.id) throw new Error("Failed to create ticket");

      await caller.tickets.updateState({
        id: ticket.id,
        newState: "En progreso",
      });

      await caller.tickets.updateState({
        id: ticket.id,
        newState: "Resuelto",
      });

      // Try to transition from Resuelto
      try {
        await caller.tickets.updateState({
          id: ticket.id,
          newState: "Abierto",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Cannot transition");
      }
    });
  });

  describe("delete", () => {
    it("should delete a ticket in Abierto state", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const ticket = await caller.tickets.create({
        title: "Test Ticket",
        description: "This is a test ticket",
        client: "Test Client",
        priority: "Alto",
      });

      if (!ticket?.id) throw new Error("Failed to create ticket");

      const result = await caller.tickets.delete({ id: ticket.id });
      expect(result.success).toBe(true);
    });

    it("should fail to delete a ticket not in Abierto state", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const ticket = await caller.tickets.create({
        title: "Test Ticket",
        description: "This is a test ticket",
        client: "Test Client",
        priority: "Alto",
      });

      if (!ticket?.id) throw new Error("Failed to create ticket");

      // Move to En progreso
      await caller.tickets.updateState({
        id: ticket.id,
        newState: "En progreso",
      });

      // Try to delete
      try {
        await caller.tickets.delete({ id: ticket.id });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Can only delete tickets in Abierto state");
      }
    });
  });
});

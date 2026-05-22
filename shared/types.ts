// Ticket types
export interface Ticket {
  id: number;
  title: string;
  description: string;
  client: string;
  priority: "Bajo" | "Medio" | "Alto" | "Crítico";
  state: "Abierto" | "En progreso" | "Resuelto";
  assignedAgentId: number | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  status: "available" | "busy" | "offline";
  createdAt: Date;
  updatedAt: Date;
}

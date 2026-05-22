import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createTicket,
  getTicketById,
  getAllTickets,
  getTicketsByState,
  getTicketsByPriority,
  getTicketsByClient,
  getTicketsByAgent,
  updateTicketState,
  updateTicket,
  deleteTicket,
  getTicketsSummary,
  getAllAgents,
  getAgentById,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ AGENTS ============
  agents: router({
    list: publicProcedure.query(async () => {
      return getAllAgents();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getAgentById(input.id);
    }),
  }),

  // ============ TICKETS ============
  tickets: router({
    // Create a new ticket
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1, "Title is required"),
          description: z.string().min(1, "Description is required"),
          client: z.string().min(1, "Client is required"),
          priority: z.enum(["Bajo", "Medio", "Alto", "Crítico"]),
          assignedAgentId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createTicket({
          title: input.title,
          description: input.description,
          client: input.client,
          priority: input.priority,
          assignedAgentId: input.assignedAgentId,
          createdBy: ctx.user.id,
        });
      }),

    // Get all tickets
    list: publicProcedure.query(async () => {
      return getAllTickets();
    }),

    // Get ticket by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getTicketById(input.id);
      }),

    // Get tickets by state
    getByState: publicProcedure
      .input(z.object({ state: z.enum(["Abierto", "En progreso", "Resuelto"]) }))
      .query(async ({ input }) => {
        return getTicketsByState(input.state);
      }),

    // Get tickets by priority
    getByPriority: publicProcedure
      .input(z.object({ priority: z.enum(["Bajo", "Medio", "Alto", "Crítico"]) }))
      .query(async ({ input }) => {
        return getTicketsByPriority(input.priority);
      }),

    // Get tickets by client
    getByClient: publicProcedure
      .input(z.object({ client: z.string() }))
      .query(async ({ input }) => {
        return getTicketsByClient(input.client);
      }),

    // Get tickets assigned to agent
    getByAgent: publicProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return getTicketsByAgent(input.agentId);
      }),

    // Update ticket state (Abierto → En progreso → Resuelto)
    updateState: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          newState: z.enum(["Abierto", "En progreso", "Resuelto"]),
        })
      )
      .mutation(async ({ input }) => {
        return updateTicketState(input.id, input.newState);
      }),

    // Update ticket details (only if not resolved)
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          client: z.string().optional(),
          priority: z.enum(["Bajo", "Medio", "Alto", "Crítico"]).optional(),
          assignedAgentId: z.number().optional().nullable(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        return updateTicket(id, updateData);
      }),

    // Delete ticket (only if in Abierto state)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteTicket(input.id);
      }),

    // Get summary of tickets by state
    summary: publicProcedure.query(async () => {
      return getTicketsSummary();
    }),
  }),
});

export type AppRouter = typeof appRouter;

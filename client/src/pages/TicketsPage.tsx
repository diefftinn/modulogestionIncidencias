import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { TicketForm } from "@/components/tickets/TicketForm";
import { TicketTable } from "@/components/tickets/TicketTable";
import { TicketSummary } from "@/components/tickets/TicketSummary";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TicketsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState({
    state: undefined as string | undefined,
    priority: undefined as string | undefined,
    client: undefined as string | undefined,
  });

  const { data: tickets = [], isLoading, error: ticketsError, refetch } = trpc.tickets.list.useQuery();
  const { data: summary = { Abierto: 0, "En progreso": 0, Resuelto: 0 }, error: summaryError } =
    trpc.tickets.summary.useQuery();

  // Extract unique clients from tickets
  const uniqueClients = useMemo(() => {
    const clients = new Set(tickets.map((t) => t.client));
    return Array.from(clients).sort();
  }, [tickets]);

  // Filter tickets based on selected filters
  const filteredTickets = tickets.filter((ticket) => {
    if (filters.state && ticket.state !== filters.state) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.client && ticket.client !== filters.client) return false;
    return true;
  });

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Incidencias</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra y da seguimiento a todos los tickets de soporte técnico
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Nuevo Ticket
          </Button>
        </div>

        {/* Error Alerts */}
        {ticketsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar los tickets. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        )}

        {summaryError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar el resumen. Por favor, intenta de nuevo.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <TicketSummary summary={summary} />

        {/* Filters */}
        <TicketFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          clients={uniqueClients}
        />

        {/* Tickets Table */}
        <TicketTable
          tickets={filteredTickets}
          isLoading={isLoading}
          onRefresh={refetch}
        />
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Ticket</DialogTitle>
          </DialogHeader>
          <TicketForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

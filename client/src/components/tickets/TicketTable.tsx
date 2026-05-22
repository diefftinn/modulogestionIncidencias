import { useState } from "react";
import { type Ticket } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TicketDetail } from "./TicketDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Trash2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TicketTableProps {
  tickets: Ticket[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const priorityColors: Record<string, string> = {
  Bajo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Medio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Alto: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Crítico: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const stateColors: Record<string, string> = {
  Abierto: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "En progreso": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Resuelto: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function TicketTable({ tickets, isLoading, onRefresh }: TicketTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const deleteMutation = trpc.tickets.delete.useMutation();
  const updateStateMutation = trpc.tickets.updateState.useMutation();

  const handleViewDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (ticket: Ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: ticketToDelete.id });
      toast.success("Ticket eliminado exitosamente");
      setIsDeleteOpen(false);
      setTicketToDelete(null);
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el ticket");
    }
  };

  const handleNextState = async (ticket: Ticket) => {
    const nextStates: Record<string, string> = {
      Abierto: "En progreso",
      "En progreso": "Resuelto",
      Resuelto: "Resuelto",
    };

    const newState = nextStates[ticket.state];
    if (newState === ticket.state) {
      toast.info("Este ticket ya está resuelto");
      return;
    }

    try {
      await updateStateMutation.mutateAsync({
        id: ticket.id,
        newState: newState as any,
      });
      toast.success(`Ticket movido a ${newState}`);
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el estado");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-12 text-center">
        <p className="text-muted-foreground">No hay tickets que coincidan con los filtros</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">#{ticket.id}</TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {ticket.title}
                </TableCell>
                <TableCell className="text-sm">{ticket.client}</TableCell>
                <TableCell>
                  <Badge className={priorityColors[ticket.priority]}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={stateColors[ticket.state]}>
                    {ticket.state}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(ticket)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {ticket.state !== "Resuelto" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNextState(ticket)}
                        title="Avanzar estado"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}

                    {ticket.state === "Abierto" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(ticket)}
                        className="text-destructive hover:text-destructive"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Ticket</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <TicketDetail ticket={selectedTicket} onClose={() => setIsDetailOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Solo se pueden eliminar tickets en estado Abierto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-3 rounded text-sm">
            <p className="font-medium">{ticketToDelete?.title}</p>
            <p className="text-muted-foreground">Cliente: {ticketToDelete?.client}</p>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

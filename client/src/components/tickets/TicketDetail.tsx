import { type Ticket } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface TicketDetailProps {
  ticket: Ticket;
  onClose?: () => void;
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

export function TicketDetail({ ticket, onClose }: TicketDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateStateMutation = trpc.tickets.updateState.useMutation();

  const handleNextState = async () => {
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

    setIsUpdating(true);
    try {
      await updateStateMutation.mutateAsync({
        id: ticket.id,
        newState: newState as any,
      });
      toast.success(`Ticket movido a ${newState}`);
      onClose?.();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el estado");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">ID del Ticket</p>
          <p className="font-mono text-lg font-semibold">#{ticket.id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Creado</p>
          <p className="text-lg font-semibold">
            {format(new Date(ticket.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <p className="text-sm text-muted-foreground">Título</p>
        <p className="text-xl font-semibold">{ticket.title}</p>
      </div>

      {/* Description */}
      <div>
        <p className="text-sm text-muted-foreground">Descripción</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg">
          {ticket.description}
        </p>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{ticket.client}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={priorityColors[ticket.priority]}>
              {ticket.priority}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={stateColors[ticket.state]}>
              {ticket.state}
            </Badge>
          </CardContent>
        </Card>

        {ticket.resolvedAt && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resuelto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {format(new Date(ticket.resolvedAt), "dd MMM yyyy, HH:mm", { locale: es })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      {ticket.state !== "Resuelto" && (
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleNextState}
            disabled={isUpdating}
            className="gap-2"
          >
            <ChevronRight className="h-4 w-4" />
            Avanzar a {ticket.state === "Abierto" ? "En progreso" : "Resuelto"}
          </Button>
        </div>
      )}

      {ticket.state === "Resuelto" && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Este ticket está resuelto y no puede ser modificado.
          </p>
        </div>
      )}
    </div>
  );
}

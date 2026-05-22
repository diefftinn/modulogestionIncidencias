import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface TicketFiltersProps {
  filters: {
    state?: string;
    priority?: string;
    client?: string;
  };
  onFiltersChange: (filters: any) => void;
  clients?: string[];
}

export function TicketFilters({ filters, onFiltersChange, clients = [] }: TicketFiltersProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v);

  const handleStateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      state: value === "all" ? undefined : value,
    });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === "all" ? undefined : value,
    });
  };

  const handleClientChange = (value: string) => {
    onFiltersChange({
      ...filters,
      client: value === "all" ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      state: undefined,
      priority: undefined,
      client: undefined,
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 flex-1">
          {/* State Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={filters.state || "all"} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Abierto">Abierto</SelectItem>
                <SelectItem value="En progreso">En progreso</SelectItem>
                <SelectItem value="Resuelto">Resuelto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridad</label>
            <Select value={filters.priority || "all"} onValueChange={handlePriorityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="Bajo">Bajo</SelectItem>
                <SelectItem value="Medio">Medio</SelectItem>
                <SelectItem value="Alto">Alto</SelectItem>
                <SelectItem value="Crítico">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <Select value={filters.client || "all"} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_empty" disabled>
                    No hay clientes
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </Card>
  );
}

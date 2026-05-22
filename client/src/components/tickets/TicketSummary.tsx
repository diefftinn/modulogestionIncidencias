import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface TicketSummaryProps {
  summary: {
    Abierto: number;
    "En progreso": number;
    Resuelto: number;
  };
}

export function TicketSummary({ summary }: TicketSummaryProps) {
  const total = summary.Abierto + summary["En progreso"] + summary.Resuelto;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Total */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Total de Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{total}</div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Tickets en el sistema
          </p>
        </CardContent>
      </Card>

      {/* Abierto */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Abierto
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {summary.Abierto}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Nuevos tickets
          </p>
        </CardContent>
      </Card>

      {/* En progreso */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900 border-blue-200 dark:border-cyan-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-cyan-100">
              En progreso
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900 dark:text-cyan-100">
            {summary["En progreso"]}
          </div>
          <p className="text-xs text-blue-700 dark:text-cyan-300 mt-1">
            Siendo atendidos
          </p>
        </CardContent>
      </Card>

      {/* Resuelto */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-emerald-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-emerald-100">
              Resuelto
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900 dark:text-emerald-100">
            {summary.Resuelto}
          </div>
          <p className="text-xs text-green-700 dark:text-emerald-300 mt-1">
            Completados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

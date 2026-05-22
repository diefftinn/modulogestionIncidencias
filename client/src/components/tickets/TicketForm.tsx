import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ticketFormSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  client: z.string().min(1, "El cliente es requerido"),
  priority: z.enum(["Bajo", "Medio", "Alto", "Crítico"]),
  assignedAgentId: z.number().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSuccess?: () => void;
}

export function TicketForm({ onSuccess }: TicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: agents = [] } = trpc.agents.list.useQuery();
  const createMutation = trpc.tickets.create.useMutation();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: "",
      description: "",
      client: "",
      priority: "Medio",
    },
  });

  const onSubmit = async (values: TicketFormValues) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(values);
      toast.success("Ticket creado exitosamente");
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Error en sistema de pagos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el problema en detalle"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Empresa XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridad</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                  <SelectItem value="Crítico">Crítico</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedAgentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agente Asignado (Opcional)</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un agente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creando..." : "Crear Ticket"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

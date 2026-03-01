import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { WeekSchedule } from "./WorkScheduleEditor";

export interface ColaboradorTask {
  id: string;
  colaboradorId: string;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: "pendente" | "em andamento" | "concluída";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaboradorId: string;
  colaboradorNome: string;
  schedule: WeekSchedule;
  existingTasks: ColaboradorTask[];
  editingTask?: ColaboradorTask | null;
  onSave: (task: ColaboradorTask) => void;
}

const dayKeyFromDate = (dateStr: string): keyof WeekSchedule | null => {
  const date = new Date(dateStr + "T12:00:00");
  const dayIndex = date.getDay();
  const map: Record<number, keyof WeekSchedule> = {
    0: "domingo",
    1: "segunda",
    2: "terca",
    3: "quarta",
    4: "quinta",
    5: "sexta",
    6: "sabado",
  };
  return map[dayIndex] ?? null;
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const TaskDialog = ({
  open,
  onOpenChange,
  colaboradorId,
  colaboradorNome,
  schedule,
  existingTasks,
  editingTask,
  onSave,
}: Props) => {
  const [form, setForm] = useState({
    titulo: editingTask?.titulo ?? "",
    descricao: editingTask?.descricao ?? "",
    data: editingTask?.data ?? "",
    horaInicio: editingTask?.horaInicio ?? "",
    horaFim: editingTask?.horaFim ?? "",
    status: editingTask?.status ?? ("pendente" as ColaboradorTask["status"]),
  });

  const selectedDayKey = form.data ? dayKeyFromDate(form.data) : null;
  const daySchedule = selectedDayKey ? schedule[selectedDayKey] : [];
  const isDayOff = form.data && daySchedule.length === 0;

  const checkConflict = (): string | null => {
    if (!form.horaInicio || !form.horaFim) return null;
    const start = timeToMinutes(form.horaInicio);
    const end = timeToMinutes(form.horaFim);

    // Check if within work hours
    const inSchedule = daySchedule.some(
      (b) => start >= timeToMinutes(b.start) && end <= timeToMinutes(b.end)
    );
    if (!inSchedule) return "Horário fora do expediente do colaborador.";

    // Check overlap with existing tasks
    const sameDayTasks = existingTasks.filter(
      (t) => t.data === form.data && t.id !== editingTask?.id
    );
    const overlap = sameDayTasks.find((t) => {
      const ts = timeToMinutes(t.horaInicio);
      const te = timeToMinutes(t.horaFim);
      return start < te && end > ts;
    });
    if (overlap) return `Conflito com tarefa "${overlap.titulo}" (${overlap.horaInicio}–${overlap.horaFim}).`;

    return null;
  };

  const conflict = checkConflict();

  const handleSave = () => {
    if (!form.titulo.trim() || !form.data || !form.horaInicio || !form.horaFim) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    if (isDayOff) {
      toast.error("O colaborador não trabalha neste dia.");
      return;
    }
    if (conflict) {
      toast.error(conflict);
      return;
    }

    onSave({
      id: editingTask?.id ?? crypto.randomUUID(),
      colaboradorId,
      ...form,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Editar Tarefa" : "Nova Tarefa"} — {colaboradorNome}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Descrição breve da tarefa"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Detalhes adicionais"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Início *</Label>
              <Input
                type="time"
                value={form.horaInicio}
                onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim *</Label>
              <Input
                type="time"
                value={form.horaFim}
                onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
              />
            </div>
          </div>

          {isDayOff && (
            <p className="text-sm text-destructive font-medium">
              ⚠ O colaborador não trabalha neste dia da semana.
            </p>
          )}
          {conflict && !isDayOff && (
            <p className="text-sm text-destructive font-medium">⚠ {conflict}</p>
          )}
          {form.data && !isDayOff && daySchedule.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Expediente: {daySchedule.map((b) => `${b.start}–${b.end}`).join(" | ")}
            </p>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as ColaboradorTask["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em andamento">Em andamento</SelectItem>
                <SelectItem value="concluída">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave}>
            {editingTask ? "Atualizar" : "Agendar Tarefa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { HealthEvent, Horse } from "@/types";
import { toast } from "sonner";
import { Users, X } from "lucide-react";

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  status: "ativo" | "inativo";
}

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: HealthEvent;
  onSave: (id: string, updates: Partial<HealthEvent>) => void;
  onDelete: (id: string) => void;
  horses: Horse[];
  colaboradores: Colaborador[];
}

export function EditEventDialog({
  open,
  onOpenChange,
  event,
  onSave,
  onDelete,
  horses,
  colaboradores,
}: EditEventDialogProps) {
  const [form, setForm] = useState({
    horseId: event.horseId,
    type: event.type,
    title: event.title,
    description: event.description ?? "",
    date: event.date,
    time: event.time ?? "",
    endTime: event.endTime ?? "",
    status: event.status,
    veterinarian: event.veterinarian ?? "",
    cost: event.cost?.toString() ?? "",
    colaboradorIds: event.colaboradorIds ?? [] as string[],
  });

  useEffect(() => {
    setForm({
      horseId: event.horseId,
      type: event.type,
      title: event.title,
      description: event.description ?? "",
      date: event.date,
      time: event.time ?? "",
      endTime: event.endTime ?? "",
      status: event.status,
      veterinarian: event.veterinarian ?? "",
      cost: event.cost?.toString() ?? "",
      colaboradorIds: event.colaboradorIds ?? [],
    });
  }, [event]);

  const toggleColaborador = (id: string) => {
    setForm((prev) => ({
      ...prev,
      colaboradorIds: prev.colaboradorIds.includes(id)
        ? prev.colaboradorIds.filter((c) => c !== id)
        : [...prev.colaboradorIds, id],
    }));
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date) {
      toast.error("Título e data são obrigatórios.");
      return;
    }
    onSave(event.id, {
      horseId: form.horseId,
      type: form.type as HealthEvent["type"],
      title: form.title,
      description: form.description || undefined,
      date: form.date,
      time: form.time || undefined,
      endTime: form.endTime || undefined,
      status: form.status as HealthEvent["status"],
      veterinarian: form.veterinarian || undefined,
      cost: form.cost ? parseFloat(form.cost) : undefined,
      colaboradorIds: form.colaboradorIds.length > 0 ? form.colaboradorIds : undefined,
    });
    onOpenChange(false);
    toast.success("Evento atualizado!");
  };

  const handleDelete = () => {
    onDelete(event.id);
    onOpenChange(false);
    toast.success("Evento removido.");
  };

  const activeColabs = colaboradores.filter((c) => c.status === "ativo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>Altere dados, reagende ou atribua colaboradores.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cavalo *</Label>
              <Select value={form.horseId} onValueChange={(v) => setForm({ ...form, horseId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {horses.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as HealthEvent["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacinação">Vacinação</SelectItem>
                  <SelectItem value="vermifugação">Vermifugação</SelectItem>
                  <SelectItem value="ferrageamento">Ferrageamento</SelectItem>
                  <SelectItem value="veterinário">Veterinário</SelectItem>
                  <SelectItem value="medicamento">Medicamento</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as HealthEvent["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="concluído">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Veterinário</Label>
              <Input value={form.veterinarian} onChange={(e) => setForm({ ...form, veterinarian: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Custo (R$)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          {/* Collaborator assignment */}
          <div className="space-y-2 border-t border-border pt-4">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Colaboradores Responsáveis
            </Label>
            {form.colaboradorIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {form.colaboradorIds.map((cId) => {
                  const c = colaboradores.find((col) => col.id === cId);
                  return (
                    <Badge key={cId} variant="secondary" className="gap-1">
                      {c?.nome ?? "?"}
                      <button onClick={() => toggleColaborador(cId)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="max-h-32 overflow-y-auto space-y-1 rounded-md border border-border p-2">
              {activeColabs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum colaborador ativo cadastrado.</p>
              ) : (
                activeColabs.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer text-sm">
                    <Checkbox
                      checked={form.colaboradorIds.includes(c.id)}
                      onCheckedChange={() => toggleColaborador(c.id)}
                    />
                    <span>{c.nome}</span>
                    <span className="text-xs text-muted-foreground">({c.funcao})</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto">
            Excluir
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

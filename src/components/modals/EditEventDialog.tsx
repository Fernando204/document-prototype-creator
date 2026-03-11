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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HealthEvent, Horse, EventStockItem, StockItem } from "@/types";
import { toast } from "sonner";
import { Users, X, CheckSquare } from "lucide-react";
import { EventStockSelector } from "./EventStockSelector";
import { CategorySelect } from "@/components/CategorySelect";

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
  stock?: StockItem[];
}

export function EditEventDialog({
  open,
  onOpenChange,
  event,
  onSave,
  onDelete,
  horses,
  colaboradores,
  stock = [],
}: EditEventDialogProps) {
  const [form, setForm] = useState({
    horseIds: event.horseIds ?? [],
    type: event.type,
    title: event.title,
    description: event.description ?? "",
    date: event.date,
    time: event.time ?? "",
    endTime: event.endTime ?? "",
    status: event.status,
    veterinarian: event.veterinarian ?? "",
    cost: event.cost?.toString() ?? "",
    colaboradorIds: event.colaboradorIds ?? ([] as string[]),
    stockItems: event.stockItems ?? ([] as EventStockItem[]),
  });

  useEffect(() => {
    setForm({
      horseIds: event.horseIds ?? [],
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
      stockItems: event.stockItems ?? [],
    });
  }, [event]);

  const toggleHorse = (id: string) => {
    setForm((prev) => ({
      ...prev,
      horseIds: prev.horseIds.includes(id) ? prev.horseIds.filter((h) => h !== id) : [...prev.horseIds, id],
    }));
  };

  const selectAllHorses = () => {
    setForm((prev) => ({
      ...prev,
      horseIds: prev.horseIds.length === horses.length ? [] : horses.map((h) => h.id),
    }));
  };

  const toggleColaborador = (id: string) => {
    setForm((prev) => ({
      ...prev,
      colaboradorIds: prev.colaboradorIds.includes(id)
        ? prev.colaboradorIds.filter((c) => c !== id)
        : [...prev.colaboradorIds, id],
    }));
  };

  const handleSave = () => {
    if (form.horseIds.length === 0 || !form.title.trim() || !form.date) {
      toast.error("Selecione ao menos um cavalo, título e data são obrigatórios.");
      return;
    }
    onSave(event.id, {
      horseIds: form.horseIds,
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
      stockItems: form.stockItems.length > 0 ? form.stockItems : undefined,
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

  // For stock selector, we need to account for current event's own reservations
  // so user can see the correct available quantity
  const adjustedStock = stock.map((s) => {
    const currentReservation = event.stockItems?.find((si) => si.stockItemId === s.id);
    if (currentReservation && event.status === "agendado") {
      return { ...s, reservedQuantity: s.reservedQuantity - currentReservation.quantity };
    }
    return s;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>Altere dados, reagende ou atribua colaboradores.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Horse selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cavalos *</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={selectAllHorses}>
                <CheckSquare className="h-3 w-3" />
                {form.horseIds.length === horses.length ? "Desmarcar todos" : "Selecionar todos"}
              </Button>
            </div>
            {form.horseIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {form.horseIds.map((hId) => {
                  const h = horses.find((horse) => horse.id === hId);
                  return (
                    <Badge key={hId} variant="secondary" className="gap-1">
                      {h?.name ?? "?"}
                      <button type="button" onClick={() => toggleHorse(hId)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="max-h-32 overflow-y-auto space-y-1 rounded-md border border-border p-2">
              {horses.map((h) => (
                <label key={h.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer text-sm">
                  <Checkbox checked={form.horseIds.includes(h.id)} onCheckedChange={() => toggleHorse(h.id)} />
                  <span>{h.name}</span>
                  <span className="text-xs text-muted-foreground">({h.breed})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as HealthEvent["type"] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="concluído">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* Stock items */}
          <EventStockSelector
            stock={adjustedStock}
            selectedItems={form.stockItems}
            onChange={(items) => setForm({ ...form, stockItems: items })}
          />

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
                  <label
                    key={c.id}
                    className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer text-sm"
                  >
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

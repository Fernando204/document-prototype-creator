import { useState } from "react";
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

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  status: "ativo" | "inativo";
}

interface NewEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: Omit<HealthEvent, "id" | "createdAt">) => void;
  horses: Horse[];
  colaboradores?: Colaborador[];
  stock?: StockItem[];
  defaultType?: HealthEvent["type"];
}

export function NewEventDialog({
  open,
  onOpenChange,
  onSave,
  horses,
  colaboradores = [],
  stock = [],
  defaultType = "veterinário",
}: NewEventDialogProps) {
  const [formData, setFormData] = useState({
    horseIds: [] as string[],
    type: defaultType,
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    endTime: "",
    veterinarian: "",
    cost: "",
    colaboradorIds: [] as string[],
    stockItems: [] as EventStockItem[],
  });

  const toggleHorse = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      horseIds: prev.horseIds.includes(id) ? prev.horseIds.filter((h) => h !== id) : [...prev.horseIds, id],
    }));
  };

  const selectAllHorses = () => {
    setFormData((prev) => ({
      ...prev,
      horseIds: prev.horseIds.length === horses.length ? [] : horses.map((h) => h.id),
    }));
  };

  const toggleColaborador = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      colaboradorIds: prev.colaboradorIds.includes(id)
        ? prev.colaboradorIds.filter((c) => c !== id)
        : [...prev.colaboradorIds, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.horseIds.length === 0 || !formData.title.trim() || !formData.date) {
      toast.error("Selecione ao menos um cavalo, título e data são obrigatórios");
      return;
    }

    onSave({
      horseIds: formData.horseIds,
      type: formData.type as HealthEvent["type"],
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime || undefined,
      status: "agendado",
      veterinarian: formData.veterinarian,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      colaboradorIds: formData.colaboradorIds.length > 0 ? formData.colaboradorIds : undefined,
      stockItems: formData.stockItems.length > 0 ? formData.stockItems : undefined,
    });

    setFormData({
      horseIds: [],
      type: defaultType,
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      endTime: "",
      veterinarian: "",
      cost: "",
      colaboradorIds: [],
      stockItems: [],
    });

    onOpenChange(false);
    toast.success("Evento agendado com sucesso!");
  };

  const activeColabs = colaboradores.filter((c) => c.status === "ativo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Evento</DialogTitle>
          <DialogDescription>Preencha as informações do evento.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Horse selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cavalos *</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={selectAllHorses}>
                <CheckSquare className="h-3 w-3" />
                {formData.horseIds.length === horses.length ? "Desmarcar todos" : "Selecionar todos"}
              </Button>
            </div>
            {formData.horseIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {formData.horseIds.map((hId) => {
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
                  <Checkbox checked={formData.horseIds.includes(h.id)} onCheckedChange={() => toggleHorse(h.id)} />
                  <span>{h.name}</span>
                  <span className="text-xs text-muted-foreground">({h.breed})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v as HealthEvent["type"] })}
            >
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
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Vacina contra Raiva"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Observações sobre o evento..."
              rows={2}
            />
          </div>

          {/* Stock items */}
          <EventStockSelector
            stock={stock}
            selectedItems={formData.stockItems}
            onChange={(items) => setFormData({ ...formData, stockItems: items })}
          />

          {/* Collaborator assignment */}
          {activeColabs.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Colaboradores Responsáveis
              </Label>
              {formData.colaboradorIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.colaboradorIds.map((cId) => {
                    const c = colaboradores.find((col) => col.id === cId);
                    return (
                      <Badge key={cId} variant="secondary" className="gap-1">
                        {c?.nome ?? "?"}
                        <button type="button" onClick={() => toggleColaborador(cId)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <div className="max-h-32 overflow-y-auto space-y-1 rounded-md border border-border p-2">
                {activeColabs.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={formData.colaboradorIds.includes(c.id)}
                      onCheckedChange={() => toggleColaborador(c.id)}
                    />
                    <span>{c.nome}</span>
                    <span className="text-xs text-muted-foreground">({c.funcao})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agendar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

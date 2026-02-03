import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { HealthEvent, Horse } from "@/types";
import { toast } from "sonner";

interface NewEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: Omit<HealthEvent, "id" | "createdAt">) => void;
  horses: Horse[];
  defaultType?: HealthEvent["type"];
}

export function NewEventDialog({
  open,
  onOpenChange,
  onSave,
  horses,
  defaultType = "veterinário",
}: NewEventDialogProps) {
  const [formData, setFormData] = useState({
    horseId: "",
    type: defaultType,
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    veterinarian: "",
    cost: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.horseId || !formData.title.trim() || !formData.date) {
      toast.error("Cavalo, título e data são obrigatórios");
      return;
    }

    onSave({
      horseId: formData.horseId,
      type: formData.type as HealthEvent["type"],
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      status: "agendado",
      veterinarian: formData.veterinarian,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
    });

    // Reset form
    setFormData({
      horseId: "",
      type: defaultType,
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      veterinarian: "",
      cost: "",
    });
    
    onOpenChange(false);
    toast.success("Evento agendado com sucesso!");
  };

  const getTypeLabel = () => {
    switch (defaultType) {
      case "vacinação":
        return "Registrar Vacina";
      case "vermifugação":
        return "Registrar Vermifugação";
      default:
        return "Agendar Evento";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{getTypeLabel()}</DialogTitle>
          <DialogDescription>
            Preencha as informações do evento de saúde.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horse">Cavalo *</Label>
              <Select
                value={formData.horseId}
                onValueChange={(value) => setFormData({ ...formData, horseId: value })}
              >
                <SelectTrigger id="horse">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {horses.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as HealthEvent["type"] })}
              >
                <SelectTrigger id="type">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Vacina contra Raiva"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarian">Veterinário</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                placeholder="Nome do profissional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Observações sobre o evento..."
              rows={2}
            />
          </div>

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

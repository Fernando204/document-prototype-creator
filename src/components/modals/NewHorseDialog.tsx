import { useState, useRef } from "react";
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
import { Horse } from "@/types";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";

interface NewHorseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (horse: Omit<Horse, "id" | "createdAt" | "updatedAt">) => void;
}

export function NewHorseDialog({ open, onOpenChange, onSave }: NewHorseDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    birthDate: "",
    color: "",
    sex: "macho" as "macho" | "fêmea" | "castrado",
    status: "saudável" as "saudável" | "em tratamento" | "observação",
    fatherName: "",
    motherName: "",
    registry: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.breed.trim()) {
      toast.error("Nome e raça são obrigatórios");
      return;
    }

    onSave({
      name: formData.name,
      breed: formData.breed,
      age: formData.age || "Não informado",
      birthDate: formData.birthDate,
      color: formData.color,
      sex: formData.sex,
      status: formData.status,
      pedigree: {
        father: formData.fatherName,
        mother: formData.motherName,
        registry: formData.registry,
      },
      notes: formData.notes,
      isFavorite: false,
    });

    // Reset form
    setFormData({
      name: "",
      breed: "",
      age: "",
      birthDate: "",
      color: "",
      sex: "macho",
      status: "saudável",
      fatherName: "",
      motherName: "",
      registry: "",
      notes: "",
    });
    
    onOpenChange(false);
    toast.success("Cavalo cadastrado com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cavalo</DialogTitle>
          <DialogDescription>
            Preencha as informações do cavalo. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do cavalo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Raça *</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="Ex: Mangalarga Marchador"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Ex: 5 anos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Pelagem</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Ex: Castanho, Alazão"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(value: "macho" | "fêmea" | "castrado") =>
                    setFormData({ ...formData, sex: value })
                  }
                >
                  <SelectTrigger id="sex">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="fêmea">Fêmea</SelectItem>
                    <SelectItem value="castrado">Castrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status de Saúde</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "saudável" | "em tratamento" | "observação") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saudável">Saudável</SelectItem>
                    <SelectItem value="em tratamento">Em Tratamento</SelectItem>
                    <SelectItem value="observação">Em Observação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pedigree */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Pedigree (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Nome do Pai</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="Nome do garanhão"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Nome da Mãe</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="Nome da égua"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registry">Registro</Label>
                <Input
                  id="registry"
                  value={formData.registry}
                  onChange={(e) => setFormData({ ...formData, registry: e.target.value })}
                  placeholder="Número de registro"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre o cavalo..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Cavalo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

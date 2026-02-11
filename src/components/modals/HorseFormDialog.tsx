import { useState, useRef, useEffect } from "react";
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
import { Camera, X, Loader2 } from "lucide-react";
import { calculateAge } from "@/lib/calculateAge";

interface HorseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (horse: Omit<Horse, "id" | "createdAt" | "updatedAt">) => Promise<any> | any;
  horse?: Horse | null; // If provided, edit mode
}

const emptyForm = {
  name: "",
  breed: "",
  birthDate: "",
  color: "",
  sex: "macho" as "macho" | "fêmea" | "castrado",
  status: "saudável" as "saudável" | "em tratamento" | "observação",
  fatherName: "",
  motherName: "",
  registry: "",
  notes: "",
};

export function HorseFormDialog({ open, onOpenChange, onSave, horse }: HorseFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const isEditing = !!horse;

  // Populate form when editing
  useEffect(() => {
    if (horse) {
      setFormData({
        name: horse.name,
        breed: horse.breed,
        birthDate: horse.birthDate || "",
        color: horse.color || "",
        sex: horse.sex,
        status: horse.status,
        fatherName: horse.pedigree?.father || "",
        motherName: horse.pedigree?.mother || "",
        registry: horse.pedigree?.registry || "",
        notes: horse.notes || "",
      });
      setImagePreview(horse.imageUrl || null);
    } else {
      setFormData(emptyForm);
      setImagePreview(null);
    }
  }, [horse, open]);

  const calculatedAge = calculateAge(formData.birthDate);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.breed.trim()) {
      toast.error("Nome e raça são obrigatórios");
      return;
    }

    if (!formData.birthDate) {
      toast.error("Data de nascimento é obrigatória");
      return;
    }

    const birth = new Date(formData.birthDate);
    if (isNaN(birth.getTime()) || birth > new Date()) {
      toast.error("Data de nascimento inválida");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: calculatedAge,
        birthDate: formData.birthDate,
        color: formData.color,
        sex: formData.sex,
        status: formData.status,
        imageUrl: imagePreview || undefined,
        pedigree: {
          father: formData.fatherName,
          mother: formData.motherName,
          registry: formData.registry,
        },
        notes: formData.notes,
        isFavorite: horse?.isFavorite ?? false,
      });

      setFormData(emptyForm);
      setImagePreview(null);
      onOpenChange(false);
      toast.success(isEditing ? "Cavalo atualizado com sucesso!" : "Cavalo cadastrado com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cavalo" : "Cadastrar Novo Cavalo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do cavalo. Campos com * são obrigatórios."
              : "Preencha as informações do cavalo. Campos com * são obrigatórios."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Foto do Cavalo</h3>
            <div className="flex items-center gap-4">
              <div
                className="relative w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Clique para adicionar</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="text-sm text-muted-foreground">
                <p>Formatos aceitos: JPG, PNG, WEBP</p>
                <p>Tamanho máximo: 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do cavalo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Raça *</Label>
                <Input id="breed" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="Ex: Mangalarga Marchador" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input id="birthDate" type="date" value={formData.birthDate} max={new Date().toISOString().split("T")[0]} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Idade (calculada)</Label>
                <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 text-sm text-muted-foreground flex items-center">
                  {formData.birthDate ? calculatedAge : "Preencha a data de nascimento"}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Pelagem</Label>
                <Input id="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="Ex: Castanho, Alazão" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select value={formData.sex} onValueChange={(value: "macho" | "fêmea" | "castrado") => setFormData({ ...formData, sex: value })}>
                  <SelectTrigger id="sex"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macho">Macho</SelectItem>
                    <SelectItem value="fêmea">Fêmea</SelectItem>
                    <SelectItem value="castrado">Castrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status de Saúde</Label>
                <Select value={formData.status} onValueChange={(value: "saudável" | "em tratamento" | "observação") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
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
                <Input id="fatherName" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} placeholder="Nome do garanhão" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Nome da Mãe</Label>
                <Input id="motherName" value={formData.motherName} onChange={(e) => setFormData({ ...formData, motherName: e.target.value })} placeholder="Nome da égua" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registry">Registro</Label>
                <Input id="registry" value={formData.registry} onChange={(e) => setFormData({ ...formData, registry: e.target.value })} placeholder="Número de registro" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Informações adicionais sobre o cavalo..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Cadastrar Cavalo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

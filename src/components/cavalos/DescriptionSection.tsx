import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Edit2, Save, X } from "lucide-react";
import { HorseDescription } from "@/types";

interface DescriptionSectionProps {
  description?: HorseDescription;
  isEditing: boolean;
  onSave: (description: HorseDescription) => void;
}

export function DescriptionSection({ description, isEditing, onSave }: DescriptionSectionProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<HorseDescription>({
    temperament: description?.temperament || "",
    behavior: description?.behavior || "",
    physicalTraits: description?.physicalTraits || "",
    generalNotes: description?.generalNotes || "",
  });

  const handleSave = () => {
    onSave({
      ...form,
      updatedAt: new Date().toISOString(),
      updatedBy: "Administrador",
    });
    setEditing(false);
  };

  const hasContent = description?.temperament || description?.behavior || description?.physicalTraits || description?.generalNotes;

  const fields = [
    { key: "temperament" as const, label: "Temperamento", placeholder: "Ex: Dócil, calmo, enérgico..." },
    { key: "behavior" as const, label: "Comportamento", placeholder: "Ex: Sociável com outros cavalos, bom para montaria..." },
    { key: "physicalTraits" as const, label: "Características Físicas", placeholder: "Ex: Cicatriz na pata dianteira esquerda..." },
    { key: "generalNotes" as const, label: "Observações Gerais", placeholder: "Informações adicionais relevantes..." },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Resenha do Cavalo
          </CardTitle>
          {isEditing && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs font-medium">{f.label}</Label>
                <Textarea
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={2}
                />
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1" /> Salvar Resenha
              </Button>
            </div>
          </div>
        ) : hasContent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => {
              const val = description?.[f.key];
              if (!val) return null;
              return (
                <div key={f.key} className="bg-muted/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">{f.label}</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{val}</p>
                </div>
              );
            })}
            {description?.updatedBy && (
              <p className="text-xs text-muted-foreground col-span-full">
                Atualizado por {description.updatedBy} em{" "}
                {description.updatedAt
                  ? new Date(description.updatedAt).toLocaleDateString("pt-BR")
                  : "—"}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma resenha cadastrada.</p>
            {isEditing && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setEditing(true)}>
                <Edit2 className="h-3.5 w-3.5 mr-1" /> Adicionar Resenha
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

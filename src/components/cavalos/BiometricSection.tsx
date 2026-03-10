import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Ruler, Weight, Plus, Save, X } from "lucide-react";
import { BiometricRecord } from "@/types";
import horseBiometricsImg from "@/assets/horse-biometrics.png";

interface BiometricSectionProps {
  biometrics: BiometricRecord[];
  breed: string;
  color?: string;
  sex: string;
  age: string;
  isEditing: boolean;
  onAddRecord: (record: Omit<BiometricRecord, "id">) => void;
}

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
};

const formatTime = (d: string) => {
  try {
    return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

const biometricFields = [
  { key: "withersHeight", label: "A - Altura na Cernelha", unit: "cm" },
  { key: "crumpHeight", label: "B - Altura na Garupa", unit: "cm" },
  { key: "elbowGroundDist", label: "C - Dist. Codilho-Solo", unit: "cm" },
  { key: "chestCircumference", label: "D - Perímetro Torácico", unit: "cm" },
  { key: "headLength", label: "E - Comp. Cabeça", unit: "cm" },
  { key: "neckLength", label: "F - Comp. Pescoço", unit: "cm" },
  { key: "shoulderLength", label: "G - Comp. Espádua", unit: "cm" },
  { key: "backLoinLength", label: "H - Comp. Dorso-Lombo", unit: "cm" },
  { key: "crumpLength", label: "I - Comp. Garupa", unit: "cm" },
  { key: "bodyLength", label: "J - Comp. do Corpo", unit: "cm" },
  { key: "forearmPerimeter", label: "K - Perím. Antebraço", unit: "cm" },
  { key: "kneePerimeter", label: "L - Perím. Joelho", unit: "cm" },
  { key: "cannonPerimeter", label: "M - Perím. Canela", unit: "cm" },
  { key: "headWidth", label: "N - Largura da Cabeça", unit: "cm" },
  { key: "hipWidth", label: "O - Largura das Ancas", unit: "cm" },
  { key: "weight", label: "Peso", unit: "kg" },
] as const;

type FieldKey = typeof biometricFields[number]["key"];

const emptyForm: Record<FieldKey, string> = Object.fromEntries(
  biometricFields.map((f) => [f.key, ""])
) as Record<FieldKey, string>;

export function BiometricSection({ biometrics, breed, color, sex, age, isEditing, onAddRecord }: BiometricSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<FieldKey, string>>({ ...emptyForm });

  const latest = biometrics.length > 0 ? biometrics[biometrics.length - 1] : null;

  const handleSave = () => {
    const record: Omit<BiometricRecord, "id"> = {
      measuredAt: new Date().toISOString(),
      measuredBy: "Administrador",
    };
    biometricFields.forEach((f) => {
      const val = form[f.key];
      if (val) (record as any)[f.key] = Number(val);
    });
    onAddRecord(record);
    setForm({ ...emptyForm });
    setShowForm(false);
  };

  const infoItems = [
    { label: "Pelagem", value: color },
    { label: "Sexo", value: sex },
    { label: "Raça", value: breed },
    { label: "Idade", value: age },
    { label: "Última medição", value: latest ? formatDate(latest.measuredAt) : "—" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Ruler className="h-4 w-4 text-primary" /> Dados Biométricos
          </CardTitle>
          {isEditing && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Nova Medição
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Biometric image + data grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/2 flex items-center justify-center bg-muted/20 rounded-xl p-4">
            <img
              src={horseBiometricsImg}
              alt="Pontos de medição biométrica do cavalo"
              className="max-h-72 w-auto object-contain"
            />
          </div>

          <div className="lg:w-1/2 space-y-4">
            {/* Metrics grid - all 15 + weight */}
            <div className="grid grid-cols-2 gap-2">
              {biometricFields.map((m) => {
                const val = latest ? (latest as any)[m.key] : undefined;
                return (
                  <div key={m.key} className="bg-muted/30 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground leading-tight">{m.label}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {val != null ? `${val} ${m.unit}` : "—"}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Info items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {infoItems.map((item) => (
                <div key={item.label} className="bg-muted/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground capitalize">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Measurement form */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/10">
            <p className="text-sm font-semibold text-foreground">Nova Medição</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {biometricFields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-[10px] leading-tight">{f.label} ({f.unit})</Label>
                  <Input
                    type="number"
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1" /> Salvar Medição
              </Button>
            </div>
          </div>
        )}

        {/* Previous records */}
        {biometrics.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Histórico de Medições</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {[...biometrics].reverse().slice(1).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between text-xs bg-muted/20 rounded-md px-3 py-2">
                  <span className="text-muted-foreground">{formatDate(rec.measuredAt)} {formatTime(rec.measuredAt)}</span>
                  <div className="flex gap-2 text-foreground flex-wrap">
                    {rec.withersHeight && <span>A:{rec.withersHeight}cm</span>}
                    {rec.chestCircumference && <span>D:{rec.chestCircumference}cm</span>}
                    {rec.bodyLength && <span>J:{rec.bodyLength}cm</span>}
                    {rec.weight && <span>{rec.weight}kg</span>}
                  </div>
                  <Badge variant="outline" className="text-[10px]">{rec.measuredBy}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

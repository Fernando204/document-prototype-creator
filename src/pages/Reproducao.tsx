import { MainLayout } from "@/components/layout/MainLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useHorses } from "@/hooks/useHorses";
import { Reproduction } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Baby, Heart, Calendar, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const typeConfig = {
  cobertura: { color: "bg-pink-100 text-pink-700", label: "Cobertura", icon: Heart },
  inseminação: { color: "bg-purple-100 text-purple-700", label: "Inseminação", icon: Stethoscope },
  gestação: { color: "bg-amber-100 text-amber-700", label: "Gestação", icon: Baby },
  nascimento: { color: "bg-horse-sage-light text-horse-sage", label: "Nascimento", icon: Baby },
};

const statusConfig = {
  planejado: "bg-blue-100 text-blue-700",
  "em andamento": "bg-primary/10 text-primary",
  concluído: "bg-horse-sage-light text-horse-sage",
  cancelado: "bg-destructive/10 text-destructive",
};

const initialReproductions: Reproduction[] = [
  {
    id: "1",
    type: "gestação",
    mareId: "2",
    mareName: "Estrela",
    stallionId: "1",
    stallionName: "Relâmpago",
    date: new Date(Date.now() - 200 * 86400000).toISOString().split("T")[0],
    expectedBirthDate: new Date(Date.now() + 140 * 86400000).toISOString().split("T")[0],
    status: "em andamento",
    veterinarian: "Dr. Carlos",
    createdAt: new Date().toISOString(),
  },
];

const ReproducaoPage = () => {
  const [reproductions, setReproductions] = useLocalStorage<Reproduction[]>(
    "horsecontrol-reproductions",
    initialReproductions
  );
  const { horses } = useHorses();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "cobertura" as Reproduction["type"],
    mareId: "",
    stallionId: "",
    date: new Date().toISOString().split("T")[0],
    veterinarian: "",
    notes: "",
  });

  const mares = horses.filter((h) => h.sex === "fêmea");
  const stallions = horses.filter((h) => h.sex === "macho");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mare = horses.find((h) => h.id === formData.mareId);
    const stallion = horses.find((h) => h.id === formData.stallionId);

    if (!formData.mareId || !formData.date) {
      toast.error("Égua e data são obrigatórios");
      return;
    }

    const newRepro: Reproduction = {
      id: crypto.randomUUID(),
      type: formData.type,
      mareId: formData.mareId,
      mareName: mare?.name || "",
      stallionId: formData.stallionId,
      stallionName: stallion?.name,
      date: formData.date,
      expectedBirthDate:
        formData.type === "cobertura" || formData.type === "inseminação"
          ? addDays(new Date(formData.date), 340).toISOString().split("T")[0]
          : undefined,
      status: formData.type === "gestação" ? "em andamento" : "planejado",
      veterinarian: formData.veterinarian,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    setReproductions((prev) => [...prev, newRepro]);
    setFormData({
      type: "cobertura",
      mareId: "",
      stallionId: "",
      date: new Date().toISOString().split("T")[0],
      veterinarian: "",
      notes: "",
    });
    setIsNewOpen(false);
    toast.success("Registro de reprodução adicionado!");
  };

  const updateStatus = (id: string, status: Reproduction["status"]) => {
    setReproductions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const activeReproductions = reproductions
    .filter((r) => r.status !== "cancelado" && r.status !== "concluído")
    .sort((a, b) => a.date.localeCompare(b.date));

  const completedReproductions = reproductions
    .filter((r) => r.status === "concluído")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reprodução</h1>
            <p className="text-muted-foreground">
              {activeReproductions.length} em andamento • {completedReproductions.length} concluídas
            </p>
          </div>
          <Button onClick={() => setIsNewOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Registro
          </Button>
        </div>

        {/* Active Gestations Alert */}
        {activeReproductions.filter((r) => r.type === "gestação").length > 0 && (
          <div className="bg-horse-gold-light border border-horse-gold/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="h-5 w-5 text-horse-gold" />
              <h3 className="font-semibold text-foreground">Gestações em Andamento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeReproductions
                .filter((r) => r.type === "gestação")
                .map((repro) => {
                  const daysPregnant = differenceInDays(new Date(), new Date(repro.date));
                  const daysRemaining = repro.expectedBirthDate
                    ? differenceInDays(new Date(repro.expectedBirthDate), new Date())
                    : null;

                  return (
                    <div key={repro.id} className="bg-background rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{repro.mareName}</span>
                        <Badge variant="outline">{daysPregnant} dias</Badge>
                      </div>
                      {repro.stallionName && (
                        <p className="text-xs text-muted-foreground mb-1">
                          Pai: {repro.stallionName}
                        </p>
                      )}
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <p className="text-xs text-horse-gold font-medium">
                          Previsão: ~{daysRemaining} dias restantes
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* All Records */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Todos os Registros</h2>
          
          {reproductions.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <p className="text-muted-foreground">Nenhum registro de reprodução.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...reproductions].sort((a, b) => b.date.localeCompare(a.date)).map((repro) => {
                const typeInfo = typeConfig[repro.type];
                const TypeIcon = typeInfo.icon;

                return (
                  <div
                    key={repro.id}
                    className="bg-card rounded-xl shadow-soft p-4 flex items-center gap-4"
                  >
                    <div className={cn("p-3 rounded-lg", typeInfo.color)}>
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{repro.mareName}</h3>
                        <Badge className={cn("text-xs", typeInfo.color)}>
                          {typeInfo.label}
                        </Badge>
                        <Badge className={cn("text-xs", statusConfig[repro.status])}>
                          {repro.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {repro.stallionName && `Garanhão: ${repro.stallionName} • `}
                        {format(new Date(repro.date), "dd/MM/yyyy")}
                      </p>
                      {repro.expectedBirthDate && repro.status === "em andamento" && (
                        <p className="text-xs text-horse-gold">
                          Previsão de nascimento:{" "}
                          {format(new Date(repro.expectedBirthDate), "dd/MM/yyyy")}
                        </p>
                      )}
                    </div>

                    <Select
                      value={repro.status}
                      onValueChange={(v) => updateStatus(repro.id, v as Reproduction["status"])}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planejado">Planejado</SelectItem>
                        <SelectItem value="em andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluído">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Record Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Registro de Reprodução</DialogTitle>
            <DialogDescription>
              Registre coberturas, inseminações, gestações ou nascimentos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as Reproduction["type"] })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cobertura">Cobertura</SelectItem>
                    <SelectItem value="inseminação">Inseminação</SelectItem>
                    <SelectItem value="gestação">Gestação</SelectItem>
                    <SelectItem value="nascimento">Nascimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mare">Égua *</Label>
                <Select
                  value={formData.mareId}
                  onValueChange={(v) => setFormData({ ...formData, mareId: v })}
                >
                  <SelectTrigger id="mare">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {mares.map((mare) => (
                      <SelectItem key={mare.id} value={mare.id}>
                        {mare.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stallion">Garanhão</Label>
                <Select
                  value={formData.stallionId}
                  onValueChange={(v) => setFormData({ ...formData, stallionId: v })}
                >
                  <SelectTrigger id="stallion">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {stallions.map((stallion) => (
                      <SelectItem key={stallion.id} value={stallion.id}>
                        {stallion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vet">Veterinário</Label>
              <Input
                id="vet"
                value={formData.veterinarian}
                onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                placeholder="Nome do veterinário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ReproducaoPage;

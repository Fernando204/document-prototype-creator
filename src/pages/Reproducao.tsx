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
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Baby, Heart, Stethoscope, ArrowRight, CheckCircle2, Clock, History, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ReproductionRecord extends Reproduction {
  parentId?: string;
  foalName?: string;
  foalSex?: "macho" | "fêmea";
}

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

const initialReproductions: ReproductionRecord[] = [
  {
    id: "1",
    type: "inseminação",
    mareId: "2",
    mareName: "Estrela",
    stallionId: "1",
    stallionName: "Relâmpago",
    date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    expectedBirthDate: addDays(new Date(Date.now() - 10 * 86400000), 340).toISOString().split("T")[0],
    status: "em andamento",
    veterinarian: "Dr. Carlos",
    createdAt: new Date().toISOString(),
  },
];

const ReproducaoPage = () => {
  const [reproductions, setReproductions] = useLocalStorage<ReproductionRecord[]>(
    "horsecontrol-reproductions",
    initialReproductions
  );
  const { horses } = useHorses();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState<string | null>(null);
  const [birthDialog, setBirthDialog] = useState<ReproductionRecord | null>(null);
  const [birthData, setBirthData] = useState({ foalName: "", foalSex: "macho" as "macho" | "fêmea", notes: "" });
  const [formData, setFormData] = useState({
    mareId: "",
    stallionId: "",
    date: new Date().toISOString().split("T")[0],
    veterinarian: "",
    notes: "",
  });

  const mares = horses.filter((h) => h.sex === "fêmea");
  const stallions = horses.filter((h) => h.sex === "macho");

  // Only allow creating inseminations (start of the flow)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mare = horses.find((h) => h.id === formData.mareId);
    const stallion = horses.find((h) => h.id === formData.stallionId);

    if (!formData.mareId || !formData.date) {
      toast.error("Égua e data são obrigatórios");
      return;
    }

    const newRepro: ReproductionRecord = {
      id: crypto.randomUUID(),
      type: "inseminação",
      mareId: formData.mareId,
      mareName: mare?.name || "",
      stallionId: formData.stallionId,
      stallionName: stallion?.name,
      date: formData.date,
      expectedBirthDate: addDays(new Date(formData.date), 340).toISOString().split("T")[0],
      status: "em andamento",
      veterinarian: formData.veterinarian,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    setReproductions((prev) => [...prev, newRepro]);
    setFormData({ mareId: "", stallionId: "", date: new Date().toISOString().split("T")[0], veterinarian: "", notes: "" });
    setIsNewOpen(false);
    toast.success("Inseminação registrada! Acompanhe o progresso nas Ações Pendentes.");
  };

  // Transition: Inseminação confirmada → Gestação
  const confirmInsemination = async (record: ReproductionRecord) => {
    setIsTransitioning(record.id);
    await new Promise((r) => setTimeout(r, 400));

    setReproductions((prev) => {
      const updated = prev.map((r) =>
        r.id === record.id ? { ...r, status: "concluído" as const } : r
      );

      const gestation: ReproductionRecord = {
        id: crypto.randomUUID(),
        type: "gestação",
        mareId: record.mareId,
        mareName: record.mareName,
        stallionId: record.stallionId,
        stallionName: record.stallionName,
        date: new Date().toISOString().split("T")[0],
        expectedBirthDate: record.expectedBirthDate,
        status: "em andamento",
        veterinarian: record.veterinarian,
        parentId: record.id,
        createdAt: new Date().toISOString(),
      };

      return [...updated, gestation];
    });

    setIsTransitioning(null);
    toast.success("Inseminação confirmada! Gestação iniciada automaticamente.");
  };

  // Transition: Gestação finalizada → open birth dialog
  const finalizeGestation = (record: ReproductionRecord) => {
    setBirthDialog(record);
    setBirthData({ foalName: "", foalSex: "macho", notes: "" });
  };

  const handleBirthSubmit = async () => {
    if (!birthDialog) return;
    if (!birthData.foalName.trim()) {
      toast.error("Nome do potro é obrigatório");
      return;
    }

    setIsTransitioning(birthDialog.id);
    await new Promise((r) => setTimeout(r, 400));

    setReproductions((prev) => {
      const updated = prev.map((r) =>
        r.id === birthDialog.id ? { ...r, status: "concluído" as const } : r
      );

      const birth: ReproductionRecord = {
        id: crypto.randomUUID(),
        type: "nascimento",
        mareId: birthDialog.mareId,
        mareName: birthDialog.mareName,
        stallionId: birthDialog.stallionId,
        stallionName: birthDialog.stallionName,
        date: new Date().toISOString().split("T")[0],
        status: "concluído",
        parentId: birthDialog.id,
        foalName: birthData.foalName,
        foalSex: birthData.foalSex,
        notes: birthData.notes,
        createdAt: new Date().toISOString(),
      };

      return [...updated, birth];
    });

    setIsTransitioning(null);
    setBirthDialog(null);
    toast.success(`Nascimento registrado! Potro: ${birthData.foalName}`);
  };

  const cancelRecord = (id: string) => {
    setReproductions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancelado" as const } : r))
    );
    toast.info("Registro cancelado.");
  };

  // Pending = inseminations or gestations that are "em andamento"
  const pendingActions = reproductions
    .filter((r) => r.status === "em andamento")
    .sort((a, b) => a.date.localeCompare(b.date));

  // History = concluded or cancelled records
  const history = reproductions
    .filter((r) => r.status === "concluído" || r.status === "cancelado")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reprodução</h1>
            <p className="text-muted-foreground">
              {pendingActions.length} ações pendentes • {history.filter((r) => r.status === "concluído").length} concluídas
            </p>
          </div>
          <Button onClick={() => setIsNewOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Inseminação
          </Button>
        </div>

        {/* Flow explanation */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Inseminação</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Gestação</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-horse-sage-light text-horse-sage border-horse-sage/20">Nascimento</Badge>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Ações Pendentes
          </h2>

          {pendingActions.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhuma ação pendente.</p>
              <p className="text-xs text-muted-foreground mt-1">Registre uma nova inseminação para iniciar o fluxo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingActions.map((record) => {
                const typeInfo = typeConfig[record.type];
                const TypeIcon = typeInfo.icon;
                const daysElapsed = differenceInDays(new Date(), new Date(record.date));
                const daysRemaining = record.expectedBirthDate
                  ? differenceInDays(new Date(record.expectedBirthDate), new Date())
                  : null;
                const loading = isTransitioning === record.id;

                return (
                  <div key={record.id} className="bg-card rounded-xl shadow-soft p-5 border-l-4 border-l-primary">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg", typeInfo.color)}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{record.mareName}</h3>
                          <Badge className={cn("text-xs mt-1", typeInfo.color)}>{typeInfo.label}</Badge>
                        </div>
                      </div>
                      <Badge variant="outline">{daysElapsed} dias</Badge>
                    </div>

                    {record.stallionName && (
                      <p className="text-sm text-muted-foreground mb-1">Garanhão: {record.stallionName}</p>
                    )}
                    <p className="text-sm text-muted-foreground mb-1">
                      Início: {format(new Date(record.date), "dd/MM/yyyy")}
                    </p>
                    {daysRemaining !== null && daysRemaining > 0 && (
                      <p className="text-sm text-amber-600 font-medium mb-3">
                        Previsão de nascimento: ~{daysRemaining} dias restantes
                      </p>
                    )}
                    {record.veterinarian && (
                      <p className="text-xs text-muted-foreground mb-3">Veterinário: {record.veterinarian}</p>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      {record.type === "inseminação" && (
                        <Button size="sm" className="flex-1" onClick={() => confirmInsemination(record)} disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                          Confirmar → Gestação
                        </Button>
                      )}
                      {record.type === "gestação" && (
                        <Button size="sm" className="flex-1" onClick={() => finalizeGestation(record)} disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Baby className="h-4 w-4 mr-2" />}
                          Registrar Nascimento
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => cancelRecord(record.id)} disabled={loading}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-horse-sage" />
            Histórico de Reprodução
          </h2>

          {history.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl">
              <History className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhum registro no histórico.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              {history.map((record, index) => {
                const typeInfo = typeConfig[record.type];
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={record.id} className={cn("p-4 flex items-center gap-4", index > 0 && "border-t")}>
                    <div className={cn("p-2 rounded-lg shrink-0", typeInfo.color)}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-foreground">{record.mareName}</span>
                        <Badge className={cn("text-xs", typeInfo.color)}>{typeInfo.label}</Badge>
                        <Badge className={cn("text-xs", statusConfig[record.status])}>{record.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {record.stallionName && `Garanhão: ${record.stallionName} • `}
                        {format(new Date(record.date), "dd/MM/yyyy")}
                        {(record as any).foalName && ` • Potro: ${(record as any).foalName}`}
                      </p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{record.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Insemination Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Inseminação</DialogTitle>
            <DialogDescription>
              Registre uma nova inseminação. O fluxo de gestação e nascimento será acompanhado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mare">Égua *</Label>
                <Select value={formData.mareId} onValueChange={(v) => setFormData({ ...formData, mareId: v })}>
                  <SelectTrigger id="mare"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {mares.map((mare) => (
                      <SelectItem key={mare.id} value={mare.id}>{mare.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stallion">Garanhão</Label>
                <Select value={formData.stallionId} onValueChange={(v) => setFormData({ ...formData, stallionId: v })}>
                  <SelectTrigger id="stallion"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {stallions.map((stallion) => (
                      <SelectItem key={stallion.id} value={stallion.id}>{stallion.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input id="date" type="date" value={formData.date} max={new Date().toISOString().split("T")[0]} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vet">Veterinário</Label>
              <Input id="vet" value={formData.veterinarian} onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })} placeholder="Nome do veterinário" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
              <Button type="submit">Registrar Inseminação</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Birth Registration Dialog */}
      <Dialog open={!!birthDialog} onOpenChange={(open) => !open && setBirthDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nascimento</DialogTitle>
            <DialogDescription>
              Registre o nascimento do potro de {birthDialog?.mareName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="foalName">Nome do Potro *</Label>
              <Input id="foalName" value={birthData.foalName} onChange={(e) => setBirthData({ ...birthData, foalName: e.target.value })} placeholder="Nome do potro" />
            </div>
            <div className="space-y-2">
              <Label>Sexo do Potro</Label>
              <Select value={birthData.foalSex} onValueChange={(v) => setBirthData({ ...birthData, foalSex: v as "macho" | "fêmea" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">Macho</SelectItem>
                  <SelectItem value="fêmea">Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthNotes">Observações</Label>
              <Textarea id="birthNotes" value={birthData.notes} onChange={(e) => setBirthData({ ...birthData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBirthDialog(null)}>Cancelar</Button>
            <Button onClick={handleBirthSubmit} disabled={isTransitioning === birthDialog?.id}>
              {isTransitioning === birthDialog?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Nascimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ReproducaoPage;

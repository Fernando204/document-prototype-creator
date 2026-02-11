import { MainLayout } from "@/components/layout/MainLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useHorses } from "@/hooks/useHorses";
import { Competition } from "@/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trophy, MapPin, Calendar, Medal, Loader2, Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface CompetitionHorse {
  horseId: string;
  horseName: string;
  result?: string;
  placement?: number;
  notes?: string;
  performance?: "bom" | "regular" | "ruim";
}

interface CompetitionWithFeedback extends Omit<Competition, "horses"> {
  horses: CompetitionHorse[];
}

const statusConfig = {
  inscrito: { color: "bg-blue-100 text-blue-700", label: "Inscrito" },
  confirmado: { color: "bg-primary/10 text-primary", label: "Confirmado" },
  concluído: { color: "bg-horse-sage-light text-horse-sage", label: "Concluído" },
  cancelado: { color: "bg-destructive/10 text-destructive", label: "Cancelado" },
};

const performanceConfig = {
  bom: { color: "bg-green-100 text-green-700", label: "Bom" },
  regular: { color: "bg-amber-100 text-amber-700", label: "Regular" },
  ruim: { color: "bg-red-100 text-red-700", label: "Ruim" },
};

const initialCompetitions: CompetitionWithFeedback[] = [
  {
    id: "1",
    name: "Copa Regional de Marcha",
    date: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    location: "Haras Bela Vista - MG",
    category: "Marcha Picada",
    horses: [{ horseId: "1", horseName: "Relâmpago" }],
    status: "confirmado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Exposição Nacional",
    date: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    location: "Parque de Exposições - SP",
    category: "Morfologia",
    horses: [{ horseId: "1", horseName: "Relâmpago" }, { horseId: "4", horseName: "Luna" }],
    status: "inscrito",
    createdAt: new Date().toISOString(),
  },
];

const Competicao = () => {
  const [competitions, setCompetitions] = useLocalStorage<CompetitionWithFeedback[]>(
    "horsecontrol-competitions",
    initialCompetitions
  );
  const { horses } = useHorses();
  const [isNewCompOpen, setIsNewCompOpen] = useState(false);
  const [feedbackComp, setFeedbackComp] = useState<CompetitionWithFeedback | null>(null);
  const [feedbackData, setFeedbackData] = useState<CompetitionHorse[]>([]);
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", date: "", location: "", category: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date || selectedHorses.length === 0) {
      toast.error("Nome, data e ao menos um cavalo são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const newComp: CompetitionWithFeedback = {
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        date: formData.date,
        location: formData.location,
        category: formData.category,
        horses: selectedHorses.map((id) => ({ horseId: id, horseName: horses.find((h) => h.id === id)?.name || "" })),
        status: "inscrito",
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };
      setCompetitions((prev) => [...prev, newComp]);
      setFormData({ name: "", date: "", location: "", category: "", notes: "" });
      setSelectedHorses([]);
      setIsNewCompOpen(false);
      toast.success("Competição registrada!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao registrar competição");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = (id: string, status: Competition["status"]) => {
    if (status === "concluído") {
      const comp = competitions.find((c) => c.id === id);
      if (comp) {
        setFeedbackComp(comp);
        setFeedbackData(comp.horses.map((h) => ({ ...h })));
        return;
      }
    }
    setCompetitions((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success("Status atualizado!");
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackComp) return;
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      setCompetitions((prev) =>
        prev.map((c) =>
          c.id === feedbackComp.id ? { ...c, status: "concluído" as const, horses: feedbackData } : c
        )
      );
      setFeedbackComp(null);
      toast.success("Resultado da competição registrado!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar resultado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFeedbackHorse = (index: number, updates: Partial<CompetitionHorse>) => {
    setFeedbackData((prev) => prev.map((h, i) => (i === index ? { ...h, ...updates } : h)));
  };

  const upcomingComps = competitions.filter((c) => c.status !== "cancelado" && c.status !== "concluído").sort((a, b) => a.date.localeCompare(b.date));
  const pastComps = competitions.filter((c) => c.status === "concluído").sort((a, b) => b.date.localeCompare(a.date));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Competições</h1>
            <p className="text-muted-foreground">{upcomingComps.length} próximas • {pastComps.length} realizadas</p>
          </div>
          <Button onClick={() => setIsNewCompOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Competição
          </Button>
        </div>

        {/* Upcoming */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Próximas Competições
          </h2>
          {upcomingComps.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhuma competição agendada.</p>
              <p className="text-xs text-muted-foreground mt-1">Registre uma nova competição para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingComps.map((comp) => {
                const status = statusConfig[comp.status];
                return (
                  <div key={comp.id} className="bg-card rounded-xl shadow-soft p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{comp.name}</h3>
                        <Badge className={cn("text-xs mt-1", status.color)}>{status.label}</Badge>
                      </div>
                      <Trophy className="h-5 w-5 text-horse-gold" />
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{format(new Date(comp.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
                      {comp.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{comp.location}</div>}
                      {comp.category && <div className="flex items-center gap-2"><Medal className="h-4 w-4" />{comp.category}</div>}
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Cavalos inscritos:</p>
                      <div className="flex flex-wrap gap-1">
                        {comp.horses.map((h) => (
                          <Badge key={h.horseId} variant="secondary" className="text-xs">{h.horseName}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={comp.status} onValueChange={(v) => updateStatus(comp.id, v as Competition["status"])}>
                        <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inscrito">Inscrito</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="concluído">Concluído</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Competitions with Feedback */}
        {pastComps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Medal className="h-5 w-5 text-horse-sage" />
              Histórico
            </h2>
            <div className="space-y-3">
              {pastComps.map((comp) => (
                <div key={comp.id} className="bg-card rounded-xl shadow-soft p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{comp.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(comp.date), "dd/MM/yyyy")} • {comp.location}
                        {comp.category && ` • ${comp.category}`}
                      </p>
                    </div>
                    <Badge className="bg-horse-sage-light text-horse-sage text-xs">Concluído</Badge>
                  </div>
                  <div className="space-y-2 mt-3">
                    {comp.horses.map((h) => (
                      <div key={h.horseId} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-foreground">{h.horseName}</span>
                          <div className="flex items-center gap-2">
                            {h.placement && (
                              <Badge variant="outline" className="text-xs">{h.placement}º lugar</Badge>
                            )}
                            {h.performance && (
                              <Badge className={cn("text-xs", performanceConfig[h.performance].color)}>
                                {performanceConfig[h.performance].label}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {h.result && <p className="text-xs text-foreground"><strong>Resultado:</strong> {h.result}</p>}
                        {h.notes && <p className="text-xs text-muted-foreground italic mt-1">{h.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Competition Dialog */}
      <Dialog open={isNewCompOpen} onOpenChange={setIsNewCompOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Competição</DialogTitle>
            <DialogDescription>Registre uma nova competição.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="compName">Nome da Competição *</Label>
              <Input id="compName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Copa Regional" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compDate">Data *</Label>
                <Input id="compDate" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compCategory">Categoria</Label>
                <Input id="compCategory" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Marcha Picada" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compLocation">Local</Label>
              <Input id="compLocation" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Endereço ou nome do local" />
            </div>
            <div className="space-y-2">
              <Label>Cavalos Participantes *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {horses.map((horse) => (
                  <div key={horse.id} className="flex items-center space-x-2">
                    <Checkbox id={`horse-${horse.id}`} checked={selectedHorses.includes(horse.id)} onCheckedChange={(checked) => {
                      setSelectedHorses(checked ? [...selectedHorses, horse.id] : selectedHorses.filter((id) => id !== horse.id));
                    }} />
                    <label htmlFor={`horse-${horse.id}`} className="text-sm">{horse.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compNotes">Observações</Label>
              <Textarea id="compNotes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewCompOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog (when completing competition) */}
      <Dialog open={!!feedbackComp} onOpenChange={(open) => !open && setFeedbackComp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resultado da Competição</DialogTitle>
            <DialogDescription>
              Registre o resultado de cada cavalo em "{feedbackComp?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {feedbackData.map((horse, index) => (
              <div key={horse.horseId} className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-horse-gold" />
                  {horse.horseName}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Colocação</Label>
                    <Input type="number" min="1" placeholder="Ex: 1" value={horse.placement || ""} onChange={(e) => updateFeedbackHorse(index, { placement: e.target.value ? parseInt(e.target.value) : undefined })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Desempenho</Label>
                    <Select value={horse.performance || ""} onValueChange={(v) => updateFeedbackHorse(index, { performance: v as "bom" | "regular" | "ruim" })}>
                      <SelectTrigger><SelectValue placeholder="Avalie" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bom">Bom</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="ruim">Ruim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Resultado</Label>
                  <Input placeholder="Ex: Classificado para final" value={horse.result || ""} onChange={(e) => updateFeedbackHorse(index, { result: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Observações</Label>
                  <Textarea placeholder="Notas sobre o desempenho..." rows={2} value={horse.notes || ""} onChange={(e) => updateFeedbackHorse(index, { notes: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackComp(null)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleFeedbackSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Competicao;

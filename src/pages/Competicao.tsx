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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trophy, MapPin, Calendar, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig = {
  inscrito: { color: "bg-blue-100 text-blue-700", label: "Inscrito" },
  confirmado: { color: "bg-primary/10 text-primary", label: "Confirmado" },
  concluído: { color: "bg-horse-sage-light text-horse-sage", label: "Concluído" },
  cancelado: { color: "bg-destructive/10 text-destructive", label: "Cancelado" },
};

const initialCompetitions: Competition[] = [
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
    horses: [
      { horseId: "1", horseName: "Relâmpago" },
      { horseId: "4", horseName: "Luna" },
    ],
    status: "inscrito",
    createdAt: new Date().toISOString(),
  },
];

const Competicao = () => {
  const [competitions, setCompetitions] = useLocalStorage<Competition[]>(
    "horsecontrol-competitions",
    initialCompetitions
  );
  const { horses } = useHorses();
  const [isNewCompOpen, setIsNewCompOpen] = useState(false);
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    category: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date || selectedHorses.length === 0) {
      toast.error("Nome, data e ao menos um cavalo são obrigatórios");
      return;
    }

    const newComp: Competition = {
      id: crypto.randomUUID(),
      name: formData.name,
      date: formData.date,
      location: formData.location,
      category: formData.category,
      horses: selectedHorses.map((id) => ({
        horseId: id,
        horseName: horses.find((h) => h.id === id)?.name || "",
      })),
      status: "inscrito",
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    setCompetitions((prev) => [...prev, newComp]);
    setFormData({ name: "", date: "", location: "", category: "", notes: "" });
    setSelectedHorses([]);
    setIsNewCompOpen(false);
    toast.success("Competição registrada!");
  };

  const updateStatus = (id: string, status: Competition["status"]) => {
    setCompetitions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    toast.success("Status atualizado!");
  };

  const upcomingComps = competitions
    .filter((c) => c.status !== "cancelado" && c.status !== "concluído")
    .sort((a, b) => a.date.localeCompare(b.date));

  const pastComps = competitions
    .filter((c) => c.status === "concluído")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Competições</h1>
            <p className="text-muted-foreground">
              {upcomingComps.length} próximas • {pastComps.length} realizadas
            </p>
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
              <p className="text-muted-foreground">Nenhuma competição agendada.</p>
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
                        <Badge className={cn("text-xs mt-1", status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      <Trophy className="h-5 w-5 text-horse-gold" />
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(comp.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                      {comp.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {comp.location}
                        </div>
                      )}
                      {comp.category && (
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4" />
                          {comp.category}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Cavalos inscritos:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {comp.horses.map((h) => (
                          <Badge key={h.horseId} variant="secondary" className="text-xs">
                            {h.horseName}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Select
                        value={comp.status}
                        onValueChange={(v) => updateStatus(comp.id, v as Competition["status"])}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
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

        {/* Past Competitions */}
        {pastComps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Medal className="h-5 w-5 text-horse-sage" />
              Histórico
            </h2>
            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              {pastComps.map((comp, index) => (
                <div
                  key={comp.id}
                  className={cn(
                    "p-4 flex items-center justify-between",
                    index > 0 && "border-t"
                  )}
                >
                  <div>
                    <h4 className="font-medium text-foreground">{comp.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comp.date), "dd/MM/yyyy")} • {comp.location}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {comp.horses.map((h) => (
                      <Badge key={h.horseId} variant="outline" className="text-xs">
                        {h.horseName}
                        {h.placement && ` - ${h.placement}º`}
                      </Badge>
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
              <Input
                id="compName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Copa Regional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compDate">Data *</Label>
                <Input
                  id="compDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compCategory">Categoria</Label>
                <Input
                  id="compCategory"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Marcha Picada"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compLocation">Local</Label>
              <Input
                id="compLocation"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Endereço ou nome do local"
              />
            </div>

            <div className="space-y-2">
              <Label>Cavalos Participantes *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {horses.map((horse) => (
                  <div key={horse.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`horse-${horse.id}`}
                      checked={selectedHorses.includes(horse.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedHorses([...selectedHorses, horse.id]);
                        } else {
                          setSelectedHorses(selectedHorses.filter((id) => id !== horse.id));
                        }
                      }}
                    />
                    <label htmlFor={`horse-${horse.id}`} className="text-sm">
                      {horse.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compNotes">Observações</Label>
              <Textarea
                id="compNotes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewCompOpen(false)}>
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

export default Competicao;

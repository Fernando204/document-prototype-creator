import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Plus,
  Pencil,
  Eye,
  Power,
  Trash2,
  Search,
  Shield,
  Clock,
  AlertTriangle,
  X,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { useTeams, teamAreas, type Team, type CreateTeamPayload } from "@/hooks/useTeams";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useHorses } from "@/hooks/useHorses";

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  status: "ativo" | "inativo";
}

const turnoLabels: Record<string, string> = {
  manhã: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
};

const emptyForm: CreateTeamPayload = {
  nome: "",
  area: "",
  responsavelId: "",
  descricao: "",
  turno: "integral",
  status: "ativa",
  observacoes: "",
  colaboradorIds: [],
  cavalosIds: [],
};

const HorseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
    <circle cx="18" cy="8" r="1" />
  </svg>
);

const Equipes = () => {
  const { teams, addTeam, updateTeam, deactivateTeam, deleteTeam, getTeamsForColaborador } = useTeams();
  const [colaboradores] = useLocalStorage<Colaborador[]>("horsecontrol-colaboradores", []);
  const { horses } = useHorses();

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState<CreateTeamPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todas");

  const activeColaboradores = colaboradores.filter((c) => c.status === "ativo");

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (filterArea !== "todas" && t.area !== filterArea) return false;
      if (filterStatus !== "todas" && t.status !== filterStatus) return false;
      if (searchTerm && !t.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [teams, filterArea, filterStatus, searchTerm]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingId(team.id);
    setForm({
      nome: team.nome,
      area: team.area,
      responsavelId: team.responsavelId,
      descricao: team.descricao,
      turno: team.turno,
      status: team.status,
      observacoes: team.observacoes,
      colaboradorIds: [...team.colaboradorIds],
      cavalosIds: [...team.cavalosIds],
    });
    setFormOpen(true);
  };

  const openDetail = (team: Team) => {
    setViewingTeam(team);
    setDetailOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) { toast.error("Nome da equipe é obrigatório."); return; }
    if (!form.area) { toast.error("Área de atuação é obrigatória."); return; }
    if (!form.responsavelId) { toast.error("Selecione um responsável."); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    if (editingId) {
      updateTeam(editingId, form);
      toast.success("Equipe atualizada com sucesso!");
    } else {
      addTeam(form);
      toast.success("Equipe criada com sucesso!");
    }
    setSaving(false);
    setFormOpen(false);
  };

  const handleDeactivate = (team: Team) => {
    deactivateTeam(team.id);
    toast.success(team.status === "ativa" ? "Equipe desativada." : "Equipe reativada.");
  };

  const handleDelete = (team: Team) => {
    if (team.history.length > 1) {
      toast.error("Equipes com histórico não podem ser excluídas, apenas desativadas.");
      return;
    }
    deleteTeam(team.id);
    toast.success("Equipe removida.");
  };

  const toggleColaborador = (id: string) => {
    setForm((prev) => ({
      ...prev,
      colaboradorIds: prev.colaboradorIds.includes(id)
        ? prev.colaboradorIds.filter((c) => c !== id)
        : [...prev.colaboradorIds, id],
    }));
  };

  const toggleCavalo = (id: string) => {
    setForm((prev) => ({
      ...prev,
      cavalosIds: prev.cavalosIds.includes(id)
        ? prev.cavalosIds.filter((c) => c !== id)
        : [...prev.cavalosIds, id],
    }));
  };

  const getColabName = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? "—";
  const getColabFuncao = (id: string) => colaboradores.find((c) => c.id === id)?.funcao ?? "";
  const getHorseName = (id: string) => horses.find((h) => h.id === id)?.name ?? "—";
  const getHorseBreed = (id: string) => horses.find((h) => h.id === id)?.breed ?? "";

  // Workload indicator
  const getWorkload = (team: Team) => {
    if (team.colaboradorIds.length === 0) return { ratio: 0, level: "vazio" as const };
    const ratio = team.cavalosIds.length / team.colaboradorIds.length;
    if (ratio > 5) return { ratio, level: "alta" as const };
    if (ratio > 3) return { ratio, level: "media" as const };
    return { ratio, level: "baixa" as const };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Equipes
            </h1>
            <p className="text-muted-foreground">Organização dos times operacionais do haras</p>
          </div>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" /> Nova Equipe
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{teams.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{teams.filter((t) => t.status === "ativa").length}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(teams.flatMap((t) => t.colaboradorIds)).size}
                </p>
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <HorseIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(teams.flatMap((t) => t.cavalosIds)).size}
                </p>
                <p className="text-xs text-muted-foreground">Cavalos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar equipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as áreas</SelectItem>
              {teamAreas.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos</SelectItem>
              <SelectItem value="ativa">Ativas</SelectItem>
              <SelectItem value="inativa">Inativas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="bg-card rounded-xl shadow-soft p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Nenhuma equipe encontrada</h3>
            <p className="text-muted-foreground text-sm">
              {teams.length === 0
                ? 'Clique em "Nova Equipe" para começar.'
                : "Ajuste os filtros para encontrar equipes."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTeams.map((team) => {
              const workload = getWorkload(team);
              const responsavel = getColabName(team.responsavelId);
              return (
                <Card key={team.id} className={`transition-all hover:shadow-md ${team.status === "inativa" ? "opacity-60" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{team.nome}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{team.area}</Badge>
                          <Badge variant={team.status === "ativa" ? "default" : "outline"} className="text-xs">
                            {team.status === "ativa" ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                      </div>
                      {workload.level === "alta" && team.status === "ativa" && (
                        <div className="text-amber-500" title="Equipe sobrecarregada">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{responsavel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{turnoLabels[team.turno]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>{team.colaboradorIds.length} colaborador{team.colaboradorIds.length !== 1 && "es"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HorseIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{team.cavalosIds.length} cavalo{team.cavalosIds.length !== 1 && "s"}</span>
                      </div>
                    </div>

                    {/* Workload bar */}
                    {team.colaboradorIds.length > 0 && team.status === "ativa" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Carga de trabalho</span>
                          <span>{workload.ratio.toFixed(1)} cavalos/colab.</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              workload.level === "alta"
                                ? "bg-amber-500"
                                : workload.level === "media"
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, (workload.ratio / 8) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(team)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(team)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeactivate(team)} title={team.status === "ativa" ? "Desativar" : "Reativar"}>
                        <Power className={`h-4 w-4 ${team.status === "inativa" ? "text-emerald-500" : "text-muted-foreground"}`} />
                      </Button>
                      {team.history.length <= 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(team)} title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Equipe" : "Nova Equipe"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize as informações da equipe." : "Preencha os dados para criar uma nova equipe."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Name & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da equipe *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Equipe de Treinamento" />
              </div>
              <div className="space-y-2">
                <Label>Área de atuação *</Label>
                <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                  <SelectContent>
                    {teamAreas.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Responsável & Turno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsável / Líder *</Label>
                <Select value={form.responsavelId} onValueChange={(v) => setForm({ ...form, responsavelId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o líder" /></SelectTrigger>
                  <SelectContent>
                    {activeColaboradores.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome} — {c.funcao || "Sem cargo"}</SelectItem>
                    ))}
                    {activeColaboradores.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum colaborador ativo cadastrado</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turno de trabalho</Label>
                <Select value={form.turno} onValueChange={(v) => setForm({ ...form, turno: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manhã">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                    <SelectItem value="integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Notas internas" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva as responsabilidades da equipe..." rows={3} />
            </div>

            <Separator />

            {/* Colaboradores */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" /> Colaboradores
              </Label>
              {activeColaboradores.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum colaborador ativo disponível.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-md border border-border p-3">
                  {activeColaboradores.map((c) => {
                    const otherTeams = teams.filter(
                      (t) => t.id !== editingId && t.colaboradorIds.includes(c.id) && t.status === "ativa"
                    );
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={form.colaboradorIds.includes(c.id)}
                          onCheckedChange={() => toggleColaborador(c.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.nome}</p>
                          <div className="flex items-center gap-1">
                            {c.funcao && <span className="text-xs text-muted-foreground">{c.funcao}</span>}
                            {otherTeams.length > 0 && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">
                                +{otherTeams.length} equipe{otherTeams.length > 1 && "s"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{form.colaboradorIds.length} selecionado(s)</p>
            </div>

            <Separator />

            {/* Cavalos */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <HorseIcon className="h-4 w-4" /> Cavalos
              </Label>
              {horses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cavalo cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-md border border-border p-3">
                  {horses.map((h) => (
                    <label
                      key={h.id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={form.cavalosIds.includes(h.id)}
                        onCheckedChange={() => toggleCavalo(h.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{h.name}</p>
                        <span className="text-xs text-muted-foreground">{h.breed}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{form.cavalosIds.length} selecionado(s)</p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Salvando..." : editingId ? "Atualizar Equipe" : "Criar Equipe"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewingTeam && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-xl">{viewingTeam.nome}</DialogTitle>
                  <Badge variant={viewingTeam.status === "ativa" ? "default" : "outline"}>
                    {viewingTeam.status === "ativa" ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <DialogDescription>{viewingTeam.descricao || "Sem descrição"}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 py-2">
                {/* Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Área</p>
                    <Badge variant="secondary">{viewingTeam.area}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Responsável</p>
                    <p className="font-medium">{getColabName(viewingTeam.responsavelId)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Turno</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {turnoLabels[viewingTeam.turno]}
                    </p>
                  </div>
                </div>

                {viewingTeam.observacoes && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Observações</p>
                    <p className="text-sm">{viewingTeam.observacoes}</p>
                  </div>
                )}

                {/* Workload summary */}
                {viewingTeam.colaboradorIds.length > 0 && viewingTeam.cavalosIds.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Carga de trabalho</span>
                        <span className="font-semibold">
                          {(viewingTeam.cavalosIds.length / viewingTeam.colaboradorIds.length).toFixed(1)} cavalos por colaborador
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Colaboradores list */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Colaboradores ({viewingTeam.colaboradorIds.length})
                  </h4>
                  {viewingTeam.colaboradorIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum colaborador vinculado.</p>
                  ) : (
                    <div className="space-y-2">
                      {viewingTeam.colaboradorIds.map((id) => (
                        <div key={id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <div>
                            <p className="text-sm font-medium">{getColabName(id)}</p>
                            <p className="text-xs text-muted-foreground">{getColabFuncao(id) || "Sem função"}</p>
                          </div>
                          {id === viewingTeam.responsavelId && (
                            <Badge variant="secondary" className="text-xs">Líder</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Cavalos list */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <HorseIcon className="h-4 w-4 text-primary" /> Cavalos ({viewingTeam.cavalosIds.length})
                  </h4>
                  {viewingTeam.cavalosIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum cavalo vinculado.</p>
                  ) : (
                    <div className="space-y-2">
                      {viewingTeam.cavalosIds.map((id) => (
                        <div key={id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <div>
                            <p className="text-sm font-medium">{getHorseName(id)}</p>
                            <p className="text-xs text-muted-foreground">{getHorseBreed(id)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* History */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Histórico
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewingTeam.history.map((h) => (
                      <div key={h.id} className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/30">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground">{h.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {h.user} • {new Date(h.timestamp).toLocaleDateString("pt-BR")} {new Date(h.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Equipes;

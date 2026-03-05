import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Pencil, Trash2, Phone, Mail, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEvents } from "@/hooks/useEvents";
import { useHorses } from "@/hooks/useHorses";
import { useStock } from "@/hooks/useStock";
import { WorkScheduleEditor, emptySchedule, type WeekSchedule } from "@/components/colaboradores/WorkScheduleEditor";
import { ColaboradorAgenda } from "@/components/colaboradores/ColaboradorAgenda";
import { NewEventDialog } from "@/components/modals/NewEventDialog";
import { EditEventDialog } from "@/components/modals/EditEventDialog";
import type { HealthEvent } from "@/types";

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  dataAdmissao: string;
  status: "ativo" | "inativo";
  observacoes: string;
  horario: WeekSchedule;
}

const funcoes = [
  "Tratador", "Veterinário", "Ferreiro", "Instrutor", "Domador",
  "Administrador", "Segurança", "Auxiliar de Serviços Gerais", "Motorista", "Outro",
];

const emptyForm: Omit<Colaborador, "id"> = {
  nome: "", funcao: "", telefone: "", email: "",
  dataAdmissao: "", status: "ativo", observacoes: "", horario: emptySchedule,
};

const Colaboradores = () => {
  const [colaboradores, setColaboradores] = useLocalStorage<Colaborador[]>("horsecontrol-colaboradores", []);
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { horses } = useHorses();
  const { stock } = useStock();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterFuncao, setFilterFuncao] = useState<string>("todas");

  // Agenda state
  const [selectedColabId, setSelectedColabId] = useState<string | null>(null);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null);

  const selectedColab = colaboradores.find((c) => c.id === selectedColabId);

  // Events for selected collaborator
  const colabEvents = selectedColabId
    ? events.filter((e) => e.colaboradorIds?.includes(selectedColabId))
    : [];

  const getHorseName = (id: string) => horses.find((h) => h.id === id)?.name ?? "?";

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: Colaborador) => {
    setEditingId(c.id);
    setForm({
      nome: c.nome, funcao: c.funcao, telefone: c.telefone, email: c.email,
      dataAdmissao: c.dataAdmissao, status: c.status, observacoes: c.observacoes,
      horario: c.horario ?? emptySchedule,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim() || !form.funcao) { toast.error("Nome e função são obrigatórios."); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    if (editingId) {
      setColaboradores((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...form } : c)));
      toast.success("Colaborador atualizado!");
    } else {
      setColaboradores((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
      toast.success("Colaborador cadastrado!");
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
    // Remove collaborator from events
    events.forEach((e) => {
      if (e.colaboradorIds?.includes(id)) {
        updateEvent(e.id, { colaboradorIds: e.colaboradorIds.filter((cId) => cId !== id) });
      }
    });
    if (selectedColabId === id) setSelectedColabId(null);
    toast.success("Colaborador removido.");
  };

  const toggleStatus = (id: string) => {
    setColaboradores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "ativo" ? "inativo" : "ativo" } : c))
    );
    toast.success("Status atualizado.");
  };

  const filtered = filterFuncao === "todas" ? colaboradores : colaboradores.filter((c) => c.funcao === filterFuncao);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Colaboradores
            </h1>
            <p className="text-muted-foreground">Gerencie funcionários, horários e tarefas.</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo Colaborador</Button>
        </div>

        <Tabs defaultValue="lista">
          <TabsList>
            <TabsTrigger value="lista"><Users className="h-4 w-4 mr-1" /> Equipe</TabsTrigger>
            <TabsTrigger value="agenda"><Calendar className="h-4 w-4 mr-1" /> Agenda</TabsTrigger>
          </TabsList>

          {/* ===== TAB LISTA ===== */}
          <TabsContent value="lista" className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground">Filtrar por função:</Label>
              <Select value={filterFuncao} onValueChange={setFilterFuncao}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {funcoes.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-card rounded-xl shadow-soft p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum colaborador cadastrado</h3>
                <p className="text-muted-foreground text-sm">Clique em "Novo Colaborador" para começar.</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl shadow-soft overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="hidden md:table-cell">Contato</TableHead>
                      <TableHead className="hidden lg:table-cell">Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => {
                      const workDays = (Object.keys(c.horario ?? {}) as (keyof WeekSchedule)[])
                        .filter((d) => (c.horario?.[d]?.length ?? 0) > 0).length;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.nome}</TableCell>
                          <TableCell><Badge variant="secondary">{c.funcao}</Badge></TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              {c.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telefone}</span>}
                              {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {workDays > 0 ? (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" /> {workDays} dias/semana
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Não definido</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.status === "ativo" ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleStatus(c.id)}>
                              {c.status === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedColabId(c.id); document.querySelector<HTMLElement>('[value="agenda"]')?.click(); }}>
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ===== TAB AGENDA ===== */}
          <TabsContent value="agenda" className="space-y-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground">Colaborador:</Label>
              <Select value={selectedColabId ?? "none"} onValueChange={(v) => setSelectedColabId(v === "none" ? null : v)}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Selecione um colaborador" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione...</SelectItem>
                  {colaboradores.filter((c) => c.status === "ativo").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome} — {c.funcao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedColab ? (
              <ColaboradorAgenda
                schedule={selectedColab.horario ?? emptySchedule}
                events={colabEvents}
                onAddEvent={() => setNewEventOpen(true)}
                onEditEvent={(ev) => setEditingEvent(ev)}
                onDeleteEvent={(id) => { deleteEvent(id); toast.success("Evento removido."); }}
                getHorseName={getHorseName}
              />
            ) : (
              <div className="bg-card rounded-xl shadow-soft p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Selecione um colaborador</h3>
                <p className="text-muted-foreground text-sm">Escolha um colaborador para ver sua agenda.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Colaborador Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Colaborador" : "Novo Colaborador"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
                </div>
                <div className="space-y-2">
                  <Label>Função *</Label>
                  <Select value={form.funcao} onValueChange={(v) => setForm({ ...form, funcao: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{funcoes.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Admissão</Label>
                  <Input type="date" value={form.dataAdmissao} onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "ativo" | "inativo" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Informações adicionais" />
              </div>
              <div className="border-t border-border pt-4">
                <WorkScheduleEditor schedule={form.horario} onChange={(h) => setForm({ ...form, horario: h })} />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Event Dialog from colaborador agenda */}
        <NewEventDialog
          open={newEventOpen}
          onOpenChange={setNewEventOpen}
          onSave={(ev) => {
            const withColab = selectedColabId
              ? { ...ev, colaboradorIds: [...(ev.colaboradorIds ?? []), ...(!(ev.colaboradorIds ?? []).includes(selectedColabId) ? [selectedColabId] : [])] }
              : ev;
            addEvent(withColab);
          }}
          horses={horses}
          colaboradores={colaboradores}
          stock={stock}
        />

        {editingEvent && (
          <EditEventDialog
            open={!!editingEvent}
            onOpenChange={(open) => !open && setEditingEvent(null)}
            event={editingEvent}
            onSave={updateEvent}
            onDelete={deleteEvent}
            horses={horses}
            colaboradores={colaboradores}
            stock={stock}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Colaboradores;

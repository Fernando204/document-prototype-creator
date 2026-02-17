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
  DialogTrigger,
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
import { Users, Plus, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  dataAdmissao: string;
  status: "ativo" | "inativo";
  observacoes: string;
}

const funcoes = [
  "Tratador",
  "Veterinário",
  "Ferreiro",
  "Instrutor",
  "Domador",
  "Administrador",
  "Segurança",
  "Auxiliar de Serviços Gerais",
  "Motorista",
  "Outro",
];

const emptyForm: Omit<Colaborador, "id"> = {
  nome: "",
  funcao: "",
  telefone: "",
  email: "",
  dataAdmissao: "",
  status: "ativo",
  observacoes: "",
};

const Colaboradores = () => {
  const [colaboradores, setColaboradores] = useLocalStorage<Colaborador[]>(
    "horsecontrol-colaboradores",
    []
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterFuncao, setFilterFuncao] = useState<string>("todas");

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Colaborador) => {
    setEditingId(c.id);
    setForm({
      nome: c.nome,
      funcao: c.funcao,
      telefone: c.telefone,
      email: c.email,
      dataAdmissao: c.dataAdmissao,
      status: c.status,
      observacoes: c.observacoes,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim() || !form.funcao) {
      toast.error("Nome e função são obrigatórios.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    if (editingId) {
      setColaboradores((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
      toast.success("Colaborador atualizado!");
    } else {
      const novo: Colaborador = {
        ...form,
        id: crypto.randomUUID(),
      };
      setColaboradores((prev) => [...prev, novo]);
      toast.success("Colaborador cadastrado!");
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
    toast.success("Colaborador removido.");
  };

  const toggleStatus = (id: string) => {
    setColaboradores((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ativo" ? "inativo" : "ativo" }
          : c
      )
    );
    toast.success("Status atualizado.");
  };

  const filtered =
    filterFuncao === "todas"
      ? colaboradores
      : colaboradores.filter((c) => c.funcao === filterFuncao);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Colaboradores
            </h1>
            <p className="text-muted-foreground">
              Gerencie os funcionários da propriedade.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Colaborador" : "Novo Colaborador"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={form.nome}
                      onChange={(e) =>
                        setForm({ ...form, nome: e.target.value })
                      }
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Função *</Label>
                    <Select
                      value={form.funcao}
                      onValueChange={(v) => setForm({ ...form, funcao: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {funcoes.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={form.telefone}
                      onChange={(e) =>
                        setForm({ ...form, telefone: e.target.value })
                      }
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Admissão</Label>
                    <Input
                      type="date"
                      value={form.dataAdmissao}
                      onChange={(e) =>
                        setForm({ ...form, dataAdmissao: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm({ ...form, status: v as "ativo" | "inativo" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input
                    value={form.observacoes}
                    onChange={(e) =>
                      setForm({ ...form, observacoes: e.target.value })
                    }
                    placeholder="Informações adicionais"
                  />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground">Filtrar por função:</Label>
          <Select value={filterFuncao} onValueChange={setFilterFuncao}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {funcoes.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="bg-card rounded-xl shadow-soft p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Nenhum colaborador cadastrado
            </h3>
            <p className="text-muted-foreground text-sm">
              Clique em "Novo Colaborador" para começar.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.funcao}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {c.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {c.telefone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {c.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === "ativo" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(c.id)}
                      >
                        {c.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Colaboradores;

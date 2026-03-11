import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CategorySelect } from "@/components/CategorySelect";
import { useCategories } from "@/hooks/useCategories";
import { Plus, Search, Edit, Trash2, Phone, Mail, Truck, Eye } from "lucide-react";
import { toast } from "sonner";

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  type: "ração" | "medicamento" | "equipamento" | "veterinário" | "ferreiro" | "transporte" | "outro";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const Fornecedores = () => {
  const { labelsMap: typeLabelsMap } = useCategories("supplier");

  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>("horsecontrol-suppliers", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", phone: "", email: "", type: "outro" as Supplier["type"], notes: "" });

  const resetForm = () => { setFormData({ name: "", phone: "", email: "", type: "outro", notes: "" }); setEditing(null); };

  const openNew = () => { resetForm(); setIsFormOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setFormData({ name: s.name, phone: s.phone || "", email: s.email || "", type: s.type, notes: s.notes || "" });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Nome é obrigatório"); return; }

    if (editing) {
      setSuppliers((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...formData, updatedAt: new Date().toISOString() } : s));
      toast.success("Fornecedor atualizado!");
    } else {
      const newSupplier: Supplier = { ...formData, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setSuppliers((prev) => [...prev, newSupplier]);
      toast.success("Fornecedor cadastrado!");
    }
    resetForm();
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    toast.success("Fornecedor removido!");
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground">{suppliers.length} {suppliers.length === 1 ? "fornecedor cadastrado" : "fornecedores cadastrados"}</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Novo Fornecedor</Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl">
            <Truck className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">{searchTerm ? "Nenhum fornecedor encontrado." : "Nenhum fornecedor cadastrado."}</p>
            <Button variant="outline" onClick={openNew} className="mt-2"><Plus className="h-4 w-4 mr-2" /> Cadastrar primeiro fornecedor</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base truncate">{supplier.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/fornecedores/${supplier.id}`)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(supplier)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(supplier.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {supplier.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{supplier.phone}</span></div>}
                  {supplier.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{supplier.email}</span></div>}
                  <Badge variant="secondary" className="text-xs">{typeLabels[supplier.type]}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormOpen(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
            <DialogDescription>{editing ? "Atualize as informações." : "Cadastre um novo fornecedor."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do fornecedor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Serviço/Produto</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Supplier["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { resetForm(); setIsFormOpen(false); }}>Cancelar</Button>
              <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Fornecedores;

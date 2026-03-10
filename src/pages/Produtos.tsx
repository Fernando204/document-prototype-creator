import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useStock } from "@/hooks/useStock";
import { Product } from "@/types";

const categoryLabels: Record<string, string> = {
  medicamento: "Medicamento",
  ração: "Ração",
  suplemento: "Suplemento",
  equipamento: "Equipamento",
  higiene: "Higiene",
  outro: "Outro",
};

const Produtos = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { stock } = useStock();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    // undefined means no category selected
    category: undefined as Product["category"] | undefined,
    unit: "",
    price: "",
  });

  const resetForm = () => {
    setFormData({ name: "", category: undefined, unit: "", price: "" });
    setEditing(null);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFormData({ name: p.name, category: p.category, unit: p.unit || "", price: p.price != null ? p.price.toString() : "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      toast.error("Preço válido é obrigatório");
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      const payload: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit || undefined,
        price: Number(formData.price),
      };
      if (editing) {
        updateProduct(editing.id, payload);
        toast.success("Produto atualizado");
      } else {
        addProduct(payload);
        toast.success("Produto cadastrado");
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Erro ao salvar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl">
            <Plus className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum produto cadastrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Produto" para começar.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-center">Em Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const stockItem = stock.find((s) => s.name === p.name);
                  const qty = stockItem ? stockItem.quantity - stockItem.reservedQuantity : 0;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category ? categoryLabels[p.category] : "-"}</TableCell>
                      <TableCell>{p.unit || "-"}</TableCell>
                      <TableCell className="text-right">{p.price != null ? p.price.toFixed(2) : "-"}</TableCell>
                      <TableCell className="text-center font-semibold">{qty}</TableCell>
                      <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(p)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => {
                          deleteProduct(p.id);
                          toast.success("Produto removido");
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>Preencha as informações do produto.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do produto" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val as Product["category"] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="(nenhuma)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="kg, doses, frascos..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Produtos;

import { MainLayout } from "@/components/layout/MainLayout";
import React, { useState } from "react";
import { useStock } from "@/hooks/useStock";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CategorySelect } from "@/components/CategorySelect";
import { Plus, Search, Package, AlertTriangle, Edit2, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StockItem } from "@/types";

const Estoque = () => {
  const { stock, addItem, updateItem, deleteItem, getLowStockItems } = useStock();
  const { products } = useProducts();
  const { labelsMap } = useCategories("product");

  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    unit: "",
    minQuantity: "",
    expirationDate: "",
    location: "",
    notes: "",
  });

  const lowStockItems = getLowStockItems();
  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({ productId: "", quantity: "", unit: "", minQuantity: "", expirationDate: "", location: "", notes: "" });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) {
      toast.error("Produto e quantidade são obrigatórios");
      return;
    }
    const selectedProd = products.find((p) => p.id === formData.productId);
    if (!selectedProd) {
      toast.error("Selecione um produto válido");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));

      const payload = {
        name: selectedProd.name,
        category: selectedProd.category || "outro",
        quantity: parseInt(formData.quantity),
        reservedQuantity: editingItem?.reservedQuantity || 0,
        unit: selectedProd.unit || "",
        minQuantity: parseInt(formData.minQuantity) || 0,
        expirationDate: formData.expirationDate,
        location: formData.location,
        notes: formData.notes,
      } as Omit<StockItem, "id" | "createdAt" | "updatedAt">;

      if (editingItem) {
        updateItem(editingItem.id, payload);
        toast.success("Item atualizado!");
      } else {
        addItem(payload);
        toast.success("Item adicionado ao estoque!");
      }

      resetForm();
      setIsNewItemOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (item: StockItem) => {
    setEditingItem(item);
    // try to locate the product by name
    const prod = products.find((p) => p.name === item.name);
    setFormData({
      productId: prod ? prod.id : "",
      quantity: item.quantity.toString(),
      unit: prod?.unit || item.unit,
      minQuantity: item.minQuantity.toString(),
      expirationDate: item.expirationDate || "",
      location: item.location || "",
      notes: item.notes || "",
    });
    setIsNewItemOpen(true);
  };

  // when user picks a product we can auto-fill unit
  React.useEffect(() => {
    if (formData.productId) {
      const prod = products.find((p) => p.id === formData.productId);
      if (prod && prod.unit) {
        setFormData((prev) => ({ ...prev, unit: prod.unit }));
      }
    }
  }, [formData.productId, products]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
            <p className="text-muted-foreground">{stock.length} itens • {lowStockItems.length} com estoque baixo</p>
          </div>
          <Button disabled={products.length === 0} onClick={() => {
              if (products.length === 0) {
                toast.error("Cadastre ao menos um produto antes de adicionar ao estoque");
                return;
              }
              resetForm();
              setIsNewItemOpen(true);
            }}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-horse-gold-light border border-horse-gold/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-horse-gold" />
              <h3 className="font-semibold text-foreground">Estoque Baixo</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Badge key={item.id} variant="outline" className="bg-background">
                  {item.name}: {item.quantity - item.reservedQuantity}/{item.minQuantity} {item.unit} disponíveis
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar item..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <CategorySelect
            group="product"
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            placeholder="Categoria"
            showAll
            className="w-full sm:w-[180px]"
          />
        </div>

        {/* Stock Table */}
        {filteredStock.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum item encontrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione itens ao estoque para começar.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Reservado</TableHead>
                  <TableHead className="text-center">Disponível</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((item) => {
                  const available = item.quantity - item.reservedQuantity;
                  const isLow = available < item.minQuantity;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle className="h-4 w-4 text-horse-gold flex-shrink-0" />}
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", "bg-secondary text-secondary-foreground")}>
                          {labelsMap[item.category] || item.category}
                        </Badge>
                      </TableCell>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        {item.reservedQuantity > 0 ? (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                            {item.reservedQuantity}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className={cn("text-center font-semibold", isLow && "text-horse-gold")}>
                        {available}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (item.reservedQuantity > 0) {
                                toast.error("Não é possível remover um item com reservas ativas.");
                                return;
                              }
                              deleteItem(item.id);
                              toast.success("Item removido");
                            }}
                          >
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

      {/* New/Edit Item Dialog */}
      <Dialog open={isNewItemOpen} onOpenChange={(open) => { setIsNewItemOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Adicionar Item ao Estoque"}</DialogTitle>
            <DialogDescription>Preencha as informações do item.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Produto *</Label>
                <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })} disabled={products.length === 0}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={products.length === 0 ? "Cadastre um produto primeiro" : "Selecione"} /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade *</Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="kg, doses, frascos..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input id="quantity" type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Quantidade Mínima</Label>
                <Input id="minQuantity" type="number" min="0" value={formData.minQuantity} onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="expirationDate">Data de Validade</Label>
                <Input id="expirationDate" type="date" value={formData.expirationDate} onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsNewItemOpen(false); resetForm(); }} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Estoque;

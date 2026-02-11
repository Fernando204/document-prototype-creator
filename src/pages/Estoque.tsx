import { MainLayout } from "@/components/layout/MainLayout";
import { useStock } from "@/hooks/useStock";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, Minus, Edit2, Trash2, ShoppingCart, DollarSign, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StockItem } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const categoryLabels = {
  medicamento: "Medicamento",
  ração: "Ração",
  suplemento: "Suplemento",
  equipamento: "Equipamento",
  higiene: "Higiene",
  outro: "Outro",
};

const categoryColors = {
  medicamento: "bg-red-100 text-red-700",
  ração: "bg-amber-100 text-amber-700",
  suplemento: "bg-green-100 text-green-700",
  equipamento: "bg-blue-100 text-blue-700",
  higiene: "bg-purple-100 text-purple-700",
  outro: "bg-gray-100 text-gray-700",
};

interface Transaction {
  id: string;
  type: "receita" | "despesa";
  category: string;
  description: string;
  amount: number;
  date: string;
  relatedStockItemId?: string;
  createdAt: string;
}

const Estoque = () => {
  const { stock, addItem, updateItem, deleteItem, adjustQuantity, getLowStockItems } = useStock();
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("horsecontrol-transactions", []);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isOperationOpen, setIsOperationOpen] = useState(false);
  const [operationItem, setOperationItem] = useState<StockItem | null>(null);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "medicamento" as StockItem["category"],
    quantity: "",
    unit: "",
    minQuantity: "",
    expirationDate: "",
    location: "",
    notes: "",
  });

  const [opData, setOpData] = useState({
    type: "compra" as "compra" | "venda",
    quantity: "",
    unitPrice: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const lowStockItems = getLowStockItems();
  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({ name: "", category: "medicamento", quantity: "", unit: "", minQuantity: "", expirationDate: "", location: "", notes: "" });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quantity || !formData.unit.trim()) {
      toast.error("Nome, quantidade e unidade são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));

      if (editingItem) {
        updateItem(editingItem.id, {
          name: formData.name,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          minQuantity: parseInt(formData.minQuantity) || 0,
          expirationDate: formData.expirationDate,
          location: formData.location,
          notes: formData.notes,
        });
        toast.success("Item atualizado!");
      } else {
        addItem({
          name: formData.name,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          minQuantity: parseInt(formData.minQuantity) || 0,
          expirationDate: formData.expirationDate,
          location: formData.location,
          notes: formData.notes,
        });
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
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minQuantity: item.minQuantity.toString(),
      expirationDate: item.expirationDate || "",
      location: item.location || "",
      notes: item.notes || "",
    });
    setIsNewItemOpen(true);
  };

  const openOperation = (item: StockItem) => {
    setOperationItem(item);
    setOpData({ type: "compra", quantity: "", unitPrice: "", description: "", date: new Date().toISOString().split("T")[0] });
    setIsOperationOpen(true);
  };

  const handleOperation = async () => {
    if (!operationItem) return;
    if (!opData.quantity || !opData.unitPrice) {
      toast.error("Quantidade e preço unitário são obrigatórios");
      return;
    }

    const qty = parseInt(opData.quantity);
    const price = parseFloat(opData.unitPrice);
    if (qty <= 0 || price <= 0) {
      toast.error("Quantidade e preço devem ser maiores que zero");
      return;
    }

    if (opData.type === "venda" && qty > operationItem.quantity) {
      toast.error("Quantidade insuficiente em estoque");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));

      // Adjust stock
      const quantityChange = opData.type === "compra" ? qty : -qty;
      adjustQuantity(operationItem.id, quantityChange);

      // Create financial transaction
      const totalValue = qty * price;
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: opData.type === "compra" ? "despesa" : "receita",
        category: opData.type === "compra" ? "Estoque (Compra)" : "Estoque (Venda)",
        description: opData.description || `${opData.type === "compra" ? "Compra" : "Venda"}: ${qty} ${operationItem.unit} de ${operationItem.name}`,
        amount: totalValue,
        date: opData.date,
        relatedStockItemId: operationItem.id,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [...prev, newTransaction]);

      setIsOperationOpen(false);
      toast.success(
        `${opData.type === "compra" ? "Compra" : "Venda"} registrada! Estoque e finanças atualizados.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Erro na operação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
            <p className="text-muted-foreground">{stock.length} itens • {lowStockItems.length} com estoque baixo</p>
          </div>
          <Button onClick={() => { resetForm(); setIsNewItemOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
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
                  {item.name}: {item.quantity}/{item.minQuantity} {item.unit}
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Grid */}
        {filteredStock.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum item encontrado.</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione itens ao estoque para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStock.map((item) => {
              const isLow = item.quantity < item.minQuantity;
              return (
                <div key={item.id} className={cn("bg-card rounded-xl shadow-soft p-4 border-2 transition-colors", isLow ? "border-horse-gold/50" : "border-transparent")}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <Badge className={cn("text-xs", categoryColors[item.category])}>{categoryLabels[item.category]}</Badge>
                    </div>
                    {isLow && <AlertTriangle className="h-4 w-4 text-horse-gold" />}
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className={cn("text-2xl font-bold", isLow ? "text-horse-gold" : "text-foreground")}>{item.quantity}</p>
                      <p className="text-xs text-muted-foreground">{item.unit} (mín: {item.minQuantity})</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { adjustQuantity(item.id, -1); toast.info("Quantidade reduzida"); }}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { adjustQuantity(item.id, 1); toast.info("Quantidade aumentada"); }}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {item.expirationDate && (
                    <p className="text-xs text-muted-foreground mb-2">Validade: {new Date(item.expirationDate).toLocaleDateString("pt-BR")}</p>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openOperation(item)}>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Compra/Venda
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => openEdit(item)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { deleteItem(item.id); toast.success("Item removido"); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
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
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do item" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as StockItem["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
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

      {/* Stock Operation Dialog (Buy/Sell) */}
      <Dialog open={isOperationOpen} onOpenChange={setIsOperationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Operação de Estoque</DialogTitle>
            <DialogDescription>
              Compra ou venda de "{operationItem?.name}" — estoque atual: {operationItem?.quantity} {operationItem?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Operação</Label>
              <Select value={opData.type} onValueChange={(v) => setOpData({ ...opData, type: v as "compra" | "venda" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra">Compra (entrada)</SelectItem>
                  <SelectItem value="venda">Venda (saída)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input type="number" min="1" value={opData.quantity} onChange={(e) => setOpData({ ...opData, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Preço Unitário (R$) *</Label>
                <Input type="number" min="0.01" step="0.01" value={opData.unitPrice} onChange={(e) => setOpData({ ...opData, unitPrice: e.target.value })} placeholder="0,00" />
              </div>
            </div>
            {opData.quantity && opData.unitPrice && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor total:</span>
                <span className="font-bold text-foreground">
                  R$ {(parseInt(opData.quantity || "0") * parseFloat(opData.unitPrice || "0")).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={opData.description} onChange={(e) => setOpData({ ...opData, description: e.target.value })} placeholder="Descrição opcional" />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={opData.date} onChange={(e) => setOpData({ ...opData, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOperationOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button onClick={handleOperation} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {opData.type === "compra" ? "Registrar Compra" : "Registrar Venda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Estoque;

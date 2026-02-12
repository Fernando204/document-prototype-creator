import { MainLayout } from "@/components/layout/MainLayout";
import { TrendingUp, TrendingDown, PiggyBank, Receipt, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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

const initialTransactions: Transaction[] = [
  { id: "1", type: "receita", category: "Venda", description: "Venda de potro", amount: 25000, date: "2025-01-15", createdAt: new Date().toISOString() },
  { id: "2", type: "receita", category: "Prêmio", description: "Prêmio competição regional", amount: 5000, date: "2025-01-20", createdAt: new Date().toISOString() },
  { id: "3", type: "despesa", category: "Veterinário", description: "Consulta e vacinas", amount: 1200, date: "2025-01-18", createdAt: new Date().toISOString() },
  { id: "4", type: "despesa", category: "Alimentação", description: "Ração mensal", amount: 3500, date: "2025-01-25", createdAt: new Date().toISOString() },
  { id: "5", type: "despesa", category: "Ferrageamento", description: "Ferradura completa", amount: 800, date: "2025-01-28", createdAt: new Date().toISOString() },
];

const categoryColors = {
  receita: {
    Venda: "bg-green-100 text-green-700",
    Prêmio: "bg-emerald-100 text-emerald-700",
    Cobertura: "bg-teal-100 text-teal-700",
    "Estoque (Venda)": "bg-cyan-100 text-cyan-700",
    Outro: "bg-lime-100 text-lime-700",
  },
  despesa: {
    Veterinário: "bg-red-100 text-red-700",
    Alimentação: "bg-orange-100 text-orange-700",
    Ferrageamento: "bg-amber-100 text-amber-700",
    Medicamento: "bg-rose-100 text-rose-700",
    Equipamento: "bg-pink-100 text-pink-700",
    "Estoque (Compra)": "bg-indigo-100 text-indigo-700",
    Outro: "bg-gray-100 text-gray-700",
  },
};

interface FormErrors {
  type?: string;
  category?: string;
  amount?: string;
  date?: string;
  description?: string;
}

const Financeiro = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    "horsecontrol-transactions",
    initialTransactions
  );
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    type: "" as "" | "receita" | "despesa",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalReceitas = monthlyTransactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.amount, 0);
  const totalDespesas = monthlyTransactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalReceitas - totalDespesas;

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.type) errs.type = "Selecione o tipo de transação";
    if (!formData.category) errs.category = "Selecione uma categoria";
    if (!formData.amount || isNaN(parseFloat(formData.amount))) errs.amount = "Informe um valor válido";
    else if (parseFloat(formData.amount) <= 0) errs.amount = "Valor deve ser maior que zero";
    if (!formData.date) errs.date = "Data é obrigatória";
    else if (isNaN(new Date(formData.date).getTime())) errs.date = "Data inválida";
    if (!formData.description.trim()) errs.description = "Descrição é obrigatória";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrija os erros antes de continuar");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));

      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: formData.type as "receita" | "despesa",
        category: formData.category,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date,
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [...prev, newTransaction]);
      setFormData({ type: "", category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
      setErrors({});
      setIsNewOpen(false);
      toast.success("Transação registrada com sucesso!");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao registrar transação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (type: "receita" | "despesa", category: string) => {
    const colors = categoryColors[type];
    return colors[category as keyof typeof colors] || (type === "receita" ? colors.Outro : (colors as any).Outro);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground">{format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
          <Button onClick={() => setIsNewOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl shadow-soft p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-horse-sage-light"><TrendingUp className="h-5 w-5 text-horse-sage" /></div>
              <span className="text-sm text-muted-foreground">Receitas</span>
            </div>
            <p className="text-2xl font-bold text-horse-sage">R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card rounded-xl shadow-soft p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10"><TrendingDown className="h-5 w-5 text-destructive" /></div>
              <span className="text-sm text-muted-foreground">Despesas</span>
            </div>
            <p className="text-2xl font-bold text-destructive">R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-card rounded-xl shadow-soft p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", saldo >= 0 ? "bg-horse-sage-light" : "bg-destructive/10")}>
                <PiggyBank className={cn("h-5 w-5", saldo >= 0 ? "text-horse-sage" : "text-destructive")} />
              </div>
              <span className="text-sm text-muted-foreground">Saldo</span>
            </div>
            <p className={cn("text-2xl font-bold", saldo >= 0 ? "text-horse-sage" : "text-destructive")}>
              R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-card rounded-xl shadow-soft">
          <div className="p-4 border-b flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Transações Recentes</h2>
          </div>
          <div className="divide-y">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Nenhuma transação registrada.</p>
                <p className="text-xs text-muted-foreground mt-1">Registre sua primeira movimentação financeira.</p>
              </div>
            ) : (
              [...transactions]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 20)
                .map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", transaction.type === "receita" ? "bg-horse-sage-light" : "bg-destructive/10")}>
                      {transaction.type === "receita" ? <TrendingUp className="h-4 w-4 text-horse-sage" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">{transaction.description || transaction.category}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getCategoryColor(transaction.type, transaction.category))}>
                          {transaction.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), "dd/MM/yyyy")}</p>
                    </div>
                    <p className={cn("font-bold", transaction.type === "receita" ? "text-horse-sage" : "text-destructive")}>
                      {transaction.type === "receita" ? "+" : "-"} R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* New Transaction Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>Registre uma receita ou despesa. Campos com * são obrigatórios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as "receita" | "despesa", category: "" })}>
                  <SelectTrigger className={cn(errors.type && "border-destructive")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className={cn(errors.category && "border-destructive")}><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {formData.type === "receita" ? (
                      <>
                        <SelectItem value="Venda">Venda</SelectItem>
                        <SelectItem value="Prêmio">Prêmio</SelectItem>
                        <SelectItem value="Cobertura">Cobertura</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </>
                    ) : formData.type === "despesa" ? (
                      <>
                        <SelectItem value="Veterinário">Veterinário</SelectItem>
                        <SelectItem value="Alimentação">Alimentação</SelectItem>
                        <SelectItem value="Ferrageamento">Ferrageamento</SelectItem>
                        <SelectItem value="Medicamento">Medicamento</SelectItem>
                        <SelectItem value="Equipamento">Equipamento</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </>
                    ) : (
                      <SelectItem value="__placeholder" disabled>Selecione o tipo primeiro</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a transação"
                className={cn(errors.description && "border-destructive")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0,00"
                  className={cn(errors.amount && "border-destructive")}
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={cn(errors.date && "border-destructive")}
                />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Financeiro;

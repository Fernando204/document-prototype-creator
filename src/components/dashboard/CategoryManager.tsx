import { useState } from "react";
import { useCategories, CustomCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Edit2, Trash2, Tags, Plus } from "lucide-react";
import { toast } from "sonner";
import { NewCategoryDialog } from "@/components/modals/NewCategoryDialog";

const groupLabels: Record<string, string> = {
  product: "Produtos/Estoque",
  supplier: "Fornecedores",
};

export function CategoryManager() {
  const productCats = useCategories("product");
  const supplierCats = useCategories("supplier");

  const [activeGroup, setActiveGroup] = useState<string>("product");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CustomCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const activeCats = activeGroup === "product" ? productCats : supplierCats;

  const handleAddCategory = (name: string, description?: string): boolean => {
    const result = activeCats.addCategory(name, description);
    return result !== null;
  };

  const openEdit = (cat: CustomCategory) => {
    setEditingCat(cat);
    setEditName(cat.label);
    setEditDesc(cat.description || "");
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editName.trim()) return;
    activeCats.updateCategory(editingCat.id, {
      label: editName.trim(),
      description: editDesc.trim() || undefined,
    });
    toast.success("Categoria atualizada!");
    setEditDialogOpen(false);
    setEditingCat(null);
  };

  const handleDelete = (cat: CustomCategory) => {
    activeCats.deleteCategory(cat.id);
    toast.success(`Categoria "${cat.label}" removida`);
  };

  return (
    <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Tags className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
        <div className="ml-auto flex items-center gap-2">
          {Object.entries(groupLabels).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={activeGroup === key ? "default" : "outline"}
              onClick={() => setActiveGroup(key)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Built-in categories as badges */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-2">Categorias padrão</p>
        <div className="flex flex-wrap gap-1.5">
          {activeCats.categories
            .filter((c) => !activeCats.customCategories.find((cc) => cc.value === c.value))
            .map((c) => (
              <Badge key={c.value} variant="secondary" className="text-xs">
                {c.label}
              </Badge>
            ))}
        </div>
      </div>

      {/* Custom categories table */}
      {activeCats.customCategories.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Categorias personalizadas</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCats.customCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.label}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {cat.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(cat)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cat)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Button size="sm" variant="outline" onClick={() => setNewDialogOpen(true)} className="w-full">
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Nova Categoria
      </Button>

      <NewCategoryDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        onConfirm={handleAddCategory}
      />

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>Atualize os dados da categoria.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

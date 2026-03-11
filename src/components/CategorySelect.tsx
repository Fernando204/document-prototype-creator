import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewCategoryDialog } from "@/components/modals/NewCategoryDialog";
import { useCategories } from "@/hooks/useCategories";
import { PlusCircle } from "lucide-react";

interface CategorySelectProps {
  group: string; // "product" | "supplier"
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show "Todas Categorias" as first option */
  showAll?: boolean;
}

export function CategorySelect({
  group,
  value,
  onValueChange,
  placeholder = "Selecione",
  disabled,
  className,
  showAll,
}: CategorySelectProps) {
  const { categories, addCategory } = useCategories(group);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleValueChange = (val: string) => {
    if (val === "__new__") {
      setDialogOpen(true);
      return;
    }
    onValueChange(val);
  };

  const handleConfirm = (name: string, description?: string): boolean => {
    const result = addCategory(name, description);
    if (!result) return false;
    // Auto-select the new category
    onValueChange(result.value);
    return true;
  };

  return (
    <>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {showAll && <SelectItem value="all">Todas Categorias</SelectItem>}
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="__new__">
            <span className="flex items-center gap-2 text-primary">
              <PlusCircle className="h-3.5 w-3.5" />
              Criar nova categoria...
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <NewCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirm}
      />
    </>
  );
}

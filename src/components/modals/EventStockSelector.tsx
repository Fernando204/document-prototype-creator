import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockItem, EventStockItem } from "@/types";
import { Package, Plus, X } from "lucide-react";

interface EventStockSelectorProps {
  stock: StockItem[];
  selectedItems: EventStockItem[];
  onChange: (items: EventStockItem[]) => void;
}

export function EventStockSelector({ stock, selectedItems, onChange }: EventStockSelectorProps) {
  const [selectedStockId, setSelectedStockId] = useState("");
  const [quantity, setQuantity] = useState("");

  const availableStock = stock.filter(
    (s) => !selectedItems.some((si) => si.stockItemId === s.id)
  );

  const addStockItem = () => {
    if (!selectedStockId || !quantity || parseInt(quantity) <= 0) return;

    const item = stock.find((s) => s.id === selectedStockId);
    if (!item) return;

    const available = item.quantity - item.reservedQuantity;
    const qty = parseInt(quantity);
    if (qty > available) return;

    onChange([...selectedItems, { stockItemId: selectedStockId, quantity: qty }]);
    setSelectedStockId("");
    setQuantity("");
  };

  const removeStockItem = (stockItemId: string) => {
    onChange(selectedItems.filter((si) => si.stockItemId !== stockItemId));
  };

  const getStockItem = (id: string) => stock.find((s) => s.id === id);

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <Label className="flex items-center gap-2">
        <Package className="h-4 w-4" /> Itens Utilizados
      </Label>

      {selectedItems.length > 0 && (
        <div className="space-y-1">
          {selectedItems.map((si) => {
            const item = getStockItem(si.stockItemId);
            return (
              <div key={si.stockItemId} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                <span>
                  {item?.name ?? "Item removido"} — <strong>{si.quantity}</strong> {item?.unit}
                </span>
                <button type="button" onClick={() => removeStockItem(si.stockItemId)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {availableStock.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Select value={selectedStockId} onValueChange={setSelectedStockId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecionar item..." />
              </SelectTrigger>
              <SelectContent>
                {availableStock.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} (disp: {s.quantity - s.reservedQuantity} {s.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-20 space-y-1">
            <Input
              type="number"
              min="1"
              max={selectedStockId ? (getStockItem(selectedStockId)?.quantity ?? 0) - (getStockItem(selectedStockId)?.reservedQuantity ?? 0) : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qtd"
              className="h-9"
            />
          </div>
          <Button type="button" size="sm" variant="outline" className="h-9" onClick={addStockItem} disabled={!selectedStockId || !quantity}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {stock.length === 0 && (
        <p className="text-xs text-muted-foreground">Nenhum item cadastrado no estoque.</p>
      )}
    </div>
  );
}

import { StockItem } from "@/types";
import { CreateStockItemDTO, StockOperation } from "@/types/dtos";
import { simulateRequest, getStorageData, setStorageData } from "./api";
import { financeService } from "./financeService";

const STORAGE_KEY = "horsecontrol-stock";

const initialStock: StockItem[] = [
  { id: "1", name: "Vermífugo Equino", category: "medicamento", quantity: 3, unit: "doses", minQuantity: 5, expirationDate: "2025-06-15", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", name: "Ração Premium", category: "ração", quantity: 50, unit: "kg", minQuantity: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", name: "Suplemento Vitamínico", category: "suplemento", quantity: 2, unit: "frascos", minQuantity: 3, expirationDate: "2025-12-01", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

function getStock(): StockItem[] {
  return getStorageData<StockItem[]>(STORAGE_KEY, initialStock);
}

function saveStock(data: StockItem[]): void {
  setStorageData(STORAGE_KEY, data);
}

export const stockService = {
  async getAll(): Promise<StockItem[]> {
    return simulateRequest(() => getStock());
  },

  async create(dto: CreateStockItemDTO): Promise<StockItem> {
    return simulateRequest(() => {
      const stock = getStock();
      const newItem: StockItem = {
        ...dto,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveStock([...stock, newItem]);
      return newItem;
    });
  },

  async update(id: string, updates: Partial<StockItem>): Promise<StockItem> {
    return simulateRequest(() => {
      const stock = getStock();
      const index = stock.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Item não encontrado");
      stock[index] = { ...stock[index], ...updates, updatedAt: new Date().toISOString() };
      saveStock(stock);
      return stock[index];
    });
  },

  async delete(id: string): Promise<void> {
    return simulateRequest(() => {
      saveStock(getStock().filter((s) => s.id !== id));
    });
  },

  async adjustQuantity(id: string, amount: number): Promise<StockItem> {
    return simulateRequest(() => {
      const stock = getStock();
      const index = stock.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Item não encontrado");
      stock[index] = {
        ...stock[index],
        quantity: Math.max(0, stock[index].quantity + amount),
        updatedAt: new Date().toISOString(),
      };
      saveStock(stock);
      return stock[index];
    });
  },

  /**
   * Purchase or sell stock with automatic finance integration
   */
  async operate(op: StockOperation): Promise<{ item: StockItem }> {
    const stock = getStock();
    const index = stock.findIndex((s) => s.id === op.stockItemId);
    if (index === -1) throw new Error("Item não encontrado");

    const item = stock[index];
    const quantityChange = op.type === "compra" ? op.quantity : -op.quantity;
    const newQuantity = item.quantity + quantityChange;

    if (newQuantity < 0) throw new Error("Quantidade insuficiente em estoque");

    // Update stock
    stock[index] = { ...item, quantity: newQuantity, updatedAt: new Date().toISOString() };
    saveStock(stock);

    // Create finance transaction
    const totalValue = op.quantity * op.unitPrice;
    await financeService.create({
      type: op.type === "compra" ? "despesa" : "receita",
      category: op.type === "compra" ? "Estoque (Compra)" : "Estoque (Venda)",
      description: op.description || `${op.type === "compra" ? "Compra" : "Venda"}: ${op.quantity} ${item.unit} de ${item.name}`,
      amount: totalValue,
      date: op.date,
      relatedStockItemId: op.stockItemId,
    });

    return { item: stock[index] };
  },
};

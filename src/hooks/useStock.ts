import { useLocalStorage } from "./useLocalStorage";
import { StockItem } from "@/types";
import { useCallback } from "react";

const initialStock: StockItem[] = [
  {
    id: "1",
    name: "Vermífugo Equino",
    category: "medicamento",
    quantity: 3,
    unit: "doses",
    minQuantity: 5,
    expirationDate: "2025-06-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Ração Premium",
    category: "ração",
    quantity: 50,
    unit: "kg",
    minQuantity: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Suplemento Vitamínico",
    category: "suplemento",
    quantity: 2,
    unit: "frascos",
    minQuantity: 3,
    expirationDate: "2025-12-01",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useStock() {
  const [stock, setStock] = useLocalStorage<StockItem[]>("horsecontrol-stock", initialStock);

  const addItem = useCallback((item: Omit<StockItem, "id" | "createdAt" | "updatedAt">) => {
    const newItem: StockItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStock((prev) => [...prev, newItem]);
    return newItem;
  }, [setStock]);

  const updateItem = useCallback((id: string, updates: Partial<StockItem>) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  }, [setStock]);

  const deleteItem = useCallback((id: string) => {
    setStock((prev) => prev.filter((item) => item.id !== id));
  }, [setStock]);

  const getLowStockItems = useCallback(() => {
    return stock.filter((item) => item.quantity < item.minQuantity);
  }, [stock]);

  const adjustQuantity = useCallback((id: string, amount: number) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + amount), updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, [setStock]);

  return {
    stock,
    addItem,
    updateItem,
    deleteItem,
    getLowStockItems,
    adjustQuantity,
  };
}

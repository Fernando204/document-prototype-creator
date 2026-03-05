import { useLocalStorage } from "./useLocalStorage";
import { StockItem } from "@/types";
import { useCallback } from "react";

const initialStock: StockItem[] = [
  {
    id: "1",
    name: "Vermífugo Equino",
    category: "medicamento",
    quantity: 3,
    reservedQuantity: 0,
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
    reservedQuantity: 0,
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
    reservedQuantity: 0,
    unit: "frascos",
    minQuantity: 3,
    expirationDate: "2025-12-01",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Migration: add reservedQuantity if missing
function migrateStock(items: any[]): StockItem[] {
  return items.map((item) => ({
    ...item,
    reservedQuantity: item.reservedQuantity ?? 0,
  }));
}

export function useStock() {
  const [rawStock, setStock] = useLocalStorage<StockItem[]>("horsecontrol-stock", initialStock);
  const stock = migrateStock(rawStock);

  const addItem = useCallback((item: Omit<StockItem, "id" | "createdAt" | "updatedAt">) => {
    const newItem: StockItem = {
      ...item,
      reservedQuantity: item.reservedQuantity ?? 0,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStock((prev) => [...migrateStock(prev), newItem]);
    return newItem;
  }, [setStock]);

  const updateItem = useCallback((id: string, updates: Partial<StockItem>) => {
    setStock((prev) =>
      migrateStock(prev).map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
  }, [setStock]);

  const deleteItem = useCallback((id: string) => {
    setStock((prev) => migrateStock(prev).filter((item) => item.id !== id));
  }, [setStock]);

  const getLowStockItems = useCallback(() => {
    return stock.filter((item) => (item.quantity - item.reservedQuantity) < item.minQuantity);
  }, [stock]);

  const adjustQuantity = useCallback((id: string, amount: number) => {
    setStock((prev) =>
      migrateStock(prev).map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + amount), updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, [setStock]);

  const reserveItems = useCallback((items: { stockItemId: string; quantity: number }[]) => {
    setStock((prev) => {
      const migrated = migrateStock(prev);
      return migrated.map((item) => {
        const reservation = items.find((r) => r.stockItemId === item.id);
        if (!reservation) return item;
        return {
          ...item,
          reservedQuantity: item.reservedQuantity + reservation.quantity,
          updatedAt: new Date().toISOString(),
        };
      });
    });
  }, [setStock]);

  const releaseReservation = useCallback((items: { stockItemId: string; quantity: number }[]) => {
    setStock((prev) => {
      const migrated = migrateStock(prev);
      return migrated.map((item) => {
        const reservation = items.find((r) => r.stockItemId === item.id);
        if (!reservation) return item;
        return {
          ...item,
          reservedQuantity: Math.max(0, item.reservedQuantity - reservation.quantity),
          updatedAt: new Date().toISOString(),
        };
      });
    });
  }, [setStock]);

  const confirmReservation = useCallback((items: { stockItemId: string; quantity: number }[]) => {
    setStock((prev) => {
      const migrated = migrateStock(prev);
      return migrated.map((item) => {
        const reservation = items.find((r) => r.stockItemId === item.id);
        if (!reservation) return item;
        return {
          ...item,
          quantity: Math.max(0, item.quantity - reservation.quantity),
          reservedQuantity: Math.max(0, item.reservedQuantity - reservation.quantity),
          updatedAt: new Date().toISOString(),
        };
      });
    });
  }, [setStock]);

  return {
    stock,
    addItem,
    updateItem,
    deleteItem,
    getLowStockItems,
    adjustQuantity,
    reserveItems,
    releaseReservation,
    confirmReservation,
  };
}

import { useLocalStorage } from "./useLocalStorage";
import { Product } from "@/types";
import { useCallback } from "react";

const initialProducts: Product[] = [
  { id: "1", name: "Vermífugo Equino", category: "medicamento", unit: "doses", price: 25.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", name: "Ração Premium", category: "ração", unit: "kg", price: 3.5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", name: "Suplemento Vitamínico", category: "suplemento", unit: "frascos", price: 50.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export function useProducts() {
  const [raw, setRaw] = useLocalStorage<Product[]>("horsecontrol-products", initialProducts);
  const products: Product[] = raw;

  const addProduct = useCallback((data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newItem: Product = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRaw((prev) => [...prev, newItem]);
    return newItem;
  }, [setRaw]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setRaw((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
  }, [setRaw]);

  const deleteProduct = useCallback((id: string) => {
    setRaw((prev) => prev.filter((p) => p.id !== id));
  }, [setRaw]);

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}

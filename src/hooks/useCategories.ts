import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export interface CustomCategory {
  id: string;
  group: string; // e.g. "product", "supplier"
  value: string; // slug/key
  label: string;
  description?: string;
  createdAt: string;
}

// Default built-in categories per group
const BUILT_IN: Record<string, { value: string; label: string }[]> = {
  product: [
    { value: "medicamento", label: "Medicamento" },
    { value: "ração", label: "Ração" },
    { value: "suplemento", label: "Suplemento" },
    { value: "equipamento", label: "Equipamento" },
    { value: "higiene", label: "Higiene" },
    { value: "outro", label: "Outro" },
  ],
  supplier: [
    { value: "ração", label: "Ração" },
    { value: "medicamento", label: "Medicamento" },
    { value: "equipamento", label: "Equipamento" },
    { value: "veterinário", label: "Veterinário" },
    { value: "ferreiro", label: "Ferreiro" },
    { value: "transporte", label: "Transporte" },
    { value: "outro", label: "Outro" },
  ],
};

export function useCategories(group: string) {
  const [customCategories, setCustomCategories] = useLocalStorage<CustomCategory[]>(
    "horsecontrol-custom-categories",
    []
  );

  const builtIn = BUILT_IN[group] || [];
  const custom = customCategories.filter((c) => c.group === group);

  const allCategories = [
    ...builtIn,
    ...custom.map((c) => ({ value: c.value, label: c.label })),
  ];

  const addCategory = useCallback(
    (name: string, description?: string): CustomCategory | null => {
      const value = name.toLowerCase().trim();
      // Check duplicates across built-in + custom
      const existing = allCategories.find(
        (c) => c.value === value || c.label.toLowerCase() === value
      );
      if (existing) return null;

      const newCat: CustomCategory = {
        id: crypto.randomUUID(),
        group,
        value,
        label: name.trim(),
        description,
        createdAt: new Date().toISOString(),
      };
      setCustomCategories((prev) => [...prev, newCat]);
      return newCat;
    },
    [group, allCategories, setCustomCategories]
  );

  const updateCategory = useCallback(
    (id: string, updates: { label?: string; description?: string }) => {
      setCustomCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                value: updates.label ? updates.label.toLowerCase().trim() : c.value,
              }
            : c
        )
      );
    },
    [setCustomCategories]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    },
    [setCustomCategories]
  );

  // Labels map for easy lookup
  const labelsMap: Record<string, string> = {};
  allCategories.forEach((c) => {
    labelsMap[c.value] = c.label;
  });

  return {
    categories: allCategories,
    customCategories: custom,
    allCustomCategories: customCategories,
    labelsMap,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}

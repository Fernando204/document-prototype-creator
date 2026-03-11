import { Product } from "@/types";
import { CreateProductDTO, UpdateProductDTO } from "@/types/dtos";
import { simulateRequest, getStorageData, setStorageData } from "./api";

const STORAGE_KEY = "horsecontrol-products";

// start with some example products; this lets the existing sample stock items correspond to real products
const initialProducts: Product[] = [
  { id: "1", name: "Vermífugo Equino", category: "medicamento", unit: "doses", price: 25.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", name: "Ração Premium", category: "ração", unit: "kg", price: 3.5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", name: "Suplemento Vitamínico", category: "suplemento", unit: "frascos", price: 50.0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

function getProducts(): Product[] {
  return getStorageData<Product[]>(STORAGE_KEY, initialProducts);
}

function saveProducts(data: Product[]): void {
  setStorageData(STORAGE_KEY, data);
}

export const productService = {
  async getAll(): Promise<Product[]> {
    return simulateRequest(() => getProducts());
  },

  async create(dto: CreateProductDTO): Promise<Product> {
    return simulateRequest(() => {
      const products = getProducts();
      const newItem: Product = {
        name: dto.name,
        category: dto.category,
        unit: dto.unit,
        price: dto.price,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProducts([...products, newItem]);
      return newItem;
    });
  },

  async update(id: string, updates: UpdateProductDTO): Promise<Product> {
    return simulateRequest(() => {
      const products = getProducts();
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Produto não encontrado");
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
      saveProducts(products);
      return products[index];
    });
  },

  async delete(id: string): Promise<void> {
    return simulateRequest(() => {
      saveProducts(getProducts().filter((p) => p.id !== id));
    });
  },
};

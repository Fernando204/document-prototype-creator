import { Transaction, CreateTransactionDTO } from "@/types/dtos";
import { simulateRequest, getStorageData, setStorageData } from "./api";

const STORAGE_KEY = "horsecontrol-transactions";

const initialTransactions: Transaction[] = [
  { id: "1", type: "receita", category: "Venda", description: "Venda de potro", amount: 25000, date: "2025-01-15", createdAt: new Date().toISOString() },
  { id: "2", type: "receita", category: "Prêmio", description: "Prêmio competição regional", amount: 5000, date: "2025-01-20", createdAt: new Date().toISOString() },
  { id: "3", type: "despesa", category: "Veterinário", description: "Consulta e vacinas", amount: 1200, date: "2025-01-18", createdAt: new Date().toISOString() },
  { id: "4", type: "despesa", category: "Alimentação", description: "Ração mensal", amount: 3500, date: "2025-01-25", createdAt: new Date().toISOString() },
  { id: "5", type: "despesa", category: "Ferrageamento", description: "Ferradura completa", amount: 800, date: "2025-01-28", createdAt: new Date().toISOString() },
];

function getTransactions(): Transaction[] {
  return getStorageData<Transaction[]>(STORAGE_KEY, initialTransactions);
}

function saveTransactions(data: Transaction[]): void {
  setStorageData(STORAGE_KEY, data);
}

export const financeService = {
  async getAll(): Promise<Transaction[]> {
    return simulateRequest(() => getTransactions());
  },

  async create(dto: CreateTransactionDTO): Promise<Transaction> {
    return simulateRequest(() => {
      // Validations
      if (!dto.category?.trim()) throw new Error("Categoria é obrigatória");
      if (!dto.type) throw new Error("Tipo de transação é obrigatório");
      if (!dto.date) throw new Error("Data é obrigatória");
      if (isNaN(new Date(dto.date).getTime())) throw new Error("Data inválida");
      if (typeof dto.amount !== "number" || isNaN(dto.amount)) throw new Error("Valor inválido");
      if (dto.amount <= 0) throw new Error("Valor deve ser maior que zero");

      const transactions = getTransactions();
      const newTransaction: Transaction = {
        ...dto,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      saveTransactions([...transactions, newTransaction]);
      return newTransaction;
    });
  },

  async delete(id: string): Promise<void> {
    return simulateRequest(() => {
      const transactions = getTransactions();
      saveTransactions(transactions.filter((t) => t.id !== id));
    });
  },
};

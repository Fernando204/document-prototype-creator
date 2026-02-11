import { Horse, HealthEvent, StockItem, Competition, Reproduction } from "./index";

// Horse DTOs
export type CreateHorseDTO = Omit<Horse, "id" | "createdAt" | "updatedAt" | "age"> & {
  birthDate: string;
};

export type UpdateHorseDTO = Partial<Omit<Horse, "id" | "createdAt" | "updatedAt" | "age">>;

// Event DTOs
export type CreateEventDTO = Omit<HealthEvent, "id" | "createdAt">;
export type UpdateEventDTO = Partial<Omit<HealthEvent, "id" | "createdAt">>;

// Stock DTOs
export type CreateStockItemDTO = Omit<StockItem, "id" | "createdAt" | "updatedAt">;
export type UpdateStockItemDTO = Partial<Omit<StockItem, "id" | "createdAt" | "updatedAt">>;

// Finance DTOs
export interface Transaction {
  id: string;
  type: "receita" | "despesa";
  category: string;
  description: string;
  amount: number;
  date: string;
  relatedStockItemId?: string;
  createdAt: string;
}

export type CreateTransactionDTO = Omit<Transaction, "id" | "createdAt">;
export type UpdateTransactionDTO = Partial<Omit<Transaction, "id" | "createdAt">>;

// Competition DTOs
export interface CompetitionHorseFeedback {
  horseId: string;
  horseName: string;
  result?: string;
  placement?: number;
  notes?: string;
  performance?: "bom" | "regular" | "ruim";
}

export type CompetitionWithFeedback = Omit<Competition, "horses"> & {
  horses: CompetitionHorseFeedback[];
};

export type CreateCompetitionDTO = Omit<CompetitionWithFeedback, "id" | "createdAt">;
export type UpdateCompetitionDTO = Partial<Omit<CompetitionWithFeedback, "id" | "createdAt">>;

// Reproduction DTOs
export interface ReproductionRecord extends Reproduction {
  parentId?: string; // Links to the previous step in the flow
  foalName?: string;
  foalSex?: "macho" | "fêmea";
}

export type CreateReproductionDTO = Omit<ReproductionRecord, "id" | "createdAt">;
export type UpdateReproductionDTO = Partial<Omit<ReproductionRecord, "id" | "createdAt">>;

// Stock purchase/sale operation
export interface StockOperation {
  stockItemId: string;
  quantity: number;
  unitPrice: number;
  type: "compra" | "venda";
  description?: string;
  date: string;
}

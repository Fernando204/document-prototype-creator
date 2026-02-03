// Types for Horse Control

export interface Horse {
  id: string;
  name: string;
  breed: string;
  age: string;
  birthDate?: string;
  color?: string;
  sex: "macho" | "fêmea" | "castrado";
  status: "saudável" | "em tratamento" | "observação";
  imageUrl?: string;
  pedigree?: {
    father?: string;
    mother?: string;
    registry?: string;
  };
  notes?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthEvent {
  id: string;
  horseId: string;
  type: "vacinação" | "vermifugação" | "ferrageamento" | "veterinário" | "medicamento" | "outro";
  title: string;
  description?: string;
  date: string;
  time?: string;
  status: "agendado" | "concluído" | "cancelado";
  veterinarian?: string;
  cost?: number;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "success" | "warning" | "pending" | "info";
  message: string;
  timestamp: string;
  relatedId?: string;
  relatedType?: "horse" | "event" | "stock" | "competition";
}

export interface StockItem {
  id: string;
  name: string;
  category: "medicamento" | "ração" | "suplemento" | "equipamento" | "higiene" | "outro";
  quantity: number;
  unit: string;
  minQuantity: number;
  expirationDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Competition {
  id: string;
  name: string;
  date: string;
  location: string;
  category: string;
  horses: {
    horseId: string;
    horseName: string;
    result?: string;
    placement?: number;
    notes?: string;
  }[];
  status: "inscrito" | "confirmado" | "concluído" | "cancelado";
  notes?: string;
  createdAt: string;
}

export interface Reproduction {
  id: string;
  type: "cobertura" | "inseminação" | "gestação" | "nascimento";
  mareId: string;
  mareName: string;
  stallionId?: string;
  stallionName?: string;
  date: string;
  expectedBirthDate?: string;
  status: "planejado" | "em andamento" | "concluído" | "cancelado";
  veterinarian?: string;
  notes?: string;
  createdAt: string;
}

// Types for Horse Control

export interface BiometricRecord {
  id: string;
  withersHeight?: number;       // A - Altura na Cernelha (cm)
  crumpHeight?: number;         // B - Altura na Garupa (cm)
  elbowGroundDist?: number;     // C - Distância Codilho-Solo (cm)
  chestCircumference?: number;  // D - Perímetro Torácico (cm)
  headLength?: number;          // E - Comprimento da Cabeça (cm)
  neckLength?: number;          // F - Comprimento do Pescoço (cm)
  shoulderLength?: number;      // G - Comprimento da Espádua (cm)
  backLoinLength?: number;      // H - Comprimento Dorso-Lombo (cm)
  crumpLength?: number;         // I - Comprimento da Garupa (cm)
  bodyLength?: number;          // J - Comprimento do Corpo (cm)
  forearmPerimeter?: number;    // K - Perímetro Antebraço (cm)
  kneePerimeter?: number;       // L - Perímetro Joelho (cm)
  cannonPerimeter?: number;     // M - Perímetro Canela (cm)
  headWidth?: number;           // N - Largura da Cabeça (cm)
  hipWidth?: number;            // O - Largura das Ancas (cm)
  weight?: number;              // Peso (kg)
  measuredAt: string;
  measuredBy: string;
}

export interface HorseDescription {
  temperament?: string;
  behavior?: string;
  physicalTraits?: string;
  generalNotes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HorseHistoryEntry {
  id: string;
  action: "criação" | "edição" | "biometria" | "resenha";
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: string;
}

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
  ownerIds?: string[];
  biometrics?: BiometricRecord[];
  description?: HorseDescription;
  history?: HorseHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthEvent {
  id: string;
  horseIds: string[];
  type: "vacinação" | "vermifugação" | "ferrageamento" | "veterinário" | "medicamento" | "outro";
  title: string;
  description?: string;
  date: string;
  time?: string;
  endTime?: string;
  status: "agendado" | "concluído" | "cancelado";
  veterinarian?: string;
  cost?: number;
  colaboradorIds?: string[];
  stockItems?: EventStockItem[];
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
  reservedQuantity: number;
  unit: string;
  minQuantity: number;
  expirationDate?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventStockItem {
  stockItemId: string;
  quantity: number;
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

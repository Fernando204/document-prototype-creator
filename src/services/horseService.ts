import { Horse } from "@/types";
import { CreateHorseDTO, UpdateHorseDTO } from "@/types/dtos";
import { simulateRequest, getStorageData, setStorageData } from "./api";
import { calculateAge } from "@/lib/calculateAge";
import horse1 from "@/assets/horse-1.jpg";
import horse2 from "@/assets/horse-2.jpg";

const STORAGE_KEY = "horsecontrol-horses";

const initialHorses: Horse[] = [
  { id: "1", name: "Relâmpago", breed: "Mangalarga Marchador", age: "5 anos", birthDate: "2020-03-15", color: "Castanho", sex: "macho", status: "saudável", imageUrl: horse1, pedigree: { father: "Trovão", mother: "Aurora", registry: "ABCCMM-123456" }, isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", name: "Estrela", breed: "Quarto de Milha", age: "3 anos", birthDate: "2022-06-20", color: "Alazão", sex: "fêmea", status: "em tratamento", imageUrl: horse2, pedigree: { father: "Cometa", mother: "Luna" }, isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", name: "Thor", breed: "Lusitano", age: "7 anos", birthDate: "2018-01-10", color: "Tordilho", sex: "castrado", status: "saudável", isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "4", name: "Luna", breed: "Crioulo", age: "4 anos", birthDate: "2021-08-05", color: "Baio", sex: "fêmea", status: "observação", isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

function getHorses(): Horse[] {
  return getStorageData<Horse[]>(STORAGE_KEY, initialHorses);
}

function saveHorses(horses: Horse[]): void {
  setStorageData(STORAGE_KEY, horses);
}

export const horseService = {
  async getAll(): Promise<Horse[]> {
    return simulateRequest(() => {
      const horses = getHorses();
      return horses.map((h) => ({ ...h, age: calculateAge(h.birthDate) }));
    });
  },

  async getById(id: string): Promise<Horse | undefined> {
    return simulateRequest(() => {
      const horse = getHorses().find((h) => h.id === id);
      if (horse) return { ...horse, age: calculateAge(horse.birthDate) };
      return undefined;
    });
  },

  async create(dto: CreateHorseDTO): Promise<Horse> {
    return simulateRequest(() => {
      const horses = getHorses();
      const newHorse: Horse = {
        ...dto,
        id: crypto.randomUUID(),
        age: calculateAge(dto.birthDate),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveHorses([...horses, newHorse]);
      return newHorse;
    });
  },

  async update(id: string, dto: UpdateHorseDTO): Promise<Horse> {
    return simulateRequest(() => {
      const horses = getHorses();
      const index = horses.findIndex((h) => h.id === id);
      if (index === -1) throw new Error("Cavalo não encontrado");
      
      const updated: Horse = {
        ...horses[index],
        ...dto,
        age: calculateAge(dto.birthDate ?? horses[index].birthDate),
        updatedAt: new Date().toISOString(),
      };
      horses[index] = updated;
      saveHorses(horses);
      return updated;
    });
  },

  async delete(id: string): Promise<void> {
    return simulateRequest(() => {
      const horses = getHorses();
      saveHorses(horses.filter((h) => h.id !== id));
      
      // Cascade: events
      const events = getStorageData("horsecontrol-events", []) as any[];
      setStorageData("horsecontrol-events", events.filter((e: any) => e.horseId !== id));
      
      // Cascade: reproductions
      const repros = getStorageData("horsecontrol-reproductions", []) as any[];
      setStorageData("horsecontrol-reproductions", repros.filter((r: any) => r.mareId !== id && r.stallionId !== id));
      
      // Cascade: competitions
      const comps = getStorageData("horsecontrol-competitions", []) as any[];
      const updatedComps = comps
        .map((c: any) => ({ ...c, horses: c.horses.filter((h: any) => h.horseId !== id) }))
        .filter((c: any) => c.horses.length > 0);
      setStorageData("horsecontrol-competitions", updatedComps);
    });
  },

  async toggleFavorite(id: string): Promise<Horse> {
    return simulateRequest(() => {
      const horses = getHorses();
      const index = horses.findIndex((h) => h.id === id);
      if (index === -1) throw new Error("Cavalo não encontrado");
      horses[index] = { ...horses[index], isFavorite: !horses[index].isFavorite, updatedAt: new Date().toISOString() };
      saveHorses(horses);
      return horses[index];
    });
  },
};

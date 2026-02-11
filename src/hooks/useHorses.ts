import { useLocalStorage } from "./useLocalStorage";
import { Horse, Activity, HealthEvent, Competition, Reproduction } from "@/types";
import { useCallback } from "react";
import { calculateAge } from "@/lib/calculateAge";
import horse1 from "@/assets/horse-1.jpg";
import horse2 from "@/assets/horse-2.jpg";

const initialHorses: Horse[] = [
  { id: "1", name: "Relâmpago", breed: "Mangalarga Marchador", age: "5 anos", birthDate: "2020-03-15", color: "Castanho", sex: "macho", status: "saudável", imageUrl: horse1, pedigree: { father: "Trovão", mother: "Aurora", registry: "ABCCMM-123456" }, isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "2", name: "Estrela", breed: "Quarto de Milha", age: "3 anos", birthDate: "2022-06-20", color: "Alazão", sex: "fêmea", status: "em tratamento", imageUrl: horse2, pedigree: { father: "Cometa", mother: "Luna" }, isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "3", name: "Thor", breed: "Lusitano", age: "7 anos", birthDate: "2018-01-10", color: "Tordilho", sex: "castrado", status: "saudável", isFavorite: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "4", name: "Luna", breed: "Crioulo", age: "4 anos", birthDate: "2021-08-05", color: "Baio", sex: "fêmea", status: "observação", isFavorite: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export function useHorses() {
  const [horses, setHorses] = useLocalStorage<Horse[]>("horsecontrol-horses", initialHorses);
  const [activities, setActivities] = useLocalStorage<Activity[]>("horsecontrol-activities", []);
  const [events, setEvents] = useLocalStorage<HealthEvent[]>("horsecontrol-events", []);
  const [competitions, setCompetitions] = useLocalStorage<Competition[]>("horsecontrol-competitions", []);
  const [reproductions, setReproductions] = useLocalStorage<Reproduction[]>("horsecontrol-reproductions", []);

  // Recalculate ages dynamically
  const horsesWithAge = horses.map((h) => ({
    ...h,
    age: calculateAge(h.birthDate),
  }));

  const addActivity = useCallback((activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = { ...activity, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50));
  }, [setActivities]);

  const addHorse = useCallback(async (horse: Omit<Horse, "id" | "createdAt" | "updatedAt">) => {
    const newHorse: Horse = {
      ...horse,
      id: crypto.randomUUID(),
      age: calculateAge(horse.birthDate),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHorses((prev) => [...prev, newHorse]);
    addActivity({ type: "success", message: `Novo cavalo cadastrado: ${newHorse.name}`, relatedId: newHorse.id, relatedType: "horse" });
    return newHorse;
  }, [setHorses, addActivity]);

  const updateHorse = useCallback(async (id: string, updates: Partial<Horse>) => {
    setHorses((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, ...updates, age: calculateAge(updates.birthDate ?? h.birthDate), updatedAt: new Date().toISOString() }
          : h
      )
    );
    addActivity({ type: "info", message: `Cavalo atualizado: ${updates.name || ""}`, relatedId: id, relatedType: "horse" });
  }, [setHorses, addActivity]);

  const deleteHorse = useCallback((id: string) => {
    const horse = horses.find((h) => h.id === id);
    setEvents((prev) => prev.filter((e) => e.horseId !== id));
    setReproductions((prev) => prev.filter((r) => r.mareId !== id && r.stallionId !== id));
    setCompetitions((prev) =>
      prev.map((c) => ({ ...c, horses: c.horses.filter((h) => h.horseId !== id) })).filter((c) => c.horses.length > 0)
    );
    setHorses((prev) => prev.filter((h) => h.id !== id));
    if (horse) {
      addActivity({ type: "warning", message: `Cavalo removido: ${horse.name} (e todos os dados relacionados)`, relatedType: "horse" });
    }
  }, [horses, setHorses, setEvents, setReproductions, setCompetitions, addActivity]);

  const toggleFavorite = useCallback((id: string) => {
    setHorses((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isFavorite: !h.isFavorite, updatedAt: new Date().toISOString() } : h))
    );
  }, [setHorses]);

  const getHorseById = useCallback((id: string) => {
    const h = horses.find((h) => h.id === id);
    return h ? { ...h, age: calculateAge(h.birthDate) } : undefined;
  }, [horses]);

  return {
    horses: horsesWithAge,
    activities,
    addHorse,
    updateHorse,
    deleteHorse,
    toggleFavorite,
    getHorseById,
    addActivity,
  };
}

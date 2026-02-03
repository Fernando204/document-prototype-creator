import { useLocalStorage } from "./useLocalStorage";
import { HealthEvent } from "@/types";
import { useCallback } from "react";

const initialEvents: HealthEvent[] = [
  {
    id: "1",
    horseId: "1",
    type: "vacinação",
    title: "Vacina Raiva",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    horseId: "2",
    type: "ferrageamento",
    title: "Troca de Ferraduras",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "09:00",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    horseId: "3",
    type: "veterinário",
    title: "Check-up Geral",
    date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    time: "10:30",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    horseId: "4",
    type: "vermifugação",
    title: "Vermifugação",
    date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    time: "08:00",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
];

export function useEvents() {
  const [events, setEvents] = useLocalStorage<HealthEvent[]>("horsecontrol-events", initialEvents);

  const addEvent = useCallback((event: Omit<HealthEvent, "id" | "createdAt">) => {
    const newEvent: HealthEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, [setEvents]);

  const updateEvent = useCallback((id: string, updates: Partial<HealthEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, [setEvents]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, [setEvents]);

  const completeEvent = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "concluído" as const } : e))
    );
  }, [setEvents]);

  const getUpcomingEvents = useCallback((limit = 5) => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.status === "agendado" && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }, [events]);

  const getEventsByHorse = useCallback((horseId: string) => {
    return events.filter((e) => e.horseId === horseId);
  }, [events]);

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    getUpcomingEvents,
    getEventsByHorse,
  };
}

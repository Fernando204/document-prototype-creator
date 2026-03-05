import { useLocalStorage } from "./useLocalStorage";
import { HealthEvent, EventStockItem } from "@/types";
import { useCallback } from "react";
import { useStock } from "./useStock";

const initialEvents: HealthEvent[] = [
  {
    id: "1",
    horseIds: ["1"],
    type: "vacinação",
    title: "Vacina Raiva",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    horseIds: ["2"],
    type: "ferrageamento",
    title: "Troca de Ferraduras",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "09:00",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    horseIds: ["3"],
    type: "veterinário",
    title: "Check-up Geral",
    date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    time: "10:30",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    horseIds: ["4"],
    type: "vermifugação",
    title: "Vermifugação",
    date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    time: "08:00",
    status: "agendado",
    createdAt: new Date().toISOString(),
  },
];

function migrateEvents(events: any[]): HealthEvent[] {
  return events.map((e) => {
    if (e.horseId && !e.horseIds) {
      const { horseId, ...rest } = e;
      return { ...rest, horseIds: [horseId] };
    }
    return e;
  });
}

export function useEvents() {
  const [rawEvents, setEvents] = useLocalStorage<HealthEvent[]>("horsecontrol-events", initialEvents);
  const events = migrateEvents(rawEvents);
  const { reserveItems, releaseReservation, confirmReservation } = useStock();

  const addEvent = useCallback((event: Omit<HealthEvent, "id" | "createdAt">) => {
    const newEvent: HealthEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...migrateEvents(prev), newEvent]);

    // Reserve stock items
    if (event.stockItems && event.stockItems.length > 0) {
      reserveItems(event.stockItems);
    }

    return newEvent;
  }, [setEvents, reserveItems]);

  const updateEvent = useCallback((id: string, updates: Partial<HealthEvent>) => {
    setEvents((prev) => {
      const migrated = migrateEvents(prev);
      const existing = migrated.find((e) => e.id === id);

      // Handle stock reservation changes
      if (existing && existing.status === "agendado") {
        // Release old reservations
        if (existing.stockItems && existing.stockItems.length > 0) {
          releaseReservation(existing.stockItems);
        }
        // Apply new reservations (only if still agendado)
        const newStatus = updates.status ?? existing.status;
        const newStockItems = updates.stockItems ?? existing.stockItems;
        if (newStatus === "agendado" && newStockItems && newStockItems.length > 0) {
          reserveItems(newStockItems);
        } else if (newStatus === "concluído" && newStockItems && newStockItems.length > 0) {
          confirmReservation(newStockItems);
        }
        // If cancelled, reservations already released above
      }

      return migrated.map((e) => (e.id === id ? { ...e, ...updates } : e));
    });
  }, [setEvents, reserveItems, releaseReservation, confirmReservation]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const migrated = migrateEvents(prev);
      const existing = migrated.find((e) => e.id === id);
      // Release reservations if event was agendado
      if (existing && existing.status === "agendado" && existing.stockItems && existing.stockItems.length > 0) {
        releaseReservation(existing.stockItems);
      }
      return migrated.filter((e) => e.id !== id);
    });
  }, [setEvents, releaseReservation]);

  const completeEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const migrated = migrateEvents(prev);
      const existing = migrated.find((e) => e.id === id);
      if (existing && existing.status === "agendado" && existing.stockItems && existing.stockItems.length > 0) {
        confirmReservation(existing.stockItems);
      }
      return migrated.map((e) => (e.id === id ? { ...e, status: "concluído" as const } : e));
    });
  }, [setEvents, confirmReservation]);

  const cancelEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const migrated = migrateEvents(prev);
      const existing = migrated.find((e) => e.id === id);
      if (existing && existing.status === "agendado" && existing.stockItems && existing.stockItems.length > 0) {
        releaseReservation(existing.stockItems);
      }
      return migrated.map((e) => (e.id === id ? { ...e, status: "cancelado" as const } : e));
    });
  }, [setEvents, releaseReservation]);

  const getUpcomingEvents = useCallback((limit = 5) => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.status === "agendado" && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }, [events]);

  const getEventsByHorse = useCallback((horseId: string) => {
    return events.filter((e) => e.horseIds.includes(horseId));
  }, [events]);

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    cancelEvent,
    getUpcomingEvents,
    getEventsByHorse,
  };
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { WeekSchedule } from "./WorkScheduleEditor";
import type { HealthEvent } from "@/types";

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const dayKeys: (keyof WeekSchedule)[] = [
  "domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado",
];

interface Props {
  schedule: WeekSchedule;
  events: HealthEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: HealthEvent) => void;
  onDeleteEvent: (id: string) => void;
  getHorseName?: (id: string) => string;
}

const getWeekDates = (baseDate: Date): Date[] => {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const statusColor: Record<string, "outline" | "default" | "secondary"> = {
  agendado: "outline",
  concluído: "default",
  cancelado: "secondary",
};

export const ColaboradorAgenda = ({ schedule, events, onAddEvent, onEditEvent, onDeleteEvent, getHorseName }: Props) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate);

  const today = formatDate(new Date());

  return (
    <div className="space-y-3">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setWeekOffset(0)}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" onClick={onAddEvent}>
          <Plus className="h-3 w-3 mr-1" /> Evento
        </Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, i) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === today;
          const dayKey = dayKeys[i];
          const blocks = schedule[dayKey];
          const isDayOff = blocks.length === 0;
          const dayEvents = events
            .filter((e) => e.date === dateStr)
            .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

          return (
            <div
              key={dateStr}
              className={`rounded-lg border p-2 min-h-[140px] text-xs ${
                isToday ? "border-primary bg-primary/5" : "border-border"
              } ${isDayOff ? "bg-muted/20 opacity-60" : ""}`}
            >
              <div className="flex flex-col items-center mb-2">
                <span className="text-[10px] text-muted-foreground uppercase">{dayLabels[i]}</span>
                <span className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                  {date.getDate()}
                </span>
              </div>

              {isDayOff ? (
                <p className="text-[10px] text-muted-foreground text-center">Folga</p>
              ) : (
                <>
                  <div className="text-[9px] text-muted-foreground text-center mb-1">
                    {blocks.map((b) => `${b.start}–${b.end}`).join(" | ")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-accent/40 rounded p-1 group cursor-pointer hover:bg-accent/60 transition-colors"
                        onClick={() => onEditEvent(ev)}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-medium text-[10px] leading-tight truncate flex-1">
                            {ev.title}
                          </span>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(ev.id);
                            }}
                          >
                            <Trash2 className="h-2.5 w-2.5 text-destructive" />
                          </button>
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {ev.time ?? ""}{ev.endTime ? `–${ev.endTime}` : ""}
                        </span>
                        {getHorseName && (
                          <span className="text-[8px] text-muted-foreground block truncate">
                            🐴 {getHorseName(ev.horseId)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

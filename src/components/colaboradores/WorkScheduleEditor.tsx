import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Plus, Trash2 } from "lucide-react";

export interface TimeBlock {
  start: string;
  end: string;
}

export interface WeekSchedule {
  segunda: TimeBlock[];
  terca: TimeBlock[];
  quarta: TimeBlock[];
  quinta: TimeBlock[];
  sexta: TimeBlock[];
  sabado: TimeBlock[];
  domingo: TimeBlock[];
}

export const emptySchedule: WeekSchedule = {
  segunda: [],
  terca: [],
  quarta: [],
  quinta: [],
  sexta: [],
  sabado: [],
  domingo: [],
};

const defaultWorkday: TimeBlock[] = [
  { start: "06:00", end: "12:00" },
  { start: "13:00", end: "18:00" },
];

const dayLabels: Record<keyof WeekSchedule, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

interface Props {
  schedule: WeekSchedule;
  onChange: (schedule: WeekSchedule) => void;
}

export const WorkScheduleEditor = ({ schedule, onChange }: Props) => {
  const [expandedDay, setExpandedDay] = useState<keyof WeekSchedule | null>(null);

  const toggleDay = (day: keyof WeekSchedule) => {
    const isActive = schedule[day].length > 0;
    onChange({
      ...schedule,
      [day]: isActive ? [] : [...defaultWorkday],
    });
  };

  const addBlock = (day: keyof WeekSchedule) => {
    onChange({
      ...schedule,
      [day]: [...schedule[day], { start: "08:00", end: "12:00" }],
    });
  };

  const removeBlock = (day: keyof WeekSchedule, index: number) => {
    onChange({
      ...schedule,
      [day]: schedule[day].filter((_, i) => i !== index),
    });
  };

  const updateBlock = (day: keyof WeekSchedule, index: number, field: "start" | "end", value: string) => {
    const updated = schedule[day].map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    );
    onChange({ ...schedule, [day]: updated });
  };

  const applyToWeekdays = (sourceDay: keyof WeekSchedule) => {
    const weekdays: (keyof WeekSchedule)[] = ["segunda", "terca", "quarta", "quinta", "sexta"];
    const newSchedule = { ...schedule };
    weekdays.forEach((d) => {
      newSchedule[d] = schedule[sourceDay].map((b) => ({ ...b }));
    });
    onChange(newSchedule);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-primary" />
        <Label className="text-sm font-semibold">Carga Horária Semanal</Label>
      </div>

      {(Object.keys(dayLabels) as (keyof WeekSchedule)[]).map((day) => {
        const isActive = schedule[day].length > 0;
        const isExpanded = expandedDay === day;

        return (
          <div key={day} className="border border-border rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between px-3 py-2 bg-muted/30 cursor-pointer"
              onClick={() => setExpandedDay(isExpanded ? null : day)}
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={isActive}
                  onCheckedChange={() => toggleDay(day)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-sm font-medium">{dayLabels[day]}</span>
              </div>
              {isActive && (
                <span className="text-xs text-muted-foreground">
                  {schedule[day].map((b) => `${b.start}–${b.end}`).join(" | ")}
                </span>
              )}
            </div>

            {isExpanded && isActive && (
              <div className="px-3 py-2 space-y-2 bg-background">
                {schedule[day].map((block, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={block.start}
                      onChange={(e) => updateBlock(day, idx, "start", e.target.value)}
                      className="w-28 text-sm"
                    />
                    <span className="text-muted-foreground text-xs">até</span>
                    <Input
                      type="time"
                      value={block.end}
                      onChange={(e) => updateBlock(day, idx, "end", e.target.value)}
                      className="w-28 text-sm"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeBlock(day, idx)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => addBlock(day)}>
                    <Plus className="h-3 w-3 mr-1" /> Intervalo
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => applyToWeekdays(day)}>
                    Aplicar a dias úteis
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

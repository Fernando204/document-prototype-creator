import { Calendar, Syringe, Scissors, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthEvent, Horse } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UpcomingEventsProps {
  events?: HealthEvent[];
  horses?: Horse[];
  onViewAll?: () => void;
}

const eventIcons = {
  vacinação: Syringe,
  vermifugação: Syringe,
  ferrageamento: Scissors,
  veterinário: Stethoscope,
  medicamento: Syringe,
  outro: Calendar,
};

const eventColors = {
  vacinação: "bg-horse-sage-light text-horse-sage",
  vermifugação: "bg-horse-sage-light text-horse-sage",
  ferrageamento: "bg-horse-gold-light text-horse-gold",
  veterinário: "bg-primary/10 text-primary",
  medicamento: "bg-destructive/10 text-destructive",
  outro: "bg-muted text-muted-foreground",
};

export function UpcomingEvents({ events = [], horses = [], onViewAll }: UpcomingEventsProps) {
  const getHorseName = (horseId: string) => {
    return horses.find((h) => h.id === horseId)?.name || "Cavalo";
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    } else {
      return format(date, "EEE, dd MMM", { locale: ptBR });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Próximos Eventos
        </h2>
        <button
          className="text-sm text-primary hover:underline font-medium"
          onClick={onViewAll}
        >
          Ver todos
        </button>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum evento agendado.
          </p>
        ) : (
          events.map((event, index) => {
            const Icon = eventIcons[event.type];
            const colorClass = eventColors[event.type];

            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("p-2.5 rounded-lg", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getHorseName(event.horseId)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">
                    {formatEventDate(event.date)}
                  </p>
                  {event.time && (
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

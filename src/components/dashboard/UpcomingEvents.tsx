import { Calendar, Syringe, Scissors, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  type: "vacinação" | "ferrageamento" | "veterinário" | "outro";
  title: string;
  horseName: string;
  date: string;
  time: string;
}

const eventIcons = {
  vacinação: Syringe,
  ferrageamento: Scissors,
  veterinário: Stethoscope,
  outro: Calendar,
};

const eventColors = {
  vacinação: "bg-horse-sage-light text-horse-sage",
  ferrageamento: "bg-horse-gold-light text-horse-gold",
  veterinário: "bg-primary/10 text-primary",
  outro: "bg-muted text-muted-foreground",
};

const mockEvents: Event[] = [
  {
    id: "1",
    type: "vacinação",
    title: "Vacina Raiva",
    horseName: "Relâmpago",
    date: "Hoje",
    time: "14:00",
  },
  {
    id: "2",
    type: "ferrageamento",
    title: "Troca de Ferraduras",
    horseName: "Estrela",
    date: "Amanhã",
    time: "09:00",
  },
  {
    id: "3",
    type: "veterinário",
    title: "Check-up Geral",
    horseName: "Thor",
    date: "Sex, 02 Fev",
    time: "10:30",
  },
  {
    id: "4",
    type: "vacinação",
    title: "Vermifugação",
    horseName: "Luna",
    date: "Seg, 05 Fev",
    time: "08:00",
  },
];

export function UpcomingEvents() {
  return (
    <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Próximos Eventos
        </h2>
        <button className="text-sm text-primary hover:underline font-medium">
          Ver todos
        </button>
      </div>

      <div className="space-y-3">
        {mockEvents.map((event, index) => {
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
                <p className="text-xs text-muted-foreground">{event.horseName}</p>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium text-foreground">
                  {event.date}
                </p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

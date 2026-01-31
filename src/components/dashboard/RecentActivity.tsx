import { Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "success" | "warning" | "pending";
  message: string;
  timestamp: string;
}

const activityIcons = {
  success: CheckCircle2,
  warning: AlertCircle,
  pending: Clock,
};

const activityColors = {
  success: "text-horse-sage",
  warning: "text-horse-gold",
  pending: "text-muted-foreground",
};

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "success",
    message: "Vacina aplicada em Relâmpago",
    timestamp: "Há 2 horas",
  },
  {
    id: "2",
    type: "success",
    message: "Novo cavalo cadastrado: Tempestade",
    timestamp: "Há 4 horas",
  },
  {
    id: "3",
    type: "warning",
    message: "Estrela precisa de vermifugação",
    timestamp: "Há 6 horas",
  },
  {
    id: "4",
    type: "pending",
    message: "Pagamento pendente - João Silva",
    timestamp: "Ontem",
  },
  {
    id: "5",
    type: "success",
    message: "Check-up concluído para Thor",
    timestamp: "Ontem",
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Atividade Recente
        </h2>
      </div>

      <div className="space-y-1">
        {mockActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-3 border-b border-border last:border-0"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", colorClass)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

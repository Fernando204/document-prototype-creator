import { Activity, CheckCircle2, AlertCircle, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity as ActivityType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentActivityProps {
  activities?: ActivityType[];
}

const activityIcons = {
  success: CheckCircle2,
  warning: AlertCircle,
  pending: Clock,
  info: Info,
};

const activityColors = {
  success: "text-horse-sage",
  warning: "text-horse-gold",
  pending: "text-muted-foreground",
  info: "text-primary",
};

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">
          Atividade Recente
        </h2>
      </div>

      <div className="space-y-1">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade recente.
          </p>
        ) : (
          activities.slice(0, 5).map((activity, index) => {
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
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

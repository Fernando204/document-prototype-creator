import { MainLayout } from "@/components/layout/MainLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Activity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, AlertTriangle, Info, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  pending: Clock,
  info: Info,
};

const colorMap = {
  success: "text-horse-sage",
  warning: "text-horse-gold",
  pending: "text-muted-foreground",
  info: "text-accent",
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return dateStr; }
};

const Historico = () => {
  const [activities] = useLocalStorage<Activity[]>("horsecontrol-activities", []);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-muted-foreground">{activities.length} {activities.length === 1 ? "ação registrada" : "ações registradas"}</p>

        {activities.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhuma atividade registrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = iconMap[activity.type] || Info;
              return (
                <Card key={activity.id}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={cn("h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0", colorMap[activity.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(activity.timestamp)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Historico;

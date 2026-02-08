import { useNotifications } from "@/hooks/useNotifications";
import { useEvents } from "@/hooks/useEvents";
import { useHorses } from "@/hooks/useHorses";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StockItem, Competition, Reproduction } from "@/types";
import { useEffect, useCallback } from "react";
import { format, differenceInDays, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Calendar,
  Package,
  Heart,
  Trophy,
  Baby,
  Check,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = {
  info: Bell,
  warning: Package,
  success: Check,
  error: X,
};

const typeColors = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-horse-sage-light text-horse-sage",
  error: "bg-destructive/10 text-destructive",
};

export function NotificationPanel() {
  const {
    notifications,
    settings,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const { events } = useEvents();
  const { horses } = useHorses();
  const [stock] = useLocalStorage<StockItem[]>("horsecontrol-stock", []);
  const [competitions] = useLocalStorage<Competition[]>("horsecontrol-competitions", []);
  const [reproductions] = useLocalStorage<Reproduction[]>("horsecontrol-reproductions", []);
  const [lastChecked, setLastChecked] = useLocalStorage<string>(
    "horsecontrol-last-notification-check",
    new Date().toISOString()
  );

  const generateNotifications = useCallback(() => {
    if (!settings.enabled) return;

    const now = new Date();
    const lastCheck = new Date(lastChecked);
    const notificationIds = new Set(notifications.map((n) => n.id));

    // Event reminders (today and tomorrow)
    if (settings.eventReminders) {
      events
        .filter((e) => e.status === "agendado")
        .forEach((event) => {
          const eventDate = new Date(event.date);
          const horse = horses.find((h) => h.id === event.horseId);
          const uniqueId = `event-${event.id}`;

          if (isToday(eventDate) && !notifications.some((n) => n.title.includes(event.title) && isToday(new Date(n.createdAt)))) {
            addNotification({
              title: `${event.title} - Hoje!`,
              message: `${horse?.name || "Cavalo"}: ${event.time ? `às ${event.time}` : "ver agenda"}`,
              type: "warning",
              link: "/agenda",
            });
          } else if (isTomorrow(eventDate) && !notifications.some((n) => n.title.includes(event.title) && n.title.includes("Amanhã"))) {
            addNotification({
              title: `${event.title} - Amanhã`,
              message: `${horse?.name || "Cavalo"}: ${event.time ? `às ${event.time}` : "ver agenda"}`,
              type: "info",
              link: "/agenda",
            });
          }
        });
    }

    // Low stock alerts
    if (settings.lowStockAlerts) {
      stock
        .filter((item) => item.quantity <= item.minQuantity)
        .forEach((item) => {
          if (!notifications.some((n) => n.title.includes(item.name) && n.type === "warning")) {
            addNotification({
              title: `Estoque baixo: ${item.name}`,
              message: `Quantidade: ${item.quantity} ${item.unit} (mínimo: ${item.minQuantity})`,
              type: "warning",
              link: "/estoque",
            });
          }
        });
    }

    // Health alerts
    if (settings.healthAlerts) {
      horses
        .filter((h) => h.status === "em tratamento" || h.status === "observação")
        .forEach((horse) => {
          if (!notifications.some((n) => n.title.includes(horse.name) && n.message.includes("status"))) {
            addNotification({
              title: `${horse.name} em ${horse.status}`,
              message: `Verifique o status de saúde deste cavalo`,
              type: horse.status === "em tratamento" ? "error" : "warning",
              link: "/saude",
            });
          }
        });
    }

    // Competition reminders (next 7 days)
    if (settings.competitionReminders) {
      competitions
        .filter((c) => c.status === "confirmado")
        .forEach((comp) => {
          const compDate = new Date(comp.date);
          const daysUntil = differenceInDays(compDate, now);

          if (daysUntil >= 0 && daysUntil <= 7) {
            if (!notifications.some((n) => n.title.includes(comp.name) && n.message.includes(`${daysUntil}`))) {
              addNotification({
                title: `Competição: ${comp.name}`,
                message: daysUntil === 0 ? "Hoje!" : `Em ${daysUntil} dias - ${comp.location}`,
                type: daysUntil <= 1 ? "warning" : "info",
                link: "/competicao",
              });
            }
          }
        });
    }

    // Reproduction alerts
    if (settings.reproductionAlerts) {
      reproductions
        .filter((r) => r.status === "em andamento" && r.expectedBirthDate)
        .forEach((repro) => {
          const birthDate = new Date(repro.expectedBirthDate!);
          const daysUntil = differenceInDays(birthDate, now);

          if (daysUntil >= 0 && daysUntil <= 30) {
            if (!notifications.some((n) => n.title.includes(repro.mareName) && n.message.includes("nascimento"))) {
              addNotification({
                title: `Previsão de nascimento: ${repro.mareName}`,
                message: `Aproximadamente ${daysUntil} dias para o nascimento`,
                type: daysUntil <= 7 ? "warning" : "info",
                link: "/reproducao",
              });
            }
          }
        });
    }

    setLastChecked(now.toISOString());
  }, [
    settings,
    events,
    horses,
    stock,
    competitions,
    reproductions,
    notifications,
    addNotification,
    lastChecked,
    setLastChecked,
  ]);

  // Generate notifications on mount and periodically
  useEffect(() => {
    generateNotifications();
    const interval = setInterval(generateNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []); // Only run once on mount

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </span>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Marcar lidas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  Limpar
                </Button>
              </div>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0
              ? `${unreadCount} ${unreadCount === 1 ? "nova notificação" : "novas notificações"}`
              : "Você está em dia!"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-4 pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors cursor-pointer",
                      notification.read
                        ? "bg-muted/30 border-border"
                        : "bg-card border-primary/20 shadow-sm"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg flex-shrink-0",
                          typeColors[notification.type]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "font-medium text-sm",
                              notification.read
                                ? "text-muted-foreground"
                                : "text-foreground"
                            )}
                          >
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {format(
                            new Date(notification.createdAt),
                            "dd/MM 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

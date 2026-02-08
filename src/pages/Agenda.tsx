import { MainLayout } from "@/components/layout/MainLayout";
import { useEvents } from "@/hooks/useEvents";
import { useHorses } from "@/hooks/useHorses";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { NewEventDialog } from "@/components/modals/NewEventDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  Syringe,
  Stethoscope,
  Pill,
  Wrench,
  Bug,
  MoreHorizontal,
} from "lucide-react";
import { format, isSameDay, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HealthEvent } from "@/types";

const Agenda = () => {
  const { events, addEvent, updateEvent } = useEvents();
  const { horses } = useHorses();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const getEventIcon = (type: HealthEvent["type"]) => {
    const icons = {
      vacinação: Syringe,
      vermifugação: Bug,
      ferrageamento: Wrench,
      veterinário: Stethoscope,
      medicamento: Pill,
      outro: MoreHorizontal,
    };
    return icons[type] || MoreHorizontal;
  };

  const getStatusBadge = (status: HealthEvent["status"]) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
      agendado: { variant: "secondary", icon: Clock },
      concluído: { variant: "default", icon: CheckCircle },
      cancelado: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || variants.agendado;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: HealthEvent["type"]) => {
    const colors: Record<string, string> = {
      vacinação: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      vermifugação: "bg-green-500/10 text-green-500 border-green-500/20",
      ferrageamento: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      veterinário: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      medicamento: "bg-red-500/10 text-red-500 border-red-500/20",
      outro: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesStatus && matchesType;
  });

  // Get events for selected date
  const eventsForSelectedDate = selectedDate
    ? filteredEvents.filter((event) => isSameDay(parseISO(event.date), selectedDate))
    : [];

  // Get upcoming events (next 7 days)
  const today = startOfDay(new Date());
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingEvents = filteredEvents
    .filter((event) => {
      const eventDate = parseISO(event.date);
      return event.status === "agendado" && isAfter(eventDate, today) && isBefore(eventDate, nextWeek);
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Get overdue events
  const overdueEvents = filteredEvents.filter((event) => {
    const eventDate = parseISO(event.date);
    return event.status === "agendado" && isBefore(eventDate, today);
  });

  // Get dates with events for calendar highlighting
  const datesWithEvents = events.map((event) => parseISO(event.date));

  const handleMarkComplete = (eventId: string) => {
    updateEvent(eventId, { status: "concluído" });
  };

  const handleCancelEvent = (eventId: string) => {
    updateEvent(eventId, { status: "cancelado" });
  };

  const getHorseName = (horseId: string) => {
    return horses.find((h) => h.id === horseId)?.name || "Cavalo não encontrado";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie todos os eventos e compromissos dos seus cavalos
            </p>
          </div>
          <Button onClick={() => setIsNewEventOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="concluído">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              <SelectItem value="vacinação">Vacinação</SelectItem>
              <SelectItem value="vermifugação">Vermifugação</SelectItem>
              <SelectItem value="ferrageamento">Ferrageamento</SelectItem>
              <SelectItem value="veterinário">Veterinário</SelectItem>
              <SelectItem value="medicamento">Medicamento</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alerts */}
        {overdueEvents.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Eventos Atrasados ({overdueEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getHorseName(event.horseId)} • {format(parseISO(event.date), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleMarkComplete(event.id)}>
                        Concluir
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCancelEvent(event.id)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                className="rounded-md border"
                modifiers={{
                  hasEvent: datesWithEvents,
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "hsl(var(--primary))",
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Eventos em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                  : "Selecione uma data"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum evento nesta data</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsNewEventOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Evento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventsForSelectedDate.map((event) => {
                    const Icon = getEventIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {getHorseName(event.horseId)}
                                {event.time && ` • ${event.time}`}
                              </p>
                              {event.description && (
                                <p className="text-sm mt-1">{event.description}</p>
                              )}
                              {event.veterinarian && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Veterinário: {event.veterinarian}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(event.status)}
                              {getTypeBadge(event.type)}
                            </div>
                          </div>
                          {event.status === "agendado" && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkComplete(event.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Marcar como Concluído
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelEvent(event.id)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum evento agendado para os próximos dias
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => setSelectedDate(parseISO(event.date))}
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {getHorseName(event.horseId)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(parseISO(event.date), "dd/MM")}
                        </p>
                        {event.time && (
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NewEventDialog
        open={isNewEventOpen}
        onOpenChange={setIsNewEventOpen}
        onSave={addEvent}
        horses={horses}
      />
    </MainLayout>
  );
};

export default Agenda;

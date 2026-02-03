import { MainLayout } from "@/components/layout/MainLayout";
import { useEvents } from "@/hooks/useEvents";
import { useHorses } from "@/hooks/useHorses";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewEventDialog } from "@/components/modals/NewEventDialog";
import { Calendar, Syringe, Scissors, Stethoscope, Plus, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const eventIcons = {
  vacinação: Syringe,
  vermifugação: Syringe,
  ferrageamento: Scissors,
  veterinário: Stethoscope,
  medicamento: Syringe,
  outro: Calendar,
};

const statusConfig = {
  agendado: { color: "bg-primary/10 text-primary", icon: Clock },
  concluído: { color: "bg-horse-sage-light text-horse-sage", icon: CheckCircle2 },
  cancelado: { color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const Saude = () => {
  const { events, addEvent, completeEvent, deleteEvent } = useEvents();
  const { horses } = useHorses();
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredEvents = events
    .filter((event) => {
      const horse = horses.find((h) => h.id === event.horseId);
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        horse?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesType = typeFilter === "all" || event.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Saúde</h1>
            <p className="text-muted-foreground">Histórico e agendamentos de saúde</p>
          </div>
          <Button onClick={() => setIsNewEventOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou cavalo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="concluído">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
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

        {/* Events List */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <p className="text-muted-foreground">Nenhum evento encontrado.</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const horse = horses.find((h) => h.id === event.horseId);
              const Icon = eventIcons[event.type];
              const status = statusConfig[event.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={event.id}
                  className="bg-card rounded-xl shadow-soft p-4 flex items-center gap-4 hover:shadow-card transition-shadow"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                      <Badge className={cn("text-xs", status.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {horse?.name || "Cavalo não encontrado"} • {event.type}
                    </p>
                    {event.veterinarian && (
                      <p className="text-xs text-muted-foreground">
                        Veterinário: {event.veterinarian}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(event.date), "dd MMM", { locale: ptBR })}
                    </p>
                    {event.time && <p className="text-xs text-muted-foreground">{event.time}</p>}
                    {event.cost && (
                      <p className="text-xs text-horse-sage font-medium">
                        R$ {event.cost.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {event.status === "agendado" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeEvent(event.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
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

export default Saude;

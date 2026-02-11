import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { HorseCard } from "@/components/dashboard/HorseCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HorseFormDialog } from "@/components/modals/HorseFormDialog";
import { NewEventDialog } from "@/components/modals/NewEventDialog";
import { ReportDialog } from "@/components/modals/ReportDialog";
import { HorseDetailDialog } from "@/components/modals/HorseDetailDialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Competition, Reproduction, Horse } from "@/types";
import { useHorses } from "@/hooks/useHorses";
import { useEvents } from "@/hooks/useEvents";
import { useStock } from "@/hooks/useStock";
import { Calendar, TrendingUp, Package } from "lucide-react";

// Custom Horse icon
const HorseIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
    <circle cx="18" cy="8" r="1" />
  </svg>
);

const Index = () => {
  const navigate = useNavigate();
  const { horses, activities, addHorse, toggleFavorite } = useHorses();
  const { events, addEvent, getUpcomingEvents } = useEvents();
  const { getLowStockItems } = useStock();

  const [isNewHorseOpen, setIsNewHorseOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [isVaccineOpen, setIsVaccineOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [competitions] = useLocalStorage<Competition[]>("horsecontrol-competitions", []);
  const [reproductions] = useLocalStorage<Reproduction[]>("horsecontrol-reproductions", []);

  const upcomingEvents = getUpcomingEvents(4);
  const lowStockCount = getLowStockItems().length;

  // Count upcoming competitions (next 30 days)
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30);

  const getNextEvent = (horseId: string) => {
    const horseEvents = events
      .filter((e) => e.horseId === horseId && e.status === "agendado")
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    if (!horseEvents) return undefined;

    const date = new Date(horseEvents.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `${horseEvents.title} - Hoje`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${horseEvents.title} - Amanhã`;
    } else {
      return `${horseEvents.title} - ${date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })}`;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Bom dia! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo dos seus cavalos hoje.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Meus Cavalos"
            value={horses.length}
            subtitle="Todos sob seu cuidado"
            icon={<HorseIcon className="h-5 w-5" />}
            variant="primary"
          />
          <StatCard
            title="Eventos Próximos"
            value={upcomingEvents.length}
            subtitle="Agendados para os próximos dias"
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            title="Competições"
            value={2}
            subtitle="Próximas 30 dias"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Estoque Baixo"
            value={lowStockCount}
            subtitle={lowStockCount > 0 ? "Itens a repor" : "Tudo em ordem"}
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Horses Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Cavalos Recentes
              </h2>
              <button
                className="text-sm text-primary hover:underline font-medium"
                onClick={() => navigate("/cavalos")}
              >
                Ver todos →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {horses.slice(0, 4).map((horse) => (
                <HorseCard
                  key={horse.id}
                  id={horse.id}
                  name={horse.name}
                  breed={horse.breed}
                  age={horse.age}
                  status={horse.status}
                  imageUrl={horse.imageUrl}
                  nextEvent={getNextEvent(horse.id)}
                  isFavorite={horse.isFavorite}
                  onToggleFavorite={() => toggleFavorite(horse.id)}
                  onViewDetails={() => setSelectedHorse(horse)}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <QuickActions
              onNewHorse={() => setIsNewHorseOpen(true)}
              onNewVaccine={() => setIsVaccineOpen(true)}
              onNewEvent={() => setIsNewEventOpen(true)}
              onReport={() => setIsReportOpen(true)}
            />
            <UpcomingEvents
              events={upcomingEvents}
              horses={horses}
              onViewAll={() => navigate("/saude")}
            />
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={activities} />

          {/* Financial Summary */}
          <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-horse-sage" />
              <h2 className="text-lg font-semibold text-foreground">
                Resumo Financeiro
              </h2>
              <button
                className="ml-auto text-sm text-primary hover:underline font-medium"
                onClick={() => navigate("/financeiro")}
              >
                Ver detalhes
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-horse-sage-light rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Receita do Mês
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <p className="text-xl font-bold text-horse-sage">R$ 30.000</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Despesas</p>
                  <p className="text-xs text-muted-foreground">
                    Medicamentos, ração
                  </p>
                </div>
                <p className="text-xl font-bold text-muted-foreground">
                  R$ 5.500
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-horse-gold-light rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Saldo</p>
                  <p className="text-xs text-muted-foreground">Resultado do mês</p>
                </div>
                <p className="text-xl font-bold text-horse-sage">R$ 24.500</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewHorseDialog
        open={isNewHorseOpen}
        onOpenChange={setIsNewHorseOpen}
        onSave={addHorse}
      />
      <NewEventDialog
        open={isVaccineOpen}
        onOpenChange={setIsVaccineOpen}
        onSave={addEvent}
        horses={horses}
        defaultType="vacinação"
      />
      <NewEventDialog
        open={isNewEventOpen}
        onOpenChange={setIsNewEventOpen}
        onSave={addEvent}
        horses={horses}
      />
      <ReportDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        horses={horses}
        events={events}
      />
      <HorseDetailDialog
        open={!!selectedHorse}
        onOpenChange={(open) => !open && setSelectedHorse(null)}
        horse={selectedHorse}
        events={events}
        competitions={competitions}
        reproductions={reproductions}
      />
    </MainLayout>
  );
};

export default Index;

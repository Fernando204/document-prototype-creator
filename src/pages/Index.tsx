import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { HorseCard } from "@/components/dashboard/HorseCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Heart, Users, Calendar, TrendingUp } from "lucide-react";
import horse1 from "@/assets/horse-1.jpg";
import horse2 from "@/assets/horse-2.jpg";

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

const mockHorses = [
  {
    name: "Relâmpago",
    breed: "Mangalarga Marchador",
    age: "5 anos",
    status: "saudável" as const,
    nextEvent: "Vacina - 05/02",
    owner: "João Silva",
  },
  {
    name: "Estrela",
    breed: "Quarto de Milha",
    age: "3 anos",
    status: "em tratamento" as const,
    nextEvent: "Ferrageamento - Amanhã",
    owner: "Maria Santos",
  },
  {
    name: "Thor",
    breed: "Lusitano",
    age: "7 anos",
    status: "saudável" as const,
    nextEvent: "Check-up - 10/02",
    owner: "Carlos Oliveira",
  },
  {
    name: "Luna",
    breed: "Crioulo",
    age: "4 anos",
    status: "observação" as const,
    nextEvent: "Vermifugação - 08/02",
    owner: "Ana Costa",
  },
];

const Index = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            Bom dia, Administrador 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está um resumo do seu haras hoje.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Cavalos"
            value={42}
            subtitle="4 novos este mês"
            icon={<HorseIcon className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Saúde em Dia"
            value="95%"
            subtitle="40 de 42 cavalos"
            icon={<Heart className="h-5 w-5" />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Clientes Ativos"
            value={28}
            subtitle="3 novos este mês"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Eventos esta Semana"
            value={12}
            subtitle="5 vacinas, 4 check-ups"
            icon={<Calendar className="h-5 w-5" />}
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
              <button className="text-sm text-primary hover:underline font-medium">
                Ver todos →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockHorses.map((horse) => (
                <HorseCard key={horse.name} {...horse} />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <UpcomingEvents />
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          
          {/* Financial Summary */}
          <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-horse-sage" />
              <h2 className="text-lg font-semibold text-foreground">
                Resumo Financeiro
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-horse-sage-light rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Receita do Mês</p>
                  <p className="text-xs text-muted-foreground">Janeiro 2025</p>
                </div>
                <p className="text-xl font-bold text-horse-sage">R$ 45.800</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Despesas</p>
                  <p className="text-xs text-muted-foreground">Medicamentos, ração</p>
                </div>
                <p className="text-xl font-bold text-muted-foreground">R$ 12.400</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-horse-gold-light rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Pendente</p>
                  <p className="text-xs text-muted-foreground">4 faturas</p>
                </div>
                <p className="text-xl font-bold text-horse-gold">R$ 8.200</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;

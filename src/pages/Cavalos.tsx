import { MainLayout } from "@/components/layout/MainLayout";
import { useHorses } from "@/hooks/useHorses";
import { useEvents } from "@/hooks/useEvents";
import { HorseCard } from "@/components/dashboard/HorseCard";
import { NewHorseDialog } from "@/components/modals/NewHorseDialog";
import { HorseDetailDialog } from "@/components/modals/HorseDetailDialog";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Competition, Reproduction, Horse } from "@/types";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Cavalos = () => {
  const { horses, addHorse, toggleFavorite, deleteHorse } = useHorses();
  const { getEventsByHorse } = useEvents();
  const [isNewHorseOpen, setIsNewHorseOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [competitions] = useLocalStorage<Competition[]>("horsecontrol-competitions", []);
  const [reproductions] = useLocalStorage<Reproduction[]>("horsecontrol-reproductions", []);

  const filteredHorses = horses.filter((horse) => {
    const matchesSearch = horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      horse.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || horse.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getNextEvent = (horseId: string) => {
    const events = getEventsByHorse(horseId);
    const upcoming = events
      .filter((e) => e.status === "agendado")
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    
    if (!upcoming) return undefined;
    
    const date = new Date(upcoming.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `${upcoming.title} - Hoje`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${upcoming.title} - Amanhã`;
    } else {
      return `${upcoming.title} - ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Cavalos</h1>
            <p className="text-muted-foreground">
              {horses.length} {horses.length === 1 ? "cavalo cadastrado" : "cavalos cadastrados"}
            </p>
          </div>
          <Button onClick={() => setIsNewHorseOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cavalo
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou raça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="saudável">Saudável</SelectItem>
              <SelectItem value="em tratamento">Em Tratamento</SelectItem>
              <SelectItem value="observação">Observação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {filteredHorses.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Nenhum cavalo encontrado com esses filtros."
                : "Nenhum cavalo cadastrado ainda."}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setIsNewHorseOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar primeiro cavalo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHorses.map((horse) => (
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
                onDelete={() => deleteHorse(horse.id)}
                onViewDetails={() => setSelectedHorse(horse)}
              />
            ))}
          </div>
        )}
      </div>

      <NewHorseDialog
        open={isNewHorseOpen}
        onOpenChange={setIsNewHorseOpen}
        onSave={addHorse}
      />
    </MainLayout>
  );
};

export default Cavalos;

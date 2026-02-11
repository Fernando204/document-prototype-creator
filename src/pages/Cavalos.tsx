import { MainLayout } from "@/components/layout/MainLayout";
import { useHorses } from "@/hooks/useHorses";
import { useEvents } from "@/hooks/useEvents";
import { HorseCard } from "@/components/dashboard/HorseCard";
import { HorseFormDialog } from "@/components/modals/HorseFormDialog";
import { HorseDetailDialog } from "@/components/modals/HorseDetailDialog";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Competition, Reproduction, Horse } from "@/types";
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
  const { horses, addHorse, updateHorse, toggleFavorite, deleteHorse } = useHorses();
  const { events, getEventsByHorse } = useEvents();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
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
    const horseEvents = getEventsByHorse(horseId);
    const upcoming = horseEvents
      .filter((e) => e.status === "agendado")
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (!upcoming) return undefined;
    const date = new Date(upcoming.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return `${upcoming.title} - Hoje`;
    if (date.toDateString() === tomorrow.toDateString()) return `${upcoming.title} - Amanhã`;
    return `${upcoming.title} - ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
  };

  const handleSave = async (data: Omit<Horse, "id" | "createdAt" | "updatedAt">) => {
    if (editingHorse) {
      await updateHorse(editingHorse.id, data);
    } else {
      await addHorse(data);
    }
  };

  const handleOpenNew = () => {
    setEditingHorse(null);
    setIsFormOpen(true);
  };

  const handleEdit = (horse: Horse) => {
    setEditingHorse(horse);
    setIsFormOpen(true);
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
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cavalo
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou raça..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
            <div className="max-w-sm mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4">
                <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
                <circle cx="18" cy="8" r="1" />
              </svg>
              <p className="text-muted-foreground mb-2">
                {searchTerm || statusFilter !== "all" ? "Nenhum cavalo encontrado com esses filtros." : "Nenhum cavalo cadastrado ainda."}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" ? "Tente ajustar seus filtros de busca." : "Comece cadastrando seu primeiro cavalo."}
              </p>
              <Button variant="outline" onClick={handleOpenNew}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar primeiro cavalo
              </Button>
            </div>
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
                onEdit={() => handleEdit(horse)}
              />
            ))}
          </div>
        )}
      </div>

      <HorseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        horse={editingHorse}
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

export default Cavalos;

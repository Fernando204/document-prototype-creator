import { Horse, HealthEvent, Competition, Reproduction } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  Syringe,
  Trophy,
  Baby,
  FileText,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HorseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horse: Horse | null;
  events: HealthEvent[];
  competitions: Competition[];
  reproductions: Reproduction[];
}

const statusConfig = {
  saudável: { color: "bg-horse-sage-light text-horse-sage", dot: "bg-horse-sage" },
  "em tratamento": { color: "bg-horse-gold-light text-horse-gold", dot: "bg-horse-gold" },
  observação: { color: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

export function HorseDetailDialog({
  open,
  onOpenChange,
  horse,
  events,
  competitions,
  reproductions,
}: HorseDetailDialogProps) {
  if (!horse) return null;

  const config = statusConfig[horse.status];

  const horseEvents = events
    .filter((e) => e.horseId === horse.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const horseCompetitions = competitions
    .filter((c) => c.horses.some((h) => h.horseId === horse.id))
    .sort((a, b) => b.date.localeCompare(a.date));

  const horseReproductions = reproductions
    .filter((r) => r.mareId === horse.id || r.stallionId === horse.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const eventStatusColor = (status: string) => {
    switch (status) {
      case "concluído": return "text-horse-sage";
      case "agendado": return "text-horse-gold";
      case "cancelado": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Detalhes do Cavalo</DialogTitle>
        </DialogHeader>

        {/* Hero Section */}
        <div className="flex gap-5 items-start">
          <div className="h-28 w-28 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {horse.imageUrl ? (
              <img src={horse.imageUrl} alt={horse.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-horse-cream to-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-horse-brown-light/30">
                  <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
                  <circle cx="18" cy="8" r="1" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-foreground truncate">{horse.name}</h2>
              {horse.isFavorite && <Heart className="h-4 w-4 fill-destructive text-destructive flex-shrink-0" />}
            </div>
            <p className="text-sm text-muted-foreground">{horse.breed} • {horse.age}</p>
            <Badge className={cn("mt-2 gap-1.5 text-xs", config.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
              {horse.status}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <InfoItem label="Sexo" value={horse.sex} />
          {horse.color && <InfoItem label="Pelagem" value={horse.color} />}
          {horse.birthDate && <InfoItem label="Nascimento" value={formatDate(horse.birthDate)} />}
          {horse.pedigree?.father && <InfoItem label="Pai" value={horse.pedigree.father} />}
          {horse.pedigree?.mother && <InfoItem label="Mãe" value={horse.pedigree.mother} />}
          {horse.pedigree?.registry && <InfoItem label="Registro" value={horse.pedigree.registry} />}
          <InfoItem label="Cadastrado em" value={formatDate(horse.createdAt)} />
        </div>

        {horse.notes && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
            <p className="text-sm text-foreground">{horse.notes}</p>
          </div>
        )}

        <Separator />

        {/* History Tabs */}
        <Tabs defaultValue="saude" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="saude" className="flex-1 text-xs gap-1">
              <Syringe className="h-3 w-3" /> Saúde ({horseEvents.length})
            </TabsTrigger>
            <TabsTrigger value="competicoes" className="flex-1 text-xs gap-1">
              <Trophy className="h-3 w-3" /> Competições ({horseCompetitions.length})
            </TabsTrigger>
            <TabsTrigger value="reproducao" className="flex-1 text-xs gap-1">
              <Baby className="h-3 w-3" /> Reprodução ({horseReproductions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saude" className="mt-3 max-h-60 overflow-y-auto space-y-2">
            {horseEvents.length === 0 ? (
              <EmptyState text="Nenhum evento de saúde registrado." />
            ) : (
              horseEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Syringe className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <span className={cn("text-xs font-medium capitalize", eventStatusColor(event.status))}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.type} • {formatDate(event.date)}
                      {event.time && ` às ${event.time}`}
                    </p>
                    {event.veterinarian && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <User className="h-3 w-3 inline mr-1" />{event.veterinarian}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    )}
                    {event.cost != null && event.cost > 0 && (
                      <p className="text-xs font-medium text-foreground mt-1">
                        R$ {event.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="competicoes" className="mt-3 max-h-60 overflow-y-auto space-y-2">
            {horseCompetitions.length === 0 ? (
              <EmptyState text="Nenhuma competição registrada." />
            ) : (
              horseCompetitions.map((comp) => {
                const entry = comp.horses.find((h) => h.horseId === horse.id);
                return (
                  <div key={comp.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{comp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {comp.category} • {formatDate(comp.date)} • {comp.location}
                      </p>
                      {entry?.placement && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {entry.placement}º lugar
                        </Badge>
                      )}
                      {entry?.result && (
                        <p className="text-xs text-muted-foreground mt-1">{entry.result}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="reproducao" className="mt-3 max-h-60 overflow-y-auto space-y-2">
            {horseReproductions.length === 0 ? (
              <EmptyState text="Nenhum registro de reprodução." />
            ) : (
              horseReproductions.map((rep) => (
                <div key={rep.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Baby className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate capitalize">{rep.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(rep.date)} • {rep.status}
                    </p>
                    {rep.stallionName && (
                      <p className="text-xs text-muted-foreground">Garanhão: {rep.stallionName}</p>
                    )}
                    {rep.expectedBirthDate && (
                      <p className="text-xs text-muted-foreground">
                        Previsão de nascimento: {formatDate(rep.expectedBirthDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-6">
      <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

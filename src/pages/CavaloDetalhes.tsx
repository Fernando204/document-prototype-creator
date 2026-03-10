import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useHorses } from "@/hooks/useHorses";
import { useEvents } from "@/hooks/useEvents";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Client, Competition, Reproduction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Heart, Calendar, Syringe, Trophy, Baby,
  FileText, User, Edit2, MapPin, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  saudável: { color: "bg-horse-sage-light text-horse-sage", dot: "bg-horse-sage" },
  "em tratamento": { color: "bg-horse-gold-light text-horse-gold", dot: "bg-horse-gold" },
  observação: { color: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return dateStr; }
};

const formatDateTime = (dateStr: string, time?: string) => {
  const date = formatDate(dateStr);
  return time ? `${date} às ${time}` : date;
};

const eventStatusColor = (status: string) => {
  switch (status) {
    case "concluído": return "text-horse-sage";
    case "agendado": return "text-horse-gold";
    case "cancelado": return "text-destructive";
    default: return "text-muted-foreground";
  }
};

const CavaloDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getHorseById, toggleFavorite } = useHorses();
  const { events } = useEvents();
  const [clients] = useLocalStorage<Client[]>("horsecontrol-clients", []);
  const [competitions] = useLocalStorage<Competition[]>("horsecontrol-competitions", []);
  const [reproductions] = useLocalStorage<Reproduction[]>("horsecontrol-reproductions", []);

  const horse = id ? getHorseById(id) : undefined;

  if (!horse) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Cavalo não encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/cavalos")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  const config = statusConfig[horse.status];
  const owners = clients.filter((c) => (horse.ownerIds || []).includes(c.id));
  const horseEvents = events.filter((e) => e.horseIds?.includes(horse.id)).sort((a, b) => b.date.localeCompare(a.date));
  const horseCompetitions = competitions.filter((c) => c.horses.some((h) => h.horseId === horse.id)).sort((a, b) => b.date.localeCompare(a.date));
  const horseReproductions = reproductions.filter((r) => r.mareId === horse.id || r.stallionId === horse.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/cavalos")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para Cavalos
        </Button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="h-56 w-full md:w-72 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {horse.imageUrl ? (
              <img src={horse.imageUrl} alt={horse.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-horse-cream to-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-20 w-20 text-horse-brown-light/30">
                  <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
                  <circle cx="18" cy="8" r="1" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{horse.name}</h1>
              {horse.isFavorite && <Heart className="h-5 w-5 fill-destructive text-destructive" />}
              <Badge className={cn("gap-1.5 text-xs", config.color)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                {horse.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{horse.breed} • {horse.age} • {horse.sex}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm pt-2">
              {horse.color && <InfoItem label="Pelagem" value={horse.color} />}
              {horse.birthDate && <InfoItem label="Nascimento" value={formatDate(horse.birthDate)} />}
              {horse.pedigree?.father && <InfoItem label="Pai" value={horse.pedigree.father} />}
              {horse.pedigree?.mother && <InfoItem label="Mãe" value={horse.pedigree.mother} />}
              {horse.pedigree?.registry && <InfoItem label="Registro" value={horse.pedigree.registry} />}
              <InfoItem label="Cadastrado em" value={formatDate(horse.createdAt)} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => toggleFavorite(horse.id)}>
                <Heart className={cn("h-4 w-4 mr-2", horse.isFavorite ? "fill-destructive text-destructive" : "")} />
                {horse.isFavorite ? "Desfavoritar" : "Favoritar"}
              </Button>
            </div>
          </div>
        </div>

        {/* Proprietários */}
        {owners.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Proprietários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {owners.map((owner) => (
                  <Link key={owner.id} to={`/clientes/${owner.id}`} className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{owner.name}</p>
                      {owner.phone && <p className="text-xs text-muted-foreground">{owner.phone}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {horse.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Anotações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{horse.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* History Tabs */}
        <Tabs defaultValue="saude" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="saude" className="flex-1 gap-1">
              <Syringe className="h-3.5 w-3.5" /> Saúde ({horseEvents.length})
            </TabsTrigger>
            <TabsTrigger value="competicoes" className="flex-1 gap-1">
              <Trophy className="h-3.5 w-3.5" /> Competições ({horseCompetitions.length})
            </TabsTrigger>
            <TabsTrigger value="reproducao" className="flex-1 gap-1">
              <Baby className="h-3.5 w-3.5" /> Reprodução ({horseReproductions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saude" className="mt-4 space-y-3">
            {horseEvents.length === 0 ? (
              <EmptyState text="Nenhum evento de saúde registrado." />
            ) : (
              horseEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Syringe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-foreground">{event.title}</p>
                          <span className={cn("text-xs font-medium capitalize", eventStatusColor(event.status))}>{event.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDateTime(event.date, event.time)}</span>
                          <span className="capitalize">{event.type}</span>
                          {event.veterinarian && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {event.veterinarian}</span>}
                        </div>
                        {event.description && <p className="text-xs text-muted-foreground mt-2">{event.description}</p>}
                        {event.cost != null && event.cost > 0 && (
                          <p className="text-xs font-medium text-foreground mt-1">R$ {event.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="competicoes" className="mt-4 space-y-3">
            {horseCompetitions.length === 0 ? (
              <EmptyState text="Nenhuma competição registrada." />
            ) : (
              horseCompetitions.map((comp) => {
                const entry = comp.horses.find((h) => h.horseId === horse.id);
                return (
                  <Card key={comp.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{comp.name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(comp.date)}</span>
                            <span>{comp.category}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {comp.location}</span>
                          </div>
                          {entry?.placement && <Badge variant="outline" className="mt-2 text-xs">{entry.placement}º lugar</Badge>}
                          {entry?.result && <p className="text-xs text-muted-foreground mt-1">{entry.result}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="reproducao" className="mt-4 space-y-3">
            {horseReproductions.length === 0 ? (
              <EmptyState text="Nenhum registro de reprodução." />
            ) : (
              horseReproductions.map((rep) => (
                <Card key={rep.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Baby className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground capitalize">{rep.type}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(rep.date)}</span>
                          <span className="capitalize">{rep.status}</span>
                        </div>
                        {rep.stallionName && <p className="text-xs text-muted-foreground mt-1">Garanhão: {rep.stallionName}</p>}
                        {rep.expectedBirthDate && <p className="text-xs text-muted-foreground">Previsão: {formatDate(rep.expectedBirthDate)}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

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
    <div className="text-center py-10 bg-card rounded-xl">
      <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export default CavaloDetalhes;

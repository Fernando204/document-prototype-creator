import { useParams, useNavigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Client, Horse, HealthEvent } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Phone, Mail, FileText, MapPin, User, Calendar,
} from "lucide-react";

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return dateStr; }
};

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clients] = useLocalStorage<Client[]>("horsecontrol-clients", []);
  const [horses] = useLocalStorage<Horse[]>("horsecontrol-horses", []);
  const [events] = useLocalStorage<HealthEvent[]>("horsecontrol-events", []);

  const client = clients.find((c) => c.id === id);
  const clientHorses = horses.filter((h) => (h.ownerIds || []).includes(id || ""));

  if (!client) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Cliente não encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/clientes")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Get all events related to client's horses
  const clientEvents = events
    .filter((e) => e.horseIds?.some((hId) => clientHorses.some((h) => h.id === hId)))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/clientes")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para Proprietários
        </Button>

        {/* Hero */}
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <p className="text-muted-foreground text-sm">Cadastrado em {formatDate(client.createdAt)}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {client.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {client.phone}</span>}
              {client.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {client.email}</span>}
              {client.document && <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {client.document}</span>}
              {client.address && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {client.address}</span>}
            </div>
          </div>
        </div>

        {/* Notes */}
        {client.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Anotações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{client.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Horses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cavalos ({clientHorses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {clientHorses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum cavalo vinculado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clientHorses.map((horse) => (
                  <Link key={horse.id} to={`/cavalos/${horse.id}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {horse.imageUrl ? (
                        <img src={horse.imageUrl} alt={horse.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{horse.name}</p>
                      <p className="text-xs text-muted-foreground">{horse.breed} • {horse.age}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{horse.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Histórico de Eventos ({clientEvents.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum evento registrado.</p>
            ) : (
              clientEvents.slice(0, 20).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.type} • {formatDate(event.date)}{event.time && ` às ${event.time}`} • <span className="capitalize">{event.status}</span>
                    </p>
                    {event.veterinarian && <p className="text-xs text-muted-foreground mt-0.5">Responsável: {event.veterinarian}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClienteDetalhes;

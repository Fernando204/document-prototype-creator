import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import { HorseHistoryEntry } from "@/types";

interface HorseHistorySectionProps {
  history: HorseHistoryEntry[];
}

const actionLabels: Record<string, string> = {
  criação: "Cadastro",
  edição: "Edição",
  biometria: "Medição Biométrica",
  resenha: "Resenha Atualizada",
};

const actionColors: Record<string, string> = {
  criação: "bg-primary/10 text-primary",
  edição: "bg-accent/10 text-accent",
  biometria: "bg-primary/10 text-primary",
  resenha: "bg-secondary text-secondary-foreground",
};

const formatDateTime = (d: string) => {
  try {
    const date = new Date(d);
    return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } catch { return d; }
};

export function HorseHistorySection({ history }: HorseHistorySectionProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Histórico de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Histórico de Alterações ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {[...history].reverse().map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 text-sm bg-muted/10 rounded-lg px-3 py-2.5">
              <Badge className={`text-[10px] shrink-0 mt-0.5 ${actionColors[entry.action] || ""}`}>
                {actionLabels[entry.action] || entry.action}
              </Badge>
              <div className="flex-1 min-w-0">
                {entry.field && (
                  <p className="text-xs text-foreground">
                    <span className="font-medium">{entry.field}</span>
                    {entry.oldValue && (
                      <span className="text-muted-foreground">
                        {" "}&quot;{entry.oldValue}&quot; → &quot;{entry.newValue}&quot;
                      </span>
                    )}
                    {!entry.oldValue && entry.newValue && (
                      <span className="text-muted-foreground"> → &quot;{entry.newValue}&quot;</span>
                    )}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  {entry.user} • {formatDateTime(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

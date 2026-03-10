import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileDown, Printer, Eye, X } from "lucide-react";
import { Horse, HealthEvent, Competition, Reproduction, Client, HorseHistoryEntry } from "@/types";

interface HorseReportProps {
  horse: Horse;
  events: HealthEvent[];
  competitions: Competition[];
  reproductions: Reproduction[];
  owners: Client[];
  onClose: () => void;
}

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

export function HorseReport({ horse, events, competitions, reproductions, owners, onClose }: HorseReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const latest = horse.biometrics?.length ? horse.biometrics[horse.biometrics.length - 1] : null;

  const handlePrint = () => {
    const content = reportRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Relatório - ${horse.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #1a1a2e; font-size: 13px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 15px; margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .item { background: #f5f5f5; padding: 8px; border-radius: 4px; }
        .item .label { font-size: 10px; color: #666; text-transform: uppercase; }
        .item .value { font-size: 13px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 12px; }
        th { background: #f0f0f0; font-weight: 600; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .meta { color: #666; font-size: 11px; }
        .section-text { background: #f9f9f9; padding: 12px; border-radius: 4px; margin-top: 4px; white-space: pre-wrap; }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-background py-2">
          <h2 className="text-lg font-bold text-foreground">Relatório — {horse.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Imprimir / PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Report content */}
        <div ref={reportRef} className="space-y-6 bg-card rounded-xl p-6 border">
          <div className="header">
            <div>
              <h1>{horse.name}</h1>
              <p className="meta">{horse.breed} • {horse.age} • {horse.sex} • {horse.color}</p>
            </div>
            <p className="meta">Gerado em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>

          <Separator />

          {/* General */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">Dados Gerais</h2>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {[
                { l: "Nascimento", v: horse.birthDate ? formatDate(horse.birthDate) : "—" },
                { l: "Pelagem", v: horse.color || "—" },
                { l: "Sexo", v: horse.sex },
                { l: "Status", v: horse.status },
                { l: "Pai", v: horse.pedigree?.father || "—" },
                { l: "Mãe", v: horse.pedigree?.mother || "—" },
                { l: "Registro", v: horse.pedigree?.registry || "—" },
                { l: "Proprietários", v: owners.map((o) => o.name).join(", ") || "—" },
              ].map((i) => (
                <div key={i.l} className="bg-muted/20 rounded p-2">
                  <p className="text-xs text-muted-foreground">{i.l}</p>
                  <p className="font-medium capitalize">{i.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Biometrics */}
          {latest && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Dados Biométricos</h2>
                <div className="grid grid-cols-4 gap-2 text-sm">
                {[
                  { l: "Altura Cernelha", v: latest.withersHeight ? `${latest.withersHeight} cm` : "—" },
                  { l: "Peso", v: latest.weight ? `${latest.weight} kg` : "—" },
                  { l: "Comp. Corpo", v: latest.bodyLength ? `${latest.bodyLength} cm` : "—" },
                  { l: "Perím. Torácico", v: latest.chestCircumference ? `${latest.chestCircumference} cm` : "—" },
                  { l: "Altura Garupa", v: latest.crumpHeight ? `${latest.crumpHeight} cm` : "—" },
                  { l: "Comp. Pescoço", v: latest.neckLength ? `${latest.neckLength} cm` : "—" },
                  { l: "Largura Ancas", v: latest.hipWidth ? `${latest.hipWidth} cm` : "—" },
                  { l: "Perím. Canela", v: latest.cannonPerimeter ? `${latest.cannonPerimeter} cm` : "—" },
                ].map((i) => (
                  <div key={i.l} className="bg-muted/20 rounded p-2">
                    <p className="text-xs text-muted-foreground">{i.l}</p>
                    <p className="font-medium">{i.v}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Medido em {formatDate(latest.measuredAt)} por {latest.measuredBy}</p>
            </div>
          )}

          {/* Description */}
          {horse.description && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Resenha</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {horse.description.temperament && <div className="bg-muted/20 rounded p-2"><p className="text-xs text-muted-foreground">Temperamento</p><p>{horse.description.temperament}</p></div>}
                {horse.description.behavior && <div className="bg-muted/20 rounded p-2"><p className="text-xs text-muted-foreground">Comportamento</p><p>{horse.description.behavior}</p></div>}
                {horse.description.physicalTraits && <div className="bg-muted/20 rounded p-2"><p className="text-xs text-muted-foreground">Características Físicas</p><p>{horse.description.physicalTraits}</p></div>}
                {horse.description.generalNotes && <div className="bg-muted/20 rounded p-2"><p className="text-xs text-muted-foreground">Observações</p><p>{horse.description.generalNotes}</p></div>}
              </div>
            </div>
          )}

          {/* Health events */}
          {events.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Saúde ({events.length})</h2>
              <table className="w-full text-xs">
                <thead><tr><th>Data</th><th>Tipo</th><th>Título</th><th>Status</th><th>Veterinário</th><th>Custo</th></tr></thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDate(e.date)}</td>
                      <td className="capitalize">{e.type}</td>
                      <td>{e.title}</td>
                      <td className="capitalize">{e.status}</td>
                      <td>{e.veterinarian || "—"}</td>
                      <td>{e.cost ? `R$ ${e.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Competitions */}
          {competitions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Competições ({competitions.length})</h2>
              <table className="w-full text-xs">
                <thead><tr><th>Data</th><th>Nome</th><th>Local</th><th>Categoria</th><th>Colocação</th></tr></thead>
                <tbody>
                  {competitions.map((c) => {
                    const entry = c.horses.find((h) => h.horseId === horse.id);
                    return (
                      <tr key={c.id}>
                        <td>{formatDate(c.date)}</td>
                        <td>{c.name}</td>
                        <td>{c.location}</td>
                        <td>{c.category}</td>
                        <td>{entry?.placement ? `${entry.placement}º` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* History */}
          {(horse.history?.length ?? 0) > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Histórico de Alterações</h2>
              <table className="w-full text-xs">
                <thead><tr><th>Data</th><th>Ação</th><th>Campo</th><th>De</th><th>Para</th><th>Responsável</th></tr></thead>
                <tbody>
                  {[...(horse.history || [])].reverse().map((h) => (
                    <tr key={h.id}>
                      <td>{formatDate(h.timestamp)}</td>
                      <td className="capitalize">{h.action}</td>
                      <td>{h.field || "—"}</td>
                      <td>{h.oldValue || "—"}</td>
                      <td>{h.newValue || "—"}</td>
                      <td>{h.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

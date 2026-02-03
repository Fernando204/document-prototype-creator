import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Horse, HealthEvent } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horses: Horse[];
  events: HealthEvent[];
}

type ReportType = "horses" | "health" | "events" | "full";

export function ReportDialog({ open, onOpenChange, horses, events }: ReportDialogProps) {
  const [reportType, setReportType] = useState<ReportType>("horses");
  const [selectedHorse, setSelectedHorse] = useState<string>("all");

  const generateReportContent = useMemo(() => {
    const now = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    let content = `HORSE CONTROL - RELATÓRIO\nGerado em: ${now}\n${"=".repeat(50)}\n\n`;

    const filteredHorses = selectedHorse === "all" 
      ? horses 
      : horses.filter(h => h.id === selectedHorse);

    if (reportType === "horses" || reportType === "full") {
      content += "📋 CADASTRO DE CAVALOS\n" + "-".repeat(30) + "\n\n";
      filteredHorses.forEach(horse => {
        content += `Nome: ${horse.name}\n`;
        content += `Raça: ${horse.breed}\n`;
        content += `Idade: ${horse.age}\n`;
        content += `Sexo: ${horse.sex}\n`;
        content += `Status: ${horse.status}\n`;
        if (horse.color) content += `Pelagem: ${horse.color}\n`;
        if (horse.pedigree?.father) content += `Pai: ${horse.pedigree.father}\n`;
        if (horse.pedigree?.mother) content += `Mãe: ${horse.pedigree.mother}\n`;
        if (horse.pedigree?.registry) content += `Registro: ${horse.pedigree.registry}\n`;
        content += "\n";
      });
    }

    if (reportType === "health" || reportType === "full") {
      content += "\n💉 HISTÓRICO DE SAÚDE\n" + "-".repeat(30) + "\n\n";
      const filteredEvents = events.filter(e => 
        selectedHorse === "all" || e.horseId === selectedHorse
      );
      
      filteredEvents.forEach(event => {
        const horse = horses.find(h => h.id === event.horseId);
        content += `Cavalo: ${horse?.name || "N/A"}\n`;
        content += `Tipo: ${event.type}\n`;
        content += `Evento: ${event.title}\n`;
        content += `Data: ${format(new Date(event.date), "dd/MM/yyyy")}\n`;
        content += `Status: ${event.status}\n`;
        if (event.veterinarian) content += `Veterinário: ${event.veterinarian}\n`;
        if (event.cost) content += `Custo: R$ ${event.cost.toFixed(2)}\n`;
        content += "\n";
      });
    }

    if (reportType === "events") {
      content += "\n📅 EVENTOS AGENDADOS\n" + "-".repeat(30) + "\n\n";
      const upcomingEvents = events
        .filter(e => e.status === "agendado")
        .filter(e => selectedHorse === "all" || e.horseId === selectedHorse)
        .sort((a, b) => a.date.localeCompare(b.date));
      
      upcomingEvents.forEach(event => {
        const horse = horses.find(h => h.id === event.horseId);
        content += `${format(new Date(event.date), "dd/MM/yyyy")} ${event.time || ""} - ${event.title}\n`;
        content += `  Cavalo: ${horse?.name || "N/A"} | Tipo: ${event.type}\n\n`;
      });
    }

    return content;
  }, [reportType, selectedHorse, horses, events]);

  const handleDownload = () => {
    const blob = new Blob([generateReportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-horsecontrol-${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Relatório baixado com sucesso!");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório Horse Control</title>
            <style>
              body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
            </style>
          </head>
          <body>${generateReportContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Relatório
          </DialogTitle>
          <DialogDescription>
            Selecione o tipo de relatório e o cavalo desejado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horses">Cadastro de Cavalos</SelectItem>
                <SelectItem value="health">Histórico de Saúde</SelectItem>
                <SelectItem value="events">Eventos Agendados</SelectItem>
                <SelectItem value="full">Relatório Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cavalo</Label>
            <Select value={selectedHorse} onValueChange={setSelectedHorse}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Cavalos</SelectItem>
                {horses.map(horse => (
                  <SelectItem key={horse.id} value={horse.id}>
                    {horse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-muted rounded-lg p-4 max-h-[300px] overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono">{generateReportContent}</pre>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

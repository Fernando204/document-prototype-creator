import { Plus, Syringe, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    icon: Plus,
    label: "Novo Cavalo",
    description: "Cadastrar animal",
    variant: "default" as const,
  },
  {
    icon: Syringe,
    label: "Registrar Vacina",
    description: "Atualizar saúde",
    variant: "outline" as const,
  },
  {
    icon: Calendar,
    label: "Agendar Evento",
    description: "Criar compromisso",
    variant: "outline" as const,
  },
  {
    icon: FileText,
    label: "Gerar Relatório",
    description: "Exportar dados",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl shadow-soft p-5 animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Ações Rápidas
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto flex-col items-start gap-2 p-4 text-left"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <action.icon className="h-5 w-5" />
            <div>
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs opacity-70">{action.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

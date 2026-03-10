import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, Truck, FileText } from "lucide-react";
import type { Supplier } from "./Fornecedores";

const typeLabels: Record<string, string> = {
  ração: "Ração", medicamento: "Medicamento", equipamento: "Equipamento",
  veterinário: "Veterinário", ferreiro: "Ferreiro", transporte: "Transporte", outro: "Outro",
};

const formatDate = (dateStr: string) => {
  try { return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return dateStr; }
};

const FornecedorDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [suppliers] = useLocalStorage<Supplier[]>("horsecontrol-suppliers", []);

  const supplier = suppliers.find((s) => s.id === id);

  if (!supplier) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Truck className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Fornecedor não encontrado.</p>
          <Button variant="outline" onClick={() => navigate("/fornecedores")}><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/fornecedores")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para Fornecedores
        </Button>

        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Truck className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{supplier.name}</h1>
            <Badge variant="secondary" className="mt-1">{typeLabels[supplier.type] || supplier.type}</Badge>
            <p className="text-muted-foreground text-sm mt-2">Cadastrado em {formatDate(supplier.createdAt)}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {supplier.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {supplier.phone}</span>}
              {supplier.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {supplier.email}</span>}
            </div>
          </div>
        </div>

        {supplier.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{supplier.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Histórico de Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma ação registrada para este fornecedor.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FornecedorDetalhes;

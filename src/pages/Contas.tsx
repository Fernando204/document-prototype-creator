import { MainLayout } from "@/components/layout/MainLayout";
import { CreditCard } from "lucide-react";

const Contas = () => (
  <MainLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Contas</h1>
      <div className="text-center py-20 bg-card rounded-xl">
        <CreditCard className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Em breve: gerencie contas bancárias e formas de pagamento.</p>
      </div>
    </div>
  </MainLayout>
);

export default Contas;

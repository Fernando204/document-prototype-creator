import { MainLayout } from "@/components/layout/MainLayout";
import { Users } from "lucide-react";

const Equipes = () => (
  <MainLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Equipes</h1>
      <div className="text-center py-20 bg-card rounded-xl">
        <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Em breve: gerencie suas equipes de trabalho.</p>
      </div>
    </div>
  </MainLayout>
);

export default Equipes;

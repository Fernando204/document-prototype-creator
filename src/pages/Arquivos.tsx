import { MainLayout } from "@/components/layout/MainLayout";
import { FolderOpen } from "lucide-react";

const Arquivos = () => (
  <MainLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Arquivos</h1>
      <div className="text-center py-20 bg-card rounded-xl">
        <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Em breve: gerencie documentos e arquivos do haras.</p>
      </div>
    </div>
  </MainLayout>
);

export default Arquivos;

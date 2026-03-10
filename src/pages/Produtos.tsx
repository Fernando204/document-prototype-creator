import { MainLayout } from "@/components/layout/MainLayout";
import { ShoppingBag } from "lucide-react";

const Produtos = () => (
  <MainLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
      <div className="text-center py-20 bg-card rounded-xl">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Em breve: catálogo de produtos utilizados no haras.</p>
      </div>
    </div>
  </MainLayout>
);

export default Produtos;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import Cavalos from "./pages/Cavalos";
import CavaloDetalhes from "./pages/CavaloDetalhes";
import Saude from "./pages/Saude";
import Estoque from "./pages/Estoque";
import Competicao from "./pages/Competicao";
import Reproducao from "./pages/Reproducao";
import Financeiro from "./pages/Financeiro";
import Agenda from "./pages/Agenda";
import Configuracoes from "./pages/Configuracoes";
import Colaboradores from "./pages/Colaboradores";
import Clientes from "./pages/Clientes";
import ClienteDetalhes from "./pages/ClienteDetalhes";
import Fornecedores from "./pages/Fornecedores";
import FornecedorDetalhes from "./pages/FornecedorDetalhes";
import Equipes from "./pages/Equipes";
import Estabulos from "./pages/Estabulos";
import Arquivos from "./pages/Arquivos";
import Historico from "./pages/Historico";
import Contas from "./pages/Contas";
import Produtos from "./pages/Produtos";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/" element={<Index />} />
            <Route path="/cavalos" element={<Cavalos />} />
            <Route path="/cavalos/:id" element={<CavaloDetalhes />} />
            <Route path="/saude" element={<Saude />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/competicao" element={<Competicao />} />
            <Route path="/reproducao" element={<Reproducao />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<ClienteDetalhes />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/fornecedores/:id" element={<FornecedorDetalhes />} />
            <Route path="/equipes" element={<Equipes />} />
            <Route path="/estabulos" element={<Estabulos />} />
            <Route path="/arquivos" element={<Arquivos />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/contas" element={<Contas />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

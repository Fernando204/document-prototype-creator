import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cavalos from "./pages/Cavalos";
import Saude from "./pages/Saude";
import Estoque from "./pages/Estoque";
import Competicao from "./pages/Competicao";
import Reproducao from "./pages/Reproducao";
import Financeiro from "./pages/Financeiro";
import Agenda from "./pages/Agenda";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cavalos" element={<Cavalos />} />
          <Route path="/saude" element={<Saude />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/competicao" element={<Competicao />} />
          <Route path="/reproducao" element={<Reproducao />} />
          <Route path="/financeiro" element={<Financeiro />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

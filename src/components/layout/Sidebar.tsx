import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Heart, Calendar, Package, Trophy, Baby, Wallet,
  Settings, ChevronLeft, ChevronRight, Users, UserCheck, Home,
  Truck, ShoppingBag, FolderOpen, Clock, CreditCard, Wrench,
} from "lucide-react";
import logo from "@/assets/horsecontrol_logo.png";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/contexts/SidebarContext";

const HorseIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
    <circle cx="18" cy="8" r="1" />
  </svg>
);

const menuGroups = [
  {
    label: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: HorseIcon, label: "Cavalos", path: "/cavalos" },
      { icon: UserCheck, label: "Proprietários", path: "/clientes" },
      { icon: Users, label: "Equipes", path: "/equipes" },
      { icon: Home, label: "Estábulos", path: "/estabulos" },
    ],
  },
  {
    label: "Operacional",
    items: [
      { icon: Calendar, label: "Agenda", path: "/agenda" },
      { icon: Trophy, label: "Competições", path: "/competicao" },
      { icon: Baby, label: "Reprodução", path: "/reproducao" },
      { icon: Heart, label: "Saúde", path: "/saude" },
      { icon: Wallet, label: "Financeiro", path: "/financeiro" },
      { icon: ShoppingBag, label: "Produtos", path: "/produtos" },
      { icon: Package, label: "Estoque", path: "/estoque" },
      { icon: Truck, label: "Fornecedores", path: "/fornecedores" },
    ],
  },
  {
    label: "Administrativo",
    items: [
      { icon: FolderOpen, label: "Arquivos", path: "/arquivos" },
      { icon: Clock, label: "Histórico", path: "/historico" },
      { icon: CreditCard, label: "Contas", path: "/contas" },
      { icon: Wrench, label: "Colaboradores", path: "/colaboradores" },
    ],
  },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebarContext();
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Horse Control" className={cn("h-10 w-auto transition-all", collapsed && "h-8")} />
          {!collapsed && <span className="font-semibold text-sidebar-foreground text-lg tracking-tight">Horse Control</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menuGroups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-4 pt-4 border-t border-sidebar-border")}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            location.pathname === "/configuracoes" && "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-4.5 w-4.5 flex-shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </Link>
        <button
          onClick={toggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <><ChevronLeft className="h-4.5 w-4.5" /><span>Recolher</span></>}
        </button>
      </div>
    </aside>
  );
}

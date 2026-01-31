import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Users,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/horsecontrol_logo.svg";
import { cn } from "@/lib/utils";

// Custom Horse icon since lucide doesn't have one
const HorseIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
    <circle cx="18" cy="8" r="1" />
  </svg>
);

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: HorseIcon, label: "Cavalos", path: "/cavalos" },
  { icon: Heart, label: "Saúde", path: "/saude" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: Package, label: "Estoque", path: "/estoque" },
  { icon: Trophy, label: "Competição", path: "/competicao" },
  { icon: Baby, label: "Reprodução", path: "/reproducao" },
  { icon: Wallet, label: "Financeiro", path: "/financeiro" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Horse Control"
            className={cn("h-10 w-auto transition-all", collapsed && "h-8")}
          />
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground text-lg tracking-tight">
              Horse Control
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Collapse */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogOut, Settings, Edit2, Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function UserProfileModal() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [farm, setFarm] = useState(user?.farm || "");

  const handleSave = () => {
    updateProfile({ name, phone, farm });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setFarm(user?.farm || "");
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="h-8 w-8 rounded-full bg-gradient-hero flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {isAuthenticated && user ? (
          <div>
            {/* Header */}
            <div className="p-4 bg-gradient-hero rounded-t-md">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-primary-foreground/70 truncate">
                    {user.email}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-foreground/70 hover:text-primary-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Edit Form */}
            {isEditing ? (
              <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Telefone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Propriedade</Label>
                  <Input
                    value={farm}
                    onChange={(e) => setFarm(e.target.value)}
                    placeholder="Nome da fazenda"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="flex-1">
                    <Check className="h-3 w-3 mr-1" /> Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <X className="h-3 w-3 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-2">
                {user.phone && (
                  <p className="px-3 py-1 text-xs text-muted-foreground">
                    📞 {user.phone}
                  </p>
                )}
                {user.farm && (
                  <p className="px-3 py-1 text-xs text-muted-foreground">
                    🏠 {user.farm}
                  </p>
                )}
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => navigate("/configuracoes")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4" /> Configurações
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center space-y-3">
            <User className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Faça login para acessar seu perfil
            </p>
            <Button
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Entrar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

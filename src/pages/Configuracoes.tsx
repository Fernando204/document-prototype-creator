import { MainLayout } from "@/components/layout/MainLayout";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Bell,
  User,
  MapPin,
  Palette,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

const Configuracoes = () => {
  const { settings, updateSettings, resetSettings, clearAllData } = useSettings();
  const { settings: notifSettings, updateSettings: updateNotifSettings } = useNotifications();

  const [formData, setFormData] = useState({
    farmName: settings.farmName,
    farmLocation: settings.farmLocation,
    ownerName: settings.ownerName,
    ownerEmail: settings.ownerEmail,
    ownerPhone: settings.ownerPhone,
  });

  const handleSaveProfile = () => {
    updateSettings(formData);
    toast.success("Configurações salvas com sucesso!");
  };

  const handleResetSettings = () => {
    resetSettings();
    setFormData({
      farmName: "",
      farmLocation: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
    });
    toast.success("Configurações restauradas!");
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e dados do sistema.
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-card rounded-xl shadow-soft p-6 space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Perfil e Propriedade
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmName">Nome da Propriedade</Label>
              <Input
                id="farmName"
                value={formData.farmName}
                onChange={(e) =>
                  setFormData({ ...formData, farmName: e.target.value })
                }
                placeholder="Ex: Haras Bela Vista"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmLocation">Localização</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="farmLocation"
                  value={formData.farmLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, farmLocation: e.target.value })
                  }
                  placeholder="Cidade - Estado"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Nome do Proprietário</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, ownerEmail: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ownerPhone">Telefone</Label>
              <Input
                id="ownerPhone"
                value={formData.ownerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, ownerPhone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        {/* Appearance Section */}
        <div className="bg-card rounded-xl shadow-soft p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Aparência</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select
                value={settings.theme}
                onValueChange={(v) =>
                  updateSettings({ theme: v as "light" | "dark" | "system" })
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de Data</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(v) =>
                  updateSettings({
                    dateFormat: v as "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd",
                  })
                }
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) =>
                  updateSettings({ currency: v as "BRL" | "USD" | "EUR" })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-card rounded-xl shadow-soft p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Notificações
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Ativar Notificações</Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas e lembretes do sistema
                </p>
              </div>
              <Switch
                checked={notifSettings.enabled}
                onCheckedChange={(checked) =>
                  updateNotifSettings({ enabled: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Lembretes de Eventos</Label>
                <p className="text-sm text-muted-foreground">
                  Vacinas, vermifugação, ferrageamento
                </p>
              </div>
              <Switch
                checked={notifSettings.eventReminders}
                onCheckedChange={(checked) =>
                  updateNotifSettings({ eventReminders: checked })
                }
                disabled={!notifSettings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Estoque Baixo</Label>
                <p className="text-sm text-muted-foreground">
                  Quando itens estiverem abaixo do mínimo
                </p>
              </div>
              <Switch
                checked={notifSettings.lowStockAlerts}
                onCheckedChange={(checked) =>
                  updateNotifSettings({ lowStockAlerts: checked })
                }
                disabled={!notifSettings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Saúde</Label>
                <p className="text-sm text-muted-foreground">
                  Cavalos em tratamento ou observação
                </p>
              </div>
              <Switch
                checked={notifSettings.healthAlerts}
                onCheckedChange={(checked) =>
                  updateNotifSettings({ healthAlerts: checked })
                }
                disabled={!notifSettings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lembretes de Competição</Label>
                <p className="text-sm text-muted-foreground">
                  Competições próximas confirmadas
                </p>
              </div>
              <Switch
                checked={notifSettings.competitionReminders}
                onCheckedChange={(checked) =>
                  updateNotifSettings({ competitionReminders: checked })
                }
                disabled={!notifSettings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Alertas de Reprodução</Label>
                <p className="text-sm text-muted-foreground">
                  Previsões de nascimento e gestações
                </p>
              </div>
              <Switch
                checked={notifSettings.reproductionAlerts}
                onCheckedChange={(checked) =>
                  updateNotifSettings({ reproductionAlerts: checked })
                }
                disabled={!notifSettings.enabled}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Zona de Perigo
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Apagar Todos os Dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá apagar permanentemente
                    todos os seus cavalos, eventos, competições, estoque e demais
                    dados do sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;

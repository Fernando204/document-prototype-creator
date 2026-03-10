import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Client, Horse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  User,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

const Clientes = () => {
  const [clients, setClients] = useLocalStorage<Client[]>("horsecontrol-clients", []);
  const [horses] = useLocalStorage<Horse[]>("horsecontrol-horses", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", document: "", address: "", notes: "" });
    setEditingClient(null);
  };

  const openNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      document: client.document || "",
      address: client.address || "",
      notes: client.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (editingClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? { ...c, ...formData, updatedAt: new Date().toISOString() }
            : c
        )
      );
      toast.success("Cliente atualizado!");
    } else {
      const newClient: Client = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setClients((prev) => [...prev, newClient]);
      toast.success("Cliente cadastrado!");
    }
    resetForm();
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    // Remove owner references from horses
    const updatedHorses = horses.map((h) => ({
      ...h,
      ownerIds: (h.ownerIds || []).filter((oid) => oid !== id),
    }));
    localStorage.setItem("horsecontrol-horses", JSON.stringify(updatedHorses));
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cliente removido!");
  };

  const getClientHorses = (clientId: string) =>
    horses.filter((h) => (h.ownerIds || []).includes(clientId));

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.document || "").includes(searchTerm)
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">
              {clients.length} {clients.length === 1 ? "proprietário cadastrado" : "proprietários cadastrados"}
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl">
            <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
            </p>
            <Button variant="outline" onClick={openNew} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar primeiro cliente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => {
              const clientHorses = getClientHorses(client.id);
              return (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base truncate">{client.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/clientes/${client.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.document && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{client.document}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-xs">
                        {clientHorses.length} {clientHorses.length === 1 ? "cavalo" : "cavalos"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsFormOpen(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editingClient ? "Atualize as informações do proprietário." : "Cadastre um novo proprietário de cavalos."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input value={formData.document} onChange={(e) => setFormData({ ...formData, document: e.target.value })} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Cidade, Estado" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { resetForm(); setIsFormOpen(false); }}>Cancelar</Button>
              <Button type="submit">{editingClient ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailClient} onOpenChange={(open) => !open && setDetailClient(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detailClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {detailClient.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {detailClient.phone && (
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium text-foreground">{detailClient.phone}</p>
                  </div>
                )}
                {detailClient.email && (
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground truncate">{detailClient.email}</p>
                  </div>
                )}
                {detailClient.document && (
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                    <p className="font-medium text-foreground">{detailClient.document}</p>
                  </div>
                )}
                {detailClient.address && (
                  <div className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-xs text-muted-foreground">Endereço</p>
                    <p className="font-medium text-foreground">{detailClient.address}</p>
                  </div>
                )}
              </div>

              {detailClient.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm text-foreground">{detailClient.notes}</p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Cavalos ({getClientHorses(detailClient.id).length})
                </h3>
                {getClientHorses(detailClient.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum cavalo vinculado a este cliente.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getClientHorses(detailClient.id).map((horse) => (
                      <div key={horse.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {horse.imageUrl ? (
                            <img src={horse.imageUrl} alt={horse.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{horse.name}</p>
                          <p className="text-xs text-muted-foreground">{horse.breed} • {horse.age}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{horse.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Clientes;

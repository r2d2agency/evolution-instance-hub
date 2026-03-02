import { useState, useMemo } from "react";
import { EvolutionInstance } from "@/types/evolution";
import { InstanceCard } from "@/components/InstanceCard";
import { WebhookDialog } from "@/components/WebhookDialog";
import { QrCodeDialog } from "@/components/QrCodeDialog";
import { InstanceDetailsDialog } from "@/components/InstanceDetailsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInstances, useCreateInstance, useDeleteInstance, useDisconnectInstance, useRestartInstance } from "@/hooks/useInstances";

export default function Instances() {
  const { toast } = useToast();
  const { data: apiInstances, isLoading } = useInstances();

  const instances: EvolutionInstance[] = apiInstances || [];

  const createMutation = useCreateInstance();
  const deleteMutation = useDeleteInstance();
  const disconnectMutation = useDisconnectInstance();
  const restartMutation = useRestartInstance();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");

  // Dialogs
  const [selectedInstance, setSelectedInstance] = useState<EvolutionInstance | null>(null);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filtered = useMemo(() => {
    return instances.filter((i) => {
      const matchSearch = i.instanceName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || i.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [instances, search, filterStatus]);

  const handleCreate = () => {
    createMutation.mutate(
      { instanceName: newName },
      {
        onSuccess: () => {
          toast({ title: "Instância criada", description: `${newName} foi criada com sucesso.` });
          setCreateOpen(false);
          setNewName("");
        },
        onError: (err) => {
          toast({ title: "Erro ao criar", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = (instance: EvolutionInstance) => {
    deleteMutation.mutate(instance.id, {
      onSuccess: () => toast({ title: "Instância removida", description: `${instance.instanceName} foi excluída.`, variant: "destructive" }),
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const handleDisconnect = (instance: EvolutionInstance) => {
    disconnectMutation.mutate(instance.id, {
      onSuccess: () => toast({ title: "Desconectado", description: `${instance.instanceName} foi desconectada.` }),
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const handleRestart = (instance: EvolutionInstance) => {
    restartMutation.mutate(instance.id, {
      onSuccess: () => toast({ title: "Reiniciando", description: `${instance.instanceName} está sendo reiniciada.` }),
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const openDialog = (instance: EvolutionInstance, setter: (v: boolean) => void) => {
    setSelectedInstance(instance);
    setter(true);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instâncias</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas instâncias W-API</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Instância
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar instância..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border/50" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Conectado</SelectItem>
            <SelectItem value="close">Desconectado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((instance) => (
          <InstanceCard
            key={instance.id}
            instance={instance}
            onDelete={handleDelete}
            onWebhook={(i) => openDialog(i, setWebhookOpen)}
            onQrCode={(i) => openDialog(i, setQrOpen)}
            onDisconnect={handleDisconnect}
            onRestart={handleRestart}
            onDetails={(i) => openDialog(i, setDetailsOpen)}
          />
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Nenhuma instância encontrada.</p>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader><DialogTitle>Nova Instância</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome da Instância</Label>
              <Input placeholder="minha-instancia" value={newName} onChange={(e) => setNewName(e.target.value)} className="font-mono bg-muted border-border/50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar Instância"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Dialog */}
      <WebhookDialog instance={selectedInstance} open={webhookOpen} onOpenChange={setWebhookOpen} />

      {/* QR Code Dialog */}
      <QrCodeDialog instance={selectedInstance} open={qrOpen} onOpenChange={setQrOpen} />

      {/* Instance Details Dialog */}
      <InstanceDetailsDialog instance={selectedInstance} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  );
}

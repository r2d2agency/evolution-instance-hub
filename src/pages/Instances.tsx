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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInstances, useCreateInstance, useDeleteInstance, useDisconnectInstance, useRestartInstance, useSyncInstances } from "@/hooks/useInstances";

export default function Instances() {
  const { toast } = useToast();
  const { data: apiInstances, isLoading } = useInstances();

  const instances: EvolutionInstance[] = apiInstances || [];

  const createMutation = useCreateInstance();
  const deleteMutation = useDeleteInstance();
  const disconnectMutation = useDisconnectInstance();
  const restartMutation = useRestartInstance();
  const syncMutation = useSyncInstances();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [rejectCalls, setRejectCalls] = useState(false);
  const [callMessage, setCallMessage] = useState("");
  const [webhookConnected, setWebhookConnected] = useState("");
  const [webhookDisconnected, setWebhookDisconnected] = useState("");
  const [webhookReceived, setWebhookReceived] = useState("");
  const [webhookDelivery, setWebhookDelivery] = useState("");
  const [webhookMessageStatus, setWebhookMessageStatus] = useState("");
  const [webhookChatPresence, setWebhookChatPresence] = useState("");

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

  const resetCreateForm = () => {
    setNewName("");
    setRejectCalls(false);
    setCallMessage("");
    setWebhookConnected("");
    setWebhookDisconnected("");
    setWebhookReceived("");
    setWebhookDelivery("");
    setWebhookMessageStatus("");
    setWebhookChatPresence("");
  };

  const handleCreate = () => {
    createMutation.mutate(
      {
        instanceName: newName,
        rejectCalls,
        callMessage,
        webhooks: {
          connected: webhookConnected || undefined,
          disconnected: webhookDisconnected || undefined,
          received: webhookReceived || undefined,
          delivery: webhookDelivery || undefined,
          messageStatus: webhookMessageStatus || undefined,
          chatPresence: webhookChatPresence || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Instância criada", description: `${newName} foi criada com sucesso.` });
          setCreateOpen(false);
          resetCreateForm();
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              syncMutation.mutate(undefined, {
                onSuccess: (data) => toast({ title: "Sincronização concluída", description: (data as any).message }),
                onError: (err) => toast({ title: "Erro ao sincronizar", description: err.message, variant: "destructive" }),
              });
            }}
            disabled={syncMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Sincronizando..." : "Sincronizar"}
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Instância
          </Button>
        </div>
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
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) resetCreateForm(); }}>
        <DialogContent className="bg-card border-border/50 max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Instância</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Nome da Instância *</Label>
              <Input placeholder="minha-instancia" value={newName} onChange={(e) => setNewName(e.target.value)} className="font-mono bg-muted border-border/50" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Rejeitar chamadas</p>
                <p className="text-xs text-muted-foreground">Rejeitar chamadas recebidas automaticamente</p>
              </div>
              <Switch checked={rejectCalls} onCheckedChange={setRejectCalls} />
            </div>

            {rejectCalls && (
              <div className="space-y-2">
                <Label>Mensagem de rejeição</Label>
                <Textarea
                  placeholder="Não estamos disponíveis no momento."
                  value={callMessage}
                  onChange={(e) => setCallMessage(e.target.value)}
                  className="bg-muted border-border/50 text-sm"
                  rows={2}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Webhooks (opcional)</Label>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Conectado</Label>
                  <Input placeholder="https://..." value={webhookConnected} onChange={(e) => setWebhookConnected(e.target.value)} className="font-mono text-xs bg-muted border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Desconectado</Label>
                  <Input placeholder="https://..." value={webhookDisconnected} onChange={(e) => setWebhookDisconnected(e.target.value)} className="font-mono text-xs bg-muted border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Recebimento</Label>
                  <Input placeholder="https://..." value={webhookReceived} onChange={(e) => setWebhookReceived(e.target.value)} className="font-mono text-xs bg-muted border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Envio</Label>
                  <Input placeholder="https://..." value={webhookDelivery} onChange={(e) => setWebhookDelivery(e.target.value)} className="font-mono text-xs bg-muted border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status da mensagem</Label>
                  <Input placeholder="https://..." value={webhookMessageStatus} onChange={(e) => setWebhookMessageStatus(e.target.value)} className="font-mono text-xs bg-muted border-border/50" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Presença no chat</Label>
                  <Input placeholder="https://..." value={webhookChatPresence} onChange={(e) => setWebhookChatPresence(e.target.value)} className="font-mono text-xs bg-muted border-border/50" />
                </div>
              </div>
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
      <InstanceDetailsDialog
        instance={selectedInstance}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onDisconnect={handleDisconnect}
        onRestart={handleRestart}
      />
    </div>
  );
}
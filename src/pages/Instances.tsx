import { useState, useMemo } from "react";
import { mockInstances, mockGroups } from "@/data/mockData";
import { EvolutionInstance, InstanceGroup } from "@/types/evolution";
import { InstanceCard } from "@/components/InstanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Key, Webhook, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInstances, useCreateInstance, useDeleteInstance, useConnectInstance, useDisconnectInstance, useSetWebhook, useRegenerateToken } from "@/hooks/useInstances";
import { useGroups } from "@/hooks/useGroups";

export default function Instances() {
  const { toast } = useToast();
  const { data: apiInstances } = useInstances();
  const { data: apiGroups } = useGroups();

  const instances: EvolutionInstance[] = apiInstances || mockInstances;
  const groups: InstanceGroup[] = apiGroups || mockGroups;

  const createMutation = useCreateInstance();
  const deleteMutation = useDeleteInstance();
  const connectMutation = useConnectInstance();
  const disconnectMutation = useDisconnectInstance();
  const webhookMutation = useSetWebhook();
  const tokenMutation = useRegenerateToken();

  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<EvolutionInstance | null>(null);
  const [copied, setCopied] = useState(false);

  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState("");

  const filtered = useMemo(() => {
    return instances.filter((i) => {
      const matchSearch = i.instanceName.toLowerCase().includes(search.toLowerCase());
      const matchGroup = filterGroup === "all" || i.groupId === filterGroup || (filterGroup === "none" && !i.groupId);
      const matchStatus = filterStatus === "all" || i.status === filterStatus;
      return matchSearch && matchGroup && matchStatus;
    });
  }, [instances, search, filterGroup, filterStatus]);

  const handleWebhook = (instance: EvolutionInstance) => {
    setSelectedInstance(instance);
    setWebhookUrl(instance.webhookUrl || "");
    setWebhookEvents(instance.webhookEvents?.join(", ") || "");
    setWebhookOpen(true);
  };

  const handleToken = (instance: EvolutionInstance) => {
    setSelectedInstance(instance);
    setTokenOpen(true);
  };

  const copyToken = () => {
    if (selectedInstance?.apikey) {
      navigator.clipboard.writeText(selectedInstance.apikey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Token copiado!" });
    }
  };

  const handleCreate = () => {
    createMutation.mutate(
      { instanceName: newName, groupId: newGroup || undefined },
      {
        onSuccess: () => {
          toast({ title: "Instância criada", description: `${newName} foi criada com sucesso.` });
          setCreateOpen(false);
          setNewName("");
          setNewGroup("");
        },
        onError: (err) => {
          toast({ title: "Erro ao criar", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  const handleSaveWebhook = () => {
    if (!selectedInstance) return;
    webhookMutation.mutate(
      { id: selectedInstance.id, data: { webhookUrl, webhookEvents: webhookEvents.split(",").map((e) => e.trim()).filter(Boolean) } },
      {
        onSuccess: () => {
          toast({ title: "Webhook salvo", description: `Webhook atualizado para ${selectedInstance.instanceName}.` });
          setWebhookOpen(false);
        },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleConnect = (instance: EvolutionInstance) => {
    connectMutation.mutate(instance.id, {
      onSuccess: () => toast({ title: "Conectando...", description: `Conectando ${instance.instanceName}...` }),
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const handleDisconnect = (instance: EvolutionInstance) => {
    disconnectMutation.mutate(instance.id, {
      onSuccess: () => toast({ title: "Desconectado", description: `${instance.instanceName} foi desconectada.` }),
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const handleDelete = (instance: EvolutionInstance) => {
    deleteMutation.mutate(instance.id, {
      onSuccess: () => toast({ title: "Instância removida", description: `${instance.instanceName} foi excluída.`, variant: "destructive" }),
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const handleRegenerateToken = () => {
    if (!selectedInstance) return;
    tokenMutation.mutate(selectedInstance.id, {
      onSuccess: (data) => {
        setSelectedInstance({ ...selectedInstance, apikey: data.apikey });
        toast({ title: "Novo token gerado!" });
      },
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instâncias</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie suas instâncias Evolution</p>
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
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50"><SelectValue placeholder="Grupo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {groups.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}
            <SelectItem value="none">Sem grupo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Conectado</SelectItem>
            <SelectItem value="close">Desconectado</SelectItem>
            <SelectItem value="connecting">Conectando</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((instance) => {
          const group = groups.find((g) => g.id === instance.groupId);
          return (
            <InstanceCard
              key={instance.id}
              instance={instance}
              groupName={group?.name}
              groupColor={group?.color}
              onWebhook={handleWebhook}
              onToken={handleToken}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onDelete={handleDelete}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
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
            <div className="space-y-2">
              <Label>Grupo (opcional)</Label>
              <Select value={newGroup} onValueChange={setNewGroup}>
                <SelectTrigger className="bg-muted border-border/50"><SelectValue placeholder="Selecione um grupo" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}
                </SelectContent>
              </Select>
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
      <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              Webhook — <span className="font-mono text-sm">{selectedInstance?.instanceName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>URL do Webhook</Label>
              <Input placeholder="https://..." value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="font-mono bg-muted border-border/50 text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Eventos (separados por vírgula)</Label>
              <Textarea placeholder="messages.upsert, connection.update" value={webhookEvents} onChange={(e) => setWebhookEvents(e.target.value)} className="font-mono bg-muted border-border/50 text-sm resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveWebhook} disabled={webhookMutation.isPending}>
              {webhookMutation.isPending ? "Salvando..." : "Salvar Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Token Dialog */}
      <Dialog open={tokenOpen} onOpenChange={setTokenOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Token — <span className="font-mono text-sm">{selectedInstance?.instanceName}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedInstance?.apikey ? (
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input readOnly value={selectedInstance.apikey} className="font-mono bg-muted border-border/50 text-sm" />
                  <Button variant="outline" size="icon" onClick={copyToken}>
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum token gerado para esta instância.</p>
            )}
            <Button variant="outline" className="w-full" onClick={handleRegenerateToken} disabled={tokenMutation.isPending}>
              <Key className="mr-2 h-4 w-4" /> {tokenMutation.isPending ? "Gerando..." : "Gerar Novo Token"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

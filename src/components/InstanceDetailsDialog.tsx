import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Settings, Eye, EyeOff, Copy, Check,
  Phone, Unplug, RotateCw, Wifi, WifiOff, Radio,
  MessageSquare, PhoneOff, Bell, BellOff, Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInstanceDetails, useDeviceInfo, useRenameInstance, useAutoRead } from "@/hooks/useInstances";
import { instancesService } from "@/services/instances";
import { EvolutionInstance } from "@/types/evolution";
import { useQueryClient } from "@tanstack/react-query";

interface InstanceDetailsDialogProps {
  instance: EvolutionInstance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisconnect?: (instance: EvolutionInstance) => void;
  onRestart?: (instance: EvolutionInstance) => void;
}

export function InstanceDetailsDialog({ instance, open, onOpenChange, onDisconnect, onRestart }: InstanceDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: details, isLoading: detailsLoading } = useInstanceDetails(open && instance ? instance.id : "");
  const { data: device } = useDeviceInfo(open && instance?.connected ? instance.id : "");
  const renameMutation = useRenameInstance();
  const autoReadMutation = useAutoRead();

  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Webhook state
  const [webhookUrls, setWebhookUrls] = useState({
    connected: "",
    disconnected: "",
    delivery: "",
    received: "",
    messageStatus: "",
    chatPresence: "",
  });
  const [savingWebhooks, setSavingWebhooks] = useState(false);

  const inst = details || instance;

  // Sync form state when instance data loads
  useEffect(() => {
    if (inst) {
      setInstanceName(inst.instanceName || "");
      setWebhookUrls({
        connected: inst.webhookConnectedUrl || "",
        disconnected: inst.webhookDisconnectedUrl || "",
        delivery: inst.webhookDeliveryUrl || "",
        received: inst.webhookReceivedUrl || "",
        messageStatus: inst.webhookStatusUrl || "",
        chatPresence: inst.webhookPresenceUrl || "",
      });
    }
  }, [inst]);

  const copyToken = () => {
    if (inst?.token) {
      navigator.clipboard.writeText(inst.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Token copiado!" });
    }
  };

  const handleSaveName = () => {
    if (!instance || !instanceName.trim()) return;
    renameMutation.mutate(
      { id: instance.id, name: instanceName },
      {
        onSuccess: () => toast({ title: "Nome atualizado com sucesso" }),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleAutoRead = (value: boolean) => {
    if (!instance) return;
    autoReadMutation.mutate(
      { id: instance.id, value },
      {
        onSuccess: () => toast({ title: value ? "Leitura automática ativada" : "Leitura automática desativada" }),
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleSaveWebhooks = async () => {
    if (!instance) return;
    setSavingWebhooks(true);
    try {
      await instancesService.updateWebhooks(instance.id, webhookUrls);
      toast({ title: "Webhooks atualizados com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["instances"] });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSavingWebhooks(false);
    }
  };

  const createdAt = inst?.createdAt
    ? new Date(inst.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setShowToken(false); }}>
      <DialogContent className="bg-card border-border/50 max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {detailsLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : inst ? (
          <>
            {/* Header Card */}
            <div className="p-5 pb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Data de criação:</span>
                  <span className="text-primary font-semibold">{createdAt}</span>
                </div>
                <Badge
                  variant="outline"
                  className={inst.connected
                    ? "text-success border-success/30 bg-success/10"
                    : "text-destructive border-destructive/30 bg-destructive/10"
                  }
                >
                  {inst.connected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {inst.connected ? "Conectado" : "Desconectado"}
                </Badge>
              </div>

              {/* ID & Token */}
              <div className="space-y-3 rounded-lg border border-border/50 p-4 bg-muted/30">
                <div>
                  <Label className="text-xs text-muted-foreground">ID da instância</Label>
                  <p className="text-sm font-mono font-semibold">{inst.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Token da Instância</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      readOnly
                      type={showToken ? "text" : "password"}
                      value={inst.token || ""}
                      className="font-mono text-xs bg-background border-border/50 flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setShowToken(!showToken)}>
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyToken}>
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Connected phone + actions */}
              {inst.connected && inst.connectedPhone && (
                <div className="flex items-center justify-between mt-4 rounded-lg border border-border/50 p-3 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-mono text-sm font-bold">{inst.connectedPhone}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 text-xs"
                      onClick={() => onDisconnect?.(inst)}
                    >
                      <Unplug className="h-3.5 w-3.5" /> Desconectar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => onRestart?.(inst)}
                    >
                      <RotateCw className="h-3.5 w-3.5" /> Resetar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="px-5 pb-5 pt-4">
              <Tabs defaultValue="whatsapp" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                  <TabsTrigger value="whatsapp" className="text-xs gap-1.5">
                    <Settings className="h-3.5 w-3.5" /> Configurações do WhatsApp
                  </TabsTrigger>
                  <TabsTrigger value="webhooks" className="text-xs gap-1.5">
                    <Activity className="h-3.5 w-3.5" /> Configurar webhooks
                  </TabsTrigger>
                </TabsList>

                {/* WhatsApp Config Tab */}
                <TabsContent value="whatsapp" className="space-y-4 mt-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    ID da instância: <span className="font-mono font-semibold text-foreground">{inst.id}</span>
                  </div>

                  {/* Nome */}
                  <div className="rounded-lg border border-border/50 p-4 space-y-2">
                    <div>
                      <Label className="text-sm font-semibold">Nome da instância</Label>
                      <p className="text-xs text-muted-foreground">Dê um nome à instância para facilitar a identificação ou o controle.</p>
                    </div>
                    <Input
                      value={instanceName}
                      onChange={(e) => setInstanceName(e.target.value)}
                      className="font-mono bg-muted border-border/50"
                    />
                  </div>

                  {/* Leitura automática */}
                  <div className="rounded-lg border border-border/50 p-4 flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Leitura de mensagens automático</Label>
                      <p className="text-xs text-muted-foreground">Com essa configuração, todas as mensagens recebidas serão automaticamente lidas.</p>
                    </div>
                    <Switch
                      checked={inst.automaticReading ?? false}
                      onCheckedChange={handleAutoRead}
                      disabled={autoReadMutation.isPending}
                    />
                  </div>

                  {/* Rejeitar chamadas */}
                  <div className="rounded-lg border border-border/50 p-4 flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Rejeitar ligações recebidas (Áudio e Vídeo)</Label>
                      <p className="text-xs text-muted-foreground">Essa ação fará com que as chamadas recebidas sejam automaticamente rejeitadas.</p>
                    </div>
                    <Switch
                      checked={inst.rejectCalls ?? false}
                      disabled
                    />
                  </div>

                  {inst.callMessage && (
                    <div className="rounded-lg border border-border/50 p-4 space-y-1">
                      <Label className="text-xs text-muted-foreground">Mensagem de rejeição</Label>
                      <p className="text-sm">{inst.callMessage}</p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleSaveName}
                    disabled={renameMutation.isPending || instanceName === inst.instanceName}
                  >
                    {renameMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Salvar alterações
                  </Button>
                </TabsContent>

                {/* Webhooks Tab */}
                <TabsContent value="webhooks" className="space-y-4 mt-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    ID da instância: <span className="font-mono font-semibold text-foreground">{inst.id}</span>
                  </div>

                  <WebhookField
                    icon={<Wifi className="h-4 w-4" />}
                    label="Ao conectar o whatsapp na instância"
                    value={webhookUrls.connected}
                    onChange={(v) => setWebhookUrls((prev) => ({ ...prev, connected: v }))}
                  />
                  <WebhookField
                    icon={<WifiOff className="h-4 w-4" />}
                    label="Ao desconectar da instância"
                    value={webhookUrls.disconnected}
                    onChange={(v) => setWebhookUrls((prev) => ({ ...prev, disconnected: v }))}
                  />
                  <WebhookField
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Ao enviar uma mensagem"
                    value={webhookUrls.delivery}
                    onChange={(v) => setWebhookUrls((prev) => ({ ...prev, delivery: v }))}
                  />
                  <WebhookField
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Ao receber uma mensagem"
                    value={webhookUrls.received}
                    onChange={(v) => setWebhookUrls((prev) => ({ ...prev, received: v }))}
                  />
                  <WebhookField
                    icon={<Radio className="h-4 w-4" />}
                    label="Presença do chat"
                    value={webhookUrls.chatPresence}
                    onChange={(v) => setWebhookUrls((prev) => ({ ...prev, chatPresence: v }))}
                  />
                  <WebhookField
                    icon={<Activity className="h-4 w-4" />}
                    label="Receber status da mensagem"
                    value={webhookUrls.messageStatus}
                    onChange={(v) => setWebhookUrls((prev) => ({ ...prev, messageStatus: v }))}
                  />

                  <Button
                    className="w-full"
                    onClick={handleSaveWebhooks}
                    disabled={savingWebhooks}
                  >
                    {savingWebhooks ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Salvar alterações
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function WebhookField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1">
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <Input
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 bg-transparent font-mono text-xs shadow-none focus-visible:ring-0 px-0"
        />
      </div>
    </div>
  );
}
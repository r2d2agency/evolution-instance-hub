import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WebhookType, webhookLabels } from "@/services/webhooks";
import { instancesService } from "@/services/instances";
import { EvolutionInstance } from "@/types/evolution";

const webhookTypes: WebhookType[] = ["connected", "disconnected", "delivery", "received", "messageStatus", "chatPresence"];

interface WebhookDialogProps {
  instance: EvolutionInstance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebhookDialog({ instance, open, onOpenChange }: WebhookDialogProps) {
  const { toast } = useToast();

  const getInitialUrl = (type: WebhookType): string => {
    if (!instance) return "";
    switch (type) {
      case "connected": return instance.webhookConnectedUrl || "";
      case "disconnected": return instance.webhookDisconnectedUrl || "";
      case "delivery": return instance.webhookDeliveryUrl || "";
      case "received": return instance.webhookReceivedUrl || "";
      case "messageStatus": return instance.webhookStatusUrl || "";
      case "chatPresence": return instance.webhookPresenceUrl || "";
      default: return "";
    }
  };

  const [urls, setUrls] = useState<Record<WebhookType, string>>(() => {
    const initial: Record<string, string> = {};
    webhookTypes.forEach((t) => (initial[t] = getInitialUrl(t)));
    return initial as Record<WebhookType, string>;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && instance) {
      const initial: Record<string, string> = {};
      webhookTypes.forEach((t) => (initial[t] = getInitialUrl(t)));
      setUrls(initial as Record<WebhookType, string>);
      setSaved(false);
    }
    onOpenChange(isOpen);
  };

  const handleSaveAll = async () => {
    if (!instance) return;
    setSaving(true);
    try {
      await instancesService.updateWebhooks(instance.id, urls);
      setSaved(true);
      toast({ title: "Webhooks salvos", description: "Todos os webhooks foram atualizados." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Webhooks — <span className="font-mono text-sm">{instance?.instanceName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-muted-foreground">
            Configure os webhooks da instância. Todos devem usar <strong>HTTPS</strong>.
          </p>

          {webhookTypes.map((type) => (
            <div key={type} className="space-y-1.5">
              <Label className="text-xs font-medium">{webhookLabels[type]}</Label>
              <Input
                placeholder="https://..."
                value={urls[type]}
                onChange={(e) => setUrls((prev) => ({ ...prev, [type]: e.target.value }))}
                className="font-mono bg-muted border-border/50 text-xs"
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveAll} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Webhooks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

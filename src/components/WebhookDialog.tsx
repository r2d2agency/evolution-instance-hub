import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateWebhook } from "@/hooks/useWebhooks";
import { WebhookType, webhookLabels } from "@/services/webhooks";
import { EvolutionInstance } from "@/types/evolution";

const webhookTypes: WebhookType[] = ["connected", "disconnected", "delivery", "received", "message-status", "chat-presence"];

interface WebhookDialogProps {
  instance: EvolutionInstance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebhookDialog({ instance, open, onOpenChange }: WebhookDialogProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateWebhook();

  // Map instance webhook URLs to their types
  const getInitialUrl = (type: WebhookType): string => {
    if (!instance) return "";
    switch (type) {
      case "connected": return instance.webhookConnectedUrl || "";
      case "disconnected": return instance.webhookDisconnectedUrl || "";
      case "delivery": return instance.webhookDeliveryUrl || "";
      case "received": return instance.webhookReceivedUrl || "";
      case "message-status": return instance.webhookStatusUrl || "";
      default: return "";
    }
  };

  const [urls, setUrls] = useState<Record<WebhookType, string>>(() => {
    const initial: Record<string, string> = {};
    webhookTypes.forEach((t) => (initial[t] = getInitialUrl(t)));
    return initial as Record<WebhookType, string>;
  });

  const [saving, setSaving] = useState<WebhookType | null>(null);
  const [saved, setSaved] = useState<Set<WebhookType>>(new Set());

  // Reset state when instance changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && instance) {
      const initial: Record<string, string> = {};
      webhookTypes.forEach((t) => (initial[t] = getInitialUrl(t)));
      setUrls(initial as Record<WebhookType, string>);
      setSaved(new Set());
    }
    onOpenChange(isOpen);
  };

  const handleSave = async (type: WebhookType) => {
    if (!instance) return;
    setSaving(type);
    try {
      await updateMutation.mutateAsync({
        instanceId: instance.id,
        type,
        url: urls[type],
      });
      setSaved((prev) => new Set(prev).add(type));
      toast({ title: "Webhook salvo", description: `${webhookLabels[type]} atualizado com sucesso.` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(null);
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
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={urls[type]}
                  onChange={(e) => setUrls((prev) => ({ ...prev, [type]: e.target.value }))}
                  className="font-mono bg-muted border-border/50 text-xs"
                />
                <Button
                  size="sm"
                  variant={saved.has(type) ? "outline" : "default"}
                  onClick={() => handleSave(type)}
                  disabled={saving === type}
                  className="shrink-0"
                >
                  {saving === type ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved.has(type) ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

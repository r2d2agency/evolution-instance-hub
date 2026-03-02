import { EvolutionInstance, InstanceStatus } from "@/types/evolution";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wifi,
  WifiOff,
  MoreVertical,
  Trash2,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Webhook,
  QrCode,
  Unplug,
  RotateCw,
  Info,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<InstanceStatus, { label: string; className: string; icon: React.ReactNode }> = {
  open: {
    label: "Conectado",
    className: "bg-success/10 text-success border-success/20",
    icon: <Wifi className="h-3 w-3" />,
  },
  close: {
    label: "Desconectado",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <WifiOff className="h-3 w-3" />,
  },
  connecting: {
    label: "Conectando",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: <Wifi className="h-3 w-3 animate-pulse" />,
  },
};

interface InstanceCardProps {
  instance: EvolutionInstance;
  onDelete?: (instance: EvolutionInstance) => void;
  onWebhook?: (instance: EvolutionInstance) => void;
  onQrCode?: (instance: EvolutionInstance) => void;
  onDisconnect?: (instance: EvolutionInstance) => void;
  onRestart?: (instance: EvolutionInstance) => void;
  onDetails?: (instance: EvolutionInstance) => void;
}

export function InstanceCard({ instance, onDelete, onWebhook, onQrCode, onDisconnect, onRestart, onDetails }: InstanceCardProps) {
  const status = statusConfig[instance.status];
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyToken = () => {
    if (instance.token) {
      navigator.clipboard.writeText(instance.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Token copiado!" });
    }
  };

  return (
    <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-200 group">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 cursor-pointer" onClick={() => onDetails?.(instance)}>
            <h3 className="text-sm font-semibold text-foreground truncate font-mono">
              {instance.instanceName}
            </h3>
            {instance.connectedPhone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="font-mono">{instance.connectedPhone}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onDetails?.(instance)}>
                <Info className="mr-2 h-4 w-4" /> Detalhes
              </DropdownMenuItem>
              {instance.status === "close" ? (
                <DropdownMenuItem onClick={() => onQrCode?.(instance)}>
                  <QrCode className="mr-2 h-4 w-4" /> Conectar (QR Code)
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onDisconnect?.(instance)}>
                  <Unplug className="mr-2 h-4 w-4" /> Desconectar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onRestart?.(instance)}>
                <RotateCw className="mr-2 h-4 w-4" /> Reiniciar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onWebhook?.(instance)}>
                <Webhook className="mr-2 h-4 w-4" /> Webhooks
              </DropdownMenuItem>
              {instance.token && (
                <DropdownMenuItem onClick={copyToken}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copiar Token
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(instance)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={status.className}>
            <span className="mr-1">{status.icon}</span>
            {status.label}
          </Badge>
        </div>

        {(instance.messagesSent !== undefined || instance.messagesReceived !== undefined) && (
          <div className="flex items-center gap-4 pt-1">
            {instance.messagesSent !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{instance.messagesSent} enviadas</span>
              </div>
            )}
            {instance.messagesReceived !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{instance.messagesReceived} recebidas</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

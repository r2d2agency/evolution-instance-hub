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
  Loader2,
  MoreVertical,
  Webhook,
  Key,
  Trash2,
  Plug,
  Unplug,
  Pencil,
  Phone,
} from "lucide-react";

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
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
};

interface InstanceCardProps {
  instance: EvolutionInstance;
  groupName?: string;
  groupColor?: string;
  onEdit?: (instance: EvolutionInstance) => void;
  onDelete?: (instance: EvolutionInstance) => void;
  onConnect?: (instance: EvolutionInstance) => void;
  onDisconnect?: (instance: EvolutionInstance) => void;
  onWebhook?: (instance: EvolutionInstance) => void;
  onToken?: (instance: EvolutionInstance) => void;
}

export function InstanceCard({
  instance,
  groupName,
  groupColor,
  onEdit,
  onDelete,
  onConnect,
  onDisconnect,
  onWebhook,
  onToken,
}: InstanceCardProps) {
  const status = statusConfig[instance.status];

  return (
    <Card className="bg-card border-border/50 hover:border-primary/20 transition-all duration-200 group">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate font-mono">
                {instance.instanceName}
              </h3>
            </div>
            {instance.number && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span className="font-mono">{instance.number}</span>
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
              <DropdownMenuItem onClick={() => onEdit?.(instance)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              {instance.status === "close" ? (
                <DropdownMenuItem onClick={() => onConnect?.(instance)}>
                  <Plug className="mr-2 h-4 w-4" /> Conectar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onDisconnect?.(instance)}>
                  <Unplug className="mr-2 h-4 w-4" /> Desconectar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onWebhook?.(instance)}>
                <Webhook className="mr-2 h-4 w-4" /> Webhook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToken?.(instance)}>
                <Key className="mr-2 h-4 w-4" /> Token
              </DropdownMenuItem>
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
          {groupName && (
            <Badge
              variant="outline"
              className="border-border/50"
              style={{ color: groupColor, borderColor: `${groupColor}33` }}
            >
              {groupName}
            </Badge>
          )}
        </div>

        {instance.webhookUrl && (
          <div className="pt-1">
            <p className="text-[10px] uppercase text-muted-foreground/60 tracking-wider mb-1">Webhook</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{instance.webhookUrl}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Info, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInstanceDetails, useDeviceInfo, useRenameInstance, useAutoRead } from "@/hooks/useInstances";
import { EvolutionInstance } from "@/types/evolution";
import { Badge } from "@/components/ui/badge";

interface InstanceDetailsDialogProps {
  instance: EvolutionInstance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstanceDetailsDialog({ instance, open, onOpenChange }: InstanceDetailsDialogProps) {
  const { toast } = useToast();
  const { data: details, isLoading: detailsLoading } = useInstanceDetails(open && instance ? instance.id : "");
  const { data: device, isLoading: deviceLoading } = useDeviceInfo(open && instance?.connected ? instance.id : "");
  const renameMutation = useRenameInstance();
  const autoReadMutation = useAutoRead();

  const [renameMode, setRenameMode] = useState(false);
  const [newName, setNewName] = useState("");

  const handleRename = () => {
    if (!instance || !newName.trim()) return;
    renameMutation.mutate(
      { id: instance.id, name: newName },
      {
        onSuccess: () => {
          toast({ title: "Instância renomeada" });
          setRenameMode(false);
        },
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

  const isLoading = detailsLoading || deviceLoading;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setRenameMode(false); }}>
      <DialogContent className="bg-card border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Detalhes — <span className="font-mono text-sm">{instance?.instanceName}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant="outline" className={details?.connected ? "text-success border-success/20" : "text-destructive border-destructive/20"}>
                {details?.connected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            {/* Connected Phone */}
            {details?.connectedPhone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Telefone</span>
                <span className="text-sm font-mono">{details.connectedPhone}</span>
              </div>
            )}

            {/* Device info */}
            {device && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nome WhatsApp</span>
                  <span className="text-sm">{device.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plataforma</span>
                  <span className="text-sm">{device.platform}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Business</span>
                  <span className="text-sm">{device.isBusiness ? "Sim" : "Não"}</span>
                </div>
                {device.profilePictureUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Foto</span>
                    <img src={device.profilePictureUrl} alt="Perfil" className="h-10 w-10 rounded-full" />
                  </div>
                )}
              </>
            )}

            {/* Stats */}
            {details && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{details.messagesSent ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Enviadas</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{details.messagesReceived ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Recebidas</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{details.contacts ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Contatos</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{details.chats ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Chats</p>
                </div>
              </div>
            )}

            {/* Auto Read */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium">Leitura automática</p>
                <p className="text-xs text-muted-foreground">Marcar mensagens como lidas automaticamente</p>
              </div>
              <Switch
                checked={details?.automaticReading ?? false}
                onCheckedChange={handleAutoRead}
                disabled={autoReadMutation.isPending}
              />
            </div>

            {/* Rename */}
            <div className="pt-2">
              {renameMode ? (
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Novo nome"
                    className="font-mono bg-muted border-border/50 text-sm"
                  />
                  <Button size="sm" onClick={handleRename} disabled={renameMutation.isPending || !newName.trim()}>
                    {renameMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRenameMode(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { setNewName(instance?.instanceName || ""); setRenameMode(true); }}>
                  <Pencil className="h-4 w-4" /> Renomear instância
                </Button>
              )}
            </div>

            {/* Token */}
            {details?.token && (
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs">Token da instância</Label>
                <Input readOnly value={details.token} className="font-mono bg-muted border-border/50 text-xs" />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

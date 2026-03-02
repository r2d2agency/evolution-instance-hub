import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, QrCode } from "lucide-react";
import { useQrCode } from "@/hooks/useInstances";
import { EvolutionInstance } from "@/types/evolution";
import { useToast } from "@/hooks/use-toast";

interface QrCodeDialogProps {
  instance: EvolutionInstance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({ instance, open, onOpenChange }: QrCodeDialogProps) {
  const { toast } = useToast();
  const qrMutation = useQrCode();
  const [qrData, setQrData] = useState<string | null>(null);

  const fetchQr = () => {
    if (!instance) return;
    setQrData(null);
    qrMutation.mutate(instance.id, {
      onSuccess: (data) => {
        if (data.qrcode) {
          setQrData(data.qrcode);
        } else {
          toast({ title: "Erro", description: "QR Code não disponível. A instância pode já estar conectada.", variant: "destructive" });
        }
      },
      onError: (err) => {
        toast({ title: "Erro ao gerar QR Code", description: err.message, variant: "destructive" });
      },
    });
  };

  useEffect(() => {
    if (open && instance) {
      fetchQr();
    }
    if (!open) {
      setQrData(null);
    }
  }, [open, instance?.id]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!open || !instance) return;
    const interval = setInterval(fetchQr, 15000);
    return () => clearInterval(interval);
  }, [open, instance?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Conectar — <span className="font-mono text-sm">{instance?.instanceName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {qrMutation.isPending && !qrData ? (
            <div className="h-64 w-64 flex items-center justify-center bg-muted rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : qrData ? (
            <div className="bg-white p-3 rounded-lg">
              <img src={qrData} alt="QR Code" className="h-64 w-64" />
            </div>
          ) : (
            <div className="h-64 w-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center px-4">
                QR Code não disponível
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Abra o WhatsApp no celular → Configurações → Dispositivos conectados → Conectar dispositivo
          </p>

          <Button variant="outline" size="sm" onClick={fetchQr} disabled={qrMutation.isPending} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${qrMutation.isPending ? "animate-spin" : ""}`} />
            Atualizar QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

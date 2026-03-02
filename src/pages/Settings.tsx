import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("https://evolution.example.com");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    toast({ title: "Configurações salvas", description: "URL e token da Evolution atualizados." });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure a conexão com sua API Evolution</p>
      </div>

      <Card className="bg-card border-border/50 p-6 space-y-5">
        <div className="space-y-2">
          <Label>URL Base da API</Label>
          <Input
            placeholder="https://evolution.seudominio.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="font-mono bg-muted border-border/50"
          />
        </div>

        <div className="space-y-2">
          <Label>API Key Global</Label>
          <div className="flex gap-2">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="Sua API Key da Evolution"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono bg-muted border-border/50"
            />
            <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A API Key global é usada para autenticar todas as requisições à Evolution API.
          </p>
        </div>

        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Salvar Configurações
        </Button>
      </Card>
    </div>
  );
}

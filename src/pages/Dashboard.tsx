import { Server, Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardStats, EvolutionInstance } from "@/types/evolution";
import { InstanceCard } from "@/components/InstanceCard";
import { useMemo } from "react";
import { useInstances } from "@/hooks/useInstances";

const StatCard = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) => (
  <Card className="bg-card border-border/50 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold mt-1" style={accent ? { color: accent } : undefined}>
          {value}
        </p>
      </div>
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: accent ? `${accent}15` : undefined }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

export default function Dashboard() {
  const { data: apiInstances } = useInstances();

  const instances: EvolutionInstance[] = apiInstances || [];

  const stats: DashboardStats = useMemo(
    () => ({
      total: instances.length,
      connected: instances.filter((i) => i.status === "open").length,
      disconnected: instances.filter((i) => i.status === "close").length,
      connecting: instances.filter((i) => i.status === "connecting").length,
    }),
    [instances]
  );

  const recentInstances = instances.slice(0, 4);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral das suas instâncias W-API</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<Server className="h-5 w-5 text-foreground/60" />}
        />
        <StatCard
          label="Conectadas"
          value={stats.connected}
          accent="hsl(152, 60%, 48%)"
          icon={<Wifi className="h-5 w-5 text-success" />}
        />
        <StatCard
          label="Desconectadas"
          value={stats.disconnected}
          accent="hsl(0, 72%, 55%)"
          icon={<WifiOff className="h-5 w-5 text-destructive" />}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Instâncias Recentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentInstances.map((instance) => (
            <InstanceCard key={instance.id} instance={instance} />
          ))}
        </div>
      </div>
    </div>
  );
}

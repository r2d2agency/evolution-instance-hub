import { EvolutionInstance, InstanceGroup } from "@/types/evolution";

export const mockGroups: InstanceGroup[] = [
  { id: "g1", name: "Vendas", color: "#22c55e", description: "Instâncias do time de vendas" },
  { id: "g2", name: "Suporte", color: "#3b82f6", description: "Instâncias de atendimento" },
  { id: "g3", name: "Marketing", color: "#f59e0b", description: "Campanhas e disparos" },
];

export const mockInstances: EvolutionInstance[] = [
  {
    id: "1",
    instanceName: "vendas-principal",
    status: "open",
    groupId: "g1",
    owner: "João Silva",
    number: "5511999990001",
    webhookUrl: "https://webhook.site/abc123",
    webhookEvents: ["messages.upsert", "connection.update"],
    apikey: "B6D711FCDE4D4FD5936544120E713976",
    createdAt: "2025-12-01T10:00:00Z",
  },
  {
    id: "2",
    instanceName: "vendas-backup",
    status: "close",
    groupId: "g1",
    owner: "Maria Santos",
    number: "5511999990002",
    createdAt: "2025-12-05T14:30:00Z",
  },
  {
    id: "3",
    instanceName: "suporte-01",
    status: "open",
    groupId: "g2",
    owner: "Carlos Oliveira",
    number: "5511999990003",
    webhookUrl: "https://n8n.empresa.com/webhook/suporte",
    webhookEvents: ["messages.upsert"],
    apikey: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    createdAt: "2025-11-20T08:00:00Z",
  },
  {
    id: "4",
    instanceName: "suporte-02",
    status: "connecting",
    groupId: "g2",
    createdAt: "2026-01-10T16:45:00Z",
  },
  {
    id: "5",
    instanceName: "mkt-disparo",
    status: "open",
    groupId: "g3",
    number: "5511999990005",
    webhookUrl: "https://api.empresa.com/webhook/mkt",
    webhookEvents: ["messages.upsert", "messages.update"],
    apikey: "X9Y8Z7W6V5U4T3S2R1Q0P9O8N7M6L5K4",
    createdAt: "2026-02-01T12:00:00Z",
  },
  {
    id: "6",
    instanceName: "teste-dev",
    status: "close",
    createdAt: "2026-02-15T09:30:00Z",
  },
];

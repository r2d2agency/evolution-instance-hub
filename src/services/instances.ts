import { EvolutionInstance } from "@/types/evolution";
import { api } from "./api";

export interface CreateInstancePayload {
  instanceName: string;
  integration?: string;
  qrcode?: boolean;
}

export interface UpdateInstancePayload {
  instanceName?: string;
  groupId?: string | null;
}

export interface SetWebhookPayload {
  url: string;
  webhook_by_events?: boolean;
  webhook_base64?: boolean;
  events?: string[];
}

// Evolution API response types
interface EvolutionInstanceRaw {
  instance: {
    instanceName: string;
    instanceId: string;
    status: string;
    owner?: string;
    profilePictureUrl?: string;
    integration?: string;
  };
}

function mapInstance(raw: EvolutionInstanceRaw): EvolutionInstance {
  return {
    id: raw.instance.instanceId || raw.instance.instanceName,
    instanceName: raw.instance.instanceName,
    status: (raw.instance.status === "open" ? "open" : raw.instance.status === "connecting" ? "connecting" : "close") as EvolutionInstance["status"],
    owner: raw.instance.owner,
    profilePictureUrl: raw.instance.profilePictureUrl,
    createdAt: new Date().toISOString(),
  };
}

export const instancesService = {
  list: async (): Promise<EvolutionInstance[]> => {
    const data = await api.get<EvolutionInstanceRaw[]>("/instance/fetchInstances");
    return data.map(mapInstance);
  },

  get: async (name: string): Promise<EvolutionInstance> => {
    const data = await api.get<EvolutionInstanceRaw>(`/instance/fetchInstances?instanceName=${name}`);
    return mapInstance(data);
  },

  create: (data: CreateInstancePayload) =>
    api.post<{ instance: { instanceName: string; instanceId: string; status: string }; qrcode?: { base64: string } }>("/instance/create", {
      instanceName: data.instanceName,
      integration: data.integration || "WHATSAPP-BAILEYS",
      qrcode: data.qrcode ?? true,
    }),

  delete: (name: string) => api.delete<void>(`/instance/delete/${name}`),

  connect: (name: string) =>
    api.get<{ base64?: string; code?: string }>(`/instance/connect/${name}`),

  disconnect: (name: string) =>
    api.delete<void>(`/instance/logout/${name}`),

  restart: (name: string) =>
    api.put<void>(`/instance/restart/${name}`, {}),

  setWebhook: (name: string, data: SetWebhookPayload) =>
    api.post<void>(`/webhook/set/${name}`, data),

  getWebhook: (name: string) =>
    api.get<{ url: string; events: string[] }>(`/webhook/find/${name}`),

  connectionState: (name: string) =>
    api.get<{ instance: { state: string } }>(`/instance/connectionState/${name}`),
};

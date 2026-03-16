import { EvolutionInstance } from "@/types/evolution";
import { api } from "./api";

export interface CreateInstancePayload {
  instanceName: string;
  rejectCalls?: boolean;
  callMessage?: string;
  webhooks?: {
    connected?: string;
    disconnected?: string;
    delivery?: string;
    received?: string;
    messageStatus?: string;
    chatPresence?: string;
  };
  metadata?: Record<string, unknown>;
}

interface BackendInstance {
  id: string;
  instance_id: string;
  instance_name: string;
  token: string;
  connected: boolean;
  connected_phone?: string;
  webhook_connected?: string;
  webhook_disconnected?: string;
  webhook_delivery?: string;
  webhook_received?: string;
  webhook_message_status?: string;
  webhook_chat_presence?: string;
  auto_read?: boolean;
  reject_calls?: boolean;
  call_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Enriched from W-API
  wapi?: Record<string, unknown>;
  device?: Record<string, unknown>;
}

interface ListResponse {
  error: boolean;
  instances: BackendInstance[];
}

interface CreateResponse {
  error: boolean;
  message: string;
  instance: BackendInstance;
  webhookResults: Record<string, string>;
}

interface DetailResponse {
  error: boolean;
  instance: BackendInstance;
}

function mapInstance(raw: BackendInstance): EvolutionInstance {
  return {
    id: raw.id,
    instanceName: raw.instance_name,
    status: raw.connected ? "open" : "close",
    token: raw.token,
    connected: raw.connected,
    connectedPhone: raw.connected_phone,
    number: raw.connected_phone,
    webhookConnectedUrl: raw.webhook_connected || undefined,
    webhookDisconnectedUrl: raw.webhook_disconnected || undefined,
    webhookReceivedUrl: raw.webhook_received || undefined,
    webhookDeliveryUrl: raw.webhook_delivery || undefined,
    webhookStatusUrl: raw.webhook_message_status || undefined,
    webhookPresenceUrl: raw.webhook_chat_presence || undefined,
    automaticReading: raw.auto_read,
    rejectCalls: raw.reject_calls,
    callMessage: raw.call_message,
    messagesSent: (raw.wapi as any)?.messagesSent,
    messagesReceived: (raw.wapi as any)?.messagesReceived,
    contacts: (raw.wapi as any)?.contacts,
    chats: (raw.wapi as any)?.chats,
    createdAt: raw.created_at,
  };
}

export const instancesService = {
  list: async (): Promise<EvolutionInstance[]> => {
    const data = await api.get<ListResponse>("/api/instances");
    return (data.instances || []).map(mapInstance);
  },

  get: async (id: string): Promise<EvolutionInstance> => {
    const data = await api.get<DetailResponse>(`/api/instances/${id}`);
    return mapInstance(data.instance);
  },

  create: (data: CreateInstancePayload) =>
    api.post<CreateResponse>("/api/instances", data),

  delete: (id: string) =>
    api.delete<{ error: boolean; message: string }>(`/api/instances/${id}`),

  qrCode: (id: string) =>
    api.get<{ error: boolean; qrcode: string; instanceId: string }>(`/api/instances/${id}/qrcode`),

  restart: (id: string) =>
    api.post<{ error: boolean; message: string }>(`/api/instances/${id}/restart`),

  disconnect: (id: string) =>
    api.post<{ error: boolean; message: string }>(`/api/instances/${id}/disconnect`),

  status: (id: string) =>
    api.get<{ error: boolean; connected: boolean }>(`/api/instances/${id}/status`),

  device: (id: string) =>
    api.get<{ error: boolean; connectedPhone: string; name: string; platform: string; profilePictureUrl: string; isBusiness: boolean }>(`/api/instances/${id}/device`),

  rename: (id: string, instanceName: string) =>
    api.put<{ error: boolean; message: string }>(`/api/instances/${id}/rename`, { instanceName }),

  autoRead: (id: string, value: boolean) =>
    api.put<{ error: boolean; message: string }>(`/api/instances/${id}/auto-read`, { value }),

  rejectCalls: (id: string, value: boolean, callMessage?: string) =>
    api.put<{ error: boolean; message: string }>(`/api/instances/${id}/reject-calls`, { value, callMessage: callMessage || "" }),

  updateWebhooks: (id: string, webhooks: Record<string, string>) =>
    api.put<{ error: boolean; message: string; results: Record<string, string> }>(`/api/instances/${id}/webhooks`, webhooks),

  webhookLogs: (id: string, page = 1, perPage = 10) =>
    api.get<unknown>(`/api/instances/${id}/webhook-logs?page=${page}&perPage=${perPage}`),

  sync: () =>
    api.post<{ error: boolean; message: string; total: number; imported: number; skipped: number }>("/api/instances/sync"),
};

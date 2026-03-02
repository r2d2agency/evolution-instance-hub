import { EvolutionInstance } from "@/types/evolution";
import { api } from "./api";

export interface CreateInstancePayload {
  instanceName: string;
  groupId?: string;
}

export interface UpdateInstancePayload {
  instanceName?: string;
  groupId?: string | null;
}

export interface SetWebhookPayload {
  webhookUrl: string;
  webhookEvents: string[];
}

export const instancesService = {
  list: () => api.get<EvolutionInstance[]>("/instances"),

  get: (id: string) => api.get<EvolutionInstance>(`/instances/${id}`),

  create: (data: CreateInstancePayload) => api.post<EvolutionInstance>("/instances", data),

  update: (id: string, data: UpdateInstancePayload) => api.put<EvolutionInstance>(`/instances/${id}`, data),

  delete: (id: string) => api.delete<void>(`/instances/${id}`),

  connect: (id: string) => api.post<{ qrcode?: string }>(`/instances/${id}/connect`, {}),

  disconnect: (id: string) => api.post<void>(`/instances/${id}/disconnect`, {}),

  setWebhook: (id: string, data: SetWebhookPayload) => api.put<void>(`/instances/${id}/webhook`, data),

  getToken: (id: string) => api.get<{ apikey: string }>(`/instances/${id}/token`),

  regenerateToken: (id: string) => api.post<{ apikey: string }>(`/instances/${id}/token/regenerate`, {}),
};

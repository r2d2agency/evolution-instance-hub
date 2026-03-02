import { api } from "./api";

export type WebhookType = "connected" | "disconnected" | "delivery" | "received" | "message-status" | "chat-presence";

const webhookEndpoints: Record<WebhookType, string> = {
  connected: "update-webhook-connected",
  disconnected: "update-webhook-disconnected",
  delivery: "update-webhook-delivery",
  received: "update-webhook-received",
  "message-status": "update-webhook-message-status",
  "chat-presence": "update-webhook-chat-presence",
};

export const webhookLabels: Record<WebhookType, string> = {
  connected: "Ao conectar",
  disconnected: "Ao desconectar",
  delivery: "Ao enviar",
  received: "Ao receber",
  "message-status": "Status de mensagem",
  "chat-presence": "Presença do chat",
};

export interface WebhookLog {
  id: string;
  [key: string]: unknown;
}

export const webhooksService = {
  update: (instanceId: string, type: WebhookType, url: string) =>
    api.put<{ error: boolean; message: string }>(
      `/webhook/${webhookEndpoints[type]}?instanceId=${instanceId}`,
      { value: url }
    ),

  fetchLogs: (instanceId: string, page = 1, perPage = 10) =>
    api.get<unknown>(`/webhook/fetch-webhook-logs?instanceId=${instanceId}&perPage=${perPage}&page=${page}`),

  fetchLogById: (instanceId: string, logId: string) =>
    api.get<unknown>(`/webhook/fetch-webhook-log/${logId}?instanceId=${instanceId}`),
};

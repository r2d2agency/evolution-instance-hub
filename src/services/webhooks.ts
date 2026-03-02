import { api } from "./api";

export type WebhookType = "connected" | "disconnected" | "delivery" | "received" | "message-status";

const webhookEndpoints: Record<WebhookType, string> = {
  connected: "update-webhook-connected",
  disconnected: "update-webhook-disconnected",
  delivery: "update-webhook-delivery",
  received: "update-webhook-received",
  "message-status": "update-webhook-message-status",
};

export const webhookLabels: Record<WebhookType, string> = {
  connected: "Ao conectar",
  disconnected: "Ao desconectar",
  delivery: "Ao enviar",
  received: "Ao receber",
  "message-status": "Status de mensagem",
};

export const webhooksService = {
  update: (instanceId: string, type: WebhookType, url: string) =>
    api.put<{ error: boolean; message: string }>(
      `/webhook/${webhookEndpoints[type]}?instanceId=${instanceId}`,
      { value: url }
    ),
};

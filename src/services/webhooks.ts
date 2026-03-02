import { api } from "./api";

export type WebhookType = "connected" | "disconnected" | "delivery" | "received" | "messageStatus" | "chatPresence";

export const webhookLabels: Record<WebhookType, string> = {
  connected: "Ao conectar",
  disconnected: "Ao desconectar",
  delivery: "Ao enviar",
  received: "Ao receber",
  messageStatus: "Status de mensagem",
  chatPresence: "Presença do chat",
};

// Webhooks are now managed through the instances service
// PUT /api/instances/:id/webhooks
export const webhooksService = {
  update: (instanceId: string, webhooks: Partial<Record<WebhookType, string>>) =>
    api.put<{ error: boolean; message: string; results: Record<string, string> }>(
      `/api/instances/${instanceId}/webhooks`,
      webhooks
    ),
};

import { useMutation } from "@tanstack/react-query";
import { webhooksService, WebhookType } from "@/services/webhooks";

export function useUpdateWebhooks() {
  return useMutation({
    mutationFn: ({ instanceId, webhooks }: { instanceId: string; webhooks: Partial<Record<WebhookType, string>> }) =>
      webhooksService.update(instanceId, webhooks),
  });
}

import { useMutation } from "@tanstack/react-query";
import { webhooksService, WebhookType } from "@/services/webhooks";

export function useUpdateWebhook() {
  return useMutation({
    mutationFn: ({ instanceId, type, url }: { instanceId: string; type: WebhookType; url: string }) =>
      webhooksService.update(instanceId, type, url),
  });
}

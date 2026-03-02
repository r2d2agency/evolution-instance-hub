import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instancesService, CreateInstancePayload, SetWebhookPayload } from "@/services/instances";

export function useInstances() {
  return useQuery({
    queryKey: ["instances"],
    queryFn: instancesService.list,
  });
}

export function useInstance(name: string) {
  return useQuery({
    queryKey: ["instances", name],
    queryFn: () => instancesService.get(name),
    enabled: !!name,
  });
}

export function useCreateInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInstancePayload) => instancesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useDeleteInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => instancesService.delete(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useConnectInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => instancesService.connect(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useDisconnectInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => instancesService.disconnect(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useSetWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: SetWebhookPayload }) => instancesService.setWebhook(name, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

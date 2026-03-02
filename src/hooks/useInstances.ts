import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instancesService, CreateInstancePayload, UpdateInstancePayload, SetWebhookPayload } from "@/services/instances";

export function useInstances() {
  return useQuery({
    queryKey: ["instances"],
    queryFn: instancesService.list,
  });
}

export function useInstance(id: string) {
  return useQuery({
    queryKey: ["instances", id],
    queryFn: () => instancesService.get(id),
    enabled: !!id,
  });
}

export function useCreateInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInstancePayload) => instancesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useUpdateInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInstancePayload }) => instancesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useDeleteInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instancesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useConnectInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instancesService.connect(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useDisconnectInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instancesService.disconnect(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useSetWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SetWebhookPayload }) => instancesService.setWebhook(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useRegenerateToken() {
  return useMutation({
    mutationFn: (id: string) => instancesService.regenerateToken(id),
  });
}

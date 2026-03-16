import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instancesService, CreateInstancePayload } from "@/services/instances";

export function useInstances() {
  return useQuery({
    queryKey: ["instances"],
    queryFn: instancesService.list,
  });
}

export function useCreateInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInstancePayload) => instancesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useSyncInstances() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => instancesService.sync(),
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

export function useQrCode() {
  return useMutation({
    mutationFn: (id: string) => instancesService.qrCode(id),
  });
}

export function useRestartInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instancesService.restart(id),
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

export function useRenameInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => instancesService.rename(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useAutoRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => instancesService.autoRead(id, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useRejectCalls() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value, callMessage }: { id: string; value: boolean; callMessage?: string }) =>
      instancesService.rejectCalls(id, value, callMessage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

export function useInstanceDetails(id: string) {
  return useQuery({
    queryKey: ["instance-details", id],
    queryFn: () => instancesService.get(id),
    enabled: !!id,
  });
}

export function useDeviceInfo(id: string) {
  return useQuery({
    queryKey: ["device", id],
    queryFn: () => instancesService.device(id),
    enabled: !!id,
  });
}

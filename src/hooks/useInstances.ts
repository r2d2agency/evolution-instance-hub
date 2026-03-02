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

export function useDeleteInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => instancesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instances"] }),
  });
}

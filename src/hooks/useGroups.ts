import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsService, CreateGroupPayload, UpdateGroupPayload } from "@/services/groups";

export function useGroups() {
  return useQuery({
    queryKey: ["groups"],
    queryFn: groupsService.list,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupPayload) => groupsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupPayload }) => groupsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  });
}

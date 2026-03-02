import { InstanceGroup } from "@/types/evolution";
import { api } from "./api";

export interface CreateGroupPayload {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateGroupPayload {
  name?: string;
  color?: string;
  description?: string;
}

export const groupsService = {
  list: () => api.get<InstanceGroup[]>("/groups"),

  get: (id: string) => api.get<InstanceGroup>(`/groups/${id}`),

  create: (data: CreateGroupPayload) => api.post<InstanceGroup>("/groups", data),

  update: (id: string, data: UpdateGroupPayload) => api.put<InstanceGroup>(`/groups/${id}`, data),

  delete: (id: string) => api.delete<void>(`/groups/${id}`),
};

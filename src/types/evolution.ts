export type InstanceStatus = "open" | "close" | "connecting";

export interface EvolutionInstance {
  id: string;
  instanceName: string;
  status: InstanceStatus;
  groupId?: string;
  owner?: string;
  profilePictureUrl?: string;
  number?: string;
  webhookUrl?: string;
  webhookEvents?: string[];
  apikey?: string;
  createdAt: string;
}

export interface InstanceGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface DashboardStats {
  total: number;
  connected: number;
  disconnected: number;
  connecting: number;
}

export type InstanceStatus = "open" | "close" | "connecting";

export interface EvolutionInstance {
  id: string;
  instanceName: string;
  status: InstanceStatus;
  token?: string;
  number?: string;
  profilePictureUrl?: string;
  connected?: boolean;
  connectedPhone?: string;
  contacts?: number;
  chats?: number;
  messagesSent?: number;
  messagesReceived?: number;
  webhookConnectedUrl?: string;
  webhookDisconnectedUrl?: string;
  webhookReceivedUrl?: string;
  webhookDeliveryUrl?: string;
  webhookStatusUrl?: string;
  webhookPresenceUrl?: string;
  rejectCalls?: boolean;
  callMessage?: string;
  automaticReading?: boolean;
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

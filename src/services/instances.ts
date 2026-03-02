import { EvolutionInstance } from "@/types/evolution";
import { api } from "./api";

export interface CreateInstancePayload {
  instanceName: string;
  rejectCalls?: boolean;
  callMessage?: string;
}

// W-API raw response for list
interface WApiInstanceRaw {
  instanceId: string;
  token: string;
  created: string;
  instanceName: string;
  connected: boolean;
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
  automaticReading?: boolean;
  rejectCalls?: boolean;
  callMessage?: string;
}

interface WApiListResponse {
  error: boolean;
  instances: WApiInstanceRaw[];
  total: number;
  totalPage: number;
  pageSize: number;
  page: number;
}

interface WApiCreateResponse {
  error: boolean;
  message: string;
  instanceId: string;
  token: string;
}

function mapInstance(raw: WApiInstanceRaw): EvolutionInstance {
  return {
    id: raw.instanceId,
    instanceName: raw.instanceName,
    status: raw.connected ? "open" : "close",
    token: raw.token,
    connected: raw.connected,
    connectedPhone: raw.connectedPhone,
    number: raw.connectedPhone,
    contacts: raw.contacts,
    chats: raw.chats,
    messagesSent: raw.messagesSent,
    messagesReceived: raw.messagesReceived,
    webhookConnectedUrl: raw.webhookConnectedUrl,
    webhookDisconnectedUrl: raw.webhookDisconnectedUrl,
    webhookReceivedUrl: raw.webhookReceivedUrl,
    webhookDeliveryUrl: raw.webhookDeliveryUrl,
    webhookStatusUrl: raw.webhookStatusUrl,
    webhookPresenceUrl: raw.webhookPresenceUrl,
    rejectCalls: raw.rejectCalls,
    callMessage: raw.callMessage,
    automaticReading: raw.automaticReading,
    createdAt: raw.created,
  };
}

export const instancesService = {
  list: async (): Promise<EvolutionInstance[]> => {
    const data = await api.get<WApiListResponse>("/instances?pageSize=100&page=1");
    return (data.instances || []).map(mapInstance);
  },

  create: (data: CreateInstancePayload) =>
    api.post<WApiCreateResponse>("/create-instance", data),

  delete: (instanceId: string) =>
    api.delete<{ error: boolean; message: string }>(`/delete-instance?instanceId=${instanceId}`),
};

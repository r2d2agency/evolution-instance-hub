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

interface WApiGenericResponse {
  error: boolean;
  message: string;
}

interface WApiQrCodeResponse {
  error: boolean;
  instanceId: string;
  qrcode: string;
}

interface WApiStatusResponse {
  instanceId: string;
  connected: boolean;
}

interface WApiDeviceResponse {
  connectedPhone: string;
  lid: string;
  name: string;
  platform: string;
  profilePictureUrl: string;
  status: string;
  isBusiness: boolean;
}

interface WApiFetchInstanceResponse {
  instanceId: string;
  instanceName: string;
  token: string;
  connected: boolean;
  connectedPhone?: string;
  paymentStatus?: string;
  created: string;
  expires?: number;
  contacts?: number;
  chats?: number;
  messagesSent?: number;
  messagesReceived?: number;
  webhookConnectedUrl?: string;
  webhookDeliveryUrl?: string;
  webhookDisconnectedUrl?: string;
  webhookStatusUrl?: string;
  webhookPresenceUrl?: string;
  webhookReceivedUrl?: string;
  automaticReading?: boolean;
  rejectCalls?: boolean;
  callMessage?: string;
  syncContacts?: boolean;
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
  // Integration endpoints (Bearer integration token)
  list: async (): Promise<EvolutionInstance[]> => {
    const data = await api.get<WApiListResponse>("/integrator/instances?pageSize=100&page=1");
    return (data.instances || []).map(mapInstance);
  },

  create: (data: CreateInstancePayload) =>
    api.post<WApiCreateResponse>("/integrator/create-instance", data),

  delete: (instanceId: string) =>
    api.delete<WApiGenericResponse>(`/integrator/delete-instance?instanceId=${instanceId}`),

  // Instance PRO endpoints
  qrCode: (instanceId: string) =>
    api.get<WApiQrCodeResponse>(`/instance/qr-code?instanceId=${instanceId}&image=disable`),

  restart: (instanceId: string) =>
    api.get<WApiGenericResponse>(`/instance/restart?instanceId=${instanceId}`),

  disconnect: (instanceId: string) =>
    api.get<WApiGenericResponse>(`/instance/disconnect?instanceId=${instanceId}`),

  status: (instanceId: string) =>
    api.get<WApiStatusResponse>(`/instance/status-instance?instanceId=${instanceId}`),

  device: (instanceId: string) =>
    api.get<WApiDeviceResponse>(`/instance/device?instanceId=${instanceId}`),

  fetchInstance: (instanceId: string) =>
    api.get<WApiFetchInstanceResponse>(`/instance/fetch-instance?instanceId=${instanceId}`),

  rename: (instanceId: string, instanceName: string) =>
    api.put<WApiGenericResponse>(`/instance/update-name?instanceId=${instanceId}`, { instanceName }),

  autoRead: (instanceId: string, value: boolean) =>
    api.put<WApiGenericResponse>(`/instance/update-auto-read-message?instanceId=${instanceId}`, { value: String(value) }),
};

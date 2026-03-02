import { api } from "./api";

export interface AppSettings {
  evolutionBaseUrl: string;
  evolutionApiKey: string;
}

export const settingsService = {
  get: () => api.get<AppSettings>("/settings"),
  update: (data: Partial<AppSettings>) => api.put<AppSettings>("/settings", data),
  testConnection: () => api.post<{ ok: boolean; message: string }>("/settings/test", {}),
};

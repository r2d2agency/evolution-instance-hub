import { z } from "zod";

export const createInstanceSchema = z.object({
  instanceName: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo")
    .regex(/^[a-zA-Z0-9_-]+$/, "Nome deve conter apenas letras, números, _ e -"),
  rejectCalls: z.boolean().optional().default(false),
  callMessage: z.string().max(500).optional().default(""),
  webhooks: z.object({
    connected: z.string().url("URL inválida").optional().or(z.literal("")),
    disconnected: z.string().url("URL inválida").optional().or(z.literal("")),
    delivery: z.string().url("URL inválida").optional().or(z.literal("")),
    received: z.string().url("URL inválida").optional().or(z.literal("")),
    messageStatus: z.string().url("URL inválida").optional().or(z.literal("")),
    chatPresence: z.string().url("URL inválida").optional().or(z.literal("")),
  }).optional().default({}),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const updateWebhooksSchema = z.object({
  connected: z.string().url("URL inválida").optional().or(z.literal("")),
  disconnected: z.string().url("URL inválida").optional().or(z.literal("")),
  delivery: z.string().url("URL inválida").optional().or(z.literal("")),
  received: z.string().url("URL inválida").optional().or(z.literal("")),
  messageStatus: z.string().url("URL inválida").optional().or(z.literal("")),
  chatPresence: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const renameSchema = z.object({
  instanceName: z.string().trim().min(1).max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, "Nome deve conter apenas letras, números, _ e -"),
});

export const autoReadSchema = z.object({
  value: z.boolean(),
});

export const rejectCallsSchema = z.object({
  value: z.boolean(),
  callMessage: z.string().max(500).optional().default(""),
});

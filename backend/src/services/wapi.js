const WAPI_BASE = process.env.WAPI_BASE_URL || "https://api.w-api.app/v1";
const WAPI_TOKEN = process.env.WAPI_TOKEN || "";

async function wapiRequest(path, options = {}) {
  const url = `${WAPI_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WAPI_TOKEN}`,
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `W-API error: ${res.status}`);
  }

  return data;
}

export const wapi = {
  // Integration endpoints
  createInstance: (instanceName, rejectCalls = false, callMessage = "") =>
    wapiRequest("/integrator/create-instance", {
      method: "POST",
      body: JSON.stringify({ instanceName, rejectCalls, callMessage }),
    }),

  deleteInstance: (instanceId) =>
    wapiRequest(`/integrator/delete-instance?instanceId=${instanceId}`, { method: "DELETE" }),

  listInstances: (page = 1, pageSize = 100) =>
    wapiRequest(`/integrator/instances?pageSize=${pageSize}&page=${page}`),

  // Instance PRO endpoints
  qrCode: (instanceId) =>
    wapiRequest(`/instance/qr-code?instanceId=${instanceId}&image=disable`),

  restart: (instanceId) =>
    wapiRequest(`/instance/restart?instanceId=${instanceId}`),

  disconnect: (instanceId) =>
    wapiRequest(`/instance/disconnect?instanceId=${instanceId}`),

  status: (instanceId) =>
    wapiRequest(`/instance/status-instance?instanceId=${instanceId}`),

  device: (instanceId) =>
    wapiRequest(`/instance/device?instanceId=${instanceId}`),

  fetchInstance: (instanceId) =>
    wapiRequest(`/instance/fetch-instance?instanceId=${instanceId}`),

  rename: (instanceId, instanceName) =>
    wapiRequest(`/instance/update-name?instanceId=${instanceId}`, {
      method: "PUT",
      body: JSON.stringify({ instanceName }),
    }),

  autoRead: (instanceId, value) =>
    wapiRequest(`/instance/update-auto-read-message?instanceId=${instanceId}`, {
      method: "PUT",
      body: JSON.stringify({ value: String(value) }),
    }),

  // Webhook endpoints
  updateWebhook: (instanceId, type, url) => {
    const endpoints = {
      connected: "update-webhook-connected",
      disconnected: "update-webhook-disconnected",
      delivery: "update-webhook-delivery",
      received: "update-webhook-received",
      "message-status": "update-webhook-message-status",
      "chat-presence": "update-webhook-chat-presence",
    };
    return wapiRequest(`/webhook/${endpoints[type]}?instanceId=${instanceId}`, {
      method: "PUT",
      body: JSON.stringify({ value: url }),
    });
  },

  fetchWebhookLogs: (instanceId, page = 1, perPage = 10) =>
    wapiRequest(`/webhook/fetch-webhook-logs?instanceId=${instanceId}&perPage=${perPage}&page=${page}`),
};

const WAPI_BASE = process.env.WAPI_BASE_URL || "https://api.w-api.app/v1";
const WAPI_TOKEN = process.env.WAPI_TOKEN || "";

async function wapiRequest(path, options = {}, token = WAPI_TOKEN) {
  const url = `${WAPI_BASE}${path}`;

  console.log(`[W-API] ${options.method || "GET"} ${url}`);
  if (options.body) console.log(`[W-API] Body: ${options.body}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const text = await res.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[W-API] Non-JSON response: ${text.substring(0, 500)}`);
  }

  console.log(`[W-API] Response ${res.status}:`, JSON.stringify(data).substring(0, 300));

  if (!res.ok) {
    throw new Error(data.message || `W-API error: ${res.status}`);
  }

  return data;
}

export const wapi = {
  // ─── Integrator endpoints (use integrator token) ───
  createInstance: (instanceName, rejectCalls = false, callMessage = "") => {
    return wapiRequest("/integrator/create-instance", {
      method: "POST",
      body: JSON.stringify({
        instanceName,
        rejectCalls: rejectCalls ?? false,
        callMessage: callMessage || "",
      }),
    });
  },

  deleteInstance: (instanceId) =>
    wapiRequest(`/integrator/delete-instance?instanceId=${instanceId}`, { method: "DELETE" }),

  listInstances: (page = 1, pageSize = 100) =>
    wapiRequest(`/integrator/instances?pageSize=${pageSize}&page=${page}`),

  // ─── Instance endpoints (use instance token) ───
  qrCode: (instanceId, instanceToken) =>
    wapiRequest(`/instance/qr-code?instanceId=${instanceId}&image=disable`, {}, instanceToken),

  restart: (instanceId, instanceToken) =>
    wapiRequest(`/instance/restart?instanceId=${instanceId}`, {}, instanceToken),

  disconnect: (instanceId, instanceToken) =>
    wapiRequest(`/instance/disconnect?instanceId=${instanceId}`, {}, instanceToken),

  status: (instanceId, instanceToken) =>
    wapiRequest(`/instance/status-instance?instanceId=${instanceId}`, {}, instanceToken),

  device: (instanceId, instanceToken) =>
    wapiRequest(`/instance/device?instanceId=${instanceId}`, {}, instanceToken),

  fetchInstance: (instanceId, instanceToken) =>
    wapiRequest(`/instance/fetch-instance?instanceId=${instanceId}`, {}, instanceToken),

  rename: (instanceId, instanceName, instanceToken) =>
    wapiRequest(`/instance/update-name?instanceId=${instanceId}`, {
      method: "PUT",
      body: JSON.stringify({ instanceName }),
    }, instanceToken),

  autoRead: (instanceId, value, instanceToken) =>
    wapiRequest(`/instance/update-auto-read-message?instanceId=${instanceId}`, {
      method: "PUT",
      body: JSON.stringify({ value: Boolean(value) }),
    }, instanceToken),

  rejectCalls: (instanceId, value, callMessage, instanceToken) =>
    wapiRequest(`/instance/update-reject-call?instanceId=${instanceId}`, {
      method: "PUT",
      body: JSON.stringify({ value: Boolean(value), callMessage: callMessage || "" }),
    }, instanceToken),

  // ─── Webhook endpoints (use instance token) ───
  updateWebhook: (instanceId, type, url, instanceToken) => {
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
    }, instanceToken);
  },

  fetchWebhookLogs: (instanceId, instanceToken, page = 1, perPage = 10) =>
    wapiRequest(`/webhook/fetch-webhook-logs?instanceId=${instanceId}&perPage=${perPage}&page=${page}`, {}, instanceToken),
};
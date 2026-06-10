// In production, API calls go through nginx reverse proxy (same origin = no CORS)
// In dev, point VITE_API_URL to your local backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const error = isJson
      ? await response.json().catch(() => ({ message: response.statusText }))
      : { message: response.statusText };
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  if (!isJson) {
    throw new Error(
      `Backend não acessível em ${url}. Resposta não-JSON (${contentType || "sem content-type"}). ` +
      `Configure VITE_API_URL apontando para o backend (ex: https://api.seudominio.com).`
    );
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

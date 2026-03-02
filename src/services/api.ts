// API Configuration
// Set VITE_API_URL to your Evolution API address (e.g. https://evo.seudominio.com)
// Set VITE_API_KEY to your Evolution API global apikey
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": API_KEY,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const { token, headers, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, data };
}

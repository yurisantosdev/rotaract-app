import { endInvalidSession } from "./auth";

const SERVER_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const API_URL =
  typeof window === "undefined"
    ? SERVER_API_URL
    : (process.env.NEXT_PUBLIC_API_URL ?? "");

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (input instanceof Request) return input.method.toUpperCase();
  return "GET";
}

function toRequestUrl(url: string): URL | null {
  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : API_URL || SERVER_API_URL;
    return new URL(url, base);
  } catch {
    return null;
  }
}

function isLoginRequest(url: string, method: string): boolean {
  const parsed = toRequestUrl(url);
  if (!parsed) return false;
  const path = parsed.pathname.replace(/\/+$/, "");
  return method === "POST" && path.endsWith("/api/auth");
}

function isApiRequest(url: string): boolean {
  const parsed = toRequestUrl(url);
  return Boolean(parsed?.pathname.startsWith("/api/"));
}

function shouldEndSessionOnUnauthorized(url: string, method: string): boolean {
  return isApiRequest(url) && !isLoginRequest(url, method);
}

let fetchGuardInstalled = false;

export function installFetchAuthGuard(): void {
  if (fetchGuardInstalled || typeof window === "undefined") return;
  fetchGuardInstalled = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
    originalFetch(input, init).then((response) => {
      if (
        response.status === 401 &&
        shouldEndSessionOnUnauthorized(requestUrl(input), requestMethod(input, init))
      ) {
        endInvalidSession();
      }
      return response;
    });
}

if (typeof window !== "undefined") {
  installFetchAuthGuard();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const { token, headers, ...rest } = options;
  const url = API_URL ? `${API_URL}${path}` : path;
  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (
    response.status === 401 &&
    shouldEndSessionOnUnauthorized(url, (rest.method ?? "GET").toUpperCase())
  ) {
    endInvalidSession();
  }

  const data = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, data };
}

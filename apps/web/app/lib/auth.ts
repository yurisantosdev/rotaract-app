const COOKIE_NAME = "access_token";

function cookieMaxAge(remember: boolean): string {
  return remember ? `; Max-Age=${60 * 60 * 24 * 7}` : "";
}

export function setSession(token: string, remember: boolean): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/${cookieMaxAge(remember)}; SameSite=Lax`;

  if (remember) {
    localStorage.setItem(COOKIE_NAME, token);
    sessionStorage.removeItem(COOKIE_NAME);
    return;
  }

  sessionStorage.setItem(COOKIE_NAME, token);
  localStorage.removeItem(COOKIE_NAME);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const stored =
    localStorage.getItem(COOKIE_NAME) ?? sessionStorage.getItem(COOKIE_NAME);
  if (stored) return stored;

  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;

  return decodeURIComponent(match.slice(`${COOKIE_NAME}=`.length));
}

export function clearSession(): void {
  localStorage.removeItem(COOKIE_NAME);
  sessionStorage.removeItem(COOKIE_NAME);
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
}

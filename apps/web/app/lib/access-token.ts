export function isAccessTokenUnusable(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return true;

  const payloadPart = parts[1];
  if (!payloadPart) return true;

  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    if (typeof payload.exp !== "number") return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

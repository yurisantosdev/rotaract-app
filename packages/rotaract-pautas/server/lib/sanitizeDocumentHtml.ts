const MAX_DOCUMENT_HTML = 2_000_000;

export function sanitizeStoredDocumentHtml(
  value: unknown
): { ok: true; html: string } | { ok: false; erro: string } {
  if (typeof value !== "string") {
    return { ok: false, erro: "Campo documento deve ser um texto" };
  }

  if (value.length > MAX_DOCUMENT_HTML) {
    return { ok: false, erro: "O documento passou do tamanho permitido" };
  }

  const html = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(?:script|iframe|object|embed|link|meta|base|form|svg|math)\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "")
    .trim();

  return { ok: true, html };
}

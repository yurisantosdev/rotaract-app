const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "span",
  "div",
  "blockquote",
  "header",
  "section",
  "footer",
  "article",
  "img",
]);

const DROP_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
  "svg",
  "math",
]);

const SAFE_STYLE = new Set([
  "font-size",
  "font-weight",
  "font-style",
  "font-family",
  "text-align",
  "text-decoration",
  "color",
  "line-height",
  "margin",
  "margin-top",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "padding",
  "padding-top",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "display",
  "gap",
  "align-items",
  "justify-content",
  "flex-direction",
  "grid-template-columns",
  "border",
  "border-bottom",
  "border-top",
  "border-radius",
  "background",
  "background-color",
  "letter-spacing",
  "text-transform",
  "white-space",
  "list-style",
  "width",
  "height",
  "object-fit",
]);

const FONT_SIZE: Record<string, string> = {
  "1": "10px",
  "2": "12px",
  "3": "14px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "7": "32px",
};

function safeStyle(style: string): string {
  return style
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const splitAt = part.indexOf(":");
      if (splitAt <= 0) return false;
      const prop = part.slice(0, splitAt).trim().toLowerCase();
      const value = part.slice(splitAt + 1).trim();
      if (!SAFE_STYLE.has(prop) || !value) return false;
      const normalized = value.toLowerCase();
      if (
        normalized.includes("url(") ||
        normalized.includes("expression") ||
        normalized.includes("javascript") ||
        normalized.includes("(")
      ) {
        return false;
      }
      return true;
    })
    .join("; ");
}

function safeImageSrc(src: string): string | null {
  const value = src.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(value)) return value;
  return null;
}

function appendClean(source: Node, target: HTMLElement) {
  source.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(node.textContent ?? ""));
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    if (DROP_TAGS.has(tag)) return;
    if (!ALLOWED_TAGS.has(tag)) {
      appendClean(element, target);
      return;
    }

    const next = document.createElement(tag);
    const style = safeStyle(element.getAttribute("style") ?? "");
    if (style) next.setAttribute("style", style);

    if (tag === "img") {
      const src = safeImageSrc(element.getAttribute("src") ?? "");
      if (!src) return;
      next.setAttribute("src", src);
      next.setAttribute("alt", element.getAttribute("alt") ?? "");
    }

    appendClean(element, next);
    target.appendChild(next);
  });
}

export function sanitizeDocumentHtml(html: string): string {
  const withSpans = html.replace(
    /<font\b([^>]*)>([\s\S]*?)<\/font>/gi,
    (_match, attrs: string, inner: string) => {
      const size = /size\s*=\s*["']?(\d)["']?/i.exec(attrs)?.[1];
      const fontSize = size ? FONT_SIZE[size] : "";
      const style = fontSize ? ` style="font-size:${fontSize}"` : "";
      return `<span${style}>${inner}</span>`;
    }
  );

  const template = document.createElement("template");
  template.innerHTML = withSpans;
  const root = document.createElement("div");
  appendClean(template.content, root);
  return root.innerHTML.trim();
}

export function documentHasVisibleContent(html: string): boolean {
  const root = document.createElement("div");
  root.innerHTML = html;
  if (root.querySelector("img")) return true;
  return (root.textContent ?? "").replace(/\u00a0/g, " ").trim().length > 0;
}

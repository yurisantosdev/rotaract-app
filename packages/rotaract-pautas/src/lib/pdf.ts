import type { Member } from "@rotaract/members";
import { sanitizeDocumentHtml } from "./sanitizeDocumentHtml";
import { formatDateLong } from "./dates";
import { membersByIds } from "./members";
import {
  pautaStatusLabel,
  pautaTypeLabel,
  type Pauta,
} from "../types/pautas";
import { sortPautaItems } from "../types/pautaItems";

export type PautaClubInfo = {
  clubName: string;
  logoUrl?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DOCUMENT_BASE_CSS = `
  h1 { font-size: 22px; font-weight: 700; margin: 0; line-height: 1.2; }
  h2 { font-size: 20px; font-weight: 700; margin: 12px 0 6px; }
  h3 { font-size: 14px; font-weight: 700; margin: 10px 0 6px; }
  p { margin: 6px 0; font-size: 14px; line-height: 1.5; }
  ul { margin: 8px 0; padding-left: 1.25rem; }
  ol { margin: 8px 0; padding-left: 1.25rem; }
  li { margin: 2px 0; }
  strong, b { font-weight: 700; }
  em, i { font-style: italic; }
  u { text-decoration: underline; }
`;

export function buildPautaInnerHtml(
  pauta: Pauta,
  members: Member[],
  club: PautaClubInfo
): string {
  const present = membersByIds(members, pauta.presentMemberIds);
  const items = sortPautaItems(pauta.items);
  const generatedAt = pauta.generatedAt
    ? new Date(pauta.generatedAt).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  const logo = club.logoUrl
    ? `<img src="${escapeHtml(club.logoUrl)}" alt="" style="height:56px;width:56px;object-fit:cover;border-radius:14px;" />`
    : `<div style="height:56px;width:56px;border-radius:14px;background:#ff2d7a;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;">RC</div>`;

  const presentHtml =
    present.length === 0
      ? `<p style="margin:0;color:#71717a;font-size:13px;">Nenhum membro marcado como presente.</p>`
      : `<ul style="margin:0;padding:0;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;">${present
        .map(
          (member) =>
            `<li style="font-size:13px;color:#27272a;">${escapeHtml(member.name)}${member.role ? ` <span style="color:#71717a;">· ${escapeHtml(member.role)}</span>` : ""}</li>`
        )
        .join("")}</ul>`;

  const itemsHtml =
    items.length === 0
      ? `<p style="margin:0;color:#71717a;font-size:14px;">Nenhum item cadastrado nesta pauta.</p>`
      : items
        .map((item, index) => {
          const description = item.description.trim();
          return `<p style="margin:${index === 0 ? "0" : "16px"} 0 0;font-size:14px;font-weight:700;color:#18181b;">${index + 1}. ${escapeHtml(item.title)}</p>${
            description
              ? `<p style="margin:4px 0 0;font-size:14px;line-height:1.5;color:#18181b;white-space:pre-wrap;">${escapeHtml(description)}</p>`
              : ""
          }`;
        })
        .join("");

  return `<header style="display:flex;align-items:center;gap:16px;border-bottom:2px solid #ff2d7a;padding-bottom:16px;">
      ${logo}
      <div>
        <p style="margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#ff2d7a;font-weight:700;">Módulo pautas</p>
        <h1 style="margin:4px 0 0;font-size:22px;line-height:1.2;">${escapeHtml(club.clubName || "Rotaract Club")}</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#71717a;">${escapeHtml(pautaTypeLabel(pauta.type))} · ${escapeHtml(pautaStatusLabel(pauta.status))}</p>
      </div>
    </header>

    <section style="margin-top:22px;">
      <h2 style="margin:0;font-size:20px;">${escapeHtml(pauta.title)}</h2>
      <p style="margin:8px 0 0;font-size:13px;color:#52525b;">${escapeHtml(formatDateLong(pauta.meetingDate))}</p>
    </section>

    <section style="margin-top:22px;">
      <h3 style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a1a1aa;">Membros presentes</h3>
      ${presentHtml}
    </section>

    <section style="margin-top:22px;">
      <h3 style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a1a1aa;">Itens da pauta</h3>
      ${itemsHtml}
    </section>

    ${pauta.notes.trim()
      ? `<section style="margin-top:22px;">
            <h3 style="margin:0 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a1a1aa;">Observações</h3>
            <p style="margin:0;font-size:13px;color:#3f3f46;line-height:1.5;white-space:pre-wrap;">${escapeHtml(pauta.notes)}</p>
          </section>`
      : ""
    }

    <footer style="margin-top:28px;padding-top:12px;border-top:1px solid #e4e4e7;font-size:11px;color:#a1a1aa;">
      Documento gerado em ${escapeHtml(generatedAt)}.
    </footer>`;
}

function wrapPautaDocument(inner: string): string {
  return `<div style="width:720px;padding:36px 40px 28px;font-family:Arial,Helvetica,sans-serif;color:#18181b;background:#fff;">
    <style>${DOCUMENT_BASE_CSS}</style>
    ${inner}
  </div>`;
}

function resolvePautaDocumentHtml(
  pauta: Pauta,
  members: Member[],
  club: PautaClubInfo
): string {
  const custom = pauta.documentHtml?.trim();
  const inner = custom
    ? sanitizeDocumentHtml(custom)
    : buildPautaInnerHtml(pauta, members, club);
  return wrapPautaDocument(inner);
}

export async function generatePautaPdfBlob(
  pauta: Pauta,
  members: Member[],
  club: PautaClubInfo
): Promise<Blob> {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const html2canvas = html2canvasModule.default;
  const container = document.createElement("div");
  container.innerHTML = resolvePautaDocumentHtml(pauta, members, club);
  container.style.position = "fixed";
  container.style.left = "-12000px";
  container.style.top = "0";
  container.style.width = "720px";
  container.style.background = "#fff";
  document.body.appendChild(container);

  try {
    const target = container.firstElementChild as HTMLElement | null;
    if (!target) {
      throw new Error("Não foi possível montar o documento da pauta");
    }

    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const image = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 28;
    const imageWidth = pageWidth - margin * 2;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    let remaining = imageHeight;
    let offset = margin;

    doc.addImage(image, "PNG", margin, offset, imageWidth, imageHeight);
    remaining -= pageHeight - margin;

    while (remaining > 0) {
      offset -= pageHeight - margin;
      doc.addPage();
      doc.addImage(image, "PNG", margin, offset, imageWidth, imageHeight);
      remaining -= pageHeight - margin;
    }

    return doc.output("blob");
  } finally {
    container.remove();
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

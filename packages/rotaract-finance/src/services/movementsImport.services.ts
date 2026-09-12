import * as XLSX from "xlsx";
import { MOVEMENT_CATEGORIES, type MovementType } from "../types/movement";
import type {
  MovementImportIssue,
  ParsedMovementImport,
} from "../types/movementImport";

export const MOVEMENT_IMPORT_MAX_ROWS = 2500;
export const MOVEMENT_IMPORT_DESCRIPTION_MAX = 80;

const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;
const DATE_BR = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const REQUIRED_HEADERS = [
  "data",
  "descricao",
  "categoria",
  "tipo",
  "valor",
] as const;

const HEADER_ALIASES: Record<string, (typeof REQUIRED_HEADERS)[number]> = {
  data: "data",
  date: "data",
  descricao: "descricao",
  description: "descricao",
  categoria: "categoria",
  category: "categoria",
  tipo: "tipo",
  type: "tipo",
  valor: "valor",
  value: "valor",
  amount: "valor",
};

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isBlank(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function isValidIsoDate(value: string): boolean {
  if (!DATE_ISO.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toISODate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const iso = `${value.getUTCFullYear()}-${pad2(value.getUTCMonth() + 1)}-${pad2(value.getUTCDate())}`;
    return isValidIsoDate(iso) ? iso : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const iso = `${parsed.y}-${pad2(parsed.m)}-${pad2(parsed.d)}`;
    return isValidIsoDate(iso) ? iso : null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch?.[1] && isValidIsoDate(isoMatch[1])) {
    return isoMatch[1];
  }

  const brMatch = trimmed.match(DATE_BR);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    const year = Number(brMatch[3]);
    const iso = `${year}-${pad2(month)}-${pad2(day)}`;
    return isValidIsoDate(iso) ? iso : null;
  }

  return null;
}

function parseExcelMoney(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100) / 100;
  }

  if (typeof value !== "string") return Number.NaN;

  const trimmed = value.trim().replace(/r\$/gi, "").replace(/\s/g, "");
  if (!trimmed) return Number.NaN;

  let normalized = trimmed;
  if (trimmed.includes(",") && trimmed.includes(".")) {
    const lastComma = trimmed.lastIndexOf(",");
    const lastDot = trimmed.lastIndexOf(".");
    normalized =
      lastComma > lastDot
        ? trimmed.replace(/\./g, "").replace(",", ".")
        : trimmed.replace(/,/g, "");
  } else if (trimmed.includes(",")) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : Number.NaN;
}

function parseCategory(value: unknown): (typeof MOVEMENT_CATEGORIES)[number] | null {
  const normalized = normalizeKey(value);
  return (
    MOVEMENT_CATEGORIES.find((item) => normalizeKey(item) === normalized) ??
    null
  );
}

function parseType(value: unknown): MovementType | null {
  const normalized = normalizeKey(value);
  if (normalized === "entrada" || normalized === "receita" || normalized === "income") {
    return "entrada";
  }
  if (
    normalized === "saida" ||
    normalized === "despesa" ||
    normalized === "expense"
  ) {
    return "saida";
  }
  return null;
}

function cellAt(row: unknown[], index: number | undefined): unknown {
  if (index == null) return undefined;
  return row[index];
}

export function downloadMovementsImportTemplate(): void {
  const dataRows = [
    ["Data", "Descrição", "Categoria", "Tipo", "Valor"],
    ["11/09/2026", "Material de escritório", "Material", "Saída", 50.5],
  ];

  const instructionRows: Array<Array<string | number>> = [
    ["Como preencher o modelo"],
    [],
    ["Coluna", "Obrigatório", "Formato", "Exemplos"],
    ["Data", "Sim", "AAAA-MM-DD ou DD/MM/AAAA", "2026-09-11 ou 11/09/2026"],
    ["Descrição", "Sim", "Texto até 80 caracteres", "Doação de sócio"],
    [
      "Categoria",
      "Sim",
      MOVEMENT_CATEGORIES.join(" | "),
      "Doação",
    ],
    ["Tipo", "Sim", "Entrada ou Saída", "Entrada"],
    ["Valor", "Sim", "Número maior que zero", "1222.22 ou 1.222,22"],
    [],
    ["Substitua as linhas de exemplo da aba Movimentações pelos seus dados."],
    ["Linhas vazias são ignoradas. O limite é de 500 movimentações por arquivo."],
  ];

  const dataSheet = XLSX.utils.aoa_to_sheet(dataRows);
  dataSheet["!cols"] = [
    { wch: 14 },
    { wch: 40 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
  ];

  const instructionSheet = XLSX.utils.aoa_to_sheet(instructionRows);
  instructionSheet["!cols"] = [
    { wch: 18 },
    { wch: 14 },
    { wch: 42 },
    { wch: 28 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Movimentações");
  XLSX.utils.book_append_sheet(workbook, instructionSheet, "Instruções");
  XLSX.writeFile(workbook, "modelo-movimentacoes.xlsx");
}

export function parseMovementsWorkbook(buffer: ArrayBuffer): ParsedMovementImport {
  const bytes = new Uint8Array(buffer);
  const workbook = XLSX.read(bytes, {
    type: "array",
    cellDates: true,
  });

  const sheetName =
    workbook.SheetNames.find((name) => normalizeKey(name).includes("moviment")) ??
    workbook.SheetNames[0];

  if (!sheetName) {
    return {
      rows: [],
      issues: [{ row: 0, message: "A planilha não contém nenhuma aba." }],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return {
      rows: [],
      issues: [{ row: 0, message: "Não foi possível ler a aba da planilha." }],
    };
  }

  const table = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
    blankrows: false,
  });

  const headerRow = table[0];
  if (!Array.isArray(headerRow) || headerRow.length === 0) {
    return {
      rows: [],
      issues: [{ row: 1, message: "A primeira linha precisa ter os cabeçalhos do modelo." }],
    };
  }

  const columnIndex: Partial<Record<(typeof REQUIRED_HEADERS)[number], number>> = {};
  headerRow.forEach((cell, index) => {
    const alias = HEADER_ALIASES[normalizeKey(cell)];
    if (alias != null && columnIndex[alias] == null) {
      columnIndex[alias] = index;
    }
  });

  const missing = REQUIRED_HEADERS.filter((key) => columnIndex[key] == null);
  if (missing.length > 0) {
    return {
      rows: [],
      issues: [
        {
          row: 1,
          message:
            "Cabeçalhos inválidos. Use o modelo: Data, Descrição, Categoria, Tipo e Valor.",
        },
      ],
    };
  }

  const rows: ParsedMovementImport["rows"] = [];
  const issues: MovementImportIssue[] = [];
  const body = table.slice(1);

  body.forEach((rawRow, offset) => {
    const excelRow = offset + 2;
    const row = Array.isArray(rawRow) ? rawRow : [];
    const dateCell = cellAt(row, columnIndex.data);
    const descriptionCell = cellAt(row, columnIndex.descricao);
    const categoryCell = cellAt(row, columnIndex.categoria);
    const typeCell = cellAt(row, columnIndex.tipo);
    const valueCell = cellAt(row, columnIndex.valor);

    if (
      isBlank(dateCell) &&
      isBlank(descriptionCell) &&
      isBlank(categoryCell) &&
      isBlank(typeCell) &&
      isBlank(valueCell)
    ) {
      return;
    }

    const date = toISODate(dateCell);
    if (!date) {
      issues.push({
        row: excelRow,
        message: "Data inválida. Use AAAA-MM-DD ou DD/MM/AAAA.",
      });
      return;
    }

    const description =
      typeof descriptionCell === "string"
        ? descriptionCell.trim()
        : String(descriptionCell ?? "").trim();

    if (!description) {
      issues.push({ row: excelRow, message: "Informe a descrição." });
      return;
    }

    if (description.length > MOVEMENT_IMPORT_DESCRIPTION_MAX) {
      issues.push({
        row: excelRow,
        message: `A descrição deve ter no máximo ${MOVEMENT_IMPORT_DESCRIPTION_MAX} caracteres.`,
      });
      return;
    }

    const category = parseCategory(categoryCell);
    if (!category) {
      issues.push({
        row: excelRow,
        message: `Categoria inválida. Use: ${MOVEMENT_CATEGORIES.join(", ")}.`,
      });
      return;
    }

    const type = parseType(typeCell);
    if (!type) {
      issues.push({
        row: excelRow,
        message: "Tipo inválido. Use Entrada ou Saída.",
      });
      return;
    }

    const value = parseExcelMoney(valueCell);
    if (!Number.isFinite(value) || value <= 0) {
      issues.push({
        row: excelRow,
        message: "Informe um valor numérico maior que zero.",
      });
      return;
    }

    rows.push({
      row: excelRow,
      data: {
        date,
        description,
        category,
        type,
        value,
      },
    });
  });

  if (rows.length > MOVEMENT_IMPORT_MAX_ROWS) {
    return {
      rows: [],
      issues: [
        {
          row: 0,
          message: `A planilha tem ${rows.length} linhas válidas. O limite é ${MOVEMENT_IMPORT_MAX_ROWS} por importação.`,
        },
      ],
    };
  }

  return { rows, issues };
}

import * as XLSX from "xlsx";
import type { Contribution } from "../types/contributions";
import type { Movement } from "../types/movement";

const CURRENCY_FORMAT = '"R$"#,##0.00';

type DownloadFinanceReportInput = {
  userName: string;
  movements: Movement[];
  contributions: Contribution[];
};

function applyCurrencyColumn(sheet: XLSX.WorkSheet, column: string, startRow: number) {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  for (let row = startRow; row <= range.e.r + 1; row += 1) {
    const cell = sheet[`${column}${row}`];
    if (cell && typeof cell.v === "number") {
      cell.z = CURRENCY_FORMAT;
    }
  }
}

function contributionStatusLabel(status: Contribution["status"]): string {
  if (status === "pago") return "Pago";
  if (status === "isento") return "Isento";
  return "Pendente";
}

function contributionsSheet(contributions: Contribution[]): XLSX.WorkSheet {
  const rows = [
    ["Nome", "Referência", "Valor", "Status"],
    ...contributions.map((item) => [
      item.name,
      item.reference,
      item.value,
      contributionStatusLabel(item.status),
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  applyCurrencyColumn(sheet, "C", 2);
  sheet["!cols"] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
  ];
  return sheet;
}

function movementsSheet(movements: Movement[]): XLSX.WorkSheet {
  const rows = [
    ["Data", "Descrição", "Categoria", "Tipo", "Valor"],
    ...movements.map((item) => [
      item.date,
      item.description,
      item.category,
      item.type === "entrada" ? "Entrada" : "Saída",
      item.value,
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  applyCurrencyColumn(sheet, "E", 2);
  sheet["!cols"] = [
    { wch: 14 },
    { wch: 40 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
  ];
  return sheet;
}

export function downloadContributionsReport(contributions: Contribution[]): void {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    contributionsSheet(contributions),
    "Mensalidades"
  );
  XLSX.writeFile(workbook, "mensalidades.xlsx");
}

export function downloadMovementsReport(movements: Movement[]): void {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    movementsSheet(movements),
    "Movimentações"
  );
  XLSX.writeFile(workbook, "movimentacoes.xlsx");
}

export function downloadFinanceReport({
  userName,
  movements,
  contributions,
}: DownloadFinanceReportInput): void {
  const income = movements
    .filter((item) => item.type === "entrada")
    .reduce((sum, item) => sum + item.value, 0);
  const expense = movements
    .filter((item) => item.type === "saida")
    .reduce((sum, item) => sum + item.value, 0);
  const paidCount = contributions.filter((item) => item.status === "pago").length;

  const byCategory = movements.reduce<Record<string, number>>((acc, item) => {
    const signal = item.type === "entrada" ? 1 : -1;
    acc[item.category] = (acc[item.category] ?? 0) + item.value * signal;
    return acc;
  }, {});

  const today = new Intl.DateTimeFormat("pt-BR").format(new Date());
  const summaryRows: Array<Array<string | number>> = [
    ["Rotaract Club Chapecó — Prestação de contas"],
    [`Gerado por ${userName}`],
    [`Data: ${today}`],
    [],
    ["Saldo", income - expense],
    ["Entradas", income],
    ["Saídas", expense],
    ["Mensalidades pagas", `${paidCount}/${contributions.length}`],
    [],
    ["Por categoria"],
    ["Categoria", "Total"],
    ...Object.entries(byCategory).map(([category, total]) => [category, total]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  applyCurrencyColumn(summarySheet, "B", 5);
  summarySheet["!cols"] = [{ wch: 28 }, { wch: 18 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");
  XLSX.utils.book_append_sheet(
    workbook,
    movementsSheet(movements),
    "Movimentações"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    contributionsSheet(contributions),
    "Mensalidades"
  );

  XLSX.writeFile(workbook, "prestacao-contas.xlsx");
}

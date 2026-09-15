import type { PautasStatsProps } from "./type";

export function usePautasStats({ pautas }: PautasStatsProps) {
  const scheduled = pautas.filter((pauta) => pauta.status === "agendada").length;
  const realized = pautas.filter((pauta) => pauta.status === "realizada").length;
  const withoutPdf = pautas.filter((pauta) => !pauta.generatedAt).length;

  return {
    scheduled,
    realized,
    withoutPdf,
  };
}

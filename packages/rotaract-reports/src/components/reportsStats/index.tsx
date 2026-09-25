import {
  BugBeetleIcon,
  CheckCircleIcon,
  HourglassIcon,
  CodeIcon,
} from "@phosphor-icons/react";
import { type Reports } from "../../types/reports";
import { StatCard } from "./_components/StatCard";
import { useReportsStats } from "./services";

export function ReportsStats({ reports }: { reports: Reports[] }) {
  const { pending, resolved, progress } = useReportsStats(reports);

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total"
        value={reports.length}
        tone="bg-rotaract-pink/10 text-rotaract-pink"
        icon={<BugBeetleIcon className="h-5 w-5" weight="bold" />}
      />
      <StatCard
        label="Pendentes"
        value={pending}
        tone="bg-amber-50 text-amber-700"
        icon={<HourglassIcon className="h-5 w-5" weight="bold" />}
      />
      <StatCard
        label="Resolvidos"
        value={resolved}
        tone="bg-emerald-50 text-emerald-700"
        icon={<CheckCircleIcon className="h-5 w-5" weight="bold" />}
      />
      <StatCard
        label="Em andamento"
        value={progress}
        tone="bg-sky-50 text-sky-700"
        icon={<CodeIcon className="h-5 w-5" weight="bold" />}
      />
    </div>
  );
}

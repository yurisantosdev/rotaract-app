"use client";

import { ReportsPage } from "@rotaract/reports";
import { useMemberSession } from "../_components/member-session";

export default function ReportesPage() {
  const { user } = useMemberSession();
  return <ReportsPage user={user} />;
}

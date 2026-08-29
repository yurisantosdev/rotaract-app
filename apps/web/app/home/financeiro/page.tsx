"use client";

import { FinancePage } from "@rotaract/finance";
import { useMemberSession } from "../_components/member-session";

export default function FinanceiroPage() {
  const { user } = useMemberSession();
  return <FinancePage userName={user.name} backHref="/home" />;
}

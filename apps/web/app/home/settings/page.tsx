"use client";

import { ConfigPage } from "@rotaract/settings";
import { useClubBranding } from "../_components/club-branding";
import { useMemberSession } from "../_components/member-session";

export default function SettingsPage() {
  const { user } = useMemberSession();
  const { setBranding } = useClubBranding();

  return (
    <ConfigPage
      userName={user.name}
      backHref="/home"
      onSaved={(settings) => {
        setBranding({
          name: settings.clubName.trim() || "Rotaract Club Chapecó",
          logo: settings.logoUrl || "/logo.jpg",
        });
      }}
    />
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { listSettings } from "@rotaract/settings";

export type ClubBranding = {
  name: string;
  logo: string;
};

const FALLBACK_BRANDING: ClubBranding = {
  name: "Rotaract Club Chapecó",
  logo: "/logo.jpg",
};

type ClubBrandingContextValue = {
  branding: ClubBranding;
  setBranding: (branding: ClubBranding) => void;
};

const ClubBrandingContext = createContext<ClubBrandingContextValue | null>(null);

export function ClubBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<ClubBranding>(FALLBACK_BRANDING);

  useEffect(() => {
    const controller = new AbortController();

    listSettings(controller.signal)
      .then((items) => {
        const current = items[0];
        if (!current) return;
        setBranding({
          name: current.nameClub.trim() || FALLBACK_BRANDING.name,
          logo: current.logo.trim() || FALLBACK_BRANDING.logo,
        });
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({ branding, setBranding }), [branding]);

  return (
    <ClubBrandingContext.Provider value={value}>
      {children}
    </ClubBrandingContext.Provider>
  );
}

export function useClubBranding(): ClubBrandingContextValue {
  const context = useContext(ClubBrandingContext);
  if (!context) {
    throw new Error("useClubBranding precisa estar dentro de /home");
  }
  return context;
}

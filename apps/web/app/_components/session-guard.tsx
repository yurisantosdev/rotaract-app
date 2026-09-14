"use client";

import { useEffect } from "react";
import { installFetchAuthGuard } from "../lib/api";
import { getToken } from "../lib/auth";

installFetchAuthGuard();

export function SessionGuard() {
  useEffect(() => {
    getToken();
  }, []);

  return null;
}

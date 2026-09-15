import type { Request } from "express";

export type AuthenticatedRequest = Request & {
  user?: {
    sub: string;
    email: string;
    photo?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

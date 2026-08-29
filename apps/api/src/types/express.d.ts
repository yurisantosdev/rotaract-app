declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; email: string; photo?: string; createdAt?: string; updatedAt?: string };
    }
  }
}

export {};

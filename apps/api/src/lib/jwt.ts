import jwt from "jsonwebtoken";

export type JwtUserPayload = {
  sub: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export function signAccessToken(payload: JwtUserPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não definido");
  }
  return jwt.sign(payload, secret, { expiresIn: "1d" });
}

export function verifyAccessToken(token: string): JwtUserPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não definido");
  }
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload & JwtUserPayload;
  if (typeof decoded.sub !== "string" || typeof decoded.email !== "string") {
    throw new Error("Token inválido");
  }
  return {
    sub: decoded.sub,
    email: decoded.email,
    createdAt: typeof decoded.createdAt === "string" ? decoded.createdAt : undefined,
    updatedAt: typeof decoded.updatedAt === "string" ? decoded.updatedAt : undefined,
  };
}

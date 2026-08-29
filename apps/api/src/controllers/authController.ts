import type { Request, Response } from "express";
import { User } from "../models/Users";
import { comparePassword } from "../lib/password";
import { signAccessToken } from "../lib/jwt";

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  if (typeof email !== "string" || !email.trim()) {
    res.status(400).json({ erro: "Campo email é obrigatório e deve ser uma string" });
    return;
  }

  if (typeof password !== "string" || password.length === 0) {
    res.status(400).json({ erro: "Campo password é obrigatório e deve ser uma string" });
    return;
  }

  const user = await User.findOne({
    email: normalizarEmail(email),
  }).select("+password");

  if (!user) {
    res.status(401).json({ erro: "Credenciais inválidas" });
    return;
  }

  const hash = user.password;
  if (!hash) {
    res.status(500).json({ erro: "Dados de autenticação inconsistentes" });
    return;
  }

  const senhaOk = await comparePassword(password, hash);
  if (!senhaOk) {
    res.status(401).json({ erro: "Credenciais inválidas" });
    return;
  }

  const token = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    photo: user.photo,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  });

  res.json({
    token,
    tipo: "Bearer",
    expiraEm: "7d",
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const user = await User.findById(req.user.sub);
  if (!user) {
    res.status(401).json({ erro: "Sessão inválida" });
    return;
  }

  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    photo: user.photo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

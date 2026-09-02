import type { Request, Response } from "express";
import { Member } from "@rotaract/members/server";
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

  const member = await Member.findOne({
    email: normalizarEmail(email),
  }).select("+password");

  if (!member) {
    res.status(401).json({ erro: "Credenciais inválidas" });
    return;
  }

  const hash = member.password;
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
    sub: member._id.toString(),
    email: member.email,
    photo: member.photo,
    position: member.position,
    status: member.status,
    birthDate: member.birthDate,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });

  res.json({
    token,
    tipo: "Bearer",
    expiraEm: "1d",
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const member = await Member.findById(req.user.sub);
  if (!member) {
    res.status(401).json({ erro: "Sessão inválida" });
    return;
  }

  res.json({
    id: member._id.toString(),
    name: member.name,
    position: member.position,
    status: member.status,
    email: member.email,
    photo: member.photo,
    birthDate: member.birthDate,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  });
}

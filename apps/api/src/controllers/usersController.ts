import type { Request, Response } from "express";
import mongoose from "mongoose";
import { hashPassword } from "../lib/password";
import { UsersType } from "../types/Users";
import { User } from "../models/Users";

function serializar(user: UsersType) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    photo: user.photo,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function isDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  );
}

type UserLean = {
  _id: mongoose.Types.ObjectId;
};

export async function list(req: Request, res: Response): Promise<void> {

  const itens = await User.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((c) => serializar(c as unknown as UsersType)));
}

export async function get(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const user = await User.findById(id).lean();
  if (!user) {
    res.status(404).json({ erro: "Usuário não encontrado" });
    return;
  }

  const userTyped = user as unknown as UserLean & UsersType;

  res.json(serializar(userTyped as unknown as UsersType));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { name, password, photo, email } = req.body as {
    name?: string;
    password?: string;
    photo?: string;
    email: string;
  };

  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ erro: "Campo name é obrigatório" });
    return;
  }
  if (typeof password !== "string" || password.length === 0) {
    res.status(400).json({ erro: "Campo password é obrigatório" });
    return;
  }
  if (typeof email !== "string") {
    res.status(400).json({ erro: "Campo email é obrigatório" });
    return;
  }

  try {
    const hash = await hashPassword(password);
    const dados: {
      name: string;
      password: string;
      photo?: string;
      email: string;
    } = {
      name: name.trim(),
      password: hash,
      email: email.trim(),
    };

    const criada = await User.create(dados);
    const obj = criada.toObject();
    delete obj.password;
    res.status(201).json(serializar(obj as UsersType));
  } catch (err) {
    if (isDuplicateKey(err)) {
      res.status(409).json({ erro: "Login ou e-mail já cadastrado" });
      return;
    }
    throw err;
  }
}

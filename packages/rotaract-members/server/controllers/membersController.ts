import type { Request, Response } from "express";
import mongoose from "mongoose";
import { hashPassword } from "../lib/password";
import { MemberPosition, MemberStatus, MembersType } from "../types/Members";
import { Member } from "../models/Members";
import {
  clubManagementsFromSettings,
  uniqueManagementNames,
} from "../lib/clubManagements";

function serializar(member: MembersType) {
  return {
    id: member._id.toString(),
    name: member.name,
    email: member.email,
    photo: member.photo,
    birthDate: member.birthDate,
    phone: member.phone,
    status: member.status,
    position: member.position,
    managements: member.managements,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

function isDuplicateKey(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  );
}

function allowsManagement(name: string, allowed: string[]): boolean {
  return allowed.some((item) => item.toLowerCase() === name.toLowerCase());
}

export async function list(req: Request, res: Response): Promise<void> {
  const itens = await Member.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((c) => serializar(c as unknown as MembersType)));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { name, password, photo, email, birthDate, position, phone, managements } = req.body as {
    name?: string;
    password?: string;
    photo?: string;
    email: string;
    birthDate?: string;
    status?: MemberStatus;
    position?: MemberPosition;
    phone?: string;
    managements?: unknown;
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

  if (typeof birthDate !== "string" || !birthDate.trim()) {
    res.status(400).json({ erro: "Campo birthDate é obrigatório" });
    return;
  }

  if (typeof position !== "string" || !position.trim()) {
    res.status(400).json({ erro: "Campo position é obrigatório" });
    return;
  }

  if (typeof phone !== "string" || !phone.trim()) {
    res.status(400).json({ erro: "Campo phone é obrigatório" });
    return;
  }

  try {
    const club = await clubManagementsFromSettings();
    if (!club.currentManagement) {
      res.status(400).json({
        erro: "Cadastre a gestão atual do clube antes de criar um membro.",
      });
      return;
    }

    const parsedManagements = uniqueManagementNames(managements);
    if (managements !== undefined && parsedManagements === null) {
      res.status(400).json({
        erro: "Campo gestões deve ser um array de strings.",
      });
      return;
    }

    const nextManagements =
      parsedManagements && parsedManagements.length > 0
        ? parsedManagements
        : [club.currentManagement];

    if (nextManagements.length === 0) {
      res.status(400).json({ erro: "Selecione ao menos uma gestão." });
      return;
    }

    if (
      nextManagements.some((item) => !allowsManagement(item, club.managements))
    ) {
      res.status(400).json({
        erro: "Há gestões que não existem no cadastro do clube.",
      });
      return;
    }

    const hash = await hashPassword(password);
    const dados: {
      name: string;
      password: string;
      photo?: string;
      email: string;
      birthDate: string;
      status?: MemberStatus;
      position: MemberPosition;
      phone?: string;
      managements: string[];
    } = {
      name: name.trim(),
      password: hash,
      email: email.trim(),
      birthDate: birthDate.trim(),
      position,
      phone: digitsOnly(phone),
      managements: nextManagements,
    };

    if (typeof photo === "string" && photo.trim()) {
      dados.photo = photo.trim();
    }

    dados.status = 'ativo';

    const criada = await Member.create(dados);
    const obj = criada.toObject();
    delete obj.password;
    res.status(201).json(serializar(obj as MembersType));
  } catch (err) {
    if (isDuplicateKey(err)) {
      res.status(409).json({ erro: "E-mail já cadastrado" });
      return;
    }
    throw err;
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const {
    name,
    password,
    photo,
    email,
    birthDate,
    status,
    position,
    phone,
    managements
  } = req.body as {
    name?: string;
    password?: string;
    photo?: string;
    email?: string;
    birthDate?: string;
    status?: MemberStatus;
    position?: MemberPosition;
    phone?: string;
    managements?: unknown;
  };

  if (typeof name !== "string" || !name.trim()) {
    res.status(400).json({ erro: "Campo name é obrigatório" });
    return;
  }
  if (typeof email !== "string" || !email.trim()) {
    res.status(400).json({ erro: "Campo email é obrigatório" });
    return;
  }
  if (typeof birthDate !== "string" || !birthDate.trim()) {
    res.status(400).json({ erro: "Campo birthDate é obrigatório" });
    return;
  }
  if (typeof position !== "string" || !position.trim()) {
    res.status(400).json({ erro: "Campo position é obrigatório" });
    return;
  }

  if (typeof phone !== "string" || !phone.trim()) {
    res.status(400).json({ erro: "Campo phone é obrigatório" });
    return;
  }

  try {
    const dados: {
      name: string;
      password?: string;
      photo?: string;
      email: string;
      birthDate: string;
      status?: MemberStatus;
      position: MemberPosition;
      phone?: string;
      managements?: string[];
    } = {
      name: name.trim(),
      email: email.trim(),
      birthDate: birthDate.trim(),
      position,
      phone: digitsOnly(phone),
    };

    if (managements !== undefined) {
      const parsedManagements = uniqueManagementNames(managements);
      if (parsedManagements === null || parsedManagements.length === 0) {
        res.status(400).json({
          erro: "Selecione ao menos uma gestão de acesso.",
        });
        return;
      }

      const club = await clubManagementsFromSettings();
      const existing = await Member.findById(id).lean();
      const allowed = [
        ...club.managements,
        ...((existing?.managements as string[] | undefined) ?? []),
      ];

      if (
        parsedManagements.some((item) => !allowsManagement(item, allowed))
      ) {
        res.status(400).json({
          erro: "Há gestões que não existem no cadastro do clube.",
        });
        return;
      }

      dados.managements = parsedManagements;
    }

    if (typeof password === "string" && password.length > 0) {
      dados.password = await hashPassword(password);
    }

    if (typeof photo === "string") {
      dados.photo = photo.trim();
    }

    if (typeof status === "string" && status.trim()) {
      dados.status = status;
    }

    const atualizada = await Member.findByIdAndUpdate(id, dados, {
      new: true,
      runValidators: true,
    });

    if (!atualizada) {
      res.status(404).json({ erro: "Membro não encontrado" });
      return;
    }

    const obj = atualizada.toObject();
    delete obj.password;
    res.json(serializar(obj as MembersType));
  } catch (err) {
    if (isDuplicateKey(err)) {
      res.status(409).json({ erro: "E-mail já cadastrado" });
      return;
    }
    throw err;
  }
}
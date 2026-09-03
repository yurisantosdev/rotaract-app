import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Calendar } from "../models/Calendar";
import { CalendarType } from "../types/Calendar";

function serializar(calendar: CalendarType) {
  return {
    id: calendar._id.toString(),
    title: calendar.title,
    type: calendar.type,
    date_start: calendar.date_start,
    date_end: calendar.date_end,
    hour_start: calendar.hour_start,
    hour_end: calendar.hour_end,
    all_day: calendar.all_day,
    description: calendar.description,
    members: calendar.members,
    createdAt: calendar.createdAt,
    updatedAt: calendar.updatedAt,
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

export async function list(req: Request, res: Response): Promise<void> {
  const itens = await Calendar.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((c) => serializar(c as unknown as CalendarType)));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { title, type, date_start, date_end, hour_start, hour_end, all_day, description, members } = req.body as {
    title: string;
    type: string;
    date_start: string;
    date_end: string;
    hour_start: string;
    hour_end: string;
    all_day: boolean;
    description: string;
    members: string[];
  };

  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({ erro: "Campo título é obrigatório" });
    return;
  }
  if (typeof type !== "string" || type.length === 0) {
    res.status(400).json({ erro: "Campo tipo é obrigatório" });
    return;
  }

  try {
    const dados: {
      title: string;
      type: string;
      date_start: string;
      date_end: string;
      hour_start: string;
      hour_end: string;
      all_day: boolean;
      description: string;
      members: string[];
    } = {
      title: title.trim(),
      type: type.trim(),
      date_start: date_start.trim(),
      date_end: date_end.trim(),
      hour_start: hour_start.trim(),
      hour_end: hour_end.trim(),
      all_day: all_day,
      description: description.trim(),
      members: members.map((member) => member.trim()),
    };
    const criada = await Calendar.create(dados);
    const obj = criada.toObject();
    res.status(201).json(serializar(obj as CalendarType));
  } catch (err) {
    if (isDuplicateKey(err)) {
      res.status(409).json({ erro: "Agendamento já cadastrado" });
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

  const { title, type, date_start, date_end, hour_start, hour_end, all_day, description, members } = req.body as {
    title: string;
    type: string;
    date_start: string;
    date_end: string;
    hour_start: string;
    hour_end: string;
    all_day: boolean;
    description: string;
    members: string[];
  };

  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({ erro: "Campo título é obrigatório" });
    return;
  }
  if (typeof type !== "string" || type.length === 0) {
    res.status(400).json({ erro: "Campo tipo é obrigatório" });
    return;
  }

  try {
    const dados: {
      title: string;
      type: string;
      date_start: string;
      date_end: string;
      hour_start: string;
      hour_end: string;
      all_day: boolean;
      description: string;
      members: string[];
    } = {
      title: title.trim(),
      type: type.trim(),
      date_start: date_start.trim(),
      date_end: date_end.trim(),
      hour_start: hour_start.trim(),
      hour_end: hour_end.trim(),
      all_day: all_day,
      description: description.trim(),
      members: members.map((member) => member.trim()),
    };
    const atualizada = await Calendar.findByIdAndUpdate(id, dados, {
      new: true,
      runValidators: true,
    });

    if (!atualizada) {
      res.status(404).json({ erro: "Agendamento não encontrado" });
      return;
    }

    const obj = atualizada.toObject();
    res.json(serializar(obj as CalendarType));
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar agendamento" });
    return;
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  try {
    const removida = await Calendar.findByIdAndDelete(id);

    if (!removida) {
      res.status(404).json({ erro: "Agendamento não encontrado" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao excluir agendamento" });
    return;
  }
}
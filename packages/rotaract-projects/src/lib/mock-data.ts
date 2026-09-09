import type { Member } from "@rotaract/members";
import { addDays, todayISO } from "./dates";
import type { Project } from "../types/projects";
import { uniqueIds } from "../types/projects";
import type { Task } from "../types/tasks";

function pickId(members: Member[], index: number): string {
  return members[index % members.length]?.id ?? "";
}

function teamOf(members: Member[], indexes: number[]): string[] {
  return uniqueIds(indexes.map((index) => pickId(members, index)));
}

export function buildMockProjects(members: Member[]): {
  projects: Project[];
  tasks: Task[];
} {
  const pool = members.filter((member) => member.status === "ativo");
  const source = pool.length > 0 ? pool : members;

  if (source.length === 0) {
    return { projects: [], tasks: [] };
  }

  const today = todayISO();
  const now = new Date().toISOString();

  const coatMembers = teamOf(source, [0, 1, 2]);
  const breakfastMembers = teamOf(source, [1, 2]);
  const healthMembers = teamOf(source, [0, 2, 3]);

  const projects: Project[] = [
    {
      id: "proj-agasalho",
      title: "Campanha do Agasalho 2026",
      description:
        "Arrecadação e distribuição de agasalhos para famílias acompanhadas pelo clube durante o inverno.",
      managerId: pickId(source, 0),
      members: coatMembers,
      createdAt: addDays(today, -28),
      updatedAt: now,
    },
    {
      id: "proj-cafe",
      title: "Café da manhã solidário",
      description:
        "Café da manhã oferecido na praça central, com doação de alimentos e conversa com a comunidade.",
      managerId: pickId(source, 1),
      members: breakfastMembers,
      createdAt: addDays(today, -60),
      updatedAt: addDays(today, -8),
    },
    {
      id: "proj-saude",
      title: "Mutirão de saúde",
      description:
        "Ação com aferição de pressão, orientação e encaminhamento em parceria com a unidade de saúde do bairro.",
      managerId: pickId(source, 2 % source.length),
      members: healthMembers,
      createdAt: addDays(today, -10),
      updatedAt: now,
    },
  ];

  const tasks: Task[] = [
    {
      id: "task-agasalho-1",
      title: "Mapear pontos de coleta",
      description: "Definir mercados, escolas e igrejas parceiras para receber as doações.",
      managerId: pickId(source, 0),
      projectId: "proj-agasalho",
      date: addDays(today, -20),
      status: "completed",
      limit: addDays(today, -12),
      createdAt: addDays(today, -20),
      updatedAt: addDays(today, -12),
    },
    {
      id: "task-agasalho-2",
      title: "Divulgar nas redes do clube",
      description: "Criar artes e cronograma de publicações para Instagram e grupos da família.",
      managerId: pickId(source, 1),
      projectId: "proj-agasalho",
      date: addDays(today, -8),
      status: "in_progress",
      limit: addDays(today, 5),
      createdAt: addDays(today, -8),
      updatedAt: now,
    },
    {
      id: "task-agasalho-3",
      title: "Separar doações recebidas",
      description: "Organizar por tamanho e estado de conservação antes da entrega.",
      managerId: pickId(source, 2),
      projectId: "proj-agasalho",
      date: addDays(today, -4),
      status: "pending",
      limit: addDays(today, -1),
      createdAt: addDays(today, -4),
      updatedAt: now,
    },
    {
      id: "task-cafe-1",
      title: "Comprar mantimentos",
      description: "Pães, leite, frutas e itens de higiene para o café da manhã.",
      managerId: pickId(source, 1),
      projectId: "proj-cafe",
      date: addDays(today, -30),
      status: "completed",
      limit: addDays(today, -20),
      createdAt: addDays(today, -30),
      updatedAt: addDays(today, -20),
    },
    {
      id: "task-cafe-2",
      title: "Escala de voluntários",
      description: "Confirmar horário de cada companheiro no dia da ação.",
      managerId: pickId(source, 2),
      projectId: "proj-cafe",
      date: addDays(today, -18),
      status: "completed",
      limit: addDays(today, -10),
      createdAt: addDays(today, -18),
      updatedAt: addDays(today, -10),
    },
    {
      id: "task-saude-1",
      title: "Alinhar com a UBS",
      description: "Combinar espaço, materiais e profissionais disponíveis no mutirão.",
      managerId: pickId(source, 0),
      projectId: "proj-saude",
      date: today,
      status: "new",
      limit: addDays(today, 7),
      createdAt: addDays(today, -6),
      updatedAt: now,
    },
    {
      id: "task-saude-2",
      title: "Levantar lista de inscrições",
      description: "Registrar moradores interessados e necessidades específicas.",
      managerId: pickId(source, 3),
      projectId: "proj-saude",
      date: addDays(today, 2),
      status: "pending",
      limit: addDays(today, 12),
      createdAt: addDays(today, -3),
      updatedAt: now,
    },
  ];

  return { projects, tasks };
}

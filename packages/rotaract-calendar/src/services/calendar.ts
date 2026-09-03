import { Calendar, CalendarPayload, TypeCalendar } from "../types/calendar";

const CALENDAR_URL = "/api/calendar";

async function readApiError(response: Response, fallback: string): Promise<string> {
  if (response.status === 409) {
    return "Já existe um agendamento com este título.";
  }

  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "erro" in body &&
      typeof (body as { erro: unknown }).erro === "string"
    ) {
      return (body as { erro: string }).erro;
    }
  } catch {
    // keep fallback
  }

  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asCalendarType(value: unknown): TypeCalendar {
  if (value === "reunião" || value === "reuniao") return "reuniao";
  if (value === "projeto" || value === "evento" || value === "compromisso" || value === "outro") {
    return value;
  }
  return "outro";
}

function parseId(row: Record<string, unknown>): string {
  if (typeof row.id === "string" && row.id) return row.id;
  if (typeof row._id === "string" && row._id) return row._id;
  if (row._id && typeof row._id === "object" && "toString" in row._id) {
    return String(row._id);
  }
  return "";
}

function parseCalendar(data: unknown): Calendar {
  if (!data || typeof data !== "object") {
    throw new Error("Resposta inválida da API de agendamentos");
  }

  const row = data as Record<string, unknown>;
  const id = parseId(row);
  if (!id || typeof row.title !== "string") {
    throw new Error("Resposta inválida da API de agendamentos");
  }

  return {
    id,
    title: row.title,
    type: asCalendarType(row.type),
    date_start: asString(row.date_start),
    date_end: asString(row.date_end),
    hour_start: asString(row.hour_start),
    hour_end: asString(row.hour_end),
    all_day: row.all_day === true,
    description: asString(row.description),
    members: Array.isArray(row.members)
      ? row.members.filter((item): item is string => typeof item === "string")
      : [],
    createdAt: typeof row.createdAt === "string" ? new Date(row.createdAt) : new Date(),
    updatedAt: typeof row.updatedAt === "string" ? new Date(row.updatedAt) : new Date(),
  };
}

function toApiBody(calendar: CalendarPayload) {
  return {
    title: calendar.title,
    type: calendar.type,
    date_start: calendar.date_start,
    date_end: calendar.date_end,
    hour_start: calendar.hour_start,
    hour_end: calendar.hour_end,
    all_day: calendar.all_day,
    description: calendar.description,
    members: calendar.members,
  };
}

export async function listCalendar(signal: AbortSignal): Promise<Calendar[]> {
  const response = await fetch(CALENDAR_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os agendamentos");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de agendamentos");
  }

  return data.flatMap((item) => {
    try {
      return [parseCalendar(item)];
    } catch {
      return [];
    }
  });
}

export async function createCalendar(
  signal: AbortSignal,
  calendar: CalendarPayload
): Promise<Calendar> {
  const response = await fetch(CALENDAR_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiBody(calendar)),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível salvar o agendamento")
    );
  }

  return parseCalendar(await response.json());
}

export async function updateCalendar(
  id: string,
  signal: AbortSignal,
  calendar: CalendarPayload
): Promise<Calendar> {
  const response = await fetch(`${CALENDAR_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiBody(calendar)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível atualizar o agendamento"));
  }

  return parseCalendar(await response.json());
}

export async function removeCalendar(
  id: string,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(`${CALENDAR_URL}/${id}`, {
    method: "DELETE",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível excluir o agendamento")
    );
  }
}
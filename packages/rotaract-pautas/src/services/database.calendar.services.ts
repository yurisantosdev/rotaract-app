export type CalendarMeetingOption = {
  id: string;
  title: string;
  date: string;
  type: string;
  acceptedMemberIds: string[];
  pendingCount: number;
};

const CALENDAR_URL = "/api/calendar";

function asId(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") {
    if ("$oid" in value && typeof (value as { $oid: unknown }).$oid === "string") {
      return (value as { $oid: string }).$oid;
    }
    if ("toString" in value && typeof value.toString === "function") {
      const text = value.toString();
      if (text && text !== "[object Object]") return text;
    }
  }
  return "";
}

function asDateInput(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return "";
}

function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isReuniao(type: unknown): boolean {
  return type === "reuniao" || type === "reunião";
}

function parseAcceptedAndPending(members: unknown): {
  acceptedMemberIds: string[];
  pendingCount: number;
} {
  if (!Array.isArray(members)) {
    return { acceptedMemberIds: [], pendingCount: 0 };
  }

  const acceptedMemberIds: string[] = [];
  let pendingCount = 0;

  for (const item of members) {
    if (typeof item === "string") {
      pendingCount += 1;
      continue;
    }
    if (!item || typeof item !== "object") continue;

    const row = item as Record<string, unknown>;
    const id = asId(row._id) || asId(row.id);
    if (!id) continue;

    if (row.accept === "accepted") {
      acceptedMemberIds.push(id);
    } else if (row.accept !== "rejected") {
      pendingCount += 1;
    }
  }

  return {
    acceptedMemberIds: Array.from(new Set(acceptedMemberIds)),
    pendingCount,
  };
}

export async function listFutureCalendarMeetings(
  signal: AbortSignal
): Promise<CalendarMeetingOption[]> {
  const response = await fetch(CALENDAR_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as reuniões da agenda");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de agenda");
  }

  const today = todayISO();

  return data
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      const id = asId(row.id) || asId(row._id);
      const title = typeof row.title === "string" ? row.title : "";
      const date = asDateInput(row.date_start);

      if (!id || !title || !date || !isReuniao(row.type)) return [];
      if (date < today) return [];

      const { acceptedMemberIds, pendingCount } = parseAcceptedAndPending(
        row.members
      );

      return [
        {
          id,
          title,
          date,
          type: String(row.type),
          acceptedMemberIds,
          pendingCount,
        },
      ];
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "pt-BR"));
}

import mongoose from "mongoose";

export function uniqueManagementNames(values: unknown): string[] | null {
  if (!Array.isArray(values)) return null;

  const names: string[] = [];
  const seen = new Set<string>();

  for (const item of values) {
    if (typeof item !== "string" || !item.trim()) return null;
    const name = item.trim();
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return names;
}

export async function clubManagementsFromSettings(): Promise<{
  currentManagement: string;
  managements: string[];
}> {
  const settings = await mongoose.connection
    .collection("settings")
    .findOne(
      {},
      {
        sort: { createdAt: -1 },
        projection: { currentManagement: 1, managements: 1 },
      }
    );

  const currentManagement =
    typeof settings?.currentManagement === "string"
      ? settings.currentManagement.trim()
      : "";
  const managements = uniqueManagementNames(settings?.managements) ?? [];

  if (
    currentManagement &&
    !managements.some(
      (item) => item.toLowerCase() === currentManagement.toLowerCase()
    )
  ) {
    managements.push(currentManagement);
  }

  return { currentManagement, managements };
}

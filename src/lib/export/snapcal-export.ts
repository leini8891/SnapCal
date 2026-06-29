import type {
  LoggedMeal,
  PilotProfile,
  SavedMeal,
} from "@/lib/mock-data";

type ExportSnapshot = {
  exportedAt: string;
  goal: number;
  profile: PilotProfile;
  logs: LoggedMeal[];
  savedMeals: SavedMeal[];
};

function escapeCsv(value: string | number | boolean | null | undefined) {
  const normalized =
    value === null || value === undefined ? "" : String(value);

  if (
    normalized.includes(",") ||
    normalized.includes('"') ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }

  return normalized;
}

export function buildExportSnapshot(input: {
  goal: number;
  profile: PilotProfile;
  logs: LoggedMeal[];
  savedMeals: SavedMeal[];
}): ExportSnapshot {
  return {
    exportedAt: new Date().toISOString(),
    goal: input.goal,
    profile: input.profile,
    logs: input.logs,
    savedMeals: input.savedMeals,
  };
}

export function buildExportJson(input: {
  goal: number;
  profile: PilotProfile;
  logs: LoggedMeal[];
  savedMeals: SavedMeal[];
}) {
  return JSON.stringify(buildExportSnapshot(input), null, 2);
}

export function buildMealLogsCsv(logs: LoggedMeal[]) {
  const header = [
    "id",
    "name",
    "logged_at",
    "kcal_low",
    "kcal_high",
    "protein_low",
    "protein_high",
    "carbs_low",
    "carbs_high",
    "fat_low",
    "fat_high",
    "confidence",
    "modifiers",
    "source",
  ];
  const rows = logs.map((log) => [
    log.id,
    log.name,
    log.loggedAt,
    log.kcalRange[0],
    log.kcalRange[1],
    log.macroRange?.protein[0] ?? "",
    log.macroRange?.protein[1] ?? "",
    log.macroRange?.carbs[0] ?? "",
    log.macroRange?.carbs[1] ?? "",
    log.macroRange?.fat[0] ?? "",
    log.macroRange?.fat[1] ?? "",
    log.confidence ?? "",
    log.modifiers.join(" | "),
    log.source,
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");
}

export function buildSavedMealsCsv(savedMeals: SavedMeal[]) {
  const header = [
    "id",
    "shortcut_key",
    "name",
    "kcal_low",
    "kcal_high",
    "protein_low",
    "protein_high",
    "carbs_low",
    "carbs_high",
    "fat_low",
    "fat_high",
    "confidence",
    "modifiers",
    "times_used",
    "last_used_at",
    "is_pinned",
  ];
  const rows = savedMeals.map((savedMeal) => [
    savedMeal.id,
    savedMeal.shortcutKey,
    savedMeal.name,
    savedMeal.kcalRange[0],
    savedMeal.kcalRange[1],
    savedMeal.macroRange?.protein[0] ?? "",
    savedMeal.macroRange?.protein[1] ?? "",
    savedMeal.macroRange?.carbs[0] ?? "",
    savedMeal.macroRange?.carbs[1] ?? "",
    savedMeal.macroRange?.fat[0] ?? "",
    savedMeal.macroRange?.fat[1] ?? "",
    savedMeal.confidence ?? "",
    savedMeal.modifiers.join(" | "),
    savedMeal.timesUsed,
    savedMeal.lastUsedAt,
    savedMeal.isPinned,
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");
}

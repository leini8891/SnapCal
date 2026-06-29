import type {
  LoggedMeal,
  MealConfidence,
  NutritionEstimate,
  Range,
  SavedMeal,
} from "@/lib/mock-data";

export type QuickMealShortcut = {
  key: string;
  name: string;
  modifiers: string[];
  kcalRange: Range;
  macroRange?: NutritionEstimate | null;
  confidence?: MealConfidence | null;
  source: LoggedMeal["source"];
  timesLogged: number;
  lastLoggedAt: string;
};

export type SavedMealSeed = Omit<SavedMeal, "id">;
export type DayGroup = {
  dayKey: string;
  label: string;
  logs: LoggedMeal[];
  totalRange: Range;
  macroRange: NutritionEstimate | null;
};

export type HistoryAnalytics = {
  groupedDays: DayGroup[];
  shortcuts: QuickMealShortcut[];
  correctionRate: number;
  repeatMealShare: number;
  currentStreak: number;
  bestStreak: number;
  weekendAverage: number;
  weekdayAverage: number;
  weekendDrift: number;
  averageRemaining: number;
  onTargetDays: number;
  overTargetDays: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  nutritionCoverage: number;
};

export type ShortcutImpact = {
  key: string;
  name: string;
  timesLogged: number;
  kcalRange: Range;
  deltaFromMealBudget: number;
  label: "Budget saver" | "Balanced anchor" | "Heavy hitter";
  note: string;
};

const singaporeDayFormatter = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const singaporeTimeFormatter = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore",
  hour: "numeric",
  minute: "2-digit",
});

const singaporeLabelFormatter = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore",
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function formatCalories(range: Range) {
  return `${range[0]}-${range[1]} kcal`;
}

export function formatMacroRange(range: Range) {
  return `${range[0]}-${range[1]}g`;
}

export function formatMacroSummary(
  macroRange?: NutritionEstimate | null,
  language: "en" | "zh" = "en",
) {
  if (!macroRange) {
    return null;
  }

  if (language === "zh") {
    return [
      `蛋白质 ${formatMacroRange(macroRange.protein)}`,
      `碳水 ${formatMacroRange(macroRange.carbs)}`,
      `脂肪 ${formatMacroRange(macroRange.fat)}`,
    ].join(" · ");
  }

  return [
    `P ${formatMacroRange(macroRange.protein)}`,
    `C ${formatMacroRange(macroRange.carbs)}`,
    `F ${formatMacroRange(macroRange.fat)}`,
  ].join(" · ");
}

export function formatSignedCalories(value: number) {
  return `${value >= 0 ? "+" : ""}${value} kcal`;
}

export function rangeMidpoint(range: Range) {
  return Math.round((range[0] + range[1]) / 2);
}

export function sumRanges(logs: LoggedMeal[]) {
  return logs.reduce<Range>(
    (total, log) => [total[0] + log.kcalRange[0], total[1] + log.kcalRange[1]],
    [0, 0],
  );
}

export function sumNutritionEstimates(logs: LoggedMeal[]) {
  const logsWithNutrition = logs.filter(
    (log): log is LoggedMeal & { macroRange: NutritionEstimate } =>
      Boolean(log.macroRange),
  );

  if (logsWithNutrition.length === 0) {
    return null;
  }

  return logsWithNutrition.reduce<NutritionEstimate>(
    (total, log) => ({
      protein: [
        total.protein[0] + log.macroRange.protein[0],
        total.protein[1] + log.macroRange.protein[1],
      ],
      carbs: [
        total.carbs[0] + log.macroRange.carbs[0],
        total.carbs[1] + log.macroRange.carbs[1],
      ],
      fat: [
        total.fat[0] + log.macroRange.fat[0],
        total.fat[1] + log.macroRange.fat[1],
      ],
    }),
    {
      protein: [0, 0],
      carbs: [0, 0],
      fat: [0, 0],
    },
  );
}

export function sourceLabel(mode: LoggedMeal["source"]) {
  if (mode === "camera") {
    return "Camera";
  }

  if (mode === "gallery") {
    return "Gallery";
  }

  return "Text";
}

export function buildMealShortcutKey({
  name,
  kcalRange,
  modifiers,
}: {
  name: string;
  kcalRange: Range;
  modifiers: string[];
}) {
  return [
    name,
    kcalRange[0],
    kcalRange[1],
    [...modifiers].sort().join("|"),
  ].join("::");
}

export function sortLogsNewestFirst(logs: LoggedMeal[]) {
  return [...logs].sort(
    (left, right) =>
      new Date(right.loggedAt).getTime() - new Date(left.loggedAt).getTime(),
  );
}

export function formatLoggedTime(loggedAt: string) {
  return singaporeTimeFormatter.format(new Date(loggedAt));
}

export function sortSavedMeals(savedMeals: SavedMeal[]) {
  return [...savedMeals].sort((left, right) => {
    if (left.isPinned !== right.isPinned) {
      return left.isPinned ? -1 : 1;
    }

    if (right.timesUsed !== left.timesUsed) {
      return right.timesUsed - left.timesUsed;
    }

    return (
      new Date(right.lastUsedAt).getTime() -
      new Date(left.lastUsedAt).getTime()
    );
  });
}

export function getSingaporeDayKey(loggedAt: string | Date) {
  const parts = singaporeDayFormatter.formatToParts(new Date(loggedAt));
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

export function formatDayLabel(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00+08:00`);
  return singaporeLabelFormatter.format(date);
}

export function isTodayInSingapore(loggedAt: string) {
  return getSingaporeDayKey(loggedAt) === getSingaporeDayKey(new Date());
}

export function groupLogsByDay(logs: LoggedMeal[]) {
  const groups = new Map<string, LoggedMeal[]>();

  for (const log of sortLogsNewestFirst(logs)) {
    const key = getSingaporeDayKey(log.loggedAt);
    const bucket = groups.get(key) ?? [];
    bucket.push(log);
    groups.set(key, bucket);
  }

  return Array.from(groups.entries()).map(([dayKey, dayLogs]) => ({
    dayKey,
    label: formatDayLabel(dayKey),
    logs: dayLogs,
    totalRange: sumRanges(dayLogs),
    macroRange: sumNutritionEstimates(dayLogs),
  })) satisfies DayGroup[];
}

function getSingaporeDayDate(dayKey: string) {
  return new Date(`${dayKey}T00:00:00+08:00`);
}

function dayKeyDiff(left: string, right: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round(
    (getSingaporeDayDate(left).getTime() - getSingaporeDayDate(right).getTime()) /
      millisecondsPerDay,
  );
}

function isWeekendDayKey(dayKey: string) {
  const day = getSingaporeDayDate(dayKey).getDay();
  return day === 0 || day === 6;
}

function calculateCurrentStreak(groups: DayGroup[]) {
  if (groups.length === 0) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < groups.length; index += 1) {
    if (dayKeyDiff(groups[index - 1].dayKey, groups[index].dayKey) !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function calculateBestStreak(groups: DayGroup[]) {
  if (groups.length === 0) {
    return 0;
  }

  let best = 1;
  let streak = 1;

  for (let index = 1; index < groups.length; index += 1) {
    if (dayKeyDiff(groups[index - 1].dayKey, groups[index].dayKey) === 1) {
      streak += 1;
      best = Math.max(best, streak);
      continue;
    }

    streak = 1;
  }

  return best;
}

export function buildQuickMealShortcuts(logs: LoggedMeal[]) {
  const grouped = new Map<string, QuickMealShortcut>();

  for (const log of sortLogsNewestFirst(logs)) {
    const key = buildMealShortcutKey({
      name: log.name,
      kcalRange: log.kcalRange,
      modifiers: log.modifiers,
    });
    const existing = grouped.get(key);

    if (existing) {
      grouped.set(key, {
        ...existing,
        macroRange: existing.macroRange ?? log.macroRange,
        confidence: existing.confidence ?? log.confidence,
        timesLogged: existing.timesLogged + 1,
        lastLoggedAt:
          new Date(log.loggedAt).getTime() > new Date(existing.lastLoggedAt).getTime()
            ? log.loggedAt
            : existing.lastLoggedAt,
      });
      continue;
    }

    grouped.set(key, {
      key,
      name: log.name,
      modifiers: log.modifiers,
      kcalRange: log.kcalRange,
      macroRange: log.macroRange ?? null,
      confidence: log.confidence ?? null,
      source: log.source,
      timesLogged: 1,
      lastLoggedAt: log.loggedAt,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => {
    if (right.timesLogged !== left.timesLogged) {
      return right.timesLogged - left.timesLogged;
    }

    return (
      new Date(right.lastLoggedAt).getTime() -
      new Date(left.lastLoggedAt).getTime()
    );
  });
}

export function buildAutoSavedMealSeeds(logs: LoggedMeal[]) {
  return buildQuickMealShortcuts(logs)
    .filter((shortcut) => shortcut.timesLogged >= 2)
    .map(
      (shortcut) =>
        ({
          shortcutKey: shortcut.key,
          name: shortcut.name,
          modifiers: shortcut.modifiers,
          kcalRange: shortcut.kcalRange,
          macroRange: shortcut.macroRange ?? null,
          confidence: shortcut.confidence ?? null,
          timesUsed: shortcut.timesLogged,
          lastUsedAt: shortcut.lastLoggedAt,
          isPinned: false,
        }) satisfies SavedMealSeed,
    );
}

export function summarizeHistoryAnalytics(
  logs: LoggedMeal[],
  goal: number,
): HistoryAnalytics {
  const groupedDays = groupLogsByDay(logs);
  const shortcuts = buildQuickMealShortcuts(logs);
  const repeatedLogCount = shortcuts
    .filter((shortcut) => shortcut.timesLogged >= 2)
    .reduce((sum, shortcut) => sum + shortcut.timesLogged, 0);
  const weekendGroups = groupedDays.filter((group) => isWeekendDayKey(group.dayKey));
  const weekdayGroups = groupedDays.filter((group) => !isWeekendDayKey(group.dayKey));
  const weekendAverage =
    weekendGroups.length > 0
      ? Math.round(
          weekendGroups.reduce(
            (sum, group) => sum + rangeMidpoint(group.totalRange),
            0,
          ) / weekendGroups.length,
        )
      : 0;
  const weekdayAverage =
    weekdayGroups.length > 0
      ? Math.round(
          weekdayGroups.reduce(
            (sum, group) => sum + rangeMidpoint(group.totalRange),
            0,
          ) / weekdayGroups.length,
        )
      : 0;
  const onTargetDays = groupedDays.filter(
    (group) => rangeMidpoint(group.totalRange) <= goal,
  ).length;
  const overTargetDays = groupedDays.length - onTargetDays;
  const averageRemaining =
    groupedDays.length > 0
      ? Math.round(
          groupedDays.reduce(
            (sum, group) => sum + (goal - rangeMidpoint(group.totalRange)),
            0,
          ) / groupedDays.length,
        )
      : 0;
  const groupsWithNutrition = groupedDays.filter(
    (group): group is DayGroup & { macroRange: NutritionEstimate } =>
      Boolean(group.macroRange),
  );

  return {
    groupedDays,
    shortcuts,
    correctionRate:
      logs.length > 0
        ? Math.round(
            (logs.filter((log) => log.modifiers.length > 0).length / logs.length) *
              100,
          )
        : 0,
    repeatMealShare:
      logs.length > 0
        ? Math.round((repeatedLogCount / logs.length) * 100)
        : 0,
    currentStreak: calculateCurrentStreak(groupedDays),
    bestStreak: calculateBestStreak(groupedDays),
    weekendAverage,
    weekdayAverage,
    weekendDrift: weekendAverage - weekdayAverage,
    averageRemaining,
    onTargetDays,
    overTargetDays,
    averageProtein:
      groupsWithNutrition.length > 0
        ? Math.round(
            groupsWithNutrition.reduce(
              (sum, group) =>
                sum + rangeMidpoint(group.macroRange.protein),
              0,
            ) / groupsWithNutrition.length,
          )
        : 0,
    averageCarbs:
      groupsWithNutrition.length > 0
        ? Math.round(
            groupsWithNutrition.reduce(
              (sum, group) =>
                sum + rangeMidpoint(group.macroRange.carbs),
              0,
            ) / groupsWithNutrition.length,
          )
        : 0,
    averageFat:
      groupsWithNutrition.length > 0
        ? Math.round(
            groupsWithNutrition.reduce(
              (sum, group) =>
                sum + rangeMidpoint(group.macroRange.fat),
              0,
            ) / groupsWithNutrition.length,
          )
        : 0,
    nutritionCoverage:
      logs.length > 0
        ? Math.round(
            (logs.filter((log) => Boolean(log.macroRange)).length / logs.length) *
              100,
          )
        : 0,
  };
}

export function summarizeShortcutImpact(
  logs: LoggedMeal[],
  goal: number,
): ShortcutImpact[] {
  const referenceMealBudget = Math.round(goal / 3);

  return buildQuickMealShortcuts(logs)
    .slice(0, 5)
    .map((shortcut) => {
      const midpoint = rangeMidpoint(shortcut.kcalRange);
      const deltaFromMealBudget = midpoint - referenceMealBudget;

      if (deltaFromMealBudget <= -120) {
        return {
          key: shortcut.key,
          name: shortcut.name,
          timesLogged: shortcut.timesLogged,
          kcalRange: shortcut.kcalRange,
          deltaFromMealBudget,
          label: "Budget saver" as const,
          note: "This repeat meal usually lands well under a one-third daily budget slice.",
        };
      }

      if (deltaFromMealBudget <= 80) {
        return {
          key: shortcut.key,
          name: shortcut.name,
          timesLogged: shortcut.timesLogged,
          kcalRange: shortcut.kcalRange,
          deltaFromMealBudget,
          label: "Balanced anchor" as const,
          note: "This is close to a sustainable default meal for a normal workday.",
        };
      }

      return {
        key: shortcut.key,
        name: shortcut.name,
        timesLogged: shortcut.timesLogged,
        kcalRange: shortcut.kcalRange,
        deltaFromMealBudget,
        label: "Heavy hitter" as const,
        note: "This repeat meal is useful to track closely because it tends to consume a big chunk of the daily budget.",
      };
    });
}

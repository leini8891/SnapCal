"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  budgetGoal,
  firstRunProfile,
  proPilotLogs,
  proPilotProfile,
  proPilotSavedMeals,
  starterProfile,
  starterSavedMeals,
  starterLogs,
  type DailyWellnessRecord,
  type DemoScenario,
  type LoggedMeal,
  type MealConfidence,
  type NutritionEstimate,
  type PilotProfile,
  type SavedMeal,
  type ActivityLevel,
  type Sex,
} from "@/lib/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env";
import { buildNutritionGuessFromNameAndModifiers } from "@/lib/nutrition-estimate";
import { clampGoal } from "@/lib/tdee";
import {
  buildAutoSavedMealSeeds,
  buildMealShortcutKey,
  sortLogsNewestFirst,
  sortSavedMeals,
} from "@/lib/snapcal-utils";

const STORAGE_KEY = "snapcal.v1";
const LANGUAGE_STORAGE_KEY = "snapcal.language";

export type SnapCalLanguage = "en" | "zh";

type PersistedSnapCalState = {
  goal: number;
  logs: LoggedMeal[];
  savedMeals: SavedMeal[];
  wellnessRecords: DailyWellnessRecord[];
  profile: PilotProfile;
};

type StorageMode = "local" | "supabase";
type SyncStatus = "idle" | "syncing" | "ready" | "error";
type AuthStatus = "idle" | "loading" | "success" | "error";
type AuthCredentials = {
  email: string;
  password: string;
};

type WellnessRecordInput = {
  dayKey: string;
  weightKg?: number | null;
  weightNote?: string | null;
  calorieRange?: DailyWellnessRecord["calorieRange"];
  dietScore?: number | null;
  mealHighlights?: string[];
  improvementPoints?: string[];
  exerciseNote?: string | null;
  sleepNote?: string | null;
  sourceNote?: string;
};

type SnapCalContextValue = {
  goal: number;
  logs: LoggedMeal[];
  savedMeals: SavedMeal[];
  wellnessRecords: DailyWellnessRecord[];
  profile: PilotProfile;
  language: SnapCalLanguage;
  cloudConfigured: boolean;
  cloudUserId: string | null;
  authUserEmail: string | null;
  authStatus: AuthStatus;
  authMessage: string;
  lastSyncedAt: string | null;
  hydrated: boolean;
  storageMode: StorageMode;
  syncStatus: SyncStatus;
  syncMessage: string;
  addLog: (log: LoggedMeal) => void;
  updateLog: (
    id: string,
    updates: Partial<
      Pick<
        LoggedMeal,
        "name" | "loggedAt" | "kcalRange" | "macroRange" | "confidence" | "modifiers" | "source"
      >
    >,
  ) => void;
  removeLog: (id: string) => void;
  upsertWellnessRecord: (input: WellnessRecordInput) => void;
  saveSavedMeal: (input: {
    name: string;
    modifiers: string[];
    kcalRange: SavedMeal["kcalRange"];
    macroRange?: SavedMeal["macroRange"];
    confidence?: SavedMeal["confidence"];
    isPinned?: boolean;
  }) => void;
  updateSavedMeal: (
    id: string,
    updates: Partial<Pick<SavedMeal, "name" | "modifiers" | "isPinned">>,
  ) => void;
  removeSavedMeal: (id: string) => void;
  clearLogs: () => void;
  startFreshLivePilot: () => void;
  restoreDemo: () => void;
  setGoal: (goal: number) => void;
  completeOnboarding: (input: {
    displayName: string;
    goal: number;
    goalPace: PilotProfile["goalPace"];
    plan: PilotProfile["plan"];
    sex: Sex | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
    activityLevel: ActivityLevel | null;
    proteinGoalG: number | null;
  }) => void;
  setPlan: (plan: PilotProfile["plan"]) => void;
  setLanguage: (language: SnapCalLanguage) => void;
  toggleLanguage: () => void;
  markPricingGateSeen: () => void;
  signIn: (input: AuthCredentials) => Promise<boolean>;
  signUp: (input: AuthCredentials) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  syncNow: () => void;
  retryCloudConnection: () => void;
  loadDemoScenario: (scenario: DemoScenario) => void;
};

type MealLogRow = {
  id: string;
  meal_name: string;
  logged_at: string;
  kcal_low: number;
  kcal_high: number;
  modifiers: string[] | null;
  source: LoggedMeal["source"];
  draft_metadata: Record<string, unknown> | null;
};

type SavedMealRow = {
  id: string;
  shortcut_key: string;
  meal_name: string;
  default_modifiers: string[] | null;
  default_metadata?: Record<string, unknown> | null;
  kcal_low: number;
  kcal_high: number;
  times_used: number;
  last_used_at: string;
  is_pinned: boolean;
};

type ProfileRow = {
  daily_calorie_goal: number;
  display_name: string | null;
  goal_pace: PilotProfile["goalPace"] | null;
  membership_plan: PilotProfile["plan"] | null;
  onboarding_completed_at: string | null;
  pricing_gate_seen_at: string | null;
  sex?: Sex | null;
  age?: number | string | null;
  height_cm?: number | string | null;
  weight_kg?: number | string | null;
  activity_level?: ActivityLevel | null;
  protein_goal?: number | string | null;
};

type WellnessRecordRow = {
  day_key: string;
  weight_kg: number | string | null;
  weight_note: string | null;
  calorie_low: number | null;
  calorie_high: number | null;
  diet_score: number | null;
  meal_highlights: string[] | null;
  improvement_points: string[] | null;
  exercise_note: string | null;
  sleep_note: string | null;
  source_note: string | null;
};

const SnapCalContext = createContext<SnapCalContextValue | undefined>(undefined);

function buildFreshLiveSnapshot(): PersistedSnapCalState {
  return {
    goal: budgetGoal,
    logs: [],
    savedMeals: [],
    wellnessRecords: [],
    profile: { ...firstRunProfile },
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function ensureUuid(value: unknown) {
  if (typeof value === "string" && isUuid(value)) {
    return value;
  }

  return crypto.randomUUID();
}

function sanitizeGoalPace(
  value: unknown,
): PilotProfile["goalPace"] {
  return value === "gentle" || value === "focused" || value === "steady"
    ? value
    : starterProfile.goalPace;
}

function sanitizePlan(value: unknown): PilotProfile["plan"] {
  return value === "pro" || value === "free" ? value : starterProfile.plan;
}

function sanitizeSex(value: unknown): Sex | null {
  return value === "male" || value === "female" ? value : null;
}

function sanitizeActivityLevel(value: unknown): ActivityLevel | null {
  return value === "sedentary" ||
    value === "light" ||
    value === "moderate" ||
    value === "active" ||
    value === "very_active"
    ? value
    : null;
}

function sanitizeLanguage(value: unknown): SnapCalLanguage {
  return value === "en" || value === "zh" ? value : "zh";
}

function readStoredLanguage(): SnapCalLanguage {
  try {
    return sanitizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return "zh";
  }
}

function writeStoredLanguage(language: SnapCalLanguage) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Language is a UI preference, so storage failures should not block the app.
  }
}

function isValidRange(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function sanitizeMealConfidence(value: unknown): MealConfidence | null {
  return value === "High" || value === "Medium" || value === "Low"
    ? value
    : null;
}

function sanitizeNutritionEstimate(
  value: unknown,
): NutritionEstimate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    !isValidRange(record.protein) ||
    !isValidRange(record.carbs) ||
    !isValidRange(record.fat)
  ) {
    return null;
  }

  return {
    protein: record.protein,
    carbs: record.carbs,
    fat: record.fat,
  };
}

function sanitizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function sanitizeNullableRange(value: unknown): [number, number] | null {
  return isValidRange(value) ? [value[0], value[1]] : null;
}

function sanitizeNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function sanitizePositiveNumber(value: unknown): number | null {
  const parsed = sanitizeNullableNumber(value);

  return parsed !== null && parsed > 0 ? parsed : null;
}

function sanitizePositiveInteger(value: unknown): number | null {
  const parsed = sanitizePositiveNumber(value);

  return parsed !== null ? Math.round(parsed) : null;
}

function sanitizeWellnessRecords(input: unknown): DailyWellnessRecord[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap((record): DailyWellnessRecord[] => {
    if (!record || typeof record !== "object") {
      return [];
    }

    const candidate = record as Record<string, unknown>;
    if (typeof candidate.dayKey !== "string") {
      return [];
    }

    return [
      {
        dayKey: candidate.dayKey,
        weightKg:
          typeof candidate.weightKg === "number" ? candidate.weightKg : null,
        weightNote:
          typeof candidate.weightNote === "string"
            ? candidate.weightNote
            : undefined,
        calorieRange: sanitizeNullableRange(candidate.calorieRange),
        dietScore:
          typeof candidate.dietScore === "number"
            ? Math.min(100, Math.max(0, Math.round(candidate.dietScore)))
            : null,
        mealHighlights: sanitizeStringArray(candidate.mealHighlights),
        improvementPoints: sanitizeStringArray(candidate.improvementPoints),
        exerciseNote:
          typeof candidate.exerciseNote === "string"
            ? candidate.exerciseNote
            : undefined,
        sleepNote:
          typeof candidate.sleepNote === "string"
            ? candidate.sleepNote
            : undefined,
        sourceNote:
          typeof candidate.sourceNote === "string"
            ? candidate.sourceNote
            : "Imported user record.",
      },
    ];
  });
}

function mergeWellnessRecord(
  records: DailyWellnessRecord[],
  input: WellnessRecordInput,
) {
  const existingRecord = records.find((record) => record.dayKey === input.dayKey);
  const parsedDietScore = sanitizeNullableNumber(input.dietScore);
  const nextRecord: DailyWellnessRecord = {
    dayKey: input.dayKey,
    weightKg:
      input.weightKg === undefined
        ? existingRecord?.weightKg ?? null
        : sanitizePositiveNumber(input.weightKg),
    weightNote:
      input.weightNote === undefined
        ? existingRecord?.weightNote
        : input.weightNote?.trim() || undefined,
    calorieRange:
      input.calorieRange === undefined
        ? existingRecord?.calorieRange ?? null
        : input.calorieRange,
    dietScore:
      input.dietScore === undefined
        ? existingRecord?.dietScore ?? null
        : parsedDietScore !== null
          ? Math.min(100, Math.max(0, Math.round(parsedDietScore)))
          : null,
    mealHighlights: input.mealHighlights ?? existingRecord?.mealHighlights ?? [],
    improvementPoints:
      input.improvementPoints ?? existingRecord?.improvementPoints ?? [],
    exerciseNote:
      input.exerciseNote === undefined
        ? existingRecord?.exerciseNote
        : input.exerciseNote?.trim() || undefined,
    sleepNote:
      input.sleepNote === undefined
        ? existingRecord?.sleepNote
        : input.sleepNote?.trim() || undefined,
    sourceNote: input.sourceNote ?? existingRecord?.sourceNote ?? "Manual user record.",
  };

  return [
    ...records.filter((record) => record.dayKey !== input.dayKey),
    nextRecord,
  ].sort((left, right) => left.dayKey.localeCompare(right.dayKey));
}

function sanitizeProfile(
  input: unknown,
): PilotProfile {
  if (!input || typeof input !== "object") {
    return { ...starterProfile };
  }

  const record = input as Record<string, unknown>;

  return {
    displayName:
      typeof record.displayName === "string"
        ? record.displayName.trim()
        : starterProfile.displayName,
    goalPace: sanitizeGoalPace(record.goalPace),
    plan: sanitizePlan(record.plan),
    onboardingCompletedAt:
      typeof record.onboardingCompletedAt === "string"
        ? record.onboardingCompletedAt
        : null,
    pricingGateSeenAt:
      typeof record.pricingGateSeenAt === "string"
        ? record.pricingGateSeenAt
        : null,
    sex: sanitizeSex(record.sex),
    age: sanitizePositiveInteger(record.age),
    heightCm: sanitizePositiveNumber(record.heightCm),
    weightKg: sanitizePositiveNumber(record.weightKg),
    activityLevel: sanitizeActivityLevel(record.activityLevel),
    proteinGoalG: sanitizePositiveInteger(record.proteinGoalG),
  };
}

function sanitizePersistedState(
  input: unknown,
): PersistedSnapCalState | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const record = input as Record<string, unknown>;
  if (typeof record.goal !== "number" || !Array.isArray(record.logs)) {
    return null;
  }

  const logs = record.logs.flatMap((log): LoggedMeal[] => {
    if (!log || typeof log !== "object") {
      return [];
    }

    const candidate = log as Record<string, unknown>;
    if (
      typeof candidate.name !== "string" ||
      typeof candidate.loggedAt !== "string" ||
      !Array.isArray(candidate.kcalRange) ||
      candidate.kcalRange.length !== 2 ||
      typeof candidate.kcalRange[0] !== "number" ||
      typeof candidate.kcalRange[1] !== "number" ||
      !Array.isArray(candidate.modifiers) ||
      (candidate.source !== "camera" &&
        candidate.source !== "gallery" &&
        candidate.source !== "text")
    ) {
      return [];
    }

    return [
      {
        id: ensureUuid(candidate.id),
        name: candidate.name,
        loggedAt: candidate.loggedAt,
        kcalRange: [candidate.kcalRange[0], candidate.kcalRange[1]],
        macroRange: sanitizeNutritionEstimate(candidate.macroRange),
        confidence: sanitizeMealConfidence(candidate.confidence),
        modifiers: candidate.modifiers.filter(
          (modifier): modifier is string => typeof modifier === "string",
        ),
        source: candidate.source,
      },
    ];
  });

  const savedMeals = Array.isArray(record.savedMeals)
    ? record.savedMeals.flatMap((savedMeal): SavedMeal[] => {
        if (!savedMeal || typeof savedMeal !== "object") {
          return [];
        }

        const candidate = savedMeal as Record<string, unknown>;
        if (
          typeof candidate.shortcutKey !== "string" ||
          typeof candidate.name !== "string" ||
          !Array.isArray(candidate.kcalRange) ||
          candidate.kcalRange.length !== 2 ||
          typeof candidate.kcalRange[0] !== "number" ||
          typeof candidate.kcalRange[1] !== "number" ||
          !Array.isArray(candidate.modifiers) ||
          typeof candidate.timesUsed !== "number" ||
          typeof candidate.lastUsedAt !== "string"
        ) {
          return [];
        }

        return [
          {
            id: ensureUuid(candidate.id),
            shortcutKey: candidate.shortcutKey,
            name: candidate.name,
            modifiers: candidate.modifiers.filter(
              (modifier): modifier is string => typeof modifier === "string",
            ),
            kcalRange: [candidate.kcalRange[0], candidate.kcalRange[1]],
            macroRange: sanitizeNutritionEstimate(candidate.macroRange),
            confidence: sanitizeMealConfidence(candidate.confidence),
            timesUsed: Math.max(0, Math.round(candidate.timesUsed)),
            lastUsedAt: candidate.lastUsedAt,
            isPinned: candidate.isPinned === true,
          },
        ];
      })
    : [];

  return {
    goal: clampGoal(record.goal),
    logs: sortLogsNewestFirst(logs),
    savedMeals:
      savedMeals.length > 0
        ? sortSavedMeals(savedMeals)
        : buildNextSavedMeals([], logs),
    wellnessRecords: sanitizeWellnessRecords(record.wellnessRecords),
    profile: sanitizeProfile(record.profile),
  };
}

function mapRowToLoggedMeal(row: MealLogRow): LoggedMeal {
  const metadata = row.draft_metadata;

  return {
    id: ensureUuid(row.id),
    name: row.meal_name,
    loggedAt: row.logged_at,
    kcalRange: [row.kcal_low, row.kcal_high],
    macroRange: sanitizeNutritionEstimate(
      metadata && typeof metadata === "object"
        ? (metadata as Record<string, unknown>).macroRange
        : null,
    ),
    confidence: sanitizeMealConfidence(
      metadata && typeof metadata === "object"
        ? (metadata as Record<string, unknown>).confidence
        : null,
    ),
    modifiers: row.modifiers ?? [],
    source: row.source,
  };
}

function mapRowToSavedMeal(row: SavedMealRow): SavedMeal {
  const metadata = row.default_metadata;

  return {
    id: ensureUuid(row.id),
    shortcutKey: row.shortcut_key,
    name: row.meal_name,
    modifiers: row.default_modifiers ?? [],
    kcalRange: [row.kcal_low, row.kcal_high],
    macroRange: sanitizeNutritionEstimate(
      metadata && typeof metadata === "object"
        ? (metadata as Record<string, unknown>).macroRange
        : null,
    ),
    confidence: sanitizeMealConfidence(
      metadata && typeof metadata === "object"
        ? (metadata as Record<string, unknown>).confidence
        : null,
    ),
    timesUsed: row.times_used,
    lastUsedAt: row.last_used_at,
    isPinned: row.is_pinned,
  };
}

function mapRowToProfile(row: ProfileRow | null | undefined): PilotProfile {
  return {
    displayName:
      typeof row?.display_name === "string" && row.display_name.trim()
        ? row.display_name.trim()
        : starterProfile.displayName,
    goalPace: sanitizeGoalPace(row?.goal_pace),
    plan: sanitizePlan(row?.membership_plan),
    onboardingCompletedAt: row?.onboarding_completed_at ?? null,
    pricingGateSeenAt: row?.pricing_gate_seen_at ?? null,
    sex: sanitizeSex(row?.sex),
    age: sanitizePositiveInteger(row?.age),
    heightCm: sanitizePositiveNumber(row?.height_cm),
    weightKg: sanitizePositiveNumber(row?.weight_kg),
    activityLevel: sanitizeActivityLevel(row?.activity_level),
    proteinGoalG: sanitizePositiveInteger(row?.protein_goal),
  };
}

function mapRowToWellnessRecord(row: WellnessRecordRow): DailyWellnessRecord {
  const calorieLow = sanitizeNullableNumber(row.calorie_low);
  const calorieHigh = sanitizeNullableNumber(row.calorie_high);
  const dietScore = sanitizeNullableNumber(row.diet_score);

  return {
    dayKey: row.day_key,
    weightKg: sanitizeNullableNumber(row.weight_kg),
    weightNote: row.weight_note ?? undefined,
    calorieRange:
      calorieLow !== null && calorieHigh !== null ? [calorieLow, calorieHigh] : null,
    dietScore:
      dietScore !== null
        ? Math.min(100, Math.max(0, Math.round(dietScore)))
        : null,
    mealHighlights: row.meal_highlights ?? [],
    improvementPoints: row.improvement_points ?? [],
    exerciseNote: row.exercise_note ?? undefined,
    sleepNote: row.sleep_note ?? undefined,
    sourceNote: row.source_note ?? "Imported user record.",
  };
}

function mapLogToInsert(userId: string, log: LoggedMeal) {
  return {
    id: ensureUuid(log.id),
    user_id: userId,
    meal_name: log.name,
    logged_at: log.loggedAt,
    kcal_low: log.kcalRange[0],
    kcal_high: log.kcalRange[1],
    modifiers: log.modifiers,
    source: log.source,
    draft_metadata: {
      macroRange: log.macroRange ?? null,
      confidence: log.confidence ?? null,
    },
  };
}

function mapSavedMealToInsert(userId: string, savedMeal: SavedMeal) {
  return {
    id: ensureUuid(savedMeal.id),
    user_id: userId,
    shortcut_key: savedMeal.shortcutKey,
    meal_name: savedMeal.name,
    default_modifiers: savedMeal.modifiers,
    default_metadata: {
      macroRange: savedMeal.macroRange ?? null,
      confidence: savedMeal.confidence ?? null,
    },
    kcal_low: savedMeal.kcalRange[0],
    kcal_high: savedMeal.kcalRange[1],
    times_used: savedMeal.timesUsed,
    last_used_at: savedMeal.lastUsedAt,
    is_pinned: savedMeal.isPinned,
  };
}

function mapWellnessRecordToInsert(
  userId: string,
  record: DailyWellnessRecord,
) {
  return {
    user_id: userId,
    day_key: record.dayKey,
    weight_kg: record.weightKg,
    weight_note: record.weightNote ?? null,
    calorie_low: record.calorieRange?.[0] ?? null,
    calorie_high: record.calorieRange?.[1] ?? null,
    diet_score: record.dietScore,
    meal_highlights: record.mealHighlights,
    improvement_points: record.improvementPoints,
    exercise_note: record.exerciseNote ?? null,
    sleep_note: record.sleepNote ?? null,
    source_note: record.sourceNote,
  };
}

function mapProfileToUpsert(
  userId: string,
  goal: number,
  profile: PilotProfile,
) {
  return {
    id: userId,
    daily_calorie_goal: goal,
    display_name: profile.displayName || null,
    goal_pace: profile.goalPace,
    membership_plan: profile.plan,
    onboarding_completed_at: profile.onboardingCompletedAt,
    pricing_gate_seen_at: profile.pricingGateSeenAt,
    sex: profile.sex ?? null,
    age: profile.age ?? null,
    height_cm: profile.heightCm ?? null,
    weight_kg: profile.weightKg ?? null,
    activity_level: profile.activityLevel ?? null,
    protein_goal: profile.proteinGoalG ?? null,
  };
}

function isMissingSavedMealMetadataColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Record<string, unknown>;
  const combinedMessage = [
    typeof candidate.message === "string" ? candidate.message : "",
    typeof candidate.details === "string" ? candidate.details : "",
    typeof candidate.hint === "string" ? candidate.hint : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return combinedMessage.includes("default_metadata");
}

function isMissingProfileBodyMetricsColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Record<string, unknown>;
  const combinedMessage = [
    typeof candidate.message === "string" ? candidate.message : "",
    typeof candidate.details === "string" ? candidate.details : "",
    typeof candidate.hint === "string" ? candidate.hint : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return [
    "height_cm",
    "weight_kg",
    "activity_level",
    "protein_goal",
    "'sex'",
    "\"sex\"",
    "'age'",
    "\"age\"",
  ].some((columnName) => combinedMessage.includes(columnName));
}

async function selectRemoteProfile(
  supabase: SupabaseClient,
  userId: string,
) {
  const withBodyMetricsResult = await supabase
    .from("profiles")
    .select(
      "daily_calorie_goal, display_name, goal_pace, membership_plan, onboarding_completed_at, pricing_gate_seen_at, sex, age, height_cm, weight_kg, activity_level, protein_goal",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!withBodyMetricsResult.error) {
    return withBodyMetricsResult.data;
  }

  if (withBodyMetricsResult.error.code === "PGRST116") {
    return null;
  }

  if (!isMissingProfileBodyMetricsColumnError(withBodyMetricsResult.error)) {
    throw withBodyMetricsResult.error;
  }

  const legacyResult = await supabase
    .from("profiles")
    .select(
      "daily_calorie_goal, display_name, goal_pace, membership_plan, onboarding_completed_at, pricing_gate_seen_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (legacyResult.error && legacyResult.error.code !== "PGRST116") {
    throw legacyResult.error;
  }

  return legacyResult.data ?? null;
}

async function upsertRemoteProfile(
  supabase: SupabaseClient,
  userId: string,
  goal: number,
  profile: PilotProfile,
) {
  const row = mapProfileToUpsert(userId, goal, profile);
  const upsertResult = await supabase.from("profiles").upsert(row);

  if (!upsertResult.error) {
    return;
  }

  if (!isMissingProfileBodyMetricsColumnError(upsertResult.error)) {
    throw upsertResult.error;
  }

  const {
    activity_level: omittedActivityLevel,
    age: omittedAge,
    height_cm: omittedHeightCm,
    protein_goal: omittedProteinGoal,
    sex: omittedSex,
    weight_kg: omittedWeightKg,
    ...legacyRow
  } = row;
  void omittedActivityLevel;
  void omittedAge;
  void omittedHeightCm;
  void omittedProteinGoal;
  void omittedSex;
  void omittedWeightKg;

  const legacyUpsertResult = await supabase.from("profiles").upsert(legacyRow);

  if (legacyUpsertResult.error) {
    throw legacyUpsertResult.error;
  }
}

async function selectRemoteWellnessRecords(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("wellness_records")
    .select(
      "day_key, weight_kg, weight_note, calorie_low, calorie_high, diet_score, meal_highlights, improvement_points, exercise_note, sleep_note, source_note",
    )
    .eq("user_id", userId)
    .order("day_key", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function selectRemoteSavedMeals(
  supabase: SupabaseClient,
  userId: string,
) {
  const withMetadataResult = await supabase
    .from("saved_meals")
    .select(
      "id, shortcut_key, meal_name, default_modifiers, default_metadata, kcal_low, kcal_high, times_used, last_used_at, is_pinned",
    )
    .eq("user_id", userId)
    .order("times_used", { ascending: false })
    .order("last_used_at", { ascending: false });

  if (!withMetadataResult.error) {
    return withMetadataResult.data ?? [];
  }

  if (!isMissingSavedMealMetadataColumnError(withMetadataResult.error)) {
    throw withMetadataResult.error;
  }

  const legacyResult = await supabase
    .from("saved_meals")
    .select(
      "id, shortcut_key, meal_name, default_modifiers, kcal_low, kcal_high, times_used, last_used_at, is_pinned",
    )
    .eq("user_id", userId)
    .order("times_used", { ascending: false })
    .order("last_used_at", { ascending: false });

  if (legacyResult.error) {
    throw legacyResult.error;
  }

  return legacyResult.data ?? [];
}

async function insertRemoteSavedMeals(
  supabase: SupabaseClient,
  userId: string,
  savedMeals: SavedMeal[],
) {
  if (savedMeals.length === 0) {
    return;
  }

  const rows = savedMeals.map((savedMeal) => mapSavedMealToInsert(userId, savedMeal));
  const insertResult = await supabase.from("saved_meals").insert(rows);

  if (!insertResult.error) {
    return;
  }

  if (!isMissingSavedMealMetadataColumnError(insertResult.error)) {
    throw insertResult.error;
  }

  const legacyRows = rows.map((row) => {
    const { default_metadata: omittedMetadata, ...legacyRow } = row;
    void omittedMetadata;
    return legacyRow;
  });
  const legacyInsertResult = await supabase.from("saved_meals").insert(legacyRows);

  if (legacyInsertResult.error) {
    throw legacyInsertResult.error;
  }
}

function readLocalSnapshot() {
  try {
    const persisted = window.localStorage.getItem(STORAGE_KEY);
    if (!persisted) {
      return null;
    }

    return sanitizePersistedState(JSON.parse(persisted));
  } catch {
    return null;
  }
}

function writeLocalSnapshot(snapshot: PersistedSnapCalState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // A storage failure should not block the in-memory logging flow.
  }
}

function clearLocalSnapshot() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Signing out should continue even if browser storage is unavailable.
  }
}

function readAuthErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function getSignUpErrorMessage(error: unknown) {
  const code = readAuthErrorCode(error);

  if (code === "email_address_invalid") {
    return "That email address is not accepted by Supabase Auth.";
  }

  if (code === "over_email_send_rate_limit") {
    return "Supabase email is rate limited. Try again later or disable email confirmation for this private pilot.";
  }

  return "Account creation failed. Try signing in if you already registered.";
}

function buildNextSavedMeals(
  currentSavedMeals: SavedMeal[],
  nextLogs: LoggedMeal[],
) {
  const autoSavedSeeds = buildAutoSavedMealSeeds(nextLogs);
  const savedByKey = new Map<string, SavedMeal>();

  for (const savedMeal of currentSavedMeals) {
    savedByKey.set(savedMeal.shortcutKey, savedMeal);
    savedByKey.set(
      buildMealShortcutKey({
        name: savedMeal.name,
        kcalRange: savedMeal.kcalRange,
        modifiers: savedMeal.modifiers,
      }),
      savedMeal,
    );
  }

  for (const seed of autoSavedSeeds) {
    const existing = savedByKey.get(seed.shortcutKey);

    if (existing) {
      savedByKey.set(seed.shortcutKey, {
        ...existing,
        macroRange: existing.macroRange ?? seed.macroRange ?? null,
        confidence: existing.confidence ?? seed.confidence ?? null,
        timesUsed: Math.max(existing.timesUsed, seed.timesUsed),
        lastUsedAt:
          new Date(seed.lastUsedAt).getTime() >
          new Date(existing.lastUsedAt).getTime()
            ? seed.lastUsedAt
            : existing.lastUsedAt,
      });
      continue;
    }

    savedByKey.set(seed.shortcutKey, {
      id: crypto.randomUUID(),
      ...seed,
    });
  }

  return sortSavedMeals(
    Array.from(
      new Map(
        Array.from(savedByKey.values()).map((savedMeal) => [savedMeal.id, savedMeal] as const),
      ).values(),
    ),
  );
}

function normalizeModifierLabels(modifiers: string[]) {
  return [...new Set(modifiers.map((modifier) => modifier.trim()).filter(Boolean))];
}

function mergeSavedMealEdits(
  currentSavedMeals: SavedMeal[],
  id: string,
  updates: Partial<Pick<SavedMeal, "name" | "modifiers" | "isPinned">>,
) {
  const target = currentSavedMeals.find((savedMeal) => savedMeal.id === id);

  if (!target) {
    return currentSavedMeals;
  }

  const nextName = updates.name?.trim() || target.name;
  const nextModifiers = normalizeModifierLabels(
    updates.modifiers ?? target.modifiers,
  );
  const nextIsPinned = updates.isPinned ?? target.isPinned;
  const recalculatedNutrition = buildNutritionGuessFromNameAndModifiers({
    name: nextName,
    modifiers: nextModifiers,
  });
  const nextContentKey = buildMealShortcutKey({
    name: nextName,
    kcalRange: recalculatedNutrition.kcalRange,
    modifiers: nextModifiers,
  });
  const duplicate = currentSavedMeals.find(
    (savedMeal) =>
      savedMeal.id !== id &&
      (savedMeal.shortcutKey === nextContentKey ||
        buildMealShortcutKey({
          name: savedMeal.name,
          kcalRange: savedMeal.kcalRange,
          modifiers: savedMeal.modifiers,
        }) === nextContentKey),
  );
  const baseSavedMeal: SavedMeal = {
    ...target,
    name: nextName,
    modifiers: nextModifiers,
    kcalRange: recalculatedNutrition.kcalRange,
    macroRange: recalculatedNutrition.macroRange,
    confidence: recalculatedNutrition.confidence,
    isPinned: nextIsPinned,
    shortcutKey: nextContentKey,
  };

  if (!duplicate) {
    return sortSavedMeals(
      currentSavedMeals.map((savedMeal) =>
        savedMeal.id === id ? baseSavedMeal : savedMeal,
      ),
    );
  }

  return sortSavedMeals(
    currentSavedMeals
      .filter((savedMeal) => savedMeal.id !== id && savedMeal.id !== duplicate.id)
      .concat({
        ...duplicate,
        name: baseSavedMeal.name,
        modifiers: baseSavedMeal.modifiers,
        macroRange: baseSavedMeal.macroRange ?? duplicate.macroRange,
        confidence: baseSavedMeal.confidence ?? duplicate.confidence,
        isPinned: duplicate.isPinned || baseSavedMeal.isPinned,
        timesUsed: Math.max(duplicate.timesUsed, baseSavedMeal.timesUsed),
        lastUsedAt:
          new Date(baseSavedMeal.lastUsedAt).getTime() >
          new Date(duplicate.lastUsedAt).getTime()
            ? baseSavedMeal.lastUsedAt
            : duplicate.lastUsedAt,
      }),
  );
}

function saveSavedMealEntry(
  currentSavedMeals: SavedMeal[],
  input: {
    name: string;
    modifiers: string[];
    kcalRange: SavedMeal["kcalRange"];
    macroRange?: SavedMeal["macroRange"];
    confidence?: SavedMeal["confidence"];
    isPinned?: boolean;
  },
) {
  const nextName = input.name.trim();
  if (!nextName) {
    return currentSavedMeals;
  }

  const nextLastUsedAt = new Date().toISOString();
  const nextModifiers = normalizeModifierLabels(input.modifiers);
  const nextShortcutKey = buildMealShortcutKey({
    name: nextName,
    kcalRange: input.kcalRange,
    modifiers: nextModifiers,
  });
  const existing = currentSavedMeals.find(
    (savedMeal) =>
      savedMeal.shortcutKey === nextShortcutKey ||
      buildMealShortcutKey({
        name: savedMeal.name,
        kcalRange: savedMeal.kcalRange,
        modifiers: savedMeal.modifiers,
      }) === nextShortcutKey,
  );

  if (!existing) {
    return sortSavedMeals([
      {
        id: crypto.randomUUID(),
        shortcutKey: nextShortcutKey,
        name: nextName,
        modifiers: nextModifiers,
        kcalRange: input.kcalRange,
        macroRange: input.macroRange ?? null,
        confidence: input.confidence ?? null,
        timesUsed: 1,
        lastUsedAt: nextLastUsedAt,
        isPinned: input.isPinned ?? false,
      },
      ...currentSavedMeals,
    ]);
  }

  return sortSavedMeals(
    currentSavedMeals.map((savedMeal) =>
      savedMeal.id === existing.id
        ? {
            ...savedMeal,
            name: nextName,
            modifiers: nextModifiers,
            macroRange: input.macroRange ?? savedMeal.macroRange,
            confidence: input.confidence ?? savedMeal.confidence,
            isPinned: input.isPinned ?? savedMeal.isPinned,
            timesUsed: Math.max(savedMeal.timesUsed, 1),
            lastUsedAt:
              nextLastUsedAt > savedMeal.lastUsedAt
                ? nextLastUsedAt
                : savedMeal.lastUsedAt,
          }
        : savedMeal,
    ),
  );
}

function buildDemoScenarioSnapshot(scenario: DemoScenario): PersistedSnapCalState {
  if (scenario === "first-run") {
    return {
      goal: budgetGoal,
      logs: [],
      savedMeals: [],
      wellnessRecords: [],
      profile: { ...firstRunProfile },
    };
  }

  if (scenario === "pro-pilot") {
    return {
      goal: 1550,
      logs: sortLogsNewestFirst(proPilotLogs),
      savedMeals: sortSavedMeals(proPilotSavedMeals),
      wellnessRecords: [],
      profile: { ...proPilotProfile },
    };
  }

  return {
    goal: budgetGoal,
    logs: sortLogsNewestFirst(starterLogs),
    savedMeals: sortSavedMeals(starterSavedMeals),
    wellnessRecords: [],
    profile: { ...starterProfile },
  };
}

function rangesEqual(
  left?: [number, number] | null,
  right?: [number, number] | null,
) {
  return (left?.[0] ?? null) === (right?.[0] ?? null) &&
    (left?.[1] ?? null) === (right?.[1] ?? null);
}

function nutritionEqual(
  left?: NutritionEstimate | null,
  right?: NutritionEstimate | null,
) {
  return (
    rangesEqual(left?.protein, right?.protein) &&
    rangesEqual(left?.carbs, right?.carbs) &&
    rangesEqual(left?.fat, right?.fat)
  );
}

function stringArraysEqual(left: string[], right: string[]) {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

function loggedMealsEqual(left: LoggedMeal[], right: LoggedMeal[]) {
  return left.length === right.length &&
    left.every((log, index) => {
      const candidate = right[index];
      return (
        log.id === candidate.id &&
        log.name === candidate.name &&
        log.loggedAt === candidate.loggedAt &&
        rangesEqual(log.kcalRange, candidate.kcalRange) &&
        nutritionEqual(log.macroRange, candidate.macroRange) &&
        (log.confidence ?? null) === (candidate.confidence ?? null) &&
        stringArraysEqual(log.modifiers, candidate.modifiers) &&
        log.source === candidate.source
      );
    });
}

function savedMealsEqual(left: SavedMeal[], right: SavedMeal[]) {
  return left.length === right.length &&
    left.every((savedMeal, index) => {
      const candidate = right[index];
      return (
        savedMeal.id === candidate.id &&
        savedMeal.shortcutKey === candidate.shortcutKey &&
        savedMeal.name === candidate.name &&
        stringArraysEqual(savedMeal.modifiers, candidate.modifiers) &&
        rangesEqual(savedMeal.kcalRange, candidate.kcalRange) &&
        nutritionEqual(savedMeal.macroRange, candidate.macroRange) &&
        (savedMeal.confidence ?? null) === (candidate.confidence ?? null) &&
        savedMeal.timesUsed === candidate.timesUsed &&
        savedMeal.lastUsedAt === candidate.lastUsedAt &&
        savedMeal.isPinned === candidate.isPinned
      );
    });
}

function wellnessRecordsEqual(
  left: DailyWellnessRecord[],
  right: DailyWellnessRecord[],
) {
  return left.length === right.length &&
    left.every((record, index) => {
      const candidate = right[index];
      return (
        record.dayKey === candidate.dayKey &&
        record.weightKg === candidate.weightKg &&
        (record.weightNote ?? null) === (candidate.weightNote ?? null) &&
        rangesEqual(record.calorieRange, candidate.calorieRange) &&
        record.dietScore === candidate.dietScore &&
        stringArraysEqual(record.mealHighlights, candidate.mealHighlights) &&
        stringArraysEqual(record.improvementPoints, candidate.improvementPoints) &&
        (record.exerciseNote ?? null) === (candidate.exerciseNote ?? null) &&
        (record.sleepNote ?? null) === (candidate.sleepNote ?? null) &&
        record.sourceNote === candidate.sourceNote
      );
    });
}

function profilesEqual(left: PilotProfile, right: PilotProfile) {
  return (
    left.displayName === right.displayName &&
    left.goalPace === right.goalPace &&
    left.plan === right.plan &&
    left.onboardingCompletedAt === right.onboardingCompletedAt &&
    left.pricingGateSeenAt === right.pricingGateSeenAt &&
    (left.sex ?? null) === (right.sex ?? null) &&
    (left.age ?? null) === (right.age ?? null) &&
    (left.heightCm ?? null) === (right.heightCm ?? null) &&
    (left.weightKg ?? null) === (right.weightKg ?? null) &&
    (left.activityLevel ?? null) === (right.activityLevel ?? null) &&
    (left.proteinGoalG ?? null) === (right.proteinGoalG ?? null)
  );
}

function snapshotsEqual(
  left: PersistedSnapCalState,
  right: PersistedSnapCalState,
) {
  return (
    left.goal === right.goal &&
    loggedMealsEqual(left.logs, right.logs) &&
    savedMealsEqual(left.savedMeals, right.savedMeals) &&
    wellnessRecordsEqual(left.wellnessRecords, right.wellnessRecords) &&
    profilesEqual(left.profile, right.profile)
  );
}

function isBundledDemoSnapshot(snapshot: PersistedSnapCalState) {
  return (
    snapshotsEqual(snapshot, buildDemoScenarioSnapshot("first-run")) ||
    snapshotsEqual(snapshot, buildDemoScenarioSnapshot("free-pilot")) ||
    snapshotsEqual(snapshot, buildDemoScenarioSnapshot("pro-pilot"))
  );
}

async function replaceRemoteSnapshot(
  supabase: SupabaseClient,
  userId: string,
  goal: number,
  logs: LoggedMeal[],
  savedMeals: SavedMeal[],
  wellnessRecords: DailyWellnessRecord[],
  profile: PilotProfile,
) {
  await upsertRemoteProfile(supabase, userId, goal, profile);

  const { error: deleteError } = await supabase
    .from("meal_logs")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }

  const { error: deleteSavedMealError } = await supabase
    .from("saved_meals")
    .delete()
    .eq("user_id", userId);

  if (deleteSavedMealError) {
    throw deleteSavedMealError;
  }

  const { error: deleteWellnessError } = await supabase
    .from("wellness_records")
    .delete()
    .eq("user_id", userId);

  if (deleteWellnessError) {
    throw deleteWellnessError;
  }

  if (logs.length > 0) {
    const { error: insertError } = await supabase
      .from("meal_logs")
      .insert(logs.map((log) => mapLogToInsert(userId, log)));

    if (insertError) {
      throw insertError;
    }
  }

  await insertRemoteSavedMeals(supabase, userId, savedMeals);

  if (wellnessRecords.length > 0) {
    const { error: insertWellnessError } = await supabase
      .from("wellness_records")
      .insert(
        wellnessRecords.map((record) =>
          mapWellnessRecordToInsert(userId, record),
        ),
      );

    if (insertWellnessError) {
      throw insertWellnessError;
    }
  }
}

export function SnapCalProvider({ children }: { children: ReactNode }) {
  const cloudConfigured = hasSupabaseBrowserEnv();
  const seedSnapshot = buildFreshLiveSnapshot();
  const [goal, setGoalState] = useState(seedSnapshot.goal);
  const [logs, setLogs] = useState<LoggedMeal[]>(seedSnapshot.logs);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(seedSnapshot.savedMeals);
  const [wellnessRecords, setWellnessRecords] = useState<DailyWellnessRecord[]>(
    seedSnapshot.wellnessRecords,
  );
  const [profile, setProfileState] = useState<PilotProfile>(seedSnapshot.profile);
  const [language, setLanguageState] = useState<SnapCalLanguage>("zh");
  const [hydrated, setHydrated] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>(
    hasSupabaseBrowserEnv() ? "supabase" : "local",
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState(
    "Preparing persistence layer...",
  );
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [authUserEmail, setAuthUserEmail] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [authMessage, setAuthMessage] = useState(
    "Sign in to keep SnapCal private and synced.",
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudRetryKey, setCloudRetryKey] = useState(0);

  function applySnapshot(snapshot: PersistedSnapCalState) {
    setGoalState(snapshot.goal);
    setLogs(snapshot.logs);
    setSavedMeals(snapshot.savedMeals);
    setWellnessRecords(snapshot.wellnessRecords);
    setProfileState(snapshot.profile);
  }

  useEffect(() => {
    setLanguageState(readStoredLanguage());
  }, []);

  useEffect(() => {
    let active = true;
    const localSnapshot = readLocalSnapshot();
    const usableLocalSnapshot =
      localSnapshot && !isBundledDemoSnapshot(localSnapshot)
        ? localSnapshot
        : null;
    const freshSnapshot = buildFreshLiveSnapshot();

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      queueMicrotask(() => {
        if (!active) {
          return;
        }

        applySnapshot(usableLocalSnapshot ?? freshSnapshot);
        setStorageMode("local");
        setSupabaseUserId(null);
        setAuthUserEmail(null);
        setLastSyncedAt(null);
        setSyncStatus("ready");
        setSyncMessage(
          "Running in browser storage. Add Supabase env vars to sync across devices.",
        );
        setHydrated(true);
      });

      return () => {
        active = false;
      };
    }

    async function connectSupabase() {
      const supabaseClient = supabase;
      if (!supabaseClient) {
        return;
      }

      try {
        if (!active) {
          return;
        }

        setStorageMode("supabase");
        setSyncStatus("syncing");
        setSyncMessage("Connecting to Supabase...");

        const { data: sessionData, error: sessionError } =
          await supabaseClient.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const sessionUser = sessionData.session?.user ?? null;

        if (!sessionUser) {
          if (!active) {
            return;
          }

          applySnapshot(freshSnapshot);
          setSupabaseUserId(null);
          setAuthUserEmail(null);
          setLastSyncedAt(null);
          setSyncStatus("ready");
          setSyncMessage("Sign in to sync SnapCal with Supabase.");
          setAuthStatus("idle");
          setAuthMessage("Sign in to keep SnapCal private and synced.");
          setHydrated(true);
          return;
        }

        const { data: userData, error: userError } =
          await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
          throw userError ?? new Error("Unable to verify Supabase session.");
        }

        const user = userData.user;
        const snapshotToSeed = freshSnapshot;

        const profile = await selectRemoteProfile(supabaseClient, user.id);

        const { data: remoteRows, error: logError } = await supabaseClient
          .from("meal_logs")
          .select(
            "id, meal_name, logged_at, kcal_low, kcal_high, modifiers, source, draft_metadata",
          )
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false });

        if (logError) {
          throw logError;
        }

        const remoteSavedMealRows = await selectRemoteSavedMeals(
          supabaseClient,
          user.id,
        );
        const remoteWellnessRows = await selectRemoteWellnessRecords(
          supabaseClient,
          user.id,
        );

        const freshRemoteSnapshot = buildFreshLiveSnapshot();
        const remoteProfile = profile
          ? mapRowToProfile(profile as ProfileRow)
          : null;

        let nextGoal =
          typeof profile?.daily_calorie_goal === "number"
            ? clampGoal(profile.daily_calorie_goal)
            : snapshotToSeed.goal;
        let nextProfile = remoteProfile ?? snapshotToSeed.profile;
        let nextLogs = sortLogsNewestFirst(
          (remoteRows ?? []).map((row) => mapRowToLoggedMeal(row as MealLogRow)),
        );
        let nextSavedMeals = sortSavedMeals(
          (remoteSavedMealRows ?? []).map((row) =>
            mapRowToSavedMeal(row as SavedMealRow),
          ),
        );
        let nextWellnessRecords = (remoteWellnessRows ?? []).map((row) =>
          mapRowToWellnessRecord(row as WellnessRecordRow),
        );

        const remoteHasOnlyFreshDefaults =
          nextLogs.length === 0 &&
          nextSavedMeals.length === 0 &&
          nextWellnessRecords.length === 0 &&
          nextGoal === freshRemoteSnapshot.goal &&
          remoteProfile !== null &&
          profilesEqual(remoteProfile, freshRemoteSnapshot.profile);

        const remoteIsEmpty =
          nextLogs.length === 0 &&
          nextSavedMeals.length === 0 &&
          nextWellnessRecords.length === 0 &&
          (!profile || remoteHasOnlyFreshDefaults);

        if (remoteIsEmpty) {
          const seedLogs = snapshotToSeed.logs;
          const seedSavedMeals =
            snapshotToSeed.savedMeals.length > 0
              ? snapshotToSeed.savedMeals
              : buildNextSavedMeals([], seedLogs);
          await replaceRemoteSnapshot(
            supabaseClient,
            user.id,
            snapshotToSeed.goal,
            seedLogs,
            seedSavedMeals,
            snapshotToSeed.wellnessRecords,
            snapshotToSeed.profile,
          );
          nextGoal = snapshotToSeed.goal;
          nextProfile = snapshotToSeed.profile;
          nextLogs = seedLogs;
          nextSavedMeals = seedSavedMeals;
          nextWellnessRecords = snapshotToSeed.wellnessRecords;
        }

        if (!active) {
          return;
        }

        setSupabaseUserId(user.id);
        setAuthUserEmail(user.email ?? null);
        setGoalState(nextGoal);
        setLogs(nextLogs);
        setSavedMeals(nextSavedMeals);
        setWellnessRecords(nextWellnessRecords);
        setProfileState(nextProfile);
        setLastSyncedAt(new Date().toISOString());
        setSyncStatus("ready");
        setSyncMessage("Supabase sync ready with email login.");
        setAuthStatus("success");
        setAuthMessage("Signed in. SnapCal is using your private cloud record.");
        setHydrated(true);
      } catch {
        if (!active) {
          return;
        }

        setStorageMode("local");
        setSupabaseUserId(null);
        setAuthUserEmail(null);
        setSyncStatus("error");
        setSyncMessage(
          "Supabase unavailable. Falling back to browser storage for now.",
        );
        setHydrated(true);
      }
    }

    void connectSupabase();

    return () => {
      active = false;
    };
  }, [cloudRetryKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (cloudConfigured && !supabaseUserId) {
      return;
    }

    writeLocalSnapshot({ goal, logs, savedMeals, wellnessRecords, profile });
  }, [
    cloudConfigured,
    goal,
    hydrated,
    logs,
    savedMeals,
    supabaseUserId,
    wellnessRecords,
    profile,
  ]);

  async function signIn({ email, password }: AuthCredentials) {
    const supabase = getSupabaseBrowserClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (!supabase) {
      setAuthStatus("error");
      setAuthMessage("Cloud auth is not configured in this environment.");
      return false;
    }

    if (!normalizedEmail || !password) {
      setAuthStatus("error");
      setAuthMessage("Enter your email and password.");
      return false;
    }

    setAuthStatus("loading");
    setAuthMessage("Signing in...");
    setSyncStatus("syncing");
    setSyncMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setAuthStatus("error");
      setAuthMessage("Sign-in failed. Check your email and password.");
      setSyncStatus("error");
      setSyncMessage("Sign-in failed. Check your email and password.");
      return false;
    }

    setAuthStatus("success");
    setAuthMessage("Signed in. Loading your cloud records...");
    setSyncMessage("Signed in. Loading your cloud records...");
    setCloudRetryKey((current) => current + 1);
    return true;
  }

  async function signUp({ email, password }: AuthCredentials) {
    const supabase = getSupabaseBrowserClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (!supabase) {
      setAuthStatus("error");
      setAuthMessage("Cloud auth is not configured in this environment.");
      return false;
    }

    if (!normalizedEmail || !password) {
      setAuthStatus("error");
      setAuthMessage("Enter your email and password.");
      return false;
    }

    if (password.length < 6) {
      setAuthStatus("error");
      setAuthMessage("Password must be at least 6 characters.");
      return false;
    }

    setAuthStatus("loading");
    setAuthMessage("Creating account...");
    setSyncStatus("syncing");
    setSyncMessage("Creating account...");

    const emailRedirectTo =
      typeof window === "undefined" ? undefined : window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });

    if (error) {
      const message = getSignUpErrorMessage(error);

      setAuthStatus("error");
      setAuthMessage(message);
      setSyncStatus("error");
      setSyncMessage(message);
      return false;
    }

    if (data.session) {
      setAuthStatus("success");
      setAuthMessage("Account created. Loading your cloud records...");
      setSyncMessage("Account created. Loading your cloud records...");
      setCloudRetryKey((current) => current + 1);
      return true;
    }

    setAuthStatus("success");
    setAuthMessage("Account created. Check your email to confirm before signing in.");
    setSyncStatus("ready");
    setSyncMessage("Account created. Check your email to confirm before signing in.");
    return true;
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();

    setAuthStatus("loading");
    setAuthMessage("Signing out...");
    setSyncStatus("syncing");
    setSyncMessage("Signing out...");

    if (supabase) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthStatus("error");
        setAuthMessage("Sign-out failed. Try again.");
        setSyncStatus("error");
        setSyncMessage("Sign-out failed. Try again.");
        return false;
      }
    }

    clearLocalSnapshot();
    applySnapshot(buildFreshLiveSnapshot());
    setSupabaseUserId(null);
    setAuthUserEmail(null);
    setLastSyncedAt(null);
    setAuthStatus("idle");
    setAuthMessage("Signed out. Local SnapCal cache cleared.");
    setSyncStatus("ready");
    setSyncMessage("Signed out. Local SnapCal cache cleared.");
    setCloudRetryKey((current) => current + 1);
    return true;
  }

  async function syncGoalToSupabase(
    nextGoal: number,
    nextProfile: PilotProfile = profile,
  ) {
    if (storageMode !== "supabase" || !supabaseUserId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    setSyncStatus("syncing");
    setSyncMessage("Saving goal to Supabase...");

    try {
      await upsertRemoteProfile(
        supabase,
        supabaseUserId,
        nextGoal,
        nextProfile,
      );
    } catch {
      setSyncStatus("error");
      setSyncMessage("Goal saved locally, but cloud sync failed.");
      return;
    }

    setLastSyncedAt(new Date().toISOString());
    setSyncStatus("ready");
    setSyncMessage("Goal saved to Supabase.");
  }

  async function syncReplaceSnapshot(
    nextGoal: number,
    nextLogs: LoggedMeal[],
    nextSavedMeals: SavedMeal[],
    nextProfile: PilotProfile = profile,
    nextWellnessRecords: DailyWellnessRecord[] = wellnessRecords,
  ) {
    if (storageMode !== "supabase" || !supabaseUserId) {
      return false;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return false;
    }

    setSyncStatus("syncing");
    setSyncMessage("Replacing remote snapshot in Supabase...");

    try {
      await replaceRemoteSnapshot(
        supabase,
        supabaseUserId,
        nextGoal,
        nextLogs,
        nextSavedMeals,
        nextWellnessRecords,
        nextProfile,
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus("ready");
      setSyncMessage("Supabase snapshot updated.");
      return true;
    } catch {
      setSyncStatus("error");
      setSyncMessage("Snapshot updated locally, but cloud sync failed.");
      return false;
    }
  }

  function addLog(log: LoggedMeal) {
    const normalizedLog = {
      ...log,
      id: ensureUuid(log.id),
    };
    const nextLogs = sortLogsNewestFirst([normalizedLog, ...logs]);
    const nextSavedMeals = buildNextSavedMeals(savedMeals, nextLogs);

    setLogs(nextLogs);
    setSavedMeals(nextSavedMeals);
    void syncReplaceSnapshot(goal, nextLogs, nextSavedMeals);
  }

  function updateLog(
    id: string,
    updates: Partial<
      Pick<
        LoggedMeal,
        "name" | "loggedAt" | "kcalRange" | "macroRange" | "confidence" | "modifiers" | "source"
      >
    >,
  ) {
    const nextLogs = sortLogsNewestFirst(
      logs.map((log) =>
        log.id === id
          ? {
              ...log,
              ...updates,
              kcalRange: updates.kcalRange ?? log.kcalRange,
              macroRange: updates.macroRange ?? log.macroRange,
              confidence: updates.confidence ?? log.confidence,
              modifiers: updates.modifiers ?? log.modifiers,
              source: updates.source ?? log.source,
            }
          : log,
      ),
    );
    const nextSavedMeals = buildNextSavedMeals(savedMeals, nextLogs);

    setLogs(nextLogs);
    setSavedMeals(nextSavedMeals);
    void syncReplaceSnapshot(goal, nextLogs, nextSavedMeals);
  }

  function removeLog(id: string) {
    const nextLogs = logs.filter((log) => log.id !== id);

    setLogs(nextLogs);
    void syncReplaceSnapshot(goal, nextLogs, savedMeals);
  }

  function upsertWellnessRecord(input: WellnessRecordInput) {
    const nextWellnessRecords = mergeWellnessRecord(wellnessRecords, input);

    setWellnessRecords(nextWellnessRecords);
    void syncReplaceSnapshot(
      goal,
      logs,
      savedMeals,
      profile,
      nextWellnessRecords,
    );
  }

  function saveSavedMeal(input: {
    name: string;
    modifiers: string[];
    kcalRange: SavedMeal["kcalRange"];
    macroRange?: SavedMeal["macroRange"];
    confidence?: SavedMeal["confidence"];
    isPinned?: boolean;
  }) {
    const nextSavedMeals = saveSavedMealEntry(savedMeals, input);

    setSavedMeals(nextSavedMeals);
    void syncReplaceSnapshot(goal, logs, nextSavedMeals);
  }

  function updateSavedMeal(
    id: string,
    updates: Partial<Pick<SavedMeal, "name" | "modifiers" | "isPinned">>,
  ) {
    const nextSavedMeals = mergeSavedMealEdits(savedMeals, id, updates);

    setSavedMeals(nextSavedMeals);
    void syncReplaceSnapshot(goal, logs, nextSavedMeals);
  }

  function removeSavedMeal(id: string) {
    const nextSavedMeals = savedMeals.filter((savedMeal) => savedMeal.id !== id);

    setSavedMeals(nextSavedMeals);
    void syncReplaceSnapshot(goal, logs, nextSavedMeals);
  }

  function clearLogs() {
    setLogs([]);
    void syncReplaceSnapshot(goal, [], savedMeals);
  }

  function startFreshLivePilot() {
    const snapshot = buildFreshLiveSnapshot();

    setGoalState(snapshot.goal);
    setLogs(snapshot.logs);
    setSavedMeals(snapshot.savedMeals);
    setWellnessRecords(snapshot.wellnessRecords);
    setProfileState(snapshot.profile);
    void syncReplaceSnapshot(
      snapshot.goal,
      snapshot.logs,
      snapshot.savedMeals,
      snapshot.profile,
      snapshot.wellnessRecords,
    );
  }

  function loadDemoScenario(scenario: DemoScenario) {
    const snapshot = buildDemoScenarioSnapshot(scenario);

    setGoalState(snapshot.goal);
    setLogs(snapshot.logs);
    setSavedMeals(snapshot.savedMeals);
    setWellnessRecords(snapshot.wellnessRecords);
    setProfileState(snapshot.profile);
    void syncReplaceSnapshot(
      snapshot.goal,
      snapshot.logs,
      snapshot.savedMeals,
      snapshot.profile,
      snapshot.wellnessRecords,
    );
  }

  function restoreDemo() {
    loadDemoScenario("free-pilot");
  }

  function setGoal(goalValue: number) {
    const nextGoal = clampGoal(goalValue);
    setGoalState(nextGoal);
    void syncGoalToSupabase(nextGoal);
  }

  function setPlan(plan: PilotProfile["plan"]) {
    const timestamp = new Date().toISOString();
    const nextProfile: PilotProfile = {
      ...profile,
      plan,
      pricingGateSeenAt: profile.pricingGateSeenAt ?? timestamp,
    };

    setProfileState(nextProfile);
    void syncReplaceSnapshot(goal, logs, savedMeals, nextProfile);
  }

  function setLanguage(nextLanguage: SnapCalLanguage) {
    setLanguageState(nextLanguage);
    writeStoredLanguage(nextLanguage);
  }

  function toggleLanguage() {
    setLanguage(language === "zh" ? "en" : "zh");
  }

  function markPricingGateSeen() {
    const nextProfile: PilotProfile = {
      ...profile,
      pricingGateSeenAt: new Date().toISOString(),
    };

    setProfileState(nextProfile);
    void syncReplaceSnapshot(goal, logs, savedMeals, nextProfile);
  }

  function retryCloudConnection() {
    if (!cloudConfigured) {
      setSyncStatus("error");
      setSyncMessage(
        "Cloud sync is not configured in this environment yet.",
      );
      return;
    }

    setSyncStatus("syncing");
    setSyncMessage("Retrying cloud connection...");
    setCloudRetryKey((current) => current + 1);
  }

  function syncNow() {
    if (storageMode === "supabase" && supabaseUserId) {
      void syncReplaceSnapshot(goal, logs, savedMeals, profile);
      return;
    }

    if (cloudConfigured && !supabaseUserId) {
      setSyncStatus("ready");
      setSyncMessage("Sign in to sync SnapCal with Supabase.");
      setAuthStatus("idle");
      setAuthMessage("Sign in to keep SnapCal private and synced.");
      return;
    }

    retryCloudConnection();
  }

  function completeOnboarding(input: {
    displayName: string;
    goal: number;
    goalPace: PilotProfile["goalPace"];
    plan: PilotProfile["plan"];
    sex: Sex | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
    activityLevel: ActivityLevel | null;
    proteinGoalG: number | null;
  }) {
    const completedAt = new Date().toISOString();
    const nextGoal = clampGoal(input.goal);
    const nextProfile: PilotProfile = {
      displayName: input.displayName.trim() || starterProfile.displayName,
      goalPace: input.goalPace,
      plan: input.plan,
      onboardingCompletedAt: completedAt,
      pricingGateSeenAt: profile.pricingGateSeenAt ?? completedAt,
      sex: sanitizeSex(input.sex),
      age: sanitizePositiveInteger(input.age),
      heightCm: sanitizePositiveNumber(input.heightCm),
      weightKg: sanitizePositiveNumber(input.weightKg),
      activityLevel: sanitizeActivityLevel(input.activityLevel),
      proteinGoalG: sanitizePositiveInteger(input.proteinGoalG),
    };

    setGoalState(nextGoal);
    setProfileState(nextProfile);
    void syncReplaceSnapshot(nextGoal, logs, savedMeals, nextProfile);
  }

  const shouldBlockForCloudAuth = cloudConfigured && !supabaseUserId;
  const renderedChildren =
    shouldBlockForCloudAuth && !hydrated ? (
      <SnapCalAuthLoading language={language} />
    ) : shouldBlockForCloudAuth ? (
      <SnapCalAuthGate
        authMessage={authMessage}
        authStatus={authStatus}
        language={language}
        setLanguage={setLanguage}
        signIn={signIn}
        signUp={signUp}
      />
    ) : (
      children
    );

  return (
    <SnapCalContext.Provider
      value={{
        goal,
        logs,
        savedMeals,
        wellnessRecords,
        profile,
        language,
        cloudConfigured,
        cloudUserId: supabaseUserId,
        authUserEmail,
        authStatus,
        authMessage,
        lastSyncedAt,
        hydrated,
        storageMode,
        syncStatus,
        syncMessage,
        addLog,
        updateLog,
        removeLog,
        upsertWellnessRecord,
        saveSavedMeal,
        updateSavedMeal,
        removeSavedMeal,
        clearLogs,
        startFreshLivePilot,
        restoreDemo,
        setGoal,
        completeOnboarding,
        setPlan,
        setLanguage,
        toggleLanguage,
        markPricingGateSeen,
        signIn,
        signUp,
        signOut,
        syncNow,
        retryCloudConnection,
        loadDemoScenario,
      }}
    >
      {renderedChildren}
    </SnapCalContext.Provider>
  );
}

function SnapCalAuthLoading({ language }: { language: SnapCalLanguage }) {
  const isZh = language === "zh";

  return (
    <main className="flex min-h-[100svh] flex-1 items-center justify-center px-4 py-8">
      <section className="card-surface w-full max-w-md rounded-[28px] px-5 py-6 text-center sm:px-7">
        <p className="font-display text-3xl text-[var(--foreground)]">SnapCal</p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {isZh ? "正在检查登录状态..." : "Checking your sign-in status..."}
        </p>
      </section>
    </main>
  );
}

function SnapCalAuthGate({
  authMessage,
  authStatus,
  language,
  setLanguage,
  signIn,
  signUp,
}: {
  authMessage: string;
  authStatus: AuthStatus;
  language: SnapCalLanguage;
  setLanguage: (language: SnapCalLanguage) => void;
  signIn: (input: AuthCredentials) => Promise<boolean>;
  signUp: (input: AuthCredentials) => Promise<boolean>;
}) {
  const isZh = language === "zh";
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = authStatus === "loading";
  const isSignUp = mode === "sign-up";

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const completed = isSignUp
      ? await signUp({ email, password })
      : await signIn({ email, password });

    if (completed) {
      setPassword("");
    }
  }

  return (
    <main className="flex min-h-[100svh] flex-1 items-center justify-center px-4 py-8">
      <section className="card-surface w-full max-w-lg rounded-[30px] px-5 py-6 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-[var(--foreground)]">SnapCal</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {isZh ? "私人饮食记录" : "Private meal logging"}
            </p>
          </div>
          <div
            className="grid grid-cols-2 overflow-hidden rounded-full border border-[var(--line)] bg-white p-1 text-xs font-bold"
            aria-label={isZh ? "语言切换" : "Language switch"}
          >
            {(["zh", "en"] as const).map((nextLanguage) => {
              const active = language === nextLanguage;

              return (
                <button
                  key={nextLanguage}
                  type="button"
                  onClick={() => setLanguage(nextLanguage)}
                  className={`rounded-full px-3 py-2 transition ${
                    active
                      ? "bg-[var(--foreground)] text-white"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  }`}
                  aria-pressed={active}
                >
                  {nextLanguage === "zh" ? "中" : "EN"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-[18px] border border-[var(--line)] bg-white p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`rounded-[14px] px-3 py-2 transition ${
              !isSignUp
                ? "bg-[var(--foreground)] text-white"
                : "text-[var(--foreground)]"
            }`}
          >
            {isZh ? "登录" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`rounded-[14px] px-3 py-2 transition ${
              isSignUp
                ? "bg-[var(--foreground)] text-white"
                : "text-[var(--foreground)]"
            }`}
          >
            {isZh ? "注册" : "Create account"}
          </button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={submitAuth}>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {isZh ? "邮箱" : "Email"}
            </span>
            <input
              autoComplete="email"
              className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-base outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {isZh ? "密码" : "Password"}
            </span>
            <input
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-base outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <button
            className="rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading
              ? isZh
                ? "处理中..."
                : "Working..."
              : isSignUp
                ? isZh
                  ? "注册"
                  : "Create account"
                : isZh
                  ? "登录"
                  : "Sign in"}
          </button>
        </form>

        <p
          className={`mt-4 rounded-[18px] px-4 py-3 text-sm leading-6 ${
            authStatus === "error"
              ? "bg-[var(--coral-tint)] text-[var(--coral-ink)]"
              : authStatus === "success"
                ? "bg-[var(--green-tint)] text-[#2e8049]"
                : "bg-white/76 text-[var(--muted)]"
          }`}
        >
          {localizeAuthMessage(authMessage, isZh)}
        </p>

        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {isZh
            ? "登录后才会读取或保存饮食记录。照片只用于生成结构化记录，默认不保存原图。"
            : "SnapCal reads or saves meal records only after sign-in. Photos are used for structured estimates and are not stored by default."}
        </p>
      </section>
    </main>
  );
}

function localizeAuthMessage(message: string, isZh: boolean) {
  if (!isZh) {
    return message;
  }

  return {
    "Sign in to keep SnapCal private and synced.":
      "登录后同步你的私人饮食记录。",
    "Cloud auth is not configured in this environment.":
      "当前环境还没有配置云端登录。",
    "Enter your email and password.": "请输入邮箱和密码。",
    "Signing in...": "正在登录...",
    "Sign-in failed. Check your email and password.":
      "登录失败，请检查邮箱和密码。",
    "Signed in. Loading your cloud records...": "已登录，正在读取云端记录...",
    "Signed in. SnapCal is using your private cloud record.":
      "已登录，SnapCal 正在使用你的私人云端记录。",
    "Password must be at least 6 characters.": "密码至少需要 6 个字符。",
    "Creating account...": "正在创建账号...",
    "That email address is not accepted by Supabase Auth.":
      "Supabase Auth 不接受这个邮箱地址。",
    "Supabase email is rate limited. Try again later or disable email confirmation for this private pilot.":
      "Supabase 邮件发送已限流。请稍后再试，或为这个私人版本关闭邮件确认。",
    "Account creation failed. Try signing in if you already registered.":
      "注册失败。如果已经注册过，请直接登录。",
    "Account created. Loading your cloud records...":
      "账号已创建，正在读取云端记录...",
    "Account created. Check your email to confirm before signing in.":
      "账号已创建，请先查看邮箱完成确认，再登录。",
    "Signing out...": "正在退出登录...",
    "Sign-out failed. Try again.": "退出登录失败，请重试。",
    "Signed out. Local SnapCal cache cleared.":
      "已退出登录，本机 SnapCal 缓存已清除。",
  }[message] ?? message;
}

export function useSnapCal() {
  const context = useContext(SnapCalContext);

  if (!context) {
    throw new Error("useSnapCal must be used inside SnapCalProvider");
  }

  return context;
}

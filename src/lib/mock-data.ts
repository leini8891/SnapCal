import type { ActivityLevel, Sex } from "./tdee";

export type Range = [number, number];
export type GoalPace = "gentle" | "steady" | "focused";
export type { ActivityLevel, Sex } from "./tdee";
export type MembershipPlan = "free" | "pro";
export type DemoScenario = "first-run" | "free-pilot" | "pro-pilot";
export type MealConfidence = "High" | "Medium" | "Low";
export type NutritionEstimate = {
  protein: Range;
  carbs: Range;
  fat: Range;
};

export type DailyWellnessRecord = {
  dayKey: string;
  weightKg: number | null;
  weightNote?: string;
  calorieRange: Range | null;
  dietScore: number | null;
  mealHighlights: string[];
  improvementPoints: string[];
  exerciseNote?: string;
  sleepNote?: string;
  sourceNote: string;
};

export type LoggedMeal = {
  id: string;
  name: string;
  loggedAt: string;
  kcalRange: Range;
  macroRange?: NutritionEstimate | null;
  confidence?: MealConfidence | null;
  modifiers: string[];
  source: "camera" | "gallery" | "text";
};

export type SavedMeal = {
  id: string;
  shortcutKey: string;
  name: string;
  modifiers: string[];
  kcalRange: Range;
  macroRange?: NutritionEstimate | null;
  confidence?: MealConfidence | null;
  timesUsed: number;
  lastUsedAt: string;
  isPinned: boolean;
};

export type PilotProfile = {
  displayName: string;
  goalPace: GoalPace;
  plan: MembershipPlan;
  onboardingCompletedAt: string | null;
  pricingGateSeenAt: string | null;
  sex?: Sex | null;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: ActivityLevel | null;
  proteinGoalG?: number | null;
};

export const budgetGoal = 1650;
export const starterProfile: PilotProfile = {
  displayName: "User",
  goalPace: "steady",
  plan: "free",
  onboardingCompletedAt: "2026-03-25T07:45:00+08:00",
  pricingGateSeenAt: "2026-03-25T07:46:00+08:00",
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  proteinGoalG: null,
};

export const firstRunProfile: PilotProfile = {
  displayName: "User",
  goalPace: "steady",
  plan: "free",
  onboardingCompletedAt: null,
  pricingGateSeenAt: null,
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  proteinGoalG: null,
};

export const proPilotProfile: PilotProfile = {
  displayName: "User",
  goalPace: "focused",
  plan: "pro",
  onboardingCompletedAt: "2026-03-25T07:45:00+08:00",
  pricingGateSeenAt: "2026-03-25T07:46:00+08:00",
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  proteinGoalG: null,
};

export const starterLogs: LoggedMeal[] = [
  {
    id: "1d3f8a2e-4e66-4a07-9255-e66003c3621f",
    name: "Kopi O Kosong",
    loggedAt: "2026-03-25T08:10:00+08:00",
    kcalRange: [10, 20],
    modifiers: ["No sugar"],
    source: "text",
  },
  {
    id: "6e3f3e0a-2a9d-46fd-8c9a-16bc6088cf61",
    name: "Banana",
    loggedAt: "2026-03-25T10:45:00+08:00",
    kcalRange: [90, 110],
    modifiers: [],
    source: "text",
  },
  {
    id: "9248f9c0-9b8a-4e7c-a88d-928d2c6437f6",
    name: "Tau Suan with You Tiao",
    loggedAt: "2026-03-25T13:05:00+08:00",
    kcalRange: [260, 340],
    modifiers: ["Regular portion"],
    source: "gallery",
  },
  {
    id: "7f71083d-ecb0-4124-b66d-f28b7e3cb5db",
    name: "Fishball Noodles (Dry)",
    loggedAt: "2026-03-24T12:18:00+08:00",
    kcalRange: [410, 500],
    modifiers: ["Less sauce"],
    source: "camera",
  },
  {
    id: "8ea88b26-b18d-4591-96a5-f5b12d4d3e66",
    name: "Chicken Rice",
    loggedAt: "2026-03-24T19:10:00+08:00",
    kcalRange: [480, 610],
    modifiers: ["Half rice", "Skin removed"],
    source: "text",
  },
  {
    id: "41b30f53-c454-4a3b-b7a8-23a01a96631d",
    name: "Kaya Toast Set",
    loggedAt: "2026-03-23T08:35:00+08:00",
    kcalRange: [380, 460],
    modifiers: ["Soft-boiled eggs"],
    source: "text",
  },
  {
    id: "7cb51751-7256-4b06-b92c-7c3bf0b2f876",
    name: "Fishball Noodles (Dry)",
    loggedAt: "2026-03-22T12:02:00+08:00",
    kcalRange: [410, 500],
    modifiers: ["Less sauce"],
    source: "text",
  },
  {
    id: "a1e42fd6-12e0-47e3-88e4-d0c6163ea7da",
    name: "Kopi O Kosong",
    loggedAt: "2026-03-22T09:00:00+08:00",
    kcalRange: [10, 20],
    modifiers: ["No sugar"],
    source: "text",
  },
];

export const starterSavedMeals: SavedMeal[] = [
  {
    id: "2f6de79c-fbc6-44e3-bcaf-9837a66da2f4",
    shortcutKey: "Fishball Noodles (Dry)::410::500::Less sauce",
    name: "Fishball Noodles (Dry)",
    modifiers: ["Less sauce"],
    kcalRange: [410, 500],
    timesUsed: 2,
    lastUsedAt: "2026-03-24T12:18:00+08:00",
    isPinned: true,
  },
  {
    id: "df3a1d1f-fd43-42b2-b12d-18636a19b1b5",
    shortcutKey: "Kopi O Kosong::10::20::No sugar",
    name: "Kopi O Kosong",
    modifiers: ["No sugar"],
    kcalRange: [10, 20],
    timesUsed: 2,
    lastUsedAt: "2026-03-25T08:10:00+08:00",
    isPinned: false,
  },
];

export const proPilotLogs: LoggedMeal[] = [
  {
    id: "bc1d7363-5f6b-4f0d-b472-33c95c2de98d",
    name: "Chicken Rice",
    loggedAt: "2026-03-25T18:40:00+08:00",
    kcalRange: [470, 590],
    modifiers: ["Half rice", "Skin removed"],
    source: "text",
  },
  {
    id: "b6f8f0d9-cffd-4f2b-9467-f2f40dbd7b0c",
    name: "Kopi O Kosong",
    loggedAt: "2026-03-25T08:05:00+08:00",
    kcalRange: [10, 20],
    modifiers: ["No sugar"],
    source: "text",
  },
  {
    id: "c6ecffb9-f851-43a0-aa80-b4994ddb6a89",
    name: "Fishball Noodles (Dry)",
    loggedAt: "2026-03-24T12:12:00+08:00",
    kcalRange: [410, 500],
    modifiers: ["Less sauce"],
    source: "camera",
  },
  {
    id: "05dc19d8-bf38-477f-8d1b-2581df31ddfb",
    name: "Bubble Milk Tea",
    loggedAt: "2026-03-23T15:20:00+08:00",
    kcalRange: [280, 380],
    modifiers: ["30% sugar"],
    source: "gallery",
  },
  {
    id: "8d3d3572-d7e1-4f30-8102-f45db726f056",
    name: "Nasi Lemak",
    loggedAt: "2026-03-22T12:50:00+08:00",
    kcalRange: [590, 760],
    modifiers: ["Rice half portion"],
    source: "text",
  },
  {
    id: "2643d6b6-3dd7-4125-b158-275f4ee6d4c4",
    name: "Chicken Rice",
    loggedAt: "2026-03-21T19:05:00+08:00",
    kcalRange: [470, 590],
    modifiers: ["Half rice", "Skin removed"],
    source: "text",
  },
  {
    id: "e5190d5e-7b39-4fbf-b65c-81939f9a1857",
    name: "Fishball Noodles (Dry)",
    loggedAt: "2026-03-20T12:08:00+08:00",
    kcalRange: [410, 500],
    modifiers: ["Less sauce"],
    source: "text",
  },
  {
    id: "d89cd7ef-8fa5-478b-8d18-2cd8f6cf9a0b",
    name: "Roti Prata",
    loggedAt: "2026-03-19T08:35:00+08:00",
    kcalRange: [420, 560],
    modifiers: ["1 piece only"],
    source: "gallery",
  },
  {
    id: "7fc9ccf2-c917-4fd0-92b2-ec295a67e2e8",
    name: "Sliced Fish Soup",
    loggedAt: "2026-03-18T12:16:00+08:00",
    kcalRange: [250, 340],
    modifiers: ["No fried side"],
    source: "camera",
  },
  {
    id: "d7036ba6-3b7a-4dbe-97f6-97d278f0d501",
    name: "Kopi O Kosong",
    loggedAt: "2026-03-17T08:14:00+08:00",
    kcalRange: [10, 20],
    modifiers: ["No sugar"],
    source: "text",
  },
  {
    id: "55efd6a4-4795-42b6-bdfe-af3e36418a77",
    name: "Chicken Rice",
    loggedAt: "2026-03-16T19:15:00+08:00",
    kcalRange: [470, 590],
    modifiers: ["Half rice", "Skin removed"],
    source: "text",
  },
  {
    id: "f3c6c6e3-2ceb-4ef6-b3ed-eab48d0b8f7e",
    name: "Laksa",
    loggedAt: "2026-03-15T13:10:00+08:00",
    kcalRange: [480, 620],
    modifiers: ["Less gravy"],
    source: "gallery",
  },
  {
    id: "6700f91c-8d20-4c58-9f54-d660bcca8dc4",
    name: "Bubble Milk Tea",
    loggedAt: "2026-03-14T16:05:00+08:00",
    kcalRange: [280, 380],
    modifiers: ["30% sugar"],
    source: "text",
  },
  {
    id: "ff36dc88-b08c-4cc7-9784-2f43893a90f9",
    name: "Yong Tau Foo",
    loggedAt: "2026-03-13T12:02:00+08:00",
    kcalRange: [360, 470],
    modifiers: ["Soup base"],
    source: "text",
  },
];

export const proPilotSavedMeals: SavedMeal[] = [
  {
    id: "c9fa7ae1-e38b-455f-ab2e-0f4d7191e7cb",
    shortcutKey: "Chicken Rice::470::590::Half rice|Skin removed",
    name: "Chicken Rice",
    modifiers: ["Half rice", "Skin removed"],
    kcalRange: [470, 590],
    timesUsed: 3,
    lastUsedAt: "2026-03-25T18:40:00+08:00",
    isPinned: true,
  },
  {
    id: "5473ac5f-afbf-4a2b-b3f4-cd5017d5f7aa",
    shortcutKey: "Fishball Noodles (Dry)::410::500::Less sauce",
    name: "Fishball Noodles (Dry)",
    modifiers: ["Less sauce"],
    kcalRange: [410, 500],
    timesUsed: 2,
    lastUsedAt: "2026-03-24T12:12:00+08:00",
    isPinned: true,
  },
  {
    id: "9d5d8dd9-97c7-4088-9a6b-2f0f1ca6c2c1",
    shortcutKey: "Bubble Milk Tea::280::380::30% sugar",
    name: "Bubble Milk Tea",
    modifiers: ["30% sugar"],
    kcalRange: [280, 380],
    timesUsed: 2,
    lastUsedAt: "2026-03-23T15:20:00+08:00",
    isPinned: false,
  },
];

export const productHighlights = [
  "Singapore-first food naming and modifier logic",
  "Best-effort estimates with user-confirmed logs",
  "One core loop: snap, adjust, confirm, stay on budget",
];

export const quickStartExamples = [
  {
    label: "Bak chor mee",
    query: "bak chor mee dry less sauce no lard",
  },
  {
    label: "Kaya toast",
    query: "kaya toast set two eggs kopi c less butter",
  },
  {
    label: "Mala bowl",
    query: "mala xiang guo less oil no noodles more vegetables seafood",
  },
  {
    label: "Tau huay",
    query: "unsweetened tau huay grass jelly soy milk",
  },
  {
    label: "Scallop CCF",
    query: "scallop chee cheong fun extra sauce half portion",
  },
  {
    label: "Zi char table",
    query: "chilli crab, cereal prawn, claypot tofu, plain rice, milo peng shared",
  },
];

export const frontendRails = [
  "Keep the page mostly server-rendered and isolate interactivity inside one client shell.",
  "Treat modifiers as first-class UI, not an afterthought behind a generic edit modal.",
  "Design for mobile first: camera, thumb reach, and low cognitive load.",
];

export const demoWalkthrough = [
  {
    step: "1",
    title: "Start with setup",
    href: "/welcome",
    action: "Set the display name, daily goal, and preferred pace.",
    outcome: "This makes the app feel personal without turning setup into a long form.",
  },
  {
    step: "2",
    title: "Log a hawker meal",
    href: "/",
    action: "Upload or search a meal, adjust modifiers, then confirm the draft.",
    outcome: "This is the core value loop: fast estimate, quick correction, budget awareness.",
  },
  {
    step: "3",
    title: "Show today's readout",
    href: "/today",
    action: "Open the daily summary and explain the next-move coaching.",
    outcome: "It proves the app is not just storing logs; it interprets the day and guides the next action.",
  },
  {
    step: "4",
    title: "Show history",
    href: "/history",
    action: "Walk through the weight trend, daily categories, filtering, and pagination.",
    outcome: "This is where the user can see what worked, what was normal, and what needs attention.",
  },
  {
    step: "5",
    title: "Close with settings",
    href: "/settings",
    action: "Show cloud state, exports, saved shortcut editing, and reset controls.",
    outcome: "It makes the product feel operational instead of fragile.",
  },
];

export const demoTalkingPoints = [
  "The wedge is not generic calorie counting. It is low-friction logging for Singapore hawker meals.",
  "The moat is not only AI image recognition. It is the modifier system, local ontology, and correction loop.",
  "History should help people review behavior, not force them to scroll through an endless pile of cards.",
  "Exports, reset controls, and local storage make the prototype practical without showing backend implementation details.",
];

export const buildChecklist = [
  "Finish live OpenAI/GLM vision setup and tune the correction loop with real meal photos.",
  "Decide whether future sync is cloud-based or local-only before exposing it as a user-facing setting.",
  "Keep analytics focused on useful reflection before adding any subscription layer.",
];

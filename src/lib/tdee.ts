export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type CalorieGoalPace = "gentle" | "steady" | "focused";

export type TargetInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalPace: CalorieGoalPace;
};

export type TargetResult = {
  bmr: number;
  tdee: number;
  calorieGoal: number;
  proteinGoalG: number;
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const PACE_DEFICIT_FACTORS: Record<CalorieGoalPace, number> = {
  gentle: 0.85,
  steady: 0.8,
  focused: 0.75,
};

export function clampGoal(goal: number) {
  return Math.min(2600, Math.max(1200, Math.round(goal)));
}

function roundToNearest(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}

export function calcBmr({
  age,
  heightCm,
  sex,
  weightKg,
}: Pick<TargetInput, "age" | "heightCm" | "sex" | "weightKg">) {
  const sexOffset = sex === "male" ? 5 : -161;

  return 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
}

export function calcTdee({
  activityLevel,
  bmr,
}: {
  activityLevel: ActivityLevel;
  bmr: number;
}) {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calcCalorieGoal({
  bmr,
  goalPace,
  tdee,
}: {
  bmr: number;
  goalPace: CalorieGoalPace;
  tdee: number;
}) {
  const roundedDeficitTarget = roundToNearest(
    tdee * PACE_DEFICIT_FACTORS[goalPace],
    10,
  );
  const safetyFloor = Math.max(1200, Math.round(bmr));

  return clampGoal(Math.max(roundedDeficitTarget, safetyFloor));
}

export function calcProteinGoal({
  goalPace,
  weightKg,
}: Pick<TargetInput, "goalPace" | "weightKg">) {
  const multiplier = goalPace === "focused" ? 2 : 1.8;

  return Math.max(60, roundToNearest(weightKg * multiplier, 5));
}

export function computeTargets(input: TargetInput): TargetResult {
  const bmr = calcBmr(input);
  const tdee = calcTdee({
    activityLevel: input.activityLevel,
    bmr,
  });

  return {
    bmr,
    tdee,
    calorieGoal: calcCalorieGoal({
      bmr,
      goalPace: input.goalPace,
      tdee,
    }),
    proteinGoalG: calcProteinGoal(input),
  };
}

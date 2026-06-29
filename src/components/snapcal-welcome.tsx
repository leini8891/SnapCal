"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SnapCalNav from "@/components/snapcal-nav";
import { useSnapCal, type SnapCalLanguage } from "@/components/snapcal-provider";
import {
  formatDayLabel,
  getSingaporeDayKey,
} from "@/lib/snapcal-utils";
import { clampGoal, computeTargets, type TargetInput } from "@/lib/tdee";
import type { ActivityLevel, PilotProfile, Sex } from "@/lib/mock-data";

const goalPresets = [1500, 1650, 1800, 2000, 2200];

function getPaceOptions(isZh: boolean) {
  return [
    {
      id: "gentle" as const,
      label: isZh ? "温和减脂" : "Gentle loss",
      body: isZh
        ? "预算更宽松，适合外食多、压力大或刚开始记录的阶段。"
        : "A more forgiving target for frequent meals out, busy weeks, or early habit building.",
    },
    {
      id: "steady" as const,
      label: isZh ? "稳定推进" : "Steady loss",
      body: isZh
        ? "默认推荐。保留正常工作日弹性，同时让体重趋势慢慢往下走。"
        : "The recommended default: flexible enough for normal workdays and disciplined enough to move the trend down.",
    },
    {
      id: "focused" as const,
      label: isZh ? "短期专注" : "Focused sprint",
      body: isZh
        ? "预算更紧，适合短期冲刺；如果很难坚持，可以随时调回稳定模式。"
        : "A tighter target for short pushes. Switch back to steady if it becomes hard to sustain.",
    },
  ];
}

function getActivityOptions(isZh: boolean) {
  return [
    {
      id: "sedentary" as const,
      label: isZh ? "久坐" : "Sedentary",
      body: isZh ? "大多坐着，日常步数较少。" : "Mostly seated with low daily movement.",
    },
    {
      id: "light" as const,
      label: isZh ? "轻度活动" : "Light",
      body: isZh ? "每周轻运动 1-3 次。" : "Light exercise 1-3 days a week.",
    },
    {
      id: "moderate" as const,
      label: isZh ? "中等活动" : "Moderate",
      body: isZh ? "规律运动或走动较多。" : "Regular workouts or an active routine.",
    },
    {
      id: "active" as const,
      label: isZh ? "高活动" : "Active",
      body: isZh ? "每周多数天训练。" : "Training most days of the week.",
    },
    {
      id: "very_active" as const,
      label: isZh ? "很高活动" : "Very active",
      body: isZh ? "高强度训练或体力工作。" : "Hard training or physical work.",
    },
  ];
}

function formatGoalPace(pace: PilotProfile["goalPace"], isZh: boolean) {
  return getPaceOptions(isZh).find((option) => option.id === pace)?.label ?? pace;
}

export default function SnapCalWelcome() {
  const { completeOnboarding, goal, hydrated, language, profile } = useSnapCal();
  const isZh = language === "zh";
  const onboardingDone = Boolean(profile.onboardingCompletedAt);
  const onboardingLabel = profile.onboardingCompletedAt
    ? formatDayLabel(getSingaporeDayKey(profile.onboardingCompletedAt))
    : isZh
      ? "尚未完成"
      : "Not completed";
  const formKey = [
    goal,
    language,
    profile.displayName,
    profile.goalPace,
    profile.plan,
    profile.sex,
    profile.age,
    profile.heightCm,
    profile.weightKg,
    profile.activityLevel,
    profile.proteinGoalG,
  ].join("|");

  return (
    <main className="relative flex-1 px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SnapCalNav />

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                {isZh ? "目标" : "Goal"}
              </p>
              <h1 className="font-display mt-2 text-4xl text-[var(--foreground)]">
                {isZh ? "设置科学热量和蛋白目标" : "Set science-based calorie and protein targets"}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
                {isZh
                  ? "填写基础身体资料后，SnapCal 会用 BMR 和 TDEE 自动给出每日热量与蛋白目标。你仍然可以手动微调热量。"
                  : "Enter basic body metrics and SnapCal will estimate daily calories and protein from BMR and TDEE. You can still fine-tune calories manually."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label={isZh ? "状态" : "Status"}
                value={
                  hydrated
                    ? isZh
                      ? "已准备"
                      : "Ready"
                    : isZh
                      ? "加载中"
                      : "Loading"
                }
              />
              <MetricCard
                label={isZh ? "设置" : "Setup"}
                value={
                  onboardingDone
                    ? isZh
                      ? "已完成"
                      : "Done"
                    : isZh
                      ? "待完成"
                      : "Pending"
                }
              />
              <MetricCard
                label={isZh ? "蛋白目标" : "Protein"}
                value={
                  profile.proteinGoalG
                    ? `${profile.proteinGoalG}g`
                    : isZh
                      ? "待计算"
                      : "Pending"
                }
              />
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[var(--line)] bg-white px-5 py-5 text-sm leading-7 text-[var(--muted)]">
            <p>
              {isZh
                ? "这个页面现在会根据性别、年龄、身高、体重、活动量和减脂节奏实时计算建议值。"
                : "This page now calculates live recommendations from sex, age, height, weight, activity, and pace."}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {isZh ? "上次完成：" : "Last completed: "}
              {onboardingLabel}
            </p>
          </div>
        </section>

        {hydrated ? (
          <WelcomeSetupForm
            key={formKey}
            goal={goal}
            initialProfile={profile}
            language={language}
            onComplete={completeOnboarding}
          />
        ) : (
          <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
            <div className="rounded-[28px] border border-[var(--line)] bg-white px-5 py-8 text-sm leading-7 text-[var(--muted)]">
              {isZh ? "正在读取本地设置..." : "Preparing saved settings..."}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function WelcomeSetupForm({
  goal,
  initialProfile,
  language,
  onComplete,
}: {
  goal: number;
  initialProfile: PilotProfile;
  language: SnapCalLanguage;
  onComplete: (input: {
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
}) {
  const router = useRouter();
  const isZh = language === "zh";
  const paceOptions = getPaceOptions(isZh);
  const activityOptions = getActivityOptions(isZh);
  const initialTargetInput = buildTargetInput({
    sex: initialProfile.sex ?? null,
    age: initialProfile.age ?? null,
    heightCm: initialProfile.heightCm ?? null,
    weightKg: initialProfile.weightKg ?? null,
    activityLevel: initialProfile.activityLevel ?? null,
    goalPace: initialProfile.goalPace,
  });
  const initialTargets = initialTargetInput
    ? computeTargets(initialTargetInput)
    : null;
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [sex, setSex] = useState<Sex | null>(initialProfile.sex ?? null);
  const [ageInput, setAgeInput] = useState(
    initialProfile.age?.toString() ?? "",
  );
  const [heightInput, setHeightInput] = useState(
    initialProfile.heightCm?.toString() ?? "",
  );
  const [weightInput, setWeightInput] = useState(
    initialProfile.weightKg?.toString() ?? "",
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    initialProfile.activityLevel ?? null,
  );
  const [goalPace, setGoalPace] = useState(initialProfile.goalPace);
  const [manualGoalDraft, setManualGoalDraft] = useState(
    initialTargets?.calorieGoal ?? goal,
  );
  const [manualOverride, setManualOverride] = useState(false);
  const age = parsePositiveInteger(ageInput);
  const heightCm = parsePositiveNumber(heightInput);
  const weightKg = parsePositiveNumber(weightInput);
  const targetInput = useMemo(
    () =>
      buildTargetInput({
        sex,
        age,
        heightCm,
        weightKg,
        activityLevel,
        goalPace,
      }),
    [activityLevel, age, goalPace, heightCm, sex, weightKg],
  );
  const targets = useMemo(
    () => (targetInput ? computeTargets(targetInput) : null),
    [targetInput],
  );
  const goalDraft = manualOverride
    ? manualGoalDraft
    : targets?.calorieGoal ?? manualGoalDraft;
  const paceDeficitLabel = {
    gentle: "15%",
    steady: "20%",
    focused: "25%",
  }[goalPace];

  function handleComplete() {
    onComplete({
      displayName,
      goal: goalDraft,
      goalPace,
      plan: initialProfile.plan,
      sex,
      age,
      heightCm,
      weightKg,
      activityLevel,
      proteinGoalG: targets?.proteinGoalG ?? null,
    });
    startTransition(() => {
      router.push("/");
    });
  }

  return (
    <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr_1.1fr]">
        <article className="rounded-[28px] border border-[var(--line)] bg-white p-5">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
            {isZh ? "步骤 1" : "Step 1"}
          </p>
          <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
            {isZh ? "基础资料" : "Basics"}
          </h2>
          <label className="mt-5 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {isZh ? "名字" : "Name"}
            </span>
            <input
              className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
              value={displayName}
              placeholder={isZh ? "例如 Alex" : "e.g. Alex"}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {(["female", "male"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSex(option)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  sex === option
                    ? "bg-[var(--foreground)] text-white"
                    : "border border-[rgba(55,36,24,0.12)] bg-white text-[var(--foreground)]"
                }`}
              >
                {formatSex(option, isZh)}
              </button>
            ))}
          </div>
          <label className="mt-5 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {isZh ? "年龄" : "Age"}
            </span>
            <input
              className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
              inputMode="numeric"
              min="1"
              type="number"
              value={ageInput}
              placeholder={isZh ? "例如 30" : "e.g. 30"}
              onChange={(event) => setAgeInput(event.target.value)}
            />
          </label>
        </article>

        <article className="rounded-[28px] border border-[var(--line)] bg-white p-5">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
            {isZh ? "步骤 2" : "Step 2"}
          </p>
          <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
            {isZh ? "身体和活动量" : "Body and activity"}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {isZh ? "身高 cm" : "Height cm"}
              </span>
              <input
                className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
                inputMode="decimal"
                min="1"
                type="number"
                value={heightInput}
                placeholder="175"
                onChange={(event) => setHeightInput(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {isZh ? "体重 kg" : "Weight kg"}
              </span>
              <input
                className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
                inputMode="decimal"
                min="1"
                type="number"
                value={weightInput}
                placeholder="80"
                onChange={(event) => setWeightInput(event.target.value)}
              />
            </label>
          </div>
          <div className="mt-5 grid gap-2">
            {activityOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActivityLevel(option.id)}
                className={`rounded-[20px] border px-4 py-3 text-left transition ${
                  activityLevel === option.id
                    ? "border-[rgba(14,110,115,0.38)] bg-[rgba(226,246,240,0.72)]"
                    : "border-[var(--line)] bg-white hover:border-[rgba(14,110,115,0.24)]"
                }`}
              >
                <span className="block font-semibold text-[var(--foreground)]">
                  {option.label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                  {option.body}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--line)] bg-white p-5">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
            {isZh ? "步骤 3" : "Step 3"}
          </p>
          <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
            {isZh ? "目标建议" : "Target recommendation"}
          </h2>
          <div className="mt-5 space-y-3">
            {paceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setGoalPace(option.id)}
                className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${
                  goalPace === option.id
                    ? "border-[rgba(239,106,67,0.45)] bg-[var(--coral-tint)]"
                    : "border-[var(--line)] bg-white hover:border-[rgba(14,110,115,0.24)]"
                }`}
              >
                <p className="font-semibold text-[var(--foreground)]">
                  {option.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  {option.body}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-[var(--surface-2)] p-4">
            <p className="text-sm text-[var(--muted)]">
              {isZh ? "建议目标" : "Recommended targets"}
            </p>
            {targets ? (
              <>
                <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
                  <span className="font-display text-4xl text-[var(--foreground)]">
                    {targets.calorieGoal} kcal
                  </span>
                  <span className="pb-1 text-base font-semibold text-[var(--teal)]">
                    {targets.proteinGoalG}g {isZh ? "蛋白" : "protein"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {isZh
                    ? `按 TDEE ≈ ${Math.round(targets.tdee)} kcal，${formatGoalPace(
                        goalPace,
                        isZh,
                      )} 节奏为 -${paceDeficitLabel}。`
                    : `Based on TDEE ≈ ${Math.round(
                        targets.tdee,
                      )} kcal, ${formatGoalPace(
                        goalPace,
                        isZh,
                      ).toLowerCase()} pace is -${paceDeficitLabel}.`}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                {isZh
                  ? "填完整身体资料后会自动出现建议热量和蛋白目标。"
                  : "Complete the body fields to see calorie and protein targets."}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--muted)]">
                {isZh ? "手动热量目标" : "Manual calorie target"}
              </span>
              <span className="font-display text-3xl text-[var(--foreground)]">
                {goalDraft} kcal
              </span>
            </div>
            <input
              className="mt-4 w-full accent-[var(--coral)]"
              type="range"
              min="1200"
              max="2600"
              step="50"
              value={goalDraft}
              onChange={(event) => {
                setManualOverride(true);
                setManualGoalDraft(clampGoal(Number(event.target.value)));
              }}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {goalPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setManualOverride(true);
                    setManualGoalDraft(preset);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    preset === goalDraft
                      ? "bg-[var(--foreground)] text-white"
                      : "border border-[rgba(55,36,24,0.12)] bg-white text-[var(--foreground)]"
                  }`}
                >
                  {preset} kcal
                </button>
              ))}
              {targets ? (
                <button
                  type="button"
                  onClick={() => {
                    setManualOverride(false);
                    setManualGoalDraft(targets.calorieGoal);
                  }}
                  className="rounded-full border border-[rgba(14,110,115,0.22)] bg-white px-4 py-2 text-sm font-semibold text-[var(--teal)] transition hover:border-[rgba(14,110,115,0.42)]"
                >
                  {isZh ? "使用建议值" : "Use recommendation"}
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {manualOverride
                ? isZh
                  ? "已手动调整"
                  : "Manual override"
                : isZh
                  ? "跟随建议值"
                  : "Following recommendation"}
            </p>
          </div>
        </article>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[28px] bg-[linear-gradient(135deg,rgba(36,22,15,0.98),rgba(14,110,115,0.92))] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-white/70">
            {isZh ? "准备记录" : "Ready to log"}
          </p>
          <p className="mt-2 font-display text-3xl">
            {isZh ? "保存目标并回到记餐页" : "Save the target and return to logging"}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/78">
            {isZh
              ? "保存后，首页会按新的热量目标计算今日剩余；蛋白目标会进入个人资料。"
              : "After saving, home uses the new calorie target, and the protein target is stored in your profile."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleComplete}
          className="rounded-[22px] bg-white px-5 py-4 text-left text-[var(--foreground)] transition hover:translate-y-[-1px]"
        >
          <span className="block text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            {isZh ? "保存" : "Save"}
          </span>
          <span className="mt-1 block font-display text-2xl">
            {isZh ? "继续记餐" : "Continue"}
          </span>
        </button>
      </div>
    </section>
  );
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parsePositiveInteger(value: string) {
  const parsed = parsePositiveNumber(value);

  return parsed === null ? null : Math.round(parsed);
}

function buildTargetInput({
  activityLevel,
  age,
  goalPace,
  heightCm,
  sex,
  weightKg,
}: {
  activityLevel: ActivityLevel | null;
  age: number | null;
  goalPace: PilotProfile["goalPace"];
  heightCm: number | null;
  sex: Sex | null;
  weightKg: number | null;
}): TargetInput | null {
  if (!sex || !age || !heightCm || !weightKg || !activityLevel) {
    return null;
  }

  return {
    activityLevel,
    age,
    goalPace,
    heightCm,
    sex,
    weightKg,
  };
}

function formatSex(sex: Sex, isZh: boolean) {
  if (isZh) {
    return sex === "female" ? "女性" : "男性";
  }

  return sex === "female" ? "Female" : "Male";
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--line)] bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

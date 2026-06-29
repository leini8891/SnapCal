"use client";

import { useState, type FormEvent } from "react";
import SnapCalNav from "@/components/snapcal-nav";
import { useSnapCal } from "@/components/snapcal-provider";
import {
  buildQuickMealShortcuts,
  formatCalories,
  formatLoggedTime,
  formatMacroSummary,
  getSingaporeDayKey,
  isTodayInSingapore,
  sourceLabel,
  sumRanges,
} from "@/lib/snapcal-utils";

export default function SnapCalToday() {
  const {
    goal,
    language,
    logs,
    profile,
    removeLog,
    upsertWellnessRecord,
    wellnessRecords,
  } = useSnapCal();
  const isZh = language === "zh";
  const todayDayKey = getSingaporeDayKey(new Date());
  const todayWellnessRecord = wellnessRecords.find(
    (record) => record.dayKey === todayDayKey,
  );
  const savedWeightInput = todayWellnessRecord?.weightKg
    ? String(todayWellnessRecord.weightKg)
    : "";
  const [weightInputOverride, setWeightInputOverride] = useState<string | null>(
    null,
  );
  const [weightMessage, setWeightMessage] = useState("");
  const weightInput = weightInputOverride ?? savedWeightInput;
  const todayLogs = logs.filter((log) => isTodayInSingapore(log.loggedAt));
  const shortcuts = buildQuickMealShortcuts(logs);
  const todayTotal = sumRanges(todayLogs);
  const remaining: [number, number] = [goal - todayTotal[1], goal - todayTotal[0]];
  const paceLabel =
    profile.goalPace === "gentle"
      ? "Gentle cut"
      : profile.goalPace === "focused"
        ? "Focused sprint"
        : "Steady loss";

  const insight =
    todayLogs.length === 0
      ? profile.goalPace === "focused"
        ? "No meals logged yet. For a focused sprint, the first meal matters more than usual, so start logging early."
        : "No meals logged yet. Use the Log page to capture the first meal of the day."
      : remaining[0] < 0
        ? profile.goalPace === "gentle"
          ? "You are over the target range, but the gentle pace is meant to be recoverable. Keep the next meal calm instead of trying to over-correct."
          : "You are already over today's target range. Dinner choices should stay light."
        : remaining[1] > 450
          ? profile.goalPace === "gentle"
            ? "You still have plenty of room left. Gentle mode should feel sustainable, not tense."
            : "You still have a healthy amount of budget left for the rest of the day."
          : profile.goalPace === "focused"
            ? "The margin is tightening. In focused mode, drinks, rice portions, and sauces will decide the finish."
          : "The day is getting tighter. Small drink and sauce edits will matter.";
  const nextMove =
    todayLogs.length === 0
      ? "Log the first meal before the day gets fuzzy."
      : remaining[0] < 0
        ? profile.goalPace === "gentle"
          ? "Use a lighter dinner shortcut and avoid over-correcting emotionally."
          : "Treat the next meal like a recovery meal: lighter protein, smaller carbs, cleaner drinks."
        : remaining[1] > 450
          ? "You still have room. Reuse a saved shortcut instead of guessing from memory later."
          : "The margin is smaller now. Shortcut quality matters more than raw motivation.";
  const habitSignal =
    shortcuts[0]?.timesLogged && shortcuts[0].timesLogged >= 2
      ? `${shortcuts[0].name} is becoming the strongest repeat meal in this account.`
      : "No repeat meal is dominant yet. This is still a good sign that the shortcut layer has room to grow.";

  function handleWeightSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = weightInput.trim();

    if (trimmedInput.length === 0) {
      if (todayWellnessRecord?.weightKg) {
        upsertWellnessRecord({
          dayKey: todayDayKey,
          weightKg: null,
          weightNote: null,
          sourceNote: "Manual daily check-in.",
        });
        setWeightInputOverride(null);
        setWeightMessage(
          isZh ? "已清空今天的体重记录。" : "Today's weigh-in was cleared.",
        );
        return;
      }

      setWeightMessage(
        isZh ? "体重是选填项，可以先留空。" : "Weight is optional; you can leave it blank.",
      );
      return;
    }

    const parsedWeight = Number(trimmedInput.replace(",", "."));

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0 || parsedWeight > 400) {
      setWeightMessage(
        isZh ? "请输入有效体重，例如 76.4。" : "Enter a valid weight, for example 76.4.",
      );
      return;
    }

    const roundedWeight = Math.round(parsedWeight * 10) / 10;

    setWeightInputOverride(String(roundedWeight));
    upsertWellnessRecord({
      dayKey: todayDayKey,
      weightKg: roundedWeight,
      weightNote: isZh
        ? "用户在今日页面手动输入。"
        : "Manually entered on the Today page.",
      sourceNote: "Manual daily check-in.",
    });
    setWeightMessage(
      isZh
        ? `已记录今天体重 ${roundedWeight} kg。`
        : `Saved today's weight: ${roundedWeight} kg.`,
    );
  }

  return (
    <main className="relative flex-1 overflow-hidden px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SnapCalNav />

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Today
              </p>
              <h1 className="font-display mt-2 text-4xl text-[var(--foreground)]">
                {profile.displayName
                  ? `${profile.displayName}'s meal log for the day`
                  : "Your meal log for the day"}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
                This route now reads from the shared persisted store. Any meal
                you confirm on the Log page appears here immediately.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Meals today"
                value={`${todayLogs.length} entries`}
              />
              <MetricCard
                label="Current total"
                value={formatCalories(todayTotal)}
              />
              <MetricCard
                label="Remaining"
                value={formatCalories(remaining)}
              />
              <MetricCard label="Goal pace" value={paceLabel} />
            </div>
          </div>
          <div className="mt-5 rounded-[24px] bg-[rgba(255,255,255,0.74)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
            {insight}
          </div>

          <form
            className="mt-4 flex flex-col gap-3 rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-4 sm:flex-row sm:items-end sm:justify-between"
            onSubmit={handleWeightSubmit}
          >
            <label className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {isZh ? "今日体重" : "Today's weight"}
              </span>
              <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                {isZh ? "选填，用来跟踪趋势，不会计入餐食。" : "Optional. Used for trend tracking, not counted as a meal."}
              </span>
              <div className="mt-3 flex items-center gap-2">
                <input
                  aria-label={isZh ? "今日体重" : "Today's weight"}
                  className="min-w-0 flex-1 rounded-[14px] border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-base font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--coral)] focus:ring-4 focus:ring-[rgba(242,80,43,0.12)]"
                  inputMode="decimal"
                  min="1"
                  max="400"
                  placeholder="76.4"
                  step="0.1"
                  type="number"
                  value={weightInput}
                  onChange={(event) => setWeightInputOverride(event.target.value)}
                />
                <span className="shrink-0 text-sm font-semibold text-[var(--muted)]">
                  kg
                </span>
              </div>
              {weightMessage ? (
                <span className="mt-2 block text-sm font-medium text-[var(--teal)]">
                  {weightMessage}
                </span>
              ) : null}
            </label>
            <button
              type="submit"
              className="rounded-[14px] bg-[var(--foreground)] px-5 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px]"
            >
              {isZh ? "保存体重" : "Save weight"}
            </button>
          </form>
        </section>

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Daily summary
              </p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
                What today is saying so far
              </h2>
            </div>
            <span className="rounded-full bg-[rgba(243,181,76,0.18)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
              {paceLabel}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <SummaryCard
              label="Budget position"
              title={remaining[0] < 0 ? "Past target range" : "Still inside range"}
              body={insight}
            />
            <SummaryCard
              label="Next best move"
              title="Recommended action"
              body={nextMove}
            />
            <SummaryCard
              label="Habit signal"
              title="Shortcut layer"
              body={habitSignal}
            />
          </div>
        </section>

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Confirmed meals
              </p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
                Today&apos;s entries
              </h2>
            </div>
            <span className="rounded-full bg-[rgba(14,110,115,0.1)] px-3 py-1 text-sm font-semibold text-[var(--teal)]">
              Goal {goal} kcal
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {todayLogs.length > 0 ? (
              todayLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-display text-2xl text-[var(--foreground)]">
                        {log.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {formatLoggedTime(log.loggedAt)} · {sourceLabel(log.source)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {log.modifiers.length > 0 ? (
                          log.modifiers.map((modifier) => (
                            <span
                              key={`${log.id}-${modifier}`}
                              className="rounded-full bg-[rgba(36,22,15,0.06)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                            >
                              {modifier}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-[rgba(36,22,15,0.06)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                            No edits
                          </span>
                        )}
                      </div>
                      {formatMacroSummary(log.macroRange) ? (
                        <p className="mt-3 text-sm text-[var(--muted)]">
                          {formatMacroSummary(log.macroRange)}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <span className="rounded-full bg-[rgba(243,181,76,0.2)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
                        {formatCalories(log.kcalRange)}
                      </span>
                      {log.confidence ? (
                        <span className="rounded-full bg-[rgba(14,110,115,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                          {log.confidence} confidence
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeLog(log.id)}
                        className="rounded-full border border-[rgba(55,36,24,0.12)] px-3 py-1 text-sm text-[var(--muted)] transition hover:border-[rgba(239,106,67,0.28)] hover:text-[var(--foreground)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                No meals logged today yet. Confirm a meal on the Log page to
                start the daily budget loop.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-[var(--foreground)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
    </article>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[rgba(55,36,24,0.08)] bg-white/80 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import SnapCalNav from "@/components/snapcal-nav";
import {
  useSnapCal,
  type SnapCalLanguage,
} from "@/components/snapcal-provider";
import type { DailyWellnessRecord, Range } from "@/lib/mock-data";
import {
  formatCalories,
  formatMacroSummary,
  groupLogsByDay,
  rangeMidpoint,
} from "@/lib/snapcal-utils";

type WeightView = "day" | "week" | "month";
type WeightPoint = {
  key: string;
  label: string;
  tooltipLabel: string;
  weightKg: number | null;
  calories: number | null;
  calorieRange: Range | null;
};
type DailyRecordCategory = "excellent" | "normal" | "needs-work";
type DailyRecordFilter = "all" | DailyRecordCategory;
type DailyRecordCard = {
  record: DailyWellnessRecord;
  calorieRange: Range | null;
  macroSummary: string | null;
  category: DailyRecordCategory;
  searchText: string;
};

const DAILY_RECORDS_PAGE_SIZE = 5;

const dayFormatters = {
  en: new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    weekday: "short",
    day: "numeric",
    month: "short",
  }),
  zh: new Intl.DateTimeFormat("zh-SG", {
    timeZone: "Asia/Singapore",
    weekday: "short",
    day: "numeric",
    month: "short",
  }),
} satisfies Record<SnapCalLanguage, Intl.DateTimeFormat>;

const monthFormatters = {
  en: new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    month: "short",
    year: "numeric",
  }),
  zh: new Intl.DateTimeFormat("zh-SG", {
    timeZone: "Asia/Singapore",
    month: "short",
    year: "numeric",
  }),
} satisfies Record<SnapCalLanguage, Intl.DateTimeFormat>;

function toSingaporeDate(dayKey: string) {
  return new Date(`${dayKey}T00:00:00+08:00`);
}

function formatDay(dayKey: string, language: SnapCalLanguage) {
  return dayFormatters[language].format(toSingaporeDate(dayKey));
}

function formatWeight(weightKg: number | null, language: SnapCalLanguage) {
  return typeof weightKg === "number"
    ? `${weightKg.toFixed(1)} kg`
    : language === "zh"
      ? "暂无体重"
      : "No weight";
}

function formatWeightDelta(delta: number | null, language: SnapCalLanguage) {
  if (delta === null) {
    return language === "zh" ? "暂无趋势" : "No trend";
  }

  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} kg`;
}

function average(values: number[]) {
  return values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function averageCaloriesFromDailyMetrics(
  records: DailyWellnessRecord[],
  dayGroupsByKey: Map<string, { totalRange: Range }>,
) {
  const calorieByDay = new Map<string, Range>();

  for (const record of records) {
    const calorieRange =
      record.calorieRange ?? dayGroupsByKey.get(record.dayKey)?.totalRange ?? null;

    if (calorieRange) {
      calorieByDay.set(record.dayKey, calorieRange);
    }
  }

  for (const [dayKey, group] of dayGroupsByKey) {
    if (!calorieByDay.has(dayKey)) {
      calorieByDay.set(dayKey, group.totalRange);
    }
  }

  if (calorieByDay.size === 0) {
    return null;
  }

  return Math.round(
    Array.from(calorieByDay.values()).reduce(
      (sum, range) => sum + rangeMidpoint(range),
      0,
    ) / calorieByDay.size,
  );
}

function getWeekKey(dayKey: string) {
  const date = toSingaporeDate(dayKey);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);

  return date.toISOString().slice(0, 10);
}

function buildWeightSeries(
  records: DailyWellnessRecord[],
  dayGroupsByKey: Map<string, { totalRange: Range }>,
  view: WeightView,
  language: SnapCalLanguage,
) {
  const dailyMetrics = new Map<
    string,
    { dayKey: string; weightKg: number | null; calorieRange: Range | null }
  >();

  for (const record of records) {
    dailyMetrics.set(record.dayKey, {
      dayKey: record.dayKey,
      weightKg: typeof record.weightKg === "number" ? record.weightKg : null,
      calorieRange:
        record.calorieRange ?? dayGroupsByKey.get(record.dayKey)?.totalRange ?? null,
    });
  }

  for (const [dayKey, group] of dayGroupsByKey) {
    const existing = dailyMetrics.get(dayKey);

    if (existing) {
      dailyMetrics.set(dayKey, {
        ...existing,
        calorieRange: existing.calorieRange ?? group.totalRange,
      });
      continue;
    }

    dailyMetrics.set(dayKey, {
      dayKey,
      weightKg: null,
      calorieRange: group.totalRange,
    });
  }

  const datedMetrics = Array.from(dailyMetrics.values())
    .filter(
      (record) =>
        typeof record.weightKg === "number" || Boolean(record.calorieRange),
    )
    .sort((left, right) => left.dayKey.localeCompare(right.dayKey));

  if (view === "day") {
    return datedMetrics.map((record) => ({
      key: record.dayKey,
      label: formatDay(record.dayKey, language),
      tooltipLabel:
        language === "zh"
          ? `日期：${formatDay(record.dayKey, language)}`
          : `Day: ${formatDay(record.dayKey, language)}`,
      weightKg: record.weightKg,
      calories: record.calorieRange ? rangeMidpoint(record.calorieRange) : null,
      calorieRange: record.calorieRange,
    })) satisfies WeightPoint[];
  }

  const grouped = new Map<
    string,
    { label: string; weights: number[]; calories: number[] }
  >();

  for (const record of datedMetrics) {
    const key = view === "week" ? getWeekKey(record.dayKey) : record.dayKey.slice(0, 7);
    const existing = grouped.get(key);
    const calories = record.calorieRange ? rangeMidpoint(record.calorieRange) : null;

    if (existing) {
      if (typeof record.weightKg === "number") {
        existing.weights.push(record.weightKg);
      }

      if (typeof calories === "number") {
        existing.calories.push(calories);
      }
      continue;
    }

    grouped.set(key, {
      label:
        view === "week"
          ? language === "zh"
            ? `${formatDay(key, language)} 当周`
            : `Week of ${formatDay(key, language)}`
          : monthFormatters[language].format(toSingaporeDate(`${key}-01`)),
      weights: typeof record.weightKg === "number" ? [record.weightKg] : [],
      calories: typeof calories === "number" ? [calories] : [],
    });
  }

  return Array.from(grouped.entries()).map(([key, group]) => ({
    key,
    label: group.label,
    tooltipLabel:
      view === "week"
        ? language === "zh"
          ? `周：${formatDay(key, language)} 当周`
          : `Week of ${formatDay(key, language)}`
        : language === "zh"
          ? `月份：${group.label}`
          : `Month: ${group.label}`,
    weightKg:
      group.weights.length > 0 ? Number(average(group.weights).toFixed(1)) : null,
    calories:
      group.calories.length > 0 ? Math.round(average(group.calories)) : null,
    calorieRange: null,
  })) satisfies WeightPoint[];
}

function getPlateauReadout(series: WeightPoint[], language: SnapCalLanguage) {
  const weightedSeries = series.filter(
    (point): point is WeightPoint & { weightKg: number } =>
      typeof point.weightKg === "number",
  );

  if (weightedSeries.length < 4) {
    return language === "zh" ? "积累中" : "Building";
  }

  const recent = weightedSeries.slice(-4);
  const delta = recent[recent.length - 1].weightKg - recent[0].weightKg;

  if (Math.abs(delta) < 0.3) {
    return language === "zh" ? "平台期观察" : "Plateau watch";
  }

  if (delta < 0) {
    return language === "zh" ? "继续下降" : "Moving down";
  }

  return language === "zh" ? "水重回升" : "Water up";
}

function getDisplayName(name: string, language: SnapCalLanguage) {
  const trimmedName = name.trim();

  if (trimmedName.length > 0) {
    return trimmedName;
  }

  return language === "zh" ? "用户" : "User";
}

function getDailyRecordCategory(
  record: DailyWellnessRecord,
  calorieRange: Range | null,
  goal: number,
): DailyRecordCategory {
  if (typeof record.dietScore === "number") {
    if (record.dietScore >= 80) {
      return "excellent";
    }

    if (record.dietScore >= 60) {
      return "normal";
    }

    return "needs-work";
  }

  if (!calorieRange) {
    return "normal";
  }

  const midpoint = rangeMidpoint(calorieRange);

  if (midpoint <= goal && midpoint >= goal * 0.65) {
    return "excellent";
  }

  if (midpoint <= goal * 1.15) {
    return "normal";
  }

  return "needs-work";
}

function getCategoryLabel(
  category: DailyRecordCategory,
  language: SnapCalLanguage,
) {
  if (language === "zh") {
    return {
      excellent: "减脂优秀日",
      normal: "普通日",
      "needs-work": "急需改进日",
    }[category];
  }

  return {
    excellent: "Strong fat-loss day",
    normal: "Regular day",
    "needs-work": "Needs attention",
  }[category];
}

function getCategoryTone(category: DailyRecordCategory) {
  return {
    excellent: "border-[rgba(14,110,115,0.22)] bg-[rgba(14,110,115,0.1)] text-[var(--teal)]",
    normal: "border-[rgba(243,181,76,0.28)] bg-[rgba(243,181,76,0.14)] text-[var(--foreground)]",
    "needs-work": "border-[rgba(239,106,67,0.26)] bg-[rgba(239,106,67,0.12)] text-[var(--coral)]",
  }[category];
}

function buildDailyRecordSearchText(
  record: DailyWellnessRecord,
  language: SnapCalLanguage,
) {
  return [
    record.dayKey,
    formatDay(record.dayKey, language),
    record.weightNote,
    record.exerciseNote,
    record.sleepNote,
    ...record.mealHighlights,
    ...record.improvementPoints,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function SnapCalHistory() {
  const { goal, language, logs, profile, wellnessRecords } = useSnapCal();
  const isZh = language === "zh";
  const [weightView, setWeightView] = useState<WeightView>("day");
  const [recordSearch, setRecordSearch] = useState("");
  const [recordFilter, setRecordFilter] = useState<DailyRecordFilter>("all");
  const [recordPage, setRecordPage] = useState(1);
  const displayName = getDisplayName(profile.displayName, language);
  const sortedRecords = useMemo(
    () => [...wellnessRecords].sort((left, right) => right.dayKey.localeCompare(left.dayKey)),
    [wellnessRecords],
  );
  const chronologicalRecords = useMemo(
    () => [...wellnessRecords].sort((left, right) => left.dayKey.localeCompare(right.dayKey)),
    [wellnessRecords],
  );
  const dayGroupsByKey = useMemo(
    () => new Map(groupLogsByDay(logs).map((group) => [group.dayKey, group])),
    [logs],
  );
  const weightSeries = useMemo(
    () => buildWeightSeries(wellnessRecords, dayGroupsByKey, weightView, language),
    [dayGroupsByKey, wellnessRecords, weightView, language],
  );
  const weightedRecords = chronologicalRecords.filter(
    (record): record is DailyWellnessRecord & { weightKg: number } =>
      typeof record.weightKg === "number",
  );
  const firstWeight = weightedRecords[0]?.weightKg ?? null;
  const latestWeight = weightedRecords[weightedRecords.length - 1]?.weightKg ?? null;
  const weightDelta =
    typeof firstWeight === "number" && typeof latestWeight === "number"
      ? latestWeight - firstWeight
      : null;
  const averageScore = Math.round(
    average(
      wellnessRecords
        .map((record) => record.dietScore)
        .filter((score): score is number => typeof score === "number"),
    ),
  );
  const averageCalories = useMemo(
    () => averageCaloriesFromDailyMetrics(wellnessRecords, dayGroupsByKey),
    [dayGroupsByKey, wellnessRecords],
  );
  const trackedDays = wellnessRecords.length;
  const latestRecord = sortedRecords[0];
  const plateauReadout = getPlateauReadout(weightSeries, language);
  const weightViewLabels = {
    day: isZh ? "日" : "Day",
    week: isZh ? "周" : "Week",
    month: isZh ? "月" : "Month",
  } satisfies Record<WeightView, string>;
  const dailyRecords = useMemo(
    () =>
      sortedRecords.map<DailyRecordCard>((record) => {
        const dayGroup = dayGroupsByKey.get(record.dayKey);
        const calorieRange = record.calorieRange ?? dayGroup?.totalRange ?? null;

        return {
          record,
          calorieRange,
          macroSummary: formatMacroSummary(dayGroup?.macroRange, language),
          category: getDailyRecordCategory(record, calorieRange, goal),
          searchText: buildDailyRecordSearchText(record, language),
        };
      }),
    [dayGroupsByKey, goal, language, sortedRecords],
  );
  const categoryCounts = useMemo(
    () =>
      dailyRecords.reduce<Record<DailyRecordFilter, number>>(
        (counts, item) => {
          counts.all += 1;
          counts[item.category] += 1;
          return counts;
        },
        { all: 0, excellent: 0, normal: 0, "needs-work": 0 },
      ),
    [dailyRecords],
  );
  const normalizedSearch = recordSearch.trim().toLowerCase();
  const filteredDailyRecords = useMemo(
    () =>
      dailyRecords.filter((item) => {
        const matchesCategory =
          recordFilter === "all" || item.category === recordFilter;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          item.searchText.includes(normalizedSearch);

        return matchesCategory && matchesSearch;
      }),
    [dailyRecords, normalizedSearch, recordFilter],
  );
  const totalRecordPages = Math.max(
    1,
    Math.ceil(filteredDailyRecords.length / DAILY_RECORDS_PAGE_SIZE),
  );
  const safeRecordPage = Math.min(recordPage, totalRecordPages);
  const visibleDailyRecords = filteredDailyRecords.slice(
    (safeRecordPage - 1) * DAILY_RECORDS_PAGE_SIZE,
    safeRecordPage * DAILY_RECORDS_PAGE_SIZE,
  );
  const firstVisibleRecord =
    filteredDailyRecords.length > 0
      ? (safeRecordPage - 1) * DAILY_RECORDS_PAGE_SIZE + 1
      : 0;
  const lastVisibleRecord = Math.min(
    safeRecordPage * DAILY_RECORDS_PAGE_SIZE,
    filteredDailyRecords.length,
  );
  const filterLabels = {
    all: isZh ? "全部记录" : "All records",
    excellent: getCategoryLabel("excellent", language),
    normal: getCategoryLabel("normal", language),
    "needs-work": getCategoryLabel("needs-work", language),
  } satisfies Record<DailyRecordFilter, string>;

  return (
    <main className="relative flex-1 overflow-hidden px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SnapCalNav />

        <section className="card-surface rounded-[28px] px-5 py-6 sm:px-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                {isZh ? "健康历史" : "Health History"}
              </p>
              <h1 className="font-display mt-2 text-4xl text-[var(--foreground)]">
                {isZh
                  ? `${displayName} 的饮食、体重与健康仪表盘`
                  : `${displayName}'s nutrition, weight, and health dashboard`}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
                {isZh
                  ? "食物图片没有保存，只保留文字记录、热量区间、营养估算、体重趋势、运动、睡眠和每日改进点。"
                  : "Food photos were excluded. This page keeps the text logs, calorie ranges, nutrition estimates, weight trend, movement, sleep notes, and daily coaching points."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                label={isZh ? "最新体重" : "Latest weight"}
                value={formatWeight(latestWeight, language)}
              />
              <MetricCard
                label={isZh ? "较首条记录" : "Since first log"}
                value={formatWeightDelta(weightDelta, language)}
              />
              <MetricCard
                label={isZh ? "平均评分" : "Average score"}
                value={
                  averageScore
                    ? `${averageScore}/100`
                    : isZh
                      ? "等待中"
                      : "Waiting"
                }
              />
              <MetricCard
                label={isZh ? "健康记录天数" : "Health days"}
                value={isZh ? `${trackedDays} 天` : `${trackedDays} days`}
              />
            </div>
          </div>
        </section>

        <section className="card-surface rounded-[28px] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                {isZh ? "体重 + 摄入热量趋势" : "Weight + Intake Calories Trend"}
              </p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
                {isZh ? "看食物摄入和体重如何一起变化" : "See how food intake and weight move together"}
              </h2>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-full border border-[rgba(55,36,24,0.12)] bg-white/78 p-1 text-sm font-semibold">
              {(["day", "week", "month"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setWeightView(view)}
                  className={`min-w-20 rounded-full px-4 py-2 transition ${
                    weightView === view
                      ? "bg-[var(--foreground)] text-white"
                      : "text-[var(--foreground)] hover:bg-[rgba(36,22,15,0.06)]"
                  }`}
                >
                  {weightViewLabels[view]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_0.8fr]">
            <WeightChart language={language} series={weightSeries} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MetricCard
                label={isZh ? "趋势状态" : "Trend status"}
                value={plateauReadout}
              />
              <MetricCard
                label={isZh ? "平均摄入" : "Average intake"}
                value={
                  averageCalories
                    ? `${averageCalories} kcal`
                    : isZh
                      ? "等待中"
                      : "Waiting"
                }
              />
              <MetricCard
                label={isZh ? "每日目标" : "Daily target"}
                value={`${goal} kcal`}
              />
              <MetricCard
                label={isZh ? "最近记录日" : "Latest logged day"}
                value={
                  latestRecord
                    ? formatDay(latestRecord.dayKey, language)
                    : isZh
                      ? "等待中"
                      : "Waiting"
                }
              />
            </div>
          </div>
        </section>

        <section className="card-surface rounded-[28px] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                {isZh ? "每日记录" : "Daily Ledger"}
              </p>
              <h2 className="font-display text-3xl text-[var(--foreground)]">
                {isZh
                  ? "按表现分类回溯饮食、运动和睡眠"
                  : "Review meals, movement, and sleep by daily outcome"}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_220px] lg:w-[520px]">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {isZh ? "搜索" : "Search"}
                </span>
                <input
                  value={recordSearch}
                  onChange={(event) => {
                    setRecordSearch(event.target.value);
                    setRecordPage(1);
                  }}
                  placeholder={
                    isZh ? "日期、食物、睡眠或改进点" : "Date, meal, sleep, or note"
                  }
                  className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white/86 px-4 py-3 text-sm outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {isZh ? "分类" : "Category"}
                </span>
                <select
                  value={recordFilter}
                  onChange={(event) => {
                    setRecordFilter(event.target.value as DailyRecordFilter);
                    setRecordPage(1);
                  }}
                  className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white/86 px-4 py-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
                >
                  {(Object.keys(filterLabels) as DailyRecordFilter[]).map((filter) => (
                    <option key={filter} value={filter}>
                      {filterLabels[filter]} ({categoryCounts[filter]})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {visibleDailyRecords.length > 0 ? (
              visibleDailyRecords.map((item) => {
                const { calorieRange, category, macroSummary, record } = item;
                return (
                  <article
                    key={record.dayKey}
                    className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          {record.dayKey}
                        </p>
                        <h3 className="font-display mt-1 text-3xl text-[var(--foreground)]">
                          {formatDay(record.dayKey, language)}
                        </h3>
                        <span
                          className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getCategoryTone(
                            category,
                          )}`}
                        >
                          {getCategoryLabel(category, language)}
                        </span>
                        {record.weightNote ? (
                          <p className="mt-2 text-sm text-[var(--muted)]">{record.weightNote}</p>
                        ) : null}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
                        <MiniMetric
                          label={isZh ? "体重" : "Weight"}
                          value={formatWeight(record.weightKg, language)}
                        />
                        <MiniMetric
                          label={isZh ? "热量" : "Calories"}
                          value={
                            calorieRange
                              ? formatCalories(calorieRange)
                              : isZh
                                ? "暂无估算"
                                : "No estimate"
                          }
                        />
                        <MiniMetric
                          label={isZh ? "饮食评分" : "Diet score"}
                          value={
                            typeof record.dietScore === "number"
                              ? `${record.dietScore}/100`
                              : isZh
                                ? "暂无评分"
                                : "No score"
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[20px] bg-[rgba(255,248,240,0.86)] px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                          {isZh ? "饮食" : "Meals"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {record.mealHighlights.map((meal) => (
                            <span
                              key={`${record.dayKey}-${meal}`}
                              className="rounded-full bg-white/86 px-3 py-1 text-sm font-medium text-[var(--foreground)]"
                            >
                              {meal}
                            </span>
                          ))}
                        </div>
                        {macroSummary ? (
                          <p className="mt-3 text-sm text-[var(--muted)]">{macroSummary}</p>
                        ) : null}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <InfoBlock
                          label={isZh ? "运动" : "Movement"}
                          value={
                            record.exerciseNote ??
                            (isZh ? "暂无运动记录。" : "No movement note.")
                          }
                        />
                        <InfoBlock
                          label={isZh ? "睡眠" : "Sleep"}
                          value={
                            record.sleepNote ??
                            (isZh ? "暂无睡眠记录。" : "No sleep note.")
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-[20px] border border-[rgba(55,36,24,0.08)] bg-white/72 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                        {isZh ? "下一步改进" : "Improve Next"}
                      </p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {record.improvementPoints.map((point) => (
                          <p
                            key={`${record.dayKey}-${point}`}
                            className="rounded-[16px] bg-[rgba(14,110,115,0.08)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]"
                          >
                            {point}
                          </p>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                {isZh
                  ? "没有符合当前条件的每日记录。"
                  : "No daily records match the current filters."}
              </div>
            )}
          </div>

          {filteredDailyRecords.length > DAILY_RECORDS_PAGE_SIZE ? (
            <div className="mt-5 flex flex-col gap-3 rounded-[22px] border border-[rgba(55,36,24,0.08)] bg-white/74 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted)]">
                {isZh
                  ? `显示 ${firstVisibleRecord}-${lastVisibleRecord} / ${filteredDailyRecords.length} 条`
                  : `Showing ${firstVisibleRecord}-${lastVisibleRecord} of ${filteredDailyRecords.length}`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRecordPage((page) => Math.max(1, page - 1))}
                  disabled={safeRecordPage === 1}
                  className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isZh ? "上一页" : "Previous"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRecordPage((page) => Math.min(totalRecordPages, page + 1))
                  }
                  disabled={safeRecordPage === totalRecordPages}
                  className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isZh ? "下一页" : "Next"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function formatTrendCalories(point: WeightPoint, language: SnapCalLanguage) {
  if (point.calorieRange) {
    return formatCalories(point.calorieRange);
  }

  if (typeof point.calories === "number") {
    return `${point.calories} kcal`;
  }

  return language === "zh" ? "暂无热量" : "No calories";
}

function WeightChart({
  language,
  series,
}: {
  language: SnapCalLanguage;
  series: WeightPoint[];
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const width = 640;
  const height = 220;
  const paddingX = 34;
  const paddingY = 24;
  const weights = series
    .map((point) => point.weightKg)
    .filter((value): value is number => typeof value === "number");
  const calories = series
    .map((point) => point.calories)
    .filter((value): value is number => typeof value === "number");
  const minWeight = weights.length > 0 ? Math.min(...weights) - 0.3 : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) + 0.3 : 1;
  const span = Math.max(maxWeight - minWeight, 0.8);
  const minCaloriesRaw = calories.length > 0 ? Math.min(...calories) : 0;
  const maxCaloriesRaw = calories.length > 0 ? Math.max(...calories) : 1;
  const caloriePadding = Math.max(120, (maxCaloriesRaw - minCaloriesRaw) * 0.12);
  const minCalories = Math.max(0, minCaloriesRaw - caloriePadding);
  const maxCalories = maxCaloriesRaw + caloriePadding;
  const calorieSpan = Math.max(maxCalories - minCalories, 300);
  const points = series.map((point, index) => {
    const x =
      series.length === 1
        ? width / 2
        : paddingX + (index / (series.length - 1)) * (width - paddingX * 2);
    const weightY =
      typeof point.weightKg === "number"
        ? height - paddingY - ((point.weightKg - minWeight) / span) * (height - paddingY * 2)
        : null;
    const calorieY =
      typeof point.calories === "number"
        ? height -
          paddingY -
          ((point.calories - minCalories) / calorieSpan) * (height - paddingY * 2)
        : null;

    return { ...point, x, weightY, calorieY };
  });
  const weightPoints = points.filter(
    (point): point is typeof point & { weightY: number } =>
      typeof point.weightY === "number",
  );
  const caloriePoints = points.filter(
    (point): point is typeof point & { calorieY: number } =>
      typeof point.calorieY === "number",
  );
  const weightPolyline = weightPoints.map((point) => `${point.x},${point.weightY}`).join(" ");
  const caloriePolyline = caloriePoints.map((point) => `${point.x},${point.calorieY}`).join(" ");
  const hoveredPoint = points.find((point) => point.key === hoveredKey) ?? null;
  const hoveredTop = hoveredPoint?.weightY ?? hoveredPoint?.calorieY ?? height / 2;

  return (
    <div className="relative rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-4">
      {points.length > 0 ? (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--teal)]" />
              {language === "zh" ? "体重 kg" : "Weight kg"}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--amber)]" />
              {language === "zh" ? "摄入 kcal" : "Intake kcal"}
            </span>
          </div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-64 w-full"
            role="img"
            aria-label={language === "zh" ? "体重和摄入热量趋势图" : "Weight and intake calories trend chart"}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {[0, 1, 2, 3].map((line) => {
              const y = paddingY + (line / 3) * (height - paddingY * 2);
              return (
                <line
                  key={line}
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                  stroke="rgba(55,36,24,0.1)"
                  strokeWidth="1"
                />
              );
            })}
            {caloriePoints.length > 1 ? (
              <polyline
                fill="none"
                points={caloriePolyline}
                stroke="var(--amber)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            ) : null}
            {weightPoints.length > 1 ? (
              <polyline
                fill="none"
                points={weightPolyline}
                stroke="var(--teal)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            ) : null}
            {points.map((point) => (
              <g
                key={point.key}
                className="cursor-pointer outline-none"
                tabIndex={0}
                onBlur={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(point.key)}
                onMouseEnter={() => setHoveredKey(point.key)}
              >
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={paddingY}
                  y2={height - paddingY}
                  stroke="transparent"
                  strokeWidth="18"
                />
                <title>{`${point.tooltipLabel}: ${formatWeight(
                  point.weightKg,
                  language,
                )} · ${formatTrendCalories(point, language)}`}</title>
              </g>
            ))}
            {caloriePoints.map((point) => (
              <circle
                key={`calories-${point.key}`}
                cx={point.x}
                cy={point.calorieY}
                r="5"
                fill="var(--amber)"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            {weightPoints.map((point) => (
              <circle
                key={`weight-${point.key}`}
                cx={point.x}
                cy={point.weightY}
                r="5.5"
                fill="var(--teal)"
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>
          {hoveredPoint ? (
            <div
              className="pointer-events-none absolute z-10 min-w-44 rounded-[18px] border border-[rgba(55,36,24,0.1)] bg-white px-4 py-3 text-sm shadow-[0_18px_44px_rgba(55,36,24,0.14)]"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredTop / height) * 100}%`,
                transform:
                  hoveredPoint.x > width * 0.72
                    ? "translate(-100%, -115%)"
                    : "translate(12px, -115%)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {language === "zh" ? "明细" : "Details"}
              </p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {hoveredPoint.tooltipLabel}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {language === "zh" ? "体重" : "Weight"}
                  </p>
                  <p className="mt-1 font-display text-xl text-[var(--foreground)]">
                    {formatWeight(hoveredPoint.weightKg, language)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    {language === "zh" ? "摄入" : "Intake"}
                  </p>
                  <p className="mt-1 font-display text-xl text-[var(--foreground)]">
                    {formatTrendCalories(hoveredPoint, language)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {points.slice(-4).map((point) => (
              <div key={point.key} className="rounded-[16px] bg-[rgba(255,248,240,0.86)] px-3 py-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{point.label}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <p className="font-display text-lg text-[var(--foreground)]">
                    {formatWeight(point.weightKg, language)}
                  </p>
                  <p className="font-display text-lg text-[var(--foreground)]">
                    {formatTrendCalories(point, language)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">
          {language === "zh" ? "还没有体重或摄入热量数据。" : "No weight or intake data yet."}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[rgba(55,36,24,0.08)] bg-white/80 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-2xl text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[rgba(255,248,240,0.86)] px-3 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-xl text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[rgba(55,36,24,0.08)] bg-white/76 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{value}</p>
    </div>
  );
}

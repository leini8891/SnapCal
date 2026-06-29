"use client";

import Link from "next/link";
import { useState } from "react";
import SnapCalNav from "@/components/snapcal-nav";
import { useSnapCal } from "@/components/snapcal-provider";
import {
  buildExportJson,
  buildMealLogsCsv,
  buildSavedMealsCsv,
} from "@/lib/export/snapcal-export";
import {
  formatCalories,
  formatDayLabel,
  formatLoggedTime,
  getSingaporeDayKey,
  isTodayInSingapore,
} from "@/lib/snapcal-utils";
import { computeTargets, type TargetInput } from "@/lib/tdee";
import type { ActivityLevel, PilotProfile, Sex } from "@/lib/mock-data";

const presets = [1500, 1650, 1800, 2000, 2200];

type ExportStatus = "ready" | "json" | "logs" | "shortcuts";

export default function SnapCalSettings() {
  const {
    authUserEmail,
    clearLogs,
    cloudConfigured,
    cloudUserId,
    goal,
    hydrated,
    language,
    lastSyncedAt,
    logs,
    profile,
    retryCloudConnection,
    restoreDemo,
    savedMeals,
    startFreshLivePilot,
    setGoal,
    signOut,
    storageMode,
    syncMessage,
    syncNow,
    syncStatus,
    updateSavedMeal,
  } = useSnapCal();
  const isZh = language === "zh";
  const [shortcutDrafts, setShortcutDrafts] = useState<
    Record<string, { name: string; modifiersInput: string }>
  >({});
  const [exportStatus, setExportStatus] = useState<ExportStatus>("ready");
  const todayCount = logs.filter((log) => isTodayInSingapore(log.loggedAt)).length;
  const displayName = profile.displayName.trim() || (isZh ? "用户" : "User");
  const profileTargetInput = buildProfileTargetInput(profile);
  const profileTargets = profileTargetInput
    ? computeTargets(profileTargetInput)
    : null;
  const proteinGoal = profile.proteinGoalG ?? profileTargets?.proteinGoalG ?? null;
  const cloudStatusLabel = formatCloudStatus({
    cloudConfigured,
    hydrated,
    isZh,
    storageMode,
    syncStatus,
  });
  const exportMessage = {
    ready: isZh
      ? "可以导出 JSON 或 CSV，方便自己备份和复盘。"
      : "Export JSON or CSV for backup and review.",
    json: isZh ? "完整 JSON 已下载。" : "Full JSON export downloaded.",
    logs: isZh ? "饮食记录 CSV 已下载。" : "Meal logs CSV downloaded.",
    shortcuts: isZh ? "常用餐食 CSV 已下载。" : "Saved meals CSV downloaded.",
  } satisfies Record<ExportStatus, string>;

  function updateDraft(
    id: string,
    field: "name" | "modifiersInput",
    value: string,
  ) {
    setShortcutDrafts((current) => ({
      ...current,
      [id]: {
        name: current[id]?.name ?? "",
        modifiersInput: current[id]?.modifiersInput ?? "",
        [field]: value,
      },
    }));
  }

  function saveShortcut(id: string) {
    const draft = shortcutDrafts[id];

    if (!draft) {
      return;
    }

    updateSavedMeal(id, {
      name: draft.name.trim(),
      modifiers: parseModifierInput(draft.modifiersInput),
    });
    setShortcutDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function downloadTextFile(
    filename: string,
    content: string,
    contentType: string,
  ) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function exportJson() {
    downloadTextFile(
      "snapcal-export.json",
      buildExportJson({ goal, profile, logs, savedMeals }),
      "application/json;charset=utf-8",
    );
    setExportStatus("json");
  }

  function exportLogsCsv() {
    downloadTextFile(
      "snapcal-logs.csv",
      buildMealLogsCsv(logs),
      "text/csv;charset=utf-8",
    );
    setExportStatus("logs");
  }

  function exportShortcutsCsv() {
    downloadTextFile(
      "snapcal-shortcuts.csv",
      buildSavedMealsCsv(savedMeals),
      "text/csv;charset=utf-8",
    );
    setExportStatus("shortcuts");
  }

  return (
    <main className="relative flex-1 overflow-hidden px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SnapCalNav />

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                {isZh ? "设置" : "Settings"}
              </p>
              <h1 className="font-display mt-2 text-4xl text-[var(--foreground)]">
                {isZh ? "目标、数据和常用餐食" : "Targets, data, and saved meals"}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
                {isZh
                  ? "这里调整每日热量目标、管理本地记录，并编辑经常重复的餐食。"
                  : "Adjust the daily calorie target, manage local records, and edit meals you repeat often."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label={isZh ? "当前目标" : "Daily goal"} value={`${goal} kcal`} />
              <MetricCard
                label={isZh ? "蛋白目标" : "Protein"}
                value={
                  proteinGoal
                    ? `${proteinGoal}g`
                    : isZh
                      ? "未设置"
                      : "Not set"
                }
              />
              <MetricCard
                label={isZh ? "饮食记录" : "Meal logs"}
                value={isZh ? `${logs.length} 条` : `${logs.length} entries`}
              />
              <MetricCard
                label={isZh ? "数据保存" : "Data storage"}
                value={cloudStatusLabel}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              {isZh ? "每日目标" : "Daily Target"}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
              {isZh ? "调整每日热量预算" : "Adjust the daily calorie target"}
            </h2>
            <div className="mt-6 rounded-[28px] bg-white/82 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[var(--muted)]">
                    {isZh ? "当前目标" : "Current target"}
                  </p>
                  <p className="font-display mt-1 text-4xl text-[var(--foreground)]">
                    {goal} kcal
                  </p>
                </div>
                <span className="rounded-full bg-[rgba(184,202,105,0.22)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
                  {isZh ? `今天 ${todayCount} 餐` : `${todayCount} meals today`}
                </span>
              </div>

              <input
                className="mt-6 w-full accent-[var(--coral)]"
                type="range"
                min="1200"
                max="2600"
                step="50"
                value={goal}
                onChange={(event) => setGoal(Number(event.target.value))}
              />

              <div className="mt-5 flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGoal(preset)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      preset === goal
                        ? "bg-[var(--foreground)] text-white"
                        : "border border-[rgba(55,36,24,0.12)] bg-white text-[var(--foreground)]"
                    }`}
                  >
                    {preset} kcal
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              {isZh ? "个人资料" : "Profile"}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
              {isZh ? `${displayName} 的目标设置` : `${displayName}'s goal setup`}
            </h2>
            <div className="mt-6 grid gap-3">
              <InfoRow
                label={isZh ? "显示名称" : "Display name"}
                value={displayName}
              />
              <InfoRow
                label={isZh ? "目标速度" : "Goal pace"}
                value={formatGoalPace(profile.goalPace, isZh)}
              />
              <InfoRow
                label={isZh ? "性别" : "Sex"}
                value={formatSex(profile.sex ?? null, isZh)}
              />
              <InfoRow
                label={isZh ? "年龄" : "Age"}
                value={
                  profile.age
                    ? isZh
                      ? `${profile.age} 岁`
                      : `${profile.age} years`
                    : formatMissing(isZh)
                }
              />
              <InfoRow
                label={isZh ? "身高 / 体重" : "Height / weight"}
                value={formatBodyMetrics(profile, isZh)}
              />
              <InfoRow
                label={isZh ? "活动量" : "Activity"}
                value={formatActivityLevel(profile.activityLevel ?? null, isZh)}
              />
              <InfoRow
                label={isZh ? "蛋白目标" : "Protein target"}
                value={
                  proteinGoal
                    ? `${proteinGoal}g`
                    : formatMissing(isZh)
                }
              />
              <InfoRow
                label={isZh ? "计算建议" : "Calculated recommendation"}
                value={
                  profileTargets
                    ? `${profileTargets.calorieGoal} kcal · TDEE ≈ ${Math.round(
                        profileTargets.tdee,
                      )}`
                    : formatMissing(isZh)
                }
              />
              <InfoRow
                label={isZh ? "设置状态" : "Setup status"}
                value={
                  profile.onboardingCompletedAt
                    ? `${formatDayLabel(
                        getSingaporeDayKey(profile.onboardingCompletedAt),
                      )} · ${formatLoggedTime(profile.onboardingCompletedAt)}`
                    : isZh
                      ? "尚未完成"
                      : "Not completed"
                }
              />
            </div>
            <Link
              href="/welcome"
              className="mt-5 inline-flex items-center justify-center rounded-[16px] border border-[var(--coral)] bg-[var(--coral-tint)] px-4 py-3 text-sm font-bold text-[var(--coral-ink)] transition hover:translate-y-[-1px]"
            >
              {isZh ? "编辑身体资料" : "Edit body profile"}
            </Link>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              {isZh ? "数据保存" : "Data Storage"}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
              {cloudConfigured
                ? isZh
                  ? "当前可同步到云端"
                  : "Cloud sync is available"
                : isZh
                  ? "当前仅保存在本机"
                  : "Stored locally on this device"}
            </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {cloudConfigured
                ? isZh
                  ? "登录账号后，刷新页面会从云端恢复你的私人记录。"
                  : "After you sign in, refreshes restore your private records from the cloud."
                : isZh
                  ? "作品集版本默认使用浏览器本地存储，记录不会离开这台设备。"
                  : "This portfolio build uses browser storage by default, so records stay on this device."}
            </p>
            <div className="mt-5 grid gap-3">
              <InfoRow
                label={isZh ? "当前状态" : "Current status"}
                value={cloudStatusLabel}
              />
              <InfoRow
                label={isZh ? "同步信息" : "Sync message"}
                value={localizeSyncMessage(syncMessage, isZh)}
              />
              <InfoRow
                label={isZh ? "上次同步" : "Last synced"}
                value={
                  lastSyncedAt
                    ? `${formatDayLabel(
                        getSingaporeDayKey(lastSyncedAt),
                      )} · ${formatLoggedTime(lastSyncedAt)}`
                    : isZh
                      ? "尚未同步"
                      : "Not synced yet"
                }
              />
              {cloudUserId ? (
                <InfoRow
                  label={isZh ? "登录账号" : "Signed-in account"}
                  value={authUserEmail ?? cloudUserId.slice(0, 8)}
                />
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {cloudConfigured ? (
                <button
                  type="button"
                  onClick={syncNow}
                  className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  {isZh ? "立即同步" : "Sync now"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={retryCloudConnection}
                className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(239,106,67,0.28)]"
              >
                {isZh ? "重试连接" : "Retry connection"}
              </button>
              {cloudUserId ? (
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                  }}
                  className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(239,106,67,0.28)]"
                >
                  {isZh ? "退出登录" : "Sign out"}
                </button>
              ) : null}
            </div>
          </section>

          <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
              {isZh ? "数据管理" : "Data Management"}
            </p>
            <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
              {isZh ? "清理或恢复记录" : "Clear or restore records"}
            </h2>
            <div className="mt-6 space-y-3">
              <ActionCard
                title={isZh ? "重新开始" : "Start fresh"}
                body={
                  isZh
                    ? "清空记录、常用餐食和目标资料，回到新用户状态。"
                    : "Clear logs, saved meals, and profile setup so the app starts clean."
                }
                actionLabel={isZh ? "重新开始" : "Start fresh"}
                onClick={startFreshLivePilot}
              />
              <ActionCard
                title={isZh ? "恢复示例数据" : "Restore sample data"}
                body={
                  isZh
                    ? "恢复内置示例记录，方便演示完整流程。"
                    : "Reload the built-in sample records for a complete demo flow."
                }
                actionLabel={isZh ? "恢复示例" : "Restore sample"}
                onClick={restoreDemo}
              />
              <ActionCard
                title={isZh ? "只清空饮食记录" : "Clear meal logs only"}
                body={
                  isZh
                    ? "删除已记录餐食，保留目标和常用餐食。"
                    : "Delete meal logs while keeping the target and saved meals."
                }
                actionLabel={isZh ? "清空记录" : "Clear logs"}
                onClick={clearLogs}
              />
            </div>
          </section>
        </div>

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                {isZh ? "数据导出" : "Exports"}
              </p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
                {isZh ? "下载自己的记录" : "Download your records"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                {isZh
                  ? "导出完整备份，或只下载饮食记录和常用餐食。"
                  : "Export a full backup, or download meal logs and saved meals separately."}
              </p>
            </div>
            <span className="rounded-full bg-[rgba(243,181,76,0.18)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
              {isZh
                ? `${logs.length} 条记录 · ${savedMeals.length} 个常用餐`
                : `${logs.length} logs · ${savedMeals.length} shortcuts`}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportJson}
              className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              {isZh ? "导出完整 JSON" : "Export full JSON"}
            </button>
            <button
              type="button"
              onClick={exportLogsCsv}
              className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)]"
            >
              {isZh ? "导出饮食 CSV" : "Export logs CSV"}
            </button>
            <button
              type="button"
              onClick={exportShortcutsCsv}
              className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)]"
            >
              {isZh ? "导出常用餐 CSV" : "Export shortcuts CSV"}
            </button>
          </div>

          <div className="mt-4 rounded-[24px] bg-[rgba(255,248,240,0.74)] px-4 py-4 text-sm leading-7 text-[var(--muted)]">
            {exportMessage[exportStatus]}
          </div>
        </section>

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                {isZh ? "常用餐食" : "Saved Meals"}
              </p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
                {isZh ? "编辑重复记录的餐食" : "Edit repeat meals"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                {isZh
                  ? "常吃的餐食会保存在这里，之后记录可以更快。"
                  : "Meals you repeat often are saved here so future logging is faster."}
              </p>
            </div>
            <span className="rounded-full bg-[rgba(243,181,76,0.18)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
              {isZh ? `${savedMeals.length} 个` : `${savedMeals.length} shortcuts`}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {savedMeals.length > 0 ? (
              savedMeals.map((savedMeal) => {
                const draft = shortcutDrafts[savedMeal.id] ?? {
                  name: savedMeal.name,
                  modifiersInput: savedMeal.modifiers.join(", "),
                };
                const draftModifiers = parseModifierInput(draft.modifiersInput);
                const hasChanges =
                  draft.name.trim() !== savedMeal.name ||
                  draftModifiers.join("|") !== savedMeal.modifiers.join("|");

                return (
                  <article
                    key={savedMeal.id}
                    className="rounded-[28px] border border-[rgba(55,36,24,0.08)] bg-white/84 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-2xl text-[var(--foreground)]">
                            {savedMeal.name}
                          </span>
                          {savedMeal.isPinned ? (
                            <span className="rounded-full bg-[rgba(14,110,115,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
                              {isZh ? "置顶" : "Pinned"}
                            </span>
                          ) : null}
                          <span className="rounded-full bg-[rgba(243,181,76,0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">
                            {isZh
                              ? `使用 ${savedMeal.timesUsed} 次`
                              : `${savedMeal.timesUsed}x used`}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted)]">
                          {formatCalories(savedMeal.kcalRange)} ·{" "}
                          {isZh ? "最近使用" : "Last used"}{" "}
                          {formatDayLabel(getSingaporeDayKey(savedMeal.lastUsedAt))} ·{" "}
                          {formatLoggedTime(savedMeal.lastUsedAt)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateSavedMeal(savedMeal.id, {
                            isPinned: !savedMeal.isPinned,
                          })
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          savedMeal.isPinned
                            ? "bg-[var(--foreground)] text-white"
                            : "border border-[rgba(55,36,24,0.12)] bg-white text-[var(--foreground)]"
                        }`}
                      >
                        {savedMeal.isPinned
                          ? isZh
                            ? "取消置顶"
                            : "Unpin"
                          : isZh
                            ? "置顶"
                            : "Pin"}
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr_auto]">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          {isZh ? "餐食名称" : "Meal name"}
                        </span>
                        <input
                          className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
                          value={draft.name}
                          onChange={(event) =>
                            updateDraft(savedMeal.id, "name", event.target.value)
                          }
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          {isZh ? "默认备注" : "Default notes"}
                        </span>
                        <input
                          className="rounded-2xl border border-[rgba(55,36,24,0.12)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgba(14,110,115,0.4)] focus:ring-4 focus:ring-[rgba(14,110,115,0.08)]"
                          value={draft.modifiersInput}
                          placeholder={
                            isZh ? "例如 少酱、加蛋" : "e.g. Less sauce, add egg"
                          }
                          onChange={(event) =>
                            updateDraft(
                              savedMeal.id,
                              "modifiersInput",
                              event.target.value,
                            )
                          }
                        />
                      </label>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => saveShortcut(savedMeal.id)}
                          disabled={!hasChanges || draft.name.trim().length === 0}
                          className="w-full rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                        >
                          {isZh ? "保存" : "Save"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                {isZh
                  ? "还没有常用餐食。重复记录同一餐后，SnapCal 会把它保存到这里。"
                  : "No saved meals yet. Repeat the same meal and SnapCal will keep it here."}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function parseModifierInput(input: string) {
  return [...new Set(input.split(",").map((item) => item.trim()).filter(Boolean))];
}

function buildProfileTargetInput(profile: PilotProfile): TargetInput | null {
  if (
    !profile.sex ||
    !profile.age ||
    !profile.heightCm ||
    !profile.weightKg ||
    !profile.activityLevel
  ) {
    return null;
  }

  return {
    activityLevel: profile.activityLevel,
    age: profile.age,
    goalPace: profile.goalPace,
    heightCm: profile.heightCm,
    sex: profile.sex,
    weightKg: profile.weightKg,
  };
}

function formatMissing(isZh: boolean) {
  return isZh ? "未设置" : "Not set";
}

function formatSex(sex: Sex | null, isZh: boolean) {
  if (!sex) {
    return formatMissing(isZh);
  }

  if (isZh) {
    return sex === "female" ? "女性" : "男性";
  }

  return sex === "female" ? "Female" : "Male";
}

function formatBodyMetrics(profile: PilotProfile, isZh: boolean) {
  if (!profile.heightCm && !profile.weightKg) {
    return formatMissing(isZh);
  }

  const height = profile.heightCm ? `${profile.heightCm}cm` : formatMissing(isZh);
  const weight = profile.weightKg ? `${profile.weightKg}kg` : formatMissing(isZh);

  return `${height} / ${weight}`;
}

function formatActivityLevel(activityLevel: ActivityLevel | null, isZh: boolean) {
  if (!activityLevel) {
    return formatMissing(isZh);
  }

  if (isZh) {
    return {
      sedentary: "久坐",
      light: "轻度活动",
      moderate: "中等活动",
      active: "高活动",
      very_active: "很高活动",
    }[activityLevel];
  }

  return {
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    active: "Active",
    very_active: "Very active",
  }[activityLevel];
}

function formatGoalPace(pace: string, isZh: boolean) {
  if (isZh) {
    return {
      gentle: "温和",
      steady: "稳定",
      focused: "专注",
    }[pace] ?? pace;
  }

  return {
    gentle: "Gentle",
    steady: "Steady",
    focused: "Focused",
  }[pace] ?? pace;
}

function formatCloudStatus({
  cloudConfigured,
  hydrated,
  isZh,
  storageMode,
  syncStatus,
}: {
  cloudConfigured: boolean;
  hydrated: boolean;
  isZh: boolean;
  storageMode: string;
  syncStatus: string;
}) {
  if (!hydrated) {
    return isZh ? "准备中" : "Preparing";
  }

  if (!cloudConfigured) {
    return isZh ? "仅本机" : "Local only";
  }

  if (syncStatus === "error") {
    return isZh ? "云同步异常" : "Cloud error";
  }

  if (syncStatus === "syncing") {
    return isZh ? "同步中" : "Syncing";
  }

  if (storageMode === "supabase") {
    return isZh ? "云端已连接" : "Cloud connected";
  }

  return isZh ? "本机备用" : "Local fallback";
}

function localizeSyncMessage(message: string, isZh: boolean) {
  if (!isZh) {
    return message;
  }

  return {
    "Preparing persistence layer...": "正在准备数据保存层...",
    "Connecting to Supabase...": "正在连接 Supabase...",
    "Supabase sync ready with email login.": "Supabase 账号云同步已就绪。",
    "Sign in to sync SnapCal with Supabase.": "登录后同步到 Supabase。",
    "Supabase unavailable. Falling back to browser storage for now.":
      "暂时无法连接 Supabase，当前先保存到本机浏览器。",
    "Running in browser storage. Add Supabase env vars to sync across devices.":
      "当前仅保存到本机浏览器。配置 Supabase 环境变量后可云同步。",
    "Signing in...": "正在登录...",
    "Sign-in failed. Check your email and password.":
      "登录失败，请检查邮箱和密码。",
    "Signed in. Loading your cloud records...": "已登录，正在读取云端记录...",
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
    "Saving goal to Supabase...": "正在把目标保存到 Supabase...",
    "Goal saved locally, but cloud sync failed.":
      "目标已保存到本机，但云同步失败。",
    "Goal saved to Supabase.": "目标已保存到 Supabase。",
    "Replacing remote snapshot in Supabase...": "正在更新 Supabase 云端记录...",
    "Supabase snapshot updated.": "Supabase 云端记录已更新。",
    "Snapshot updated locally, but cloud sync failed.":
      "记录已保存到本机，但云同步失败。",
    "Cloud sync is not configured in this environment yet.":
      "当前环境还没有配置云同步。",
    "Retrying cloud connection...": "正在重试云端连接...",
  }[message] ?? message;
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  title,
  body,
  actionLabel,
  onClick,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/82 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-2xl text-[var(--foreground)]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
        </div>
        <button
          type="button"
          onClick={onClick}
          className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(239,106,67,0.28)]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

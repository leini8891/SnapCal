"use client";

import { useState } from "react";
import Link from "next/link";
import SnapCalNav from "@/components/snapcal-nav";
import { useSnapCal } from "@/components/snapcal-provider";
import {
  demoTalkingPoints,
  demoWalkthrough,
} from "@/lib/mock-data";

export default function SnapCalDemo() {
  const {
    goal,
    hydrated,
    loadDemoScenario,
    logs,
    profile,
    savedMeals,
    storageMode,
    syncMessage,
    syncStatus,
  } = useSnapCal();
  const [presenterMode, setPresenterMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copyMessage, setCopyMessage] = useState(
    "Copy the demo script for a cleaner live walkthrough.",
  );
  const scenarioLabel = !profile.onboardingCompletedAt && logs.length === 0
    ? "First run"
    : profile.plan === "pro"
      ? "Full history demo"
      : "Basic demo";
  const currentStep = demoWalkthrough[activeStepIndex] ?? demoWalkthrough[0];
  const checklist = [
    {
      label: "Scenario",
      value: scenarioLabel,
    },
    {
      label: "Setup completed",
      value: profile.onboardingCompletedAt ? "Yes" : "Pending",
    },
    {
      label: "Logs ready",
      value: `${logs.length} entries`,
    },
    {
      label: "Saved shortcuts",
      value: `${savedMeals.length} shortcuts`,
    },
    {
      label: "Profile",
      value: profile.displayName || "User",
    },
    {
      label: "Sync mode",
      value:
        !hydrated
          ? "Preparing"
          : storageMode === "supabase"
            ? "Cloud"
            : "Local",
    },
    {
      label: "Daily goal",
      value: `${goal} kcal`,
    },
  ];

  async function copyDemoScript() {
    const script = [
      `SnapCal demo script`,
      `Scenario: ${scenarioLabel}`,
      "",
      "Walkthrough:",
      ...demoWalkthrough.map(
        (step) =>
          `${step.step}. ${step.title} (${step.href}) - ${step.action} Outcome: ${step.outcome}`,
      ),
      "",
      "Talking points:",
      ...demoTalkingPoints.map((point, index) => `${index + 1}. ${point}`),
    ].join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(script);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = script;
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopyMessage("Demo script copied to clipboard.");
    } catch {
      setCopyMessage("Copy failed in this browser. The demo route still has the full script visible.");
    }
  }

  return (
    <main className="relative flex-1 overflow-hidden px-4 py-5 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,244,221,0.92),transparent_68%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SnapCalNav />

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Demo
              </p>
              <h1 className="font-display mt-2 text-4xl text-[var(--foreground)]">
                A guided walkthrough for showing SnapCal live
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
                This route is here so the product is easier to present. It gives
                you a reset button, a recommended demo order, and the main
                talking points to hit while you click through the app.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  Open photo upload
                </Link>
                <Link
                  href="/welcome"
                  className="rounded-full border border-[rgba(55,36,24,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)]"
                >
                  Open setup
                </Link>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Photo upload lives on the <span className="font-semibold text-[var(--foreground)]">Log meal</span> route, not inside this demo control panel.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => loadDemoScenario("first-run")}
                  className="rounded-[24px] border border-[rgba(55,36,24,0.12)] bg-white px-4 py-4 text-left text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)]"
                >
                  <span className="block text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                    Scenario
                  </span>
                  <span className="mt-1 block font-display text-2xl">
                    First run
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoScenario("free-pilot")}
                  className="rounded-[24px] bg-[var(--foreground)] px-4 py-4 text-left text-white transition hover:translate-y-[-1px]"
                >
                  <span className="block text-sm uppercase tracking-[0.18em] text-white/65">
                    Scenario
                  </span>
                  <span className="mt-1 block font-display text-2xl">
                    Basic demo
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoScenario("pro-pilot")}
                  className="rounded-[24px] border border-[rgba(14,110,115,0.2)] bg-[rgba(233,248,246,0.92)] px-4 py-4 text-left text-[var(--foreground)] transition hover:translate-y-[-1px]"
                >
                  <span className="block text-sm uppercase tracking-[0.18em] text-[var(--teal)]">
                    Scenario
                  </span>
                  <span className="mt-1 block font-display text-2xl">
                    Full history
                  </span>
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setPresenterMode((current) => !current)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    presenterMode
                      ? "bg-[var(--foreground)] text-white"
                      : "border border-[rgba(55,36,24,0.12)] bg-white text-[var(--foreground)]"
                  }`}
                >
                  {presenterMode ? "Presenter mode on" : "Presenter mode off"}
                </button>
                <button
                  type="button"
                  onClick={copyDemoScript}
                  className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)]"
                >
                  Copy script
                </button>
              </div>
              <div className="rounded-[24px] bg-white/80 px-4 py-4 text-sm leading-7 text-[var(--muted)]">
                <p>{syncMessage}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  Sync status: {syncStatus}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  {copyMessage}
                </p>
              </div>
            </div>
          </div>
        </section>

        {presenterMode ? (
          <section className="card-surface sticky top-4 z-10 rounded-[32px] px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                  Presenter mode
                </p>
                <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
                  Step {currentStep.step}: {currentStep.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {currentStep.action}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                  {currentStep.outcome}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveStepIndex((current) => Math.max(0, current - 1))
                  }
                  disabled={activeStepIndex === 0}
                  className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveStepIndex((current) =>
                      Math.min(demoWalkthrough.length - 1, current + 1),
                    )
                  }
                  disabled={activeStepIndex === demoWalkthrough.length - 1}
                  className="rounded-full border border-[rgba(55,36,24,0.12)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
                <Link
                  href={currentStep.href}
                  className="rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
                >
                  Open current step
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
                Live state
              </p>
              <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
                Quick readiness check
              </h2>
            </div>
            <span className="rounded-full bg-[rgba(184,202,105,0.22)] px-3 py-1 text-sm font-semibold text-[var(--foreground)]">
              {(profile.displayName || "User")}&apos;s demo
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {checklist.map((item) => (
              <article
                key={item.label}
                className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/84 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-2xl text-[var(--foreground)]">
                  {item.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Demo flow
          </p>
          <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
            Recommended click path
          </h2>

          <div className="mt-5 space-y-4">
            {demoWalkthrough.map((step) => (
              <article
                key={step.title}
                className={`rounded-[28px] border p-5 ${
                  currentStep.title === step.title
                    ? "border-[rgba(239,106,67,0.35)] bg-[rgba(255,241,228,0.88)]"
                    : "border-[rgba(55,36,24,0.08)] bg-white/84"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(239,106,67,0.14)] font-display text-xl text-[var(--foreground)]">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl text-[var(--foreground)]">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                        {step.action}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
                        {step.outcome}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveStepIndex(
                          demoWalkthrough.findIndex(
                            (candidate) => candidate.title === step.title,
                          ),
                        )
                      }
                      className="rounded-[22px] border border-[rgba(55,36,24,0.12)] px-5 py-4 text-left text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)]"
                    >
                      <span className="block text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                        Presenter
                      </span>
                      <span className="mt-1 block font-display text-2xl">
                        Focus step
                      </span>
                    </button>
                    <Link
                      href={step.href}
                      className="rounded-[22px] border border-[rgba(55,36,24,0.12)] px-5 py-4 text-left text-[var(--foreground)] transition hover:border-[rgba(14,110,115,0.28)]"
                    >
                      <span className="block text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                        Open route
                      </span>
                      <span className="mt-1 block font-display text-2xl">
                        {step.href}
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card-surface rounded-[32px] px-5 py-6 sm:px-7">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">
            Talking points
          </p>
          <h2 className="font-display mt-2 text-3xl text-[var(--foreground)]">
            What to say while demoing
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {demoTalkingPoints.map((point, index) => (
              <article
                key={point}
                className="rounded-[24px] border border-[rgba(55,36,24,0.08)] bg-white/84 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  Point {index + 1}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">
                  {point}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

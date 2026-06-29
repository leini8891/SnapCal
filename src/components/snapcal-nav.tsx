"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSnapCal } from "@/components/snapcal-provider";

type NavIconName = "log" | "history" | "today" | "settings" | "goal";

type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  isActive?: (pathname: string) => boolean;
};

export default function SnapCalNav() {
  const pathname = usePathname();
  const { language, profile, setLanguage } = useSnapCal();
  const isZh = language === "zh";
  const primaryItems: NavItem[] = [
    { href: "/", label: isZh ? "记餐" : "Log", icon: "log" },
    { href: "/history", label: isZh ? "历史" : "History", icon: "history" },
    { href: "/today", label: isZh ? "今日" : "Today", icon: "today" },
    { href: "/settings", label: isZh ? "设置" : "Settings", icon: "settings" },
  ];
  const desktopItems: NavItem[] = [
    ...primaryItems,
    {
      href: "/welcome",
      label: profile.onboardingCompletedAt
        ? isZh
          ? "目标"
          : "Goal"
        : isZh
          ? "开始"
          : "Start",
      icon: "goal",
    },
  ];

  return (
    <>
      <header className="md:hidden">
        <div className="flex items-center justify-between rounded-[22px] border border-[var(--line)] bg-white px-4 py-3 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--coral)] text-white">
              <NavIcon name="log" />
            </span>
            <div>
              <p className="font-display text-xl font-bold text-[var(--foreground)]">
                SnapCal
              </p>
              <p className="text-xs text-[var(--muted)]">
                {isZh ? "今天还剩一眼看清" : "Fast meal logging"}
              </p>
            </div>
          </div>
          <LanguageSwitch
            isZh={isZh}
            language={language}
            setLanguage={setLanguage}
          />
        </div>
      </header>

      <nav className="hidden rounded-[24px] border border-[var(--line)] bg-white px-5 py-4 shadow-[var(--shadow-card)] md:block">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="font-display text-2xl font-bold text-[var(--foreground)]">
              SnapCal
            </p>
            <p className="text-sm text-[var(--muted)]">
              {isZh
                ? "面向新加坡餐食的快速热量记录。"
                : "Fast calorie logging for Singapore meals."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {desktopItems.map((item) => {
              const active = (item.isActive ?? defaultIsActive)(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--coral)] text-white shadow-[var(--shadow-pop)]"
                      : "border border-[var(--line)] bg-white text-[var(--foreground)] hover:border-[var(--coral)]"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
            <LanguageSwitch
              isZh={isZh}
              language={language}
              setLanguage={setLanguage}
            />
          </div>
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-white/96 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_32px_rgba(31,23,18,0.08)] md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {primaryItems.map((item) => {
            const active =
              item.href === "/settings"
                ? pathname === "/settings" || pathname === "/welcome"
                : defaultIsActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[14px] text-xs font-semibold transition ${
                  active
                    ? "bg-[var(--coral-tint)] text-[var(--coral-ink)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function defaultIsActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href;
}

function LanguageSwitch({
  isZh,
  language,
  setLanguage,
}: {
  isZh: boolean;
  language: "en" | "zh";
  setLanguage: (language: "en" | "zh") => void;
}) {
  return (
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
  );
}

function NavIcon({ name }: { name: NavIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.2,
  };

  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      {name === "log" ? (
        <>
          <path {...common} d="M7 4v16" />
          <path {...common} d="M12 4v16" />
          <path {...common} d="M17 4v16" />
          <path {...common} d="M5 8h14" />
          <path {...common} d="M5 16h14" />
        </>
      ) : null}
      {name === "history" ? (
        <>
          <path {...common} d="M4 12a8 8 0 1 0 2.3-5.7" />
          <path {...common} d="M4 5v5h5" />
          <path {...common} d="M12 8v5l3 2" />
        </>
      ) : null}
      {name === "today" ? (
        <>
          <path {...common} d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path {...common} d="M8 2v4M16 2v4M4 10h16" />
          <path {...common} d="m9 15 2 2 4-5" />
        </>
      ) : null}
      {name === "settings" ? (
        <>
          <path {...common} d="M4 7h16" />
          <path {...common} d="M4 17h16" />
          <path {...common} d="M4 12h16" />
          <circle {...common} cx="9" cy="7" r="2" />
          <circle {...common} cx="15" cy="12" r="2" />
          <circle {...common} cx="11" cy="17" r="2" />
        </>
      ) : null}
      {name === "goal" ? (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <circle {...common} cx="12" cy="12" r="3" />
          <path {...common} d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </>
      ) : null}
    </svg>
  );
}

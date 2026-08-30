import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Home, BarChart3, Trophy, Gift, Sprout, BookOpen } from "lucide-react";
import { useSync } from "@/lib/sync-store";
import { useI18n, LANGUAGES, type Dict } from "@/lib/i18n";

const tabs = [
  { to: "/sibling", key: "nav_my_sync", Icon: Home },
  { to: "/parent", key: "nav_parent", Icon: BarChart3 },
  { to: "/learn", key: "nav_learn", Icon: BookOpen },
  { to: "/garden", key: "nav_garden", Icon: Sprout },
  { to: "/leaderboard", key: "nav_ranks", Icon: Trophy },
  { to: "/rewards", key: "nav_rewards", Icon: Gift },
] as const satisfies readonly { to: string; key: keyof Dict; Icon: unknown }[];

function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("language")}
        className="rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-on-primary-container"
      >
        🌍 {current?.code.toUpperCase()}
      </button>
      {open && (
        <ul className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-2xl bg-card shadow-lift">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-bold ${
                  l.code === lang ? "bg-primary-container text-on-primary-container" : ""
                }`}
              >
                {l.flag} {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { family, offlineMode, viewerRole } = useSync();
  const { t } = useI18n();
  const visibleTabs = tabs.filter((t) => t.to !== "/parent" || viewerRole === "parent");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="bg-sky-pink rounded-b-4xl px-5 pt-8 pb-7 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-on-primary-container">
            {family.name} · {family.code}
          </span>
          {family.locationType === "rural" && offlineMode && (
            <span className="rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-on-secondary-container">
              📴 {t("offline_mode")}
            </span>
          )}
          {viewerRole !== "parent" && (
            <Link
              to="/parent"
              className="rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-on-primary-container"
            >
              🔒 {t("parent_lock")}
            </Link>
          )}
          <LanguagePicker />
        </div>

        <h1 className="mt-4 text-3xl font-extrabold text-primary-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm font-semibold text-primary-foreground/80">{subtitle}</p>
        )}
      </header>

      <main className="flex-1 space-y-4 px-4 pt-5 pb-28">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-border bg-surface/95 px-1 py-2 backdrop-blur">
        <ul className="flex items-center justify-around">
          {visibleTabs.map(({ to, key, Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex w-16 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-bold transition-colors ${
                    active
                      ? "bg-primary-container text-on-primary-container"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {t(key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function AgeBadge({ tone, label }: { tone: "easy" | "medium" | "hard"; label: string }) {
  const map = {
    easy: "bg-success/25 text-success-foreground",
    medium: "bg-warning/30 text-warning-foreground",
    hard: "bg-secondary-container text-on-secondary-container",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[tone]}`}>
      {label}
    </span>
  );
}

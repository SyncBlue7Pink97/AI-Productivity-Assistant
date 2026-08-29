import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, BarChart3, Trophy, Gift, Sprout } from "lucide-react";
import { useSync } from "@/lib/sync-store";

const tabs = [
  { to: "/sibling", label: "My Sync", Icon: Home },
  { to: "/parent", label: "Parent", Icon: BarChart3 },
  { to: "/garden", label: "Garden", Icon: Sprout },
  { to: "/leaderboard", label: "Ranks", Icon: Trophy },
  { to: "/rewards", label: "Rewards", Icon: Gift },
] as const;

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
  const visibleTabs = tabs.filter((t) => t.to !== "/parent" || viewerRole === "parent");


  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="bg-sky-pink rounded-b-4xl px-5 pt-8 pb-7 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-on-primary-container">
            {family.name} · {family.code}
          </span>
          {family.locationType === "rural" && offlineMode && (
            <span className="rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-on-secondary-container">
              📴 Offline mode
            </span>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-primary-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm font-semibold text-primary-foreground/80">{subtitle}</p>
        )}
      </header>

      <main className="flex-1 space-y-4 px-4 pt-5 pb-28">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t border-border bg-surface/95 px-2 py-2 backdrop-blur">
        <ul className="flex items-center justify-around">
          {tabs.map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex w-20 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition-colors ${
                    active
                      ? "bg-primary-container text-on-primary-container"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {label}
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

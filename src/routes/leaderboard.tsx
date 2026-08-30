import { createFileRoute } from "@tanstack/react-router";
import { AppShell, AgeBadge } from "@/components/AppShell";
import { useSync, ageBadge } from "@/lib/sync-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — SiblingSync" },
      {
        name: "description",
        content:
          "Points, streaks and age-adjusted fairness scores so younger and older siblings compete evenly.",
      },
      { property: "og:title", content: "Leaderboard — SiblingSync" },
      {
        property: "og:description",
        content: "Age-adjusted sibling rankings with points and streaks.",
      },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const { users } = useSync();
  const { t } = useI18n();
  const siblings = users.filter((u) => u.role === "sibling");
  const ranked = [...siblings]
    .map((s) => ({
      ...s,
      fairness: Math.round(s.points / (s.age <= 8 ? 0.7 : s.age <= 12 ? 0.85 : 1)),
    }))
    .sort((a, b) => b.fairness - a.fairness);
  const top = ranked[0]?.fairness ?? 1;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <AppShell title={t("leaderboard")} subtitle={t("leaderboard_sub")}>
      {ranked.map((s, i) => {
        const badge = ageBadge(s.age);
        return (
          <div key={s.id} className="card-soft p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{medals[i] ?? "🎖️"}</span>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-container text-xl">
                {s.emoji}
              </div>
              <div className="flex-1">
                <p className="font-extrabold">
                  {s.name} <span className="text-muted-foreground">· {s.age}</span>
                </p>
                <p className="text-xs font-bold text-muted-foreground">
                  {t("pts_streak", { pts: s.points, streak: s.streak })}
                </p>
              </div>
              <AgeBadge tone={badge.tone} label={badge.label} />
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-sky-pink"
                style={{ width: `${Math.max((s.fairness / top) * 100, 6)}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] font-bold text-muted-foreground">
              {t("fairness_score", { n: s.fairness })}
            </p>
          </div>
        );
      })}
      <p className="card-soft p-4 text-xs font-semibold text-muted-foreground">
        {t("leaderboard_note")}
      </p>
    </AppShell>
  );
}

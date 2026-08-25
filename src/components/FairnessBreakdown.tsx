import { useState } from "react";
import { AgeBadge } from "@/components/AppShell";
import {
  useSync,
  ageBadge,
  difficultyOf,
  weightedPoints,
  allowedDifficulties,
} from "@/lib/sync-store";

/** Explains, per sibling, why they got today's chores (age rules + weighting + rotation). */
export function FairnessBreakdown() {
  const { users, chores, assignments } = useSync();
  const [openId, setOpenId] = useState<string | null>(null);

  const siblings = users.filter((u) => u.role === "sibling");

  const rows = siblings.map((s) => {
    const mine = assignments
      .map((a) => ({ a, chore: chores.find((c) => c.id === a.choreId) }))
      .filter((x) => x.a.userId === s.id && x.chore);
    const raw = mine.reduce((n, x) => n + (x.chore?.points ?? 0), 0);
    const weighted = mine.reduce(
      (n, x) => n + weightedPoints(x.chore?.points ?? 0, s.age),
      0,
    );
    return { sibling: s, mine, raw, weighted };
  });

  const spread =
    rows.length > 0
      ? Math.max(...rows.map((r) => r.weighted)) -
        Math.min(...rows.map((r) => r.weighted))
      : 0;

  return (
    <section className="card-soft p-5">
      <h2 className="text-lg font-extrabold">Why these chores? 🤔</h2>
      <p className="text-xs font-semibold text-muted-foreground">
        Fairness breakdown — age limits, point weighting and hard-chore rotation
      </p>

      <div
        className={`mt-3 rounded-2xl px-4 py-3 text-xs font-bold ${
          spread <= 20
            ? "bg-success/25 text-success-foreground"
            : "bg-warning/25 text-warning-foreground"
        }`}
      >
        {spread <= 20
          ? `✅ Balanced week — only ${spread} weighted points between the busiest and lightest sibling.`
          : `⚖️ ${spread} weighted points apart — tap Auto-rotate to even things out.`}
      </div>

      <ul className="mt-4 space-y-3">
        {rows.map(({ sibling: s, mine, raw, weighted }) => {
          const badge = ageBadge(s.age);
          const allowed = allowedDifficulties(s.age);
          const open = openId === s.id;
          const multiplier = s.age <= 8 ? "1.6×" : s.age <= 12 ? "1.25×" : "1×";
          return (
            <li key={s.id} className="rounded-2xl bg-surface-2 p-3">
              <button
                onClick={() => setOpenId(open ? null : s.id)}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold">
                    {s.name} · {s.age}
                  </span>
                  <span className="block text-[11px] font-bold text-muted-foreground">
                    {raw} pts → {weighted} weighted ({multiplier})
                  </span>
                </span>
                <AgeBadge tone={badge.tone} label={badge.label} />
                <span className="text-xs font-extrabold text-muted-foreground">
                  {open ? "▲" : "▼"}
                </span>
              </button>

              {open && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Can be given: {allowed.join(", ")} chores only — anything with a
                    higher minimum age is hidden from {s.name}.
                  </p>
                  {mine.map(({ a, chore }) => {
                    if (!chore) return null;
                    const diff = difficultyOf(chore);
                    const repeated = (chore.hardLastWeekFor ?? []).includes(s.id);
                    return (
                      <div key={a.id} className="rounded-xl bg-surface p-3">
                        <p className="text-sm font-extrabold">
                          {chore.emoji} {chore.title}
                        </p>
                        <ul className="mt-1 space-y-0.5 text-[11px] font-semibold text-muted-foreground">
                          <li>
                            • {diff} chore, min age {chore.minAge} — {s.name} is {s.age},
                            so it is allowed.
                          </li>
                          <li>
                            • {chore.points} pts × {multiplier} age weighting ={" "}
                            {weightedPoints(chore.points, s.age)} pts, so younger
                            siblings aren't left behind.
                          </li>
                          <li>
                            •{" "}
                            {diff === "hard"
                              ? repeated
                                ? "Flagged: had a hard chore last week — next rotation will move it."
                                : "No hard chore last week, so rotation allows this one."
                              : "Rotation keeps lighter chores moving between siblings each week."}
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                  {mine.length === 0 && (
                    <p className="text-sm font-semibold">
                      No chores today — the rotation gave {s.name} a rest day.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

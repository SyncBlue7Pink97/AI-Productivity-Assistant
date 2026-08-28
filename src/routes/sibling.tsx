import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, AgeBadge } from "@/components/AppShell";
import {
  useSync,
  difficultyOf,
  ageBadge,
  weightedPoints,
  filterChoresByAge,
} from "@/lib/sync-store";

export const Route = createFileRoute("/sibling")({
  head: () => ({
    meta: [
      { title: "My Sync Today — SiblingSync" },
      {
        name: "description",
        content:
          "See today's age-matched chores, upload photo proof or tick offline, and swap tasks with a sibling.",
      },
      { property: "og:title", content: "My Sync Today — SiblingSync" },
      {
        property: "og:description",
        content: "Today's fair chore list for each sibling, with proof and swaps.",
      },
    ],
  }),
  component: SiblingHome,
});

function SiblingHome() {
  const {
    users,
    chores,
    assignments,
    currentSiblingId,
    setCurrentSibling,
    submitProof,
    swap,
    family,
    offlineMode,
    setCheckIn,
  } = useSync();
  const [swapFor, setSwapFor] = useState<string | null>(null);

  const siblings = users.filter((u) => u.role === "sibling");
  const me = siblings.find((s) => s.id === currentSiblingId) ?? siblings[0];
  if (!me) return null;
  const badge = ageBadge(me.age);
  const mine = assignments.filter((a) => a.userId === me.id);
  const eligible = filterChoresByAge(chores, me.age);
  const noPhoto = family.locationType === "rural" && offlineMode;
  const totalPoints = mine.reduce((sum, a) => {
    const c = chores.find((x) => x.id === a.choreId);
    return sum + (c ? weightedPoints(c.points, me.age) : 0);
  }, 0);
  const left = mine.filter((a) => a.status !== "approved").length;

  return (
    <AppShell title={`Hi ${me.name} 👋`} subtitle="My Sync Today">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {siblings.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentSibling(s.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              s.id === me.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground"
            }`}
          >
            <span>{s.emoji}</span> {s.name} · {s.age}
          </button>
        ))}
      </div>

      <div className="card-soft flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-bold text-muted-foreground">My points</p>
          <p className="text-2xl font-extrabold">{me.points}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted-foreground">Streak</p>
          <p className="text-2xl font-extrabold">🔥 {me.streak}</p>
        </div>
        <AgeBadge tone={badge.tone} label={badge.label} />
      </div>

      <ul className="space-y-3">
        {mine.map((a) => {
          const chore = chores.find((c) => c.id === a.choreId);
          if (!chore) return null;
          const diff = difficultyOf(chore);
          return (
            <li key={a.id} className="card-soft p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-container text-2xl">
                  {chore.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-base font-extrabold">{chore.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <AgeBadge
                      tone={diff}
                      label={`${diff} · ${chore.points} pts`}
                    />
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                      {chore.category} · min age {chore.minAge}
                    </span>
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                      age-weighted {weightedPoints(chore.points, me.age)} pts
                    </span>
                  </div>
                </div>
              </div>

              {a.status === "todo" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => submitProof(a.id, noPhoto ? undefined : "photo.jpg")}
                    className="flex-1 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
                  >
                    {noPhoto ? "✅ Mark done" : "📸 Upload proof"}
                  </button>
                  <button
                    onClick={() => setSwapFor(swapFor === a.id ? null : a.id)}
                    className="rounded-2xl bg-secondary-container px-4 py-3 text-sm font-extrabold text-on-secondary-container"
                  >
                    🔁 Swap
                  </button>
                </div>
              )}
              {a.status === "pending" && (
                <p className="mt-3 rounded-2xl bg-warning/25 px-4 py-3 text-sm font-bold text-warning-foreground">
                  ⏳ Waiting for parent approval
                </p>
              )}
              {a.status === "approved" && (
                <p className="mt-3 rounded-2xl bg-success/25 px-4 py-3 text-sm font-bold text-success-foreground">
                  🎉 Approved — points added!
                </p>
              )}

              {swapFor === a.id && (
                <div className="mt-3 space-y-2 rounded-2xl bg-surface-2 p-3">
                  <p className="text-xs font-bold text-muted-foreground">
                    Swap with a sibling old enough for this chore
                  </p>
                  {siblings
                    .filter(
                      (s) =>
                        s.id !== me.id &&
                        filterChoresByAge(chores, s.age).some((c) => c.id === chore.id),
                    )
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          swap(a.id, s.id);
                          setSwapFor(null);
                        }}
                        className="w-full rounded-xl bg-surface px-4 py-2.5 text-left text-sm font-bold"
                      >
                        {s.emoji} {s.name} ({s.age})
                      </button>
                    ))}
                  {siblings.filter(
                    (s) =>
                      s.id !== me.id &&
                      filterChoresByAge(chores, s.age).some((c) => c.id === chore.id),
                  ).length === 0 && (
                    <p className="text-sm font-semibold">
                      No one else is old enough for this one.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="px-1 text-xs font-semibold text-muted-foreground">
        {eligible.length} chores in the family pool match {me.name}'s age group.
      </p>
    </AppShell>
  );
}

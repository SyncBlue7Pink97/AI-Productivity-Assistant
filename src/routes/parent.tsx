import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, AgeBadge } from "@/components/AppShell";
import { FairnessBreakdown } from "@/components/FairnessBreakdown";
import { FamilyGarden } from "@/components/FamilyGarden";
import {
  useSync,
  difficultyOf,
  weightedPoints,
  suggestHelper,
  HELP_BONUS,
  type Category,
} from "@/lib/sync-store";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Parent Home — SiblingSync" },
      {
        name: "description",
        content:
          "Weekly fairness chart, pending chore approvals and one-tap chore creation with age limits.",
      },
      { property: "og:title", content: "Parent Home — SiblingSync" },
      {
        property: "og:description",
        content: "Approve proof, watch weekly fairness and add new chores.",
      },
    ],
  }),
  component: ParentHome,
});

function ParentHome() {
  const { users, chores, assignments, approve, reject, addChore, rotate, family } = useSync();
  const siblings = users.filter((u) => u.role === "sibling");
  const pending = assignments.filter((a) => a.status === "pending");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState<10 | 20 | 30>(20);
  const [category, setCategory] = useState<Category>(
    family.locationType === "rural" ? "rural" : "indoor",
  );
  const [assignee, setAssignee] = useState(siblings[0]?.id ?? "");

  const load = siblings.map((s) => {
    const total = assignments
      .filter((a) => a.userId === s.id)
      .reduce((sum, a) => {
        const c = chores.find((x) => x.id === a.choreId);
        return sum + (c ? weightedPoints(c.points, s.age) : 0);
      }, 0);
    return { ...s, total };
  });
  const max = Math.max(...load.map((l) => l.total), 1);

  return (
    <AppShell title="Parent Home" subtitle="Keeping the week fair">
      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">Weekly fairness</h2>
        <p className="text-xs font-semibold text-muted-foreground">
          Age-weighted workload — bars should look even
        </p>
        <div className="mt-4 flex h-40 items-end justify-around gap-3">
          {load.map((l, i) => (
            <div key={l.id} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-extrabold">{l.total}</span>
              <div
                className="w-full rounded-t-2xl"
                style={{
                  height: `${Math.max((l.total / max) * 110, 8)}px`,
                  backgroundColor: `var(--chart-${(i % 3) + 1})`,
                }}
              />
              <span className="text-[11px] font-bold text-muted-foreground">
                {l.emoji} {l.name}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={rotate}
          className="mt-4 w-full rounded-2xl bg-secondary-container py-3 text-sm font-extrabold text-on-secondary-container"
        >
          🔄 Auto-rotate next week (no repeat hard chores)
        </button>
      </section>

      <FairnessBreakdown />

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-extrabold">
          Pending approvals {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 && (
          <p className="card-soft p-5 text-sm font-semibold text-muted-foreground">
            All caught up — nothing to approve.
          </p>
        )}
        {pending.map((a) => {
          const chore = chores.find((c) => c.id === a.choreId)!;
          const kid = users.find((u) => u.id === a.userId)!;
          return (
            <div key={a.id} className="card-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary-container text-2xl">
                  {chore.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold">{chore.title}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {kid.emoji} {kid.name} · {a.photoUrl ? "photo proof" : "offline tick"}
                  </p>
                </div>
                <AgeBadge tone={difficultyOf(chore)} label={`${chore.points} pts`} />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => approve(a.id)}
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(a.id)}
                  className="rounded-2xl bg-surface-2 px-5 py-3 text-sm font-extrabold text-muted-foreground"
                >
                  Redo
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="card-soft p-5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
        >
          {open ? "Close" : "➕ Add chore"}
        </button>
        {open && (
          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chore title"
              className="w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="grid grid-cols-3 gap-2">
              {([10, 20, 30] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPoints(p)}
                  className={`rounded-2xl py-3 text-sm font-extrabold ${
                    points === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {p} pts
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["indoor", "outdoor", "rural"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-2xl py-2.5 text-xs font-extrabold capitalize ${
                    category === c
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-semibold"
            >
              {siblings.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.age})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!title.trim()) return;
                addChore(
                  {
                    title: title.trim(),
                    points,
                    minAge: points === 10 ? 5 : points === 20 ? 9 : 13,
                    category,
                    emoji: points === 30 ? "💪" : points === 20 ? "🧹" : "🌟",
                  },
                  assignee,
                );
                setTitle("");
                setOpen(false);
              }}
              className="w-full rounded-2xl bg-secondary py-3 text-sm font-extrabold text-secondary-foreground"
            >
              Save chore
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}

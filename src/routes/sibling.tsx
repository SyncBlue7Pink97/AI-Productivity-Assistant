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
import { useI18n } from "@/lib/i18n";
import { ShoutDone } from "@/components/ShoutDone";

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
  const { t } = useI18n();

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
    <AppShell title={t("hi_name", { name: me.name })} subtitle={t("my_sync_today")}>
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

      <section className="card-soft bg-primary-container p-5">
        <h2 className="text-lg font-extrabold text-on-primary-container">{t("todays_plan")}</h2>
        <p className="mt-1 text-sm font-bold text-on-primary-container/80">
          {left > 0
            ? t("chores_left", { n: left, pts: totalPoints })
            : t("all_done_today")}
        </p>
        <p className="mt-1 text-xs font-semibold text-on-primary-container/70">
          {t("checkin_hint")}
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
          {t("my_points")}: {me.points}
        </span>
        <span className="rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
          {t("streak")}: 🔥 {me.streak}
        </span>
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
                      label={`${t(diff)} · ${t("pts_suffix", { n: chore.points })}`}
                    />
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                      {t(("cat_" + chore.category) as "cat_indoor")} · {t("min_age", { n: chore.minAge })}
                    </span>
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                      {t("age_weighted_pts", { n: weightedPoints(chore.points, me.age) })}
                    </span>
                    {chore.dueTime && (
                      <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                        {t("due_at", { time: chore.dueTime })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {a.status === "todo" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCheckIn(a.id, "can-do")}
                    className={`rounded-2xl py-2.5 text-xs font-extrabold ${
                      a.checkIn === "can-do"
                        ? "bg-success/40 text-success-foreground"
                        : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {t("i_can_do_it")}
                  </button>
                  <button
                    onClick={() => setCheckIn(a.id, "need-help")}
                    className={`rounded-2xl py-2.5 text-xs font-extrabold ${
                      a.checkIn === "need-help"
                        ? "bg-warning/40 text-warning-foreground"
                        : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {t("need_help")}
                  </button>
                </div>
              )}

              {a.helperId && (
                <p className="mt-2 rounded-2xl bg-secondary-container px-4 py-2.5 text-xs font-bold text-on-secondary-container">
                  {t("helper_helping", { name: users.find((u) => u.id === a.helperId)?.name ?? "" })}
                </p>
              )}


              {a.status === "todo" && (
                <div className="mt-3 rounded-2xl bg-surface-2 p-3">
                  <p className="text-xs font-extrabold">{t("shout_done")}</p>
                  <ShoutDone
                    onDone={(voiceUrl) => submitProof(a.id, undefined, voiceUrl)}
                  />
                </div>
              )}

              {a.status === "todo" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => submitProof(a.id, noPhoto ? undefined : "photo.jpg")}
                    className="flex-1 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
                  >
                    {noPhoto ? t("mark_done") : t("upload_proof")}
                  </button>
                  <button
                    onClick={() => setSwapFor(swapFor === a.id ? null : a.id)}
                    className="rounded-2xl bg-secondary-container px-4 py-3 text-sm font-extrabold text-on-secondary-container"
                  >
                    {t("swap")}
                  </button>
                </div>
              )}
              {a.status === "pending" && (
                <p className="mt-3 rounded-2xl bg-warning/25 px-4 py-3 text-sm font-bold text-warning-foreground">
                  {t("waiting_approval")}
                </p>
              )}
              {a.status === "approved" && (
                <p className="mt-3 rounded-2xl bg-success/25 px-4 py-3 text-sm font-bold text-success-foreground">
                  {t("approved_points")}
                </p>
              )}

              {swapFor === a.id && (
                <div className="mt-3 space-y-2 rounded-2xl bg-surface-2 p-3">
                  <p className="text-xs font-bold text-muted-foreground">
                    {t("swap_with_sibling")}
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
                      {t("nobody_old_enough")}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="px-1 text-xs font-semibold text-muted-foreground">
        {t("pool_match", { n: eligible.length, name: me.name })}
      </p>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, AgeBadge } from "@/components/AppShell";
import { FairnessBreakdown } from "@/components/FairnessBreakdown";
import { PremiumGate } from "@/components/PremiumGate";
import { FamilyGarden } from "@/components/FamilyGarden";
import {
  useSync,
  difficultyOf,
  weightedPoints,
  suggestHelper,
  HELP_BONUS,
  CHORE_PACKS,
  type Category,
  type Recurrence,
} from "@/lib/sync-store";
import { useI18n } from "@/lib/i18n";


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

function CreatePassword({ onDone }: { onDone: () => void }) {
  const { setParentPassword } = useSync();
  const { t } = useI18n();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring";

  return (
    <AppShell title={t("parent_home")} subtitle={t("grown_ups_only")}>
      <section className="card-soft space-y-3 p-6">
        <p className="text-center text-5xl">🔑</p>
        <h2 className="text-center text-lg font-extrabold">{t("set_parent_password")}</h2>
        <p className="text-center text-xs font-semibold text-muted-foreground">
          {t("parent_password_note")}
        </p>
        <input
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setError(null);
          }}
          type="password"
          placeholder={t("new_password")}
          className={inputClass}
        />
        <input
          value={pw2}
          onChange={(e) => {
            setPw2(e.target.value);
            setError(null);
          }}
          type="password"
          placeholder={t("confirm_password")}
          className={inputClass}
        />
        {error && <p className="text-xs font-bold text-destructive">{error}</p>}
        <button
          onClick={() => {
            if (pw.trim().length < 4) return setError(t("password_too_short"));
            if (pw !== pw2) return setError(t("passwords_dont_match"));
            setParentPassword(pw);
          }}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
        >
          {t("save_password")}
        </button>
        <button
          onClick={onDone}
          className="w-full text-xs font-bold text-muted-foreground"
        >
          {t("back_to_login")}
        </button>
      </section>
    </AppShell>
  );
}

function ParentGate() {
  const { unlockParent, hasCustomPassword } = useSync();
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [creating, setCreating] = useState(!hasCustomPassword);

  if (creating) return <CreatePassword onDone={() => setCreating(false)} />;

  return (
    <AppShell title={t("parent_home")} subtitle={t("grown_ups_only")}>
      <section className="card-soft space-y-4 p-6 text-center">
        <p className="text-5xl">🔒</p>
        <h2 className="text-lg font-extrabold">{t("enter_parent_password")}</h2>
        <p className="text-xs font-semibold text-muted-foreground">
          {t("parent_area_note")}
        </p>
        <input
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          type="password"
          placeholder="••••"
          className="w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-center text-2xl font-extrabold tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
        />
        {error && (
          <p className="text-xs font-bold text-destructive">{t("wrong_password")}</p>
        )}
        <button
          onClick={() => {
            if (!unlockParent(pin)) {
              setError(true);
              setPin("");
            }
          }}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
        >
          {t("unlock_parent_home")}
        </button>
        <button
          onClick={() => setCreating(true)}
          className="w-full text-xs font-bold text-muted-foreground"
        >
          {t("create_password_instead")}
        </button>
        {!hasCustomPassword && (
          <p className="text-[11px] font-semibold text-muted-foreground">{t("demo_pin")}</p>
        )}
      </section>
    </AppShell>
  );
}


function ParentHome() {
  const { viewerRole } = useSync();
  if (viewerRole !== "parent") return <ParentGate />;
  return <ParentDashboard />;
}

function ParentDashboard() {
  const {
    users,
    chores,
    assignments,
    approve,
    reject,
    addChore,
    rotate,
    family,
    acceptHelp,
    lockParent,
    homework,
    addChorePack,
    isPremium,
    gardenEnabled,

  } = useSync();
  const { t } = useI18n();

  const siblings = users.filter((u) => u.role === "sibling");
  const pending = assignments.filter((a) => a.status === "pending");
  const done = assignments.filter((a) => a.status === "approved");
  const canDo = assignments.filter((a) => a.checkIn === "can-do" && a.status === "todo");
  const needHelp = assignments.filter(
    (a) => a.checkIn === "need-help" && a.status === "todo" && !a.helperId,
  );
  const helpSuggestions = needHelp
    .map((a) => {
      const chore = chores.find((c) => c.id === a.choreId);
      if (!chore) return null;
      const helper = suggestHelper(a, chore, siblings, assignments);
      const kid = users.find((u) => u.id === a.userId);
      if (!helper || !kid) return null;
      return { a, chore, helper, kid };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);


  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState<10 | 20 | 30>(20);
  const [recurrence, setRecurrence] = useState<Recurrence>("once");
  const [addedPack, setAddedPack] = useState<string | null>(null);
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
    <AppShell title={t("parent_home")} subtitle={t("keeping_week_fair")}>
      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">{t("family_checkin")}</h2>
        <p className="text-xs font-semibold text-muted-foreground">
          {t("checkin_summary_note")}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { label: t("can_do"), value: canDo.length, emoji: "👍" },
            { label: t("need_help_short"), value: needHelp.length, emoji: "🙋" },
            { label: t("to_approve"), value: pending.length, emoji: "⏳" },
            { label: t("done"), value: done.length, emoji: "🎉" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-surface-2 px-1 py-3">
              <p className="text-lg">{s.emoji}</p>
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {helpSuggestions.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm font-semibold text-muted-foreground">
            {t("no_help_asked")}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {helpSuggestions.map(({ a, chore, helper, kid }) => (
              <li key={a.id} className="rounded-2xl bg-secondary-container p-4">
                <p className="text-sm font-bold text-on-secondary-container">
                  {t("help_suggestion", {
                    kid: kid.name,
                    chore: chore.title.toLowerCase(),
                    helper: helper.name,
                    bonus: HELP_BONUS,
                  })}
                </p>
                <button
                  onClick={() => acceptHelp(a.id, helper.id)}
                  className="mt-3 w-full rounded-2xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground"
                >
                  {t("ask_to_help", { name: helper.name })}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">{t("learn_summary")}</h2>
        <p className="text-xs font-semibold text-muted-foreground">
          {t("study_progress", {
            done: homework.filter((h) => h.status === "done").length,
            total: homework.length,
          })}
        </p>
        <ul className="mt-3 space-y-2">
          {siblings.map((s) => {
            const mine = homework.filter((h) => h.userId === s.id);
            const doneCount = mine.filter((h) => h.status === "done").length;
            const help = mine.find((h) => h.helpWanted);
            return (
              <li key={s.id} className="rounded-2xl bg-surface-2 px-4 py-3">
                <p className="text-sm font-extrabold">
                  {s.emoji} {s.name} · {t("study_progress", { done: doneCount, total: mine.length })}
                </p>
                {help && (
                  <p className="mt-1 text-[11px] font-bold text-warning-foreground">
                    {t("study_help_note", { name: s.name, subject: help.subject })}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
          {t("chores_after_homework")}
        </p>
      </section>

      {gardenEnabled && <FamilyGarden compact />}

      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">{t("weekly_fairness")}</h2>
        <p className="text-xs font-semibold text-muted-foreground">
          {t("weekly_fairness_note")}
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
          {t("auto_rotate")}
        </button>
      </section>

      <PremiumGate feature={t("feature_reports")}>
        <FairnessBreakdown />
      </PremiumGate>

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-extrabold">
          {t("pending_approvals")} {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 && (
          <p className="card-soft p-5 text-sm font-semibold text-muted-foreground">
            {t("all_caught_up")}
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
                    {kid.emoji} {kid.name} ·{" "}
                    {a.voiceUrl
                      ? t("voice_proof")
                      : a.photoUrl
                        ? t("photo_proof")
                        : t("offline_tick")}
                  </p>
                </div>
                <AgeBadge tone={difficultyOf(chore)} label={t("pts_suffix", { n: chore.points })} />
              </div>
              {a.voiceUrl && (
                <div className="mt-3 rounded-2xl bg-secondary-container p-3">
                  <p className="text-[11px] font-extrabold text-on-secondary-container">
                    🎤 {t("voice_note_from", { name: kid.name })}
                  </p>
                  <audio
                    controls
                    src={a.voiceUrl}
                    className="mt-2 w-full"
                    aria-label={t("play_voice")}
                  />
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => approve(a.id)}
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
                >
                  {t("approve")}
                </button>
                <button
                  onClick={() => reject(a.id)}
                  className="rounded-2xl bg-surface-2 px-5 py-3 text-sm font-extrabold text-muted-foreground"
                >
                  {t("redo")}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">{t("chore_packs")}</h2>
        <p className="text-xs font-semibold text-muted-foreground">{t("chore_packs_note")}</p>
        <ul className="mt-3 space-y-2">
          {CHORE_PACKS.map((pack) => (
            <li key={pack.id} className="rounded-2xl bg-surface-2 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pack.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold">
                    {t(("pack_" + pack.id) as "pack_bedroom")}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    {t("chores_in_pack", { n: pack.chores.length })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    addChorePack(pack.id);
                    setAddedPack(pack.id);
                  }}
                  className="rounded-2xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"
                >
                  {t("add_pack", { pack: t(("pack_" + pack.id) as "pack_bedroom") })}
                </button>
              </div>
              {addedPack === pack.id && (
                <p className="mt-2 text-[11px] font-bold text-success-foreground">
                  {t("pack_added")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-soft p-5">

        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
        >
          {open ? t("close") : t("add_chore")}
        </button>
        {open && (
          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("chore_title")}
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
                  {t("pts_suffix", { n: p })}
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
                  {t(("cat_" + c) as "cat_indoor")}
                </button>
              ))}
            </div>
            <div>
              <p className="mb-2 px-1 text-xs font-extrabold text-muted-foreground">
                {t("recurrence")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["once", "daily", "weekly"] as const).map((r) => {
                  const locked = r !== "once" && !isPremium;
                  return (
                    <button
                      key={r}
                      onClick={() => !locked && setRecurrence(r)}
                      className={`rounded-2xl py-2.5 text-xs font-extrabold ${
                        recurrence === r
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-surface-2 text-muted-foreground"
                      } ${locked ? "opacity-50" : ""}`}
                    >
                      {locked ? "🔒 " : ""}
                      {t(("rec_" + r) as "rec_once")}
                    </button>
                  );
                })}
              </div>
              {!isPremium && (
                <Link
                  to="/plans"
                  className="mt-2 block text-[11px] font-bold text-muted-foreground underline"
                >
                  {t("premium_locked_note", { feature: t("feature_recurring") })} {t("see_plans")}
                </Link>
              )}
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
                    recurrence,
                  },
                  assignee,
                );
                setTitle("");
                setRecurrence("once");
                setOpen(false);
              }}
              className="w-full rounded-2xl bg-secondary py-3 text-sm font-extrabold text-secondary-foreground"
            >
              {t("save_chore")}
            </button>
          </div>
        )}
      </section>

      <ChangePassword />

      <button
        onClick={lockParent}
        className="w-full rounded-2xl bg-surface-2 py-3 text-sm font-extrabold text-muted-foreground"
      >
        {t("switch_kid_view")}
      </button>

    </AppShell>

  );
}

function ChangePassword() {
  const { setParentPassword } = useSync();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const inputClass =
    "w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-ring";

  return (
    <section className="card-soft p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-2xl bg-surface-2 py-3 text-sm font-extrabold text-muted-foreground"
      >
        {t("change_password")}
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          <input
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError(null);
              setSaved(false);
            }}
            type="password"
            placeholder={t("new_password")}
            className={inputClass}
          />
          <input
            value={pw2}
            onChange={(e) => {
              setPw2(e.target.value);
              setError(null);
              setSaved(false);
            }}
            type="password"
            placeholder={t("confirm_password")}
            className={inputClass}
          />
          {error && <p className="text-xs font-bold text-destructive">{error}</p>}
          {saved && <p className="text-xs font-bold text-success-foreground">{t("password_saved")}</p>}
          <button
            onClick={() => {
              if (pw.trim().length < 4) return setError(t("password_too_short"));
              if (pw !== pw2) return setError(t("passwords_dont_match"));
              setParentPassword(pw);
              setPw("");
              setPw2("");
              setSaved(true);
            }}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
          >
            {t("save_password")}
          </button>
        </div>
      )}
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useSync, HOMEWORK_POINTS } from "@/lib/sync-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "LearnSync — Schoolwork for siblings | SiblingSync" },
      {
        name: "description",
        content:
          "Track homework, subjects, study minutes and study-help requests for every sibling alongside their chores.",
      },
      { property: "og:title", content: "LearnSync — Schoolwork for siblings" },
      {
        property: "og:description",
        content: "Homework first, chores after — schoolwork tracking for the whole family.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnSync,
});

function LearnSync() {
  const {
    users,
    homework,
    currentSiblingId,
    setCurrentSibling,
    addHomework,
    setHomeworkStatus,
    requestStudyHelp,
  } = useSync();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("Today");
  const [minutes, setMinutes] = useState(30);

  const siblings = users.filter((u) => u.role === "sibling");
  const me = siblings.find((s) => s.id === currentSiblingId) ?? siblings[0];
  if (!me) return null;

  const mine = homework.filter((h) => h.userId === me.id);
  const doneCount = mine.filter((h) => h.status === "done").length;

  return (
    <AppShell title={t("learn_sync")} subtitle={t("learn_sub")}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {siblings.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentSibling(s.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              s.id === me.id
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground"
            }`}
          >
            {s.emoji} {s.name} · {s.age}
          </button>
        ))}
      </div>

      <section className="card-soft bg-primary-container p-5">
        <h2 className="text-lg font-extrabold text-on-primary-container">
          {t("homework_today")}
        </h2>
        <p className="mt-1 text-sm font-bold text-on-primary-container/80">
          {t("study_progress", { done: doneCount, total: mine.length })}
        </p>
        <p className="mt-1 text-xs font-semibold text-on-primary-container/70">
          {t("chores_after_homework")}
        </p>
      </section>

      {mine.length === 0 && (
        <p className="card-soft p-5 text-sm font-semibold text-muted-foreground">
          {t("no_homework")}
        </p>
      )}

      <ul className="space-y-3">
        {mine.map((h) => (
          <li key={h.id} className="card-soft p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary-container text-2xl">
                📚
              </div>
              <div className="flex-1">
                <p className="text-base font-extrabold">{h.title}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    {h.subject}
                  </span>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    ⏰ {h.due}
                  </span>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    🕒 {h.minutes} {t("minutes")}
                  </span>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    {h.status === "done"
                      ? t("status_done")
                      : h.status === "doing"
                        ? t("status_doing")
                        : t("status_todo")}
                  </span>
                </div>
              </div>
            </div>

            {h.status !== "done" && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHomeworkStatus(h.id, "doing")}
                  className={`rounded-2xl py-2.5 text-xs font-extrabold ${
                    h.status === "doing"
                      ? "bg-warning/40 text-warning-foreground"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {t("mark_doing")}
                </button>
                <button
                  onClick={() => setHomeworkStatus(h.id, "done")}
                  className="rounded-2xl bg-primary py-2.5 text-xs font-extrabold text-primary-foreground"
                >
                  {t("mark_done_hw")}
                </button>
              </div>
            )}

            {h.status === "done" && (
              <p className="mt-3 rounded-2xl bg-success/25 px-4 py-3 text-sm font-bold text-success-foreground">
                {t("homework_points", { n: HOMEWORK_POINTS })}
              </p>
            )}

            {h.status !== "done" &&
              (h.helpWanted ? (
                <p className="mt-2 rounded-2xl bg-secondary-container px-4 py-2.5 text-xs font-bold text-on-secondary-container">
                  {t("study_help_note", { name: me.name, subject: h.subject })}
                </p>
              ) : (
                <button
                  onClick={() => requestStudyHelp(h.id)}
                  className="mt-2 w-full rounded-2xl bg-surface-2 py-2.5 text-xs font-extrabold text-muted-foreground"
                >
                  {t("needs_help_study")}
                </button>
              ))}
          </li>
        ))}
      </ul>

      <section className="card-soft p-5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
        >
          {open ? t("close") : t("add_homework")}
        </button>
        {open && (
          <div className="mt-4 space-y-3">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subject")}
              className="w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("task_title")}
              className="w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <input
                value={due}
                onChange={(e) => setDue(e.target.value)}
                placeholder={t("due_day")}
                className="flex-1 rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-24 rounded-2xl border border-input bg-surface-2 px-3 py-3 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={() => {
                if (!title.trim()) return;
                addHomework({
                  userId: me.id,
                  subject: subject.trim() || "School",
                  title: title.trim(),
                  due: due.trim() || "Today",
                  minutes,
                });
                setSubject("");
                setTitle("");
                setOpen(false);
              }}
              className="w-full rounded-2xl bg-secondary py-3 text-sm font-extrabold text-secondary-foreground"
            >
              {t("save_homework")}
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}

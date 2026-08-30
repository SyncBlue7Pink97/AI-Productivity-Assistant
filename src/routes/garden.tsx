import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FamilyGarden } from "@/components/FamilyGarden";
import { useSync } from "@/lib/sync-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "Family Garden — SiblingSync" },
      {
        name: "description",
        content:
          "Every approved chore grows the shared family garden — unlock chickens, goats and crops or pets and rooms together.",
      },
      { property: "og:title", content: "Family Garden — SiblingSync" },
      {
        property: "og:description",
        content: "A shared progress garden that rewards teamwork, not competition.",
      },
    ],
  }),
  component: GardenPage,
});

function GardenPage() {
  const { users, assignments, chores } = useSync();
  const { t } = useI18n();
  const siblings = users.filter((u) => u.role === "sibling");

  return (
    <AppShell title={t("our_garden")} subtitle={t("grown_by_family")}>
      <FamilyGarden />

      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">{t("who_helped")}</h2>
        <ul className="mt-3 space-y-2">
          {siblings.map((s) => {
            const done = assignments.filter(
              (a) => a.userId === s.id && a.status === "approved",
            );
            const helped = assignments.filter((a) => a.helperId === s.id);
            return (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3"
              >
                <span className="text-sm font-extrabold">
                  {s.emoji} {s.name}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {t("grown_helped", { grown: done.length, helped: helped.length })}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          {t("chores_in_pool", { n: chores.length })}
        </p>
      </section>
    </AppShell>
  );
}

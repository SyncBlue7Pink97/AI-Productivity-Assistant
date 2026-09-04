import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PremiumGate } from "@/components/PremiumGate";
import { useSync } from "@/lib/sync-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — SiblingSync" },
      {
        name: "description",
        content:
          "Spend earned chore points on family rewards like screen time, dinner picks and day trips.",
      },
      { property: "og:title", content: "Rewards — SiblingSync" },
      {
        property: "og:description",
        content: "Redeem sibling chore points for real family rewards.",
      },
    ],
  }),
  component: Rewards,
});

function Rewards() {
  const { rewards, users, currentSiblingId, setCurrentSibling, redeem } = useSync();
  const { t } = useI18n();
  const siblings = users.filter((u) => u.role === "sibling");
  const me = siblings.find((s) => s.id === currentSiblingId) ?? siblings[0];
  if (!me) return null;

  return (
    <AppShell title={t("rewards")} subtitle={t("points_to_spend", { name: me.name, pts: me.points })}>
      <PremiumGate feature={t("feature_rewards")}>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {siblings.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentSibling(s.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              s.id === me.id
                ? "bg-secondary text-secondary-foreground"
                : "bg-surface-2 text-muted-foreground"
            }`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {rewards.map((r) => {
        const affordable = me.points >= r.cost && !r.redeemed;
        return (
          <div key={r.id} className="card-soft flex items-center gap-3 p-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary-container text-2xl">
              {r.emoji}
            </div>
            <div className="flex-1">
              <p className="font-extrabold">{r.title}</p>
              <p className="text-xs font-bold text-muted-foreground">{t("points_label", { n: r.cost })}</p>
            </div>
            <button
              disabled={!affordable}
              onClick={() => redeem(r.id, me.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold ${
                r.redeemed
                  ? "bg-success/25 text-success-foreground"
                  : affordable
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {r.redeemed ? t("claimed") : affordable ? t("redeem") : t("locked")}
            </button>
          </div>
        );
      })}
    </AppShell>
  );
}

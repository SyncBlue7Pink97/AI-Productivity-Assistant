import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useSync, PREMIUM_PRICE } from "@/lib/sync-store";
import { createPremiumCheckout } from "@/lib/billing.functions";
import { useI18n, type Dict } from "@/lib/i18n";


export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans & pricing — SiblingSync" },
      {
        name: "description",
        content:
          "Free household chore sharing, or a Premium family subscription with recurring schedules, rewards, photo verification and advanced reports.",
      },
      { property: "og:title", content: "Plans & pricing — SiblingSync" },
      {
        property: "og:description",
        content: "Start free, upgrade monthly for automation, rewards and reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlansPage,
});

const freeFeatures: (keyof Dict)[] = ["plan_free_f1", "plan_free_f2", "plan_free_f3"];
const premiumFeatures: (keyof Dict)[] = [
  "plan_prem_f1",
  "plan_prem_f2",
  "plan_prem_f3",
  "plan_prem_f4",
  "plan_prem_f5",
  "plan_prem_f6",
];

function PlansPage() {
  const { plan, setPlan, isPremium } = useSync();
  const { t } = useI18n();
  const startCheckout = useServerFn(createPremiumCheckout);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setPlan("premium");
      window.history.replaceState({}, "", "/plans");
    }
  }, [setPlan]);

  const onUpgrade = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await startCheckout({});
      window.location.href = url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setBusy(false);
    }
  };



  return (
    <AppShell title={t("plans_title")} subtitle={t("plans_sub")}>
      <section
        className={`card-soft p-5 ${plan === "free" ? "ring-2 ring-primary" : ""}`}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">{t("plan_free")}</h2>
          <span className="text-sm font-extrabold text-muted-foreground">
            {t("plan_free_price")}
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {freeFeatures.map((k) => (
            <li key={k} className="rounded-2xl bg-surface-2 px-4 py-2.5 text-sm font-bold">
              ✅ {t(k)}
            </li>
          ))}
        </ul>
        {plan === "free" && (
          <p className="mt-3 rounded-2xl bg-primary-container px-4 py-2.5 text-xs font-extrabold text-on-primary-container">
            {t("current_plan")}
          </p>
        )}
      </section>

      <section
        className={`card-soft bg-secondary-container p-5 ${
          isPremium ? "ring-2 ring-primary" : ""
        }`}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold text-on-secondary-container">
            ⭐ {t("plan_premium")}
          </h2>
          <span className="text-sm font-extrabold text-on-secondary-container">
            {t("plan_premium_price", { price: PREMIUM_PRICE })}
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {premiumFeatures.map((k) => (
            <li
              key={k}
              className="rounded-2xl bg-card/70 px-4 py-2.5 text-sm font-bold text-on-secondary-container"
            >
              ⭐ {t(k)}
            </li>
          ))}
        </ul>
        {isPremium ? (
          <div className="mt-4 space-y-2">
            <p className="rounded-2xl bg-card/70 px-4 py-2.5 text-xs font-extrabold text-on-secondary-container">
              {t("premium_active")}
            </p>
            <button
              onClick={() => setPlan("free")}
              className="w-full rounded-2xl bg-surface-2 py-3 text-sm font-extrabold text-muted-foreground"
            >
              {t("cancel_plan")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPlan("premium")}
            className="mt-4 w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lift"
          >
            {t("upgrade_now", { price: PREMIUM_PRICE })}
          </button>
        )}
      </section>
    </AppShell>
  );
}

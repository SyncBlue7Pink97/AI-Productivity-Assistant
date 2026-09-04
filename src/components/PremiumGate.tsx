import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSync, PREMIUM_PRICE } from "@/lib/sync-store";
import { useI18n } from "@/lib/i18n";

export function PremiumGate({
  feature,
  children,
}: {
  feature: string;
  children: ReactNode;
}) {
  const { isPremium } = useSync();
  const { t } = useI18n();

  if (isPremium) return <>{children}</>;

  return (
    <section className="card-soft bg-secondary-container p-5 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-card/70 text-2xl">
        🔒
      </div>
      <h2 className="mt-3 text-lg font-extrabold text-on-secondary-container">
        ⭐ {t("plan_premium")}
      </h2>
      <p className="mt-1 text-sm font-semibold text-on-secondary-container">
        {t("premium_locked_note", { feature })}
      </p>
      <Link
        to="/plans"
        className="mt-4 inline-block rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground shadow-lift"
      >
        {t("upgrade_now", { price: PREMIUM_PRICE })}
      </Link>
    </section>
  );
}

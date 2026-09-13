import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the creator — SiblingSync" },
      {
        name: "description",
        content:
          "SiblingSync was created by Prosperity Mojapelo to help families share chores fairly across urban and rural homes.",
      },
      { property: "og:title", content: "About the creator — SiblingSync" },
      {
        property: "og:description",
        content:
          "Created by Prosperity Mojapelo: fair, age-based chore sharing for siblings in urban and rural families.",
      },
    ],
  }),
  component: AboutCreator,
});

function AboutCreator() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="bg-sky-pink rounded-b-4xl px-6 pt-14 pb-10 text-center shadow-soft">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-card/80 text-4xl shadow-soft">
          👤
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-primary-foreground">
          {t("creator_name")}
        </h1>
        <p className="mt-1 text-sm font-semibold text-primary-foreground/85">
          {t("creator_role")}
        </p>
      </header>

      <main className="flex-1 space-y-4 px-4 pt-6 pb-12">
        <section className="card-soft space-y-3 p-5">
          <h2 className="text-base font-extrabold">{t("about_creator")}</h2>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            {t("creator_bio")}
          </p>
          <div className="rounded-2xl bg-primary-container/60 px-4 py-3 text-sm font-bold text-on-primary-container">
            🌟 {t("creator_mission")}
          </div>
        </section>

        <section className="card-soft space-y-3 p-5">
          <h2 className="text-base font-extrabold">{t("app_name")}</h2>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            {t("about_app")}
          </p>
        </section>

        <Link
          to="/"
          className="block w-full rounded-3xl bg-primary py-4 text-center text-base font-extrabold text-primary-foreground shadow-lift active:scale-[0.99]"
        >
          {t("back_home")}
        </Link>
      </main>
    </div>
  );
}

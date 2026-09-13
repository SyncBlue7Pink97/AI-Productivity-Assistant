import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSync, type LocationType } from "@/lib/sync-store";
import { useI18n, LANGUAGES } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SiblingSync — Fair chore sharing for siblings" },
      {
        name: "description",
        content:
          "SiblingSync ends chore arguments with fair, age-based rotation for urban and rural families. Photo proof, points, streaks and rewards.",
      },
      { property: "og:title", content: "SiblingSync — Fair chore sharing for siblings" },
      {
        property: "og:description",
        content:
          "Age-fair chore rotation for siblings, with rural offline mode, points and rewards.",
      },
    ],
  }),
  component: Onboarding,
});

type Kid = { name: string; age: number };

function Onboarding() {
  const navigate = useNavigate();
  const { completeFamilySetup } = useSync();
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [familyName, setFamilyName] = useState("Mokoena Family");
  const [joinCode, setJoinCode] = useState("");
  const [familyCode, setFamilyCode] = useState("LIM-482");
  const [locationType, setLocationType] = useState<LocationType>("rural");
  const [kids, setKids] = useState<Kid[]>([
    { name: "Amahle", age: 16 },
    { name: "Thabo", age: 11 },
    { name: "Lindiwe", age: 7 },
  ]);

  const update = (i: number, patch: Partial<Kid>) =>
    setKids((prev) => prev.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));

  const randomCode = () => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const pick = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    return `${pick}-${Math.floor(100 + Math.random() * 900)}`;
  };

  const start = () => {
    const created = familyCode.trim().toUpperCase() || randomCode();
    completeFamilySetup(
      {
        name: mode === "create" ? familyName : "Joined Family",
        code: mode === "join" ? (joinCode.toUpperCase() || "LIM-482") : created,
        locationType,
      },
      kids.filter((k) => k.name.trim()),
    );
    navigate({ to: "/sibling" });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background">
      <header className="bg-sky-pink rounded-b-4xl px-6 pt-14 pb-10 text-center shadow-soft">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-card/80 text-3xl">
          🔄
        </div>
        <h1 className="mt-4 text-4xl font-extrabold text-primary-foreground">{t("app_name")}</h1>
        <p className="mt-2 text-sm font-semibold text-primary-foreground/85">{t("tagline")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                lang === l.code
                  ? "bg-card text-on-primary-container"
                  : "bg-card/50 text-on-primary-container/80"
              }`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4 px-4 pt-6 pb-12">
        <div className="grid grid-cols-2 gap-2 rounded-3xl bg-surface-2 p-1.5">
          {(["create", "join"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-2xl py-3 text-sm font-bold transition-colors ${
                mode === m
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground"
              }`}
            >
              {m === "create" ? t("create_family") : t("join_with_code")}
            </button>
          ))}
        </div>

        <section className="card-soft space-y-3 p-5">
          {mode === "create" ? (
            <label className="block">
              <span className="text-xs font-bold text-muted-foreground">{t("family_name")}</span>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-base font-semibold outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          ) : null}
          {mode === "create" ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">{t("family_code")}</span>
                <button
                  type="button"
                  onClick={() => setFamilyCode(randomCode())}
                  className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container"
                >
                  🎲
                </button>
              </div>
              <input
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                maxLength={12}
                placeholder="LIM-482"
                className="mt-1 w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-center text-xl font-extrabold tracking-[0.3em] uppercase outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ) : (
            <label className="block">
              <span className="text-xs font-bold text-muted-foreground">{t("family_code")}</span>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="LIM-482"
                className="mt-1 w-full rounded-2xl border border-input bg-surface-2 px-4 py-3 text-center text-xl font-extrabold tracking-[0.3em] uppercase outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          )}
        </section>

        <section className="card-soft space-y-3 p-5">
          <h2 className="text-lg font-extrabold">{t("where_do_you_live")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: "urban", emoji: "🏙️", label: t("urban"), note: t("indoor_chores") },
                { key: "rural", emoji: "🌾", label: t("rural"), note: t("offline_friendly") },
              ] as const
            ).map((o) => (
              <button
                key={o.key}
                onClick={() => setLocationType(o.key)}
                className={`rounded-3xl border-2 p-4 text-left transition-colors ${
                  locationType === o.key
                    ? "border-primary bg-primary-container"
                    : "border-border bg-surface-2"
                }`}
              >
                <div className="text-2xl">{o.emoji}</div>
                <div className="mt-1 text-sm font-extrabold">{o.label}</div>
                <div className="text-[11px] font-semibold text-muted-foreground">{o.note}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="card-soft space-y-3 p-5">
          <h2 className="text-lg font-extrabold">{t("add_siblings_ages")}</h2>
          {kids.map((k, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={k.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder={t("name")}
                className="flex-1 rounded-2xl border border-input bg-surface-2 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="number"
                min={4}
                max={19}
                value={k.age}
                onChange={(e) => update(i, { age: Number(e.target.value) })}
                className="w-20 rounded-2xl border border-input bg-surface-2 px-3 py-3 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <button
            onClick={() => setKids((p) => [...p, { name: "", age: 10 }])}
            className="w-full rounded-2xl border-2 border-dashed border-border py-3 text-sm font-bold text-muted-foreground"
          >
            {t("add_another_sibling")}
          </button>
        </section>

        <button
          onClick={start}
          className="w-full rounded-3xl bg-primary py-4 text-base font-extrabold text-primary-foreground shadow-lift active:scale-[0.99]"
        >
          {t("start_syncing")}
        </button>

        <Link
          to="/about"
          className="block w-full rounded-2xl bg-surface-2 py-3 text-center text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("view_creator")}
        </Link>
      </div>
    </div>
  );
}

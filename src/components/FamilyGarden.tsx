import { useSync } from "@/lib/sync-store";

export function FamilyGarden({ compact = false }: { compact?: boolean }) {
  const { gardenItems, grown, family } = useSync();
  const next = gardenItems[grown];
  const pct = Math.min((grown / gardenItems.length) * 100, 100);

  return (
    <section className="card-soft p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold">Family garden</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            {family.locationType === "rural" ? "Homestead" : "City garden"} grown together ·{" "}
            {grown}/{gardenItems.length}
          </p>
        </div>
        <span className="text-3xl">{family.locationType === "rural" ? "🏡" : "🏙️"}</span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 grid grid-cols-4 gap-2">
        {gardenItems.map((item, i) => {
          const unlocked = i < grown;
          return (
            <li
              key={item.label}
              className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-3 text-center transition-all ${
                unlocked ? "bg-primary-container" : "bg-surface-2 opacity-50"
              }`}
            >
              <span
                className={`text-2xl ${unlocked ? "animate-in zoom-in duration-500" : "grayscale"}`}
              >
                {unlocked ? item.emoji : "🌫️"}
              </span>
              <span className="text-[10px] font-bold leading-tight text-muted-foreground">
                {unlocked ? item.label : "Locked"}
              </span>
            </li>
          );
        })}
      </ul>

      {!compact && (
        <p className="mt-4 rounded-2xl bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container">
          {next
            ? `Next up: ${next.emoji} ${next.label} — one more approved chore unlocks it for everyone.`
            : "🎉 The whole garden is grown. Amazing teamwork, family!"}
        </p>
      )}
    </section>
  );
}

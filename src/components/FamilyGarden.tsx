import { useSync } from "@/lib/sync-store";

export function FamilyGarden() {
  const { gardenItems, grown, family } = useSync();
  const unlocked = gardenItems.filter((g) => grown >= g.unlockAt);
  const next = gardenItems.find((g) => grown < g.unlockAt);

  return (
    <div className="space-y-4">
      <section className="card-soft p-5">
        <h2 className="text-lg font-extrabold">
          {family.locationType === "rural" ? "Our homestead" : "Our home"}
        </h2>
        <p className="text-xs font-semibold text-muted-foreground">
          {grown} approved chores have grown the family garden
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {gardenItems.map((g) => {
            const open = grown >= g.unlockAt;
            return (
              <div
                key={g.id}
                className={`flex flex-col items-center gap-1 rounded-3xl py-5 text-center ${
                  open ? "bg-primary-container" : "bg-surface-2"
                }`}
              >
                <span className={`text-3xl ${open ? "" : "opacity-30 grayscale"}`}>
                  {open ? g.emoji : "🔒"}
                </span>
                <span
                  className={`px-1 text-[11px] font-bold ${
                    open ? "text-on-primary-container" : "text-muted-foreground"
                  }`}
                >
                  {g.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card-soft p-5">
        <h3 className="text-sm font-extrabold">Next to unlock</h3>
        {next ? (
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {next.emoji} {next.label} — {next.unlockAt - grown} more approved chore
            {next.unlockAt - grown === 1 ? "" : "s"} to go.
          </p>
        ) : (
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            🎉 Everything unlocked — the whole family grew it together.
          </p>
        )}
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          Unlocked {unlocked.length} of {gardenItems.length}
        </p>
      </section>
    </div>
  );
}

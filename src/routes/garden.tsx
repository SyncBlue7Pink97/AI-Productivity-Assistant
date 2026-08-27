import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FamilyGarden } from "@/components/FamilyGarden";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "Family Garden — SiblingSync" },
      {
        name: "description",
        content:
          "Every approved chore grows the shared family garden — unlock chickens, maize, goats and more together.",
      },
      { property: "og:title", content: "Family Garden — SiblingSync" },
      {
        property: "og:description",
        content: "A shared reward siblings grow together, one approved chore at a time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GardenPage,
});

function GardenPage() {
  return (
    <AppShell title="Family Garden 🌱" subtitle="Grown by everyone, together">
      <FamilyGarden />
    </AppShell>
  );
}

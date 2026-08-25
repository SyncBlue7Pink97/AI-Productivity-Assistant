import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LocationType = "urban" | "rural";
export type Role = "parent" | "sibling";
export type Difficulty = "easy" | "medium" | "hard";
export type Category = "indoor" | "outdoor" | "rural";
export type AssignmentStatus = "todo" | "pending" | "approved";

export type Family = {
  name: string;
  code: string;
  locationType: LocationType;
};

export type User = {
  id: string;
  name: string;
  role: Role;
  age: number;
  points: number;
  streak: number;
  emoji: string;
};

export type Chore = {
  id: string;
  title: string;
  points: 10 | 20 | 30;
  minAge: number;
  category: Category;
  emoji: string;
  hardLastWeekFor?: string[];
};

export type Assignment = {
  id: string;
  choreId: string;
  userId: string;
  status: AssignmentStatus;
  photoUrl?: string;
  day: string;
};

export type Reward = {
  id: string;
  title: string;
  cost: number;
  emoji: string;
  redeemed?: boolean;
};

export const RURAL_CHORES: Chore[] = [
  { id: "c-water", title: "Fetch water", points: 30, minAge: 13, category: "rural", emoji: "🪣" },
  { id: "c-chickens", title: "Feed chickens", points: 10, minAge: 5, category: "rural", emoji: "🐔" },
  { id: "c-firewood", title: "Collect firewood", points: 30, minAge: 13, category: "rural", emoji: "🪵" },
  { id: "c-yard", title: "Sweep yard", points: 20, minAge: 9, category: "rural", emoji: "🧹" },
  { id: "c-goats", title: "Herd goats", points: 30, minAge: 13, category: "rural", emoji: "🐐" },
];

export const URBAN_CHORES: Chore[] = [
  { id: "c-dishes", title: "Wash dishes", points: 20, minAge: 9, category: "indoor", emoji: "🍽️" },
  { id: "c-toys", title: "Pack away toys", points: 10, minAge: 5, category: "indoor", emoji: "🧸" },
  { id: "c-bins", title: "Take out bins", points: 20, minAge: 9, category: "outdoor", emoji: "🗑️" },
  { id: "c-laundry", title: "Fold laundry", points: 30, minAge: 13, category: "indoor", emoji: "👕" },
  { id: "c-vacuum", title: "Vacuum lounge", points: 30, minAge: 13, category: "indoor", emoji: "🧽" },
];

export function difficultyOf(chore: Chore): Difficulty {
  if (chore.points === 10) return "easy";
  if (chore.points === 20) return "medium";
  return "hard";
}

export function allowedDifficulties(age: number): Difficulty[] {
  if (age <= 8) return ["easy"];
  if (age <= 12) return ["easy", "medium"];
  return ["easy", "medium", "hard"];
}

export function ageBadge(age: number) {
  if (age <= 8) return { label: "Ages 5–8 · Easy", tone: "easy" as const };
  if (age <= 12) return { label: "Ages 9–12 · Medium", tone: "medium" as const };
  return { label: "Ages 13+ · Hard", tone: "hard" as const };
}

/** Only shows chores a child of this age is allowed to do. */
export function filterChoresByAge(chores: Chore[], age: number) {
  const allowed = allowedDifficulties(age);
  return chores.filter(
    (c) => age >= c.minAge && allowed.includes(difficultyOf(c)),
  );
}

/** Age-weighted points so younger siblings aren't unfairly behind. */
export function weightedPoints(points: number, age: number) {
  const weight = age <= 8 ? 1.6 : age <= 12 ? 1.25 : 1;
  return Math.round(points * weight);
}

/** Fair rotation: no hard chore two weeks in a row for the same sibling. */
export function autoRotateChores(
  chores: Chore[],
  siblings: User[],
): Assignment[] {
  const pool = [...chores];
  const out: Assignment[] = [];
  const sorted = [...siblings].sort((a, b) => b.age - a.age);
  for (const sib of sorted) {
    const options = filterChoresByAge(pool, sib.age).filter((c) => {
      if (difficultyOf(c) !== "hard") return true;
      return !(c.hardLastWeekFor ?? []).includes(sib.id);
    });
    const pick = options[options.length - 1] ?? options[0];
    if (!pick) continue;
    pool.splice(pool.indexOf(pick), 1);
    out.push({
      id: `a-${sib.id}-${pick.id}`,
      choreId: pick.id,
      userId: sib.id,
      status: "todo",
      day: "today",
    });
  }
  return out;
}

const seedUsers: User[] = [
  { id: "u-mom", name: "Mama Mokoena", role: "parent", age: 41, points: 0, streak: 0, emoji: "👩🏾" },
  { id: "u-amahle", name: "Amahle", role: "sibling", age: 16, points: 240, streak: 6, emoji: "👧🏾" },
  { id: "u-thabo", name: "Thabo", role: "sibling", age: 11, points: 180, streak: 4, emoji: "👦🏾" },
  { id: "u-lindiwe", name: "Lindiwe", role: "sibling", age: 7, points: 120, streak: 3, emoji: "🧒🏾" },
];

const seedAssignments: Assignment[] = [
  { id: "a1", choreId: "c-water", userId: "u-amahle", status: "todo", day: "today" },
  { id: "a2", choreId: "c-yard", userId: "u-thabo", status: "todo", day: "today" },
  { id: "a3", choreId: "c-chickens", userId: "u-lindiwe", status: "pending", day: "today" },
  { id: "a4", choreId: "c-firewood", userId: "u-thabo", status: "todo", day: "today" },
];

const seedRewards: Reward[] = [
  { id: "r1", title: "Extra 30 min screen time", cost: 100, emoji: "📱" },
  { id: "r2", title: "Choose Sunday dinner", cost: 150, emoji: "🍲" },
  { id: "r3", title: "Skip one chore day", cost: 200, emoji: "🎟️" },
  { id: "r4", title: "Trip to town with Mama", cost: 300, emoji: "🚌" },
  { id: "r5", title: "New soccer ball", cost: 500, emoji: "⚽" },
];

type Store = {
  family: Family;
  users: User[];
  chores: Chore[];
  assignments: Assignment[];
  rewards: Reward[];
  currentSiblingId: string;
  onboarded: boolean;
  offlineMode: boolean;
  setOfflineMode: (v: boolean) => void;
  setCurrentSibling: (id: string) => void;
  completeFamilySetup: (f: Family, kids: { name: string; age: number }[]) => void;
  submitProof: (assignmentId: string, photoUrl?: string) => void;
  approve: (assignmentId: string) => void;
  reject: (assignmentId: string) => void;
  swap: (assignmentId: string, toUserId: string) => void;
  addChore: (c: Omit<Chore, "id">, userId: string) => void;
  rotate: () => void;
  redeem: (rewardId: string, userId: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<Family>({
    name: "Mokoena Family",
    code: "LIM-482",
    locationType: "rural",
  });
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [chores, setChores] = useState<Chore[]>(RURAL_CHORES);
  const [assignments, setAssignments] = useState<Assignment[]>(seedAssignments);
  const [rewards, setRewards] = useState<Reward[]>(seedRewards);
  const [currentSiblingId, setCurrentSibling] = useState("u-thabo");
  const [onboarded, setOnboarded] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const value = useMemo<Store>(
    () => ({
      family,
      users,
      chores,
      assignments,
      rewards,
      currentSiblingId,
      onboarded,
      offlineMode,
      setOfflineMode,
      setCurrentSibling,
      completeFamilySetup: (f, kids) => {
        setFamily(f);
        const rural = f.locationType === "rural";
        setChores(rural ? RURAL_CHORES : URBAN_CHORES);
        setOfflineMode(rural);
        if (kids.length) {
          const parent = users.find((u) => u.role === "parent")!;
          const emojis = ["👧🏾", "👦🏾", "🧒🏾", "👶🏾"];
          const kidUsers: User[] = kids.map((k, i) => ({
            id: `u-new-${i}`,
            name: k.name,
            role: "sibling",
            age: k.age,
            points: 0,
            streak: 0,
            emoji: emojis[i % emojis.length],
          }));
          setUsers([parent, ...kidUsers]);
          setAssignments(
            autoRotateChores(rural ? RURAL_CHORES : URBAN_CHORES, kidUsers),
          );
          setCurrentSibling(kidUsers[0]?.id ?? "");
        }
        setOnboarded(true);
      },
      submitProof: (id, photoUrl) =>
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "pending", photoUrl } : a,
          ),
        ),
      approve: (id) => {
        const a = assignments.find((x) => x.id === id);
        if (!a) return;
        const chore = chores.find((c) => c.id === a.choreId);
        const user = users.find((u) => u.id === a.userId);
        if (chore && user) {
          const gain = weightedPoints(chore.points, user.age);
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id
                ? { ...u, points: u.points + gain, streak: u.streak + 1 }
                : u,
            ),
          );
        }
        setAssignments((prev) =>
          prev.map((x) => (x.id === id ? { ...x, status: "approved" } : x)),
        );
      },
      reject: (id) =>
        setAssignments((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, status: "todo", photoUrl: undefined } : x,
          ),
        ),
      swap: (id, toUserId) =>
        setAssignments((prev) =>
          prev.map((x) => (x.id === id ? { ...x, userId: toUserId } : x)),
        ),
      addChore: (c, userId) => {
        const id = `c-${Date.now()}`;
        setChores((prev) => [...prev, { ...c, id }]);
        setAssignments((prev) => [
          ...prev,
          { id: `a-${id}`, choreId: id, userId, status: "todo", day: "today" },
        ]);
      },
      rotate: () =>
        setAssignments(
          autoRotateChores(
            chores,
            users.filter((u) => u.role === "sibling"),
          ),
        ),
      redeem: (rewardId, userId) => {
        const reward = rewards.find((r) => r.id === rewardId);
        const user = users.find((u) => u.id === userId);
        if (!reward || !user || user.points < reward.cost) return;
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, points: u.points - reward.cost } : u,
          ),
        );
        setRewards((prev) =>
          prev.map((r) => (r.id === rewardId ? { ...r, redeemed: true } : r)),
        );
      },
    }),
    [family, users, chores, assignments, rewards, currentSiblingId, onboarded, offlineMode],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSync() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useSync must be used inside SyncProvider");
  return ctx;
}

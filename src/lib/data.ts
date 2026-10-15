import { db } from "./db";
import { rarity } from "./rules";
export async function getData() {
  const [user, items, total] = await Promise.all([
    db.user.findUnique({
      where: { id: "local" },
      include: { unlocks: true, showcase: { orderBy: { position: "asc" } } },
    }),
    db.achievement.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: { select: { unlocks: { where: { user: { active: true } } } } },
      },
    }),
    db.user.count({ where: { active: true } }),
  ]);
  return {
    user: user
      ? {
          ...user,
          unlocks: user.unlocks.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
          })),
        }
      : null,
    total,
    achievements: items.map(({ _count, ...a }) => ({
      ...a,
      ...rarity(_count.unlocks, total),
      unlockedCount: _count.unlocks,
    })),
  };
}
export type AppData = Awaited<ReturnType<typeof getData>>;
export type Achievement = AppData["achievements"][number];

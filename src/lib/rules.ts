export const MIN_SAMPLE = 100;
export function rarity(unlocked: number, total: number) {
  if (total < MIN_SAMPLE) return { label: "数据不足", rate: null, rank: 0 };
  const rate = (unlocked / total) * 100;
  return {
    rate,
    label:
      rate >= 20
        ? "普通"
        : rate >= 5
          ? "稀有"
          : rate >= 1
            ? "极其稀有"
            : rate >= 0.1
              ? "史诗"
              : "传说",
    rank: rate >= 20 ? 1 : rate >= 5 ? 2 : rate >= 1 ? 3 : rate >= 0.1 ? 4 : 5,
  };
}
export function validDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(value + "T00:00:00Z");
  const today = new Date();
  const local = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return (
    !Number.isNaN(+date) &&
    date.toISOString().slice(0, 10) === value &&
    value <= local
  );
}

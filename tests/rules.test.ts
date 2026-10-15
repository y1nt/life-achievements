import { test } from "node:test";
import assert from "node:assert/strict";
import { rarity, validDate } from "../src/lib/rules";
import { catalog, categories } from "../src/lib/catalog";
test("rarity hides small samples and respects every boundary", () => {
  assert.equal(rarity(99, 99).rate, null);
  for (const [count, label] of [
    [2000, "普通"],
    [500, "稀有"],
    [100, "极其稀有"],
    [10, "史诗"],
    [9, "传说"],
  ] as const) {
    assert.equal(rarity(count, 10000).label, label);
  }
  assert.equal(rarity(1, 100).rate, 1);
});
test("completion dates reject future and impossible dates", () => {
  assert.equal(validDate("2024-02-29"), true);
  for (const value of [
    "2025-02-29",
    "2026-13-01",
    "2099-01-01",
    "2020-1-1",
    null,
  ])
    assert.equal(validDate(value), false);
});
test("catalog has unique entries and ten per category", () => {
  assert.equal(catalog.length, 60);
  assert.equal(new Set(catalog.map((a) => a.id)).size, 60);
  categories.forEach((_, i) =>
    assert.equal(catalog.filter((a) => a.category === i).length, 10),
  );
  assert.ok(
    catalog.every(
      (a) => a.condition.length > 8 && a.difficulty >= 1 && a.difficulty <= 5,
    ),
  );
});

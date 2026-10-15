import assert from "node:assert/strict";
import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { PrismaClient } from "@prisma/client";
const dir = await mkdtemp(join(tmpdir(), "life-achievements-test-"));
const database = join(dir, "test.db");
await copyFile(resolve("prisma/dev.db"), database);
const url = "file:" + database.replaceAll("\\", "/");
const db = new PrismaClient({ datasources: { db: { url } } });
await db.user.deleteMany();
await db.$disconnect();
let server;
async function start() {
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3101",
    ],
    {
      env: { ...process.env, DATABASE_URL: url },
      stdio: "pipe",
      windowsHide: true,
    },
  );
  let logs = "";
  server.stdout.on("data", (d) => (logs += d));
  server.stderr.on("data", (d) => (logs += d));
  for (let n = 0; n < 100; n++) {
    try {
      if ((await fetch("http://127.0.0.1:3101/api/state")).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error(logs);
}
async function stop() {
  if (server && server.exitCode === null) {
    const exited = new Promise((r) => server.once("exit", r));
    server.kill();
    await exited;
  }
}
async function post(body, status = 200) {
  const r = await fetch("http://127.0.0.1:3101/api/state", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  assert.equal(r.status, status, JSON.stringify(json));
  return json;
}
try {
  await start();
  for (const path of ["/", "/achievements", "/profile"])
    assert.equal((await fetch("http://127.0.0.1:3101" + path)).status, 200);
  await post(
    { action: "unlock", id: "1-01", date: "2024-01-01", note: "" },
    400,
  );
  let state = await post({
    action: "profile",
    nickname: "测试探险家",
    bio: "测试数据，仅在临时数据库",
    avatar: "stars",
  });
  assert.equal(state.total, 1);
  await post(
    { action: "unlock", id: "1-01", date: "2099-01-01", note: "" },
    400,
  );
  await post(
    { action: "unlock", id: "1-01", date: "2025-02-29", note: "" },
    400,
  );
  await post({ action: "showcase", ids: ["1-01"] }, 400);
  for (let i = 1; i <= 7; i++)
    state = await post({
      action: "unlock",
      id: `1-0${i}`,
      date: "2024-01-01",
      note: "一次值得纪念的经历",
    });
  assert.equal(state.user.unlocks.length, 7);
  assert.equal(state.achievements[0].unlockedCount, 1);
  assert.equal(state.achievements[0].rate, null);
  state = await post({
    action: "unlock",
    id: "1-01",
    date: "2024-01-02",
    note: "重复请求",
  });
  assert.equal(state.user.unlocks.length, 7);
  await post({ action: "showcase", ids: ["1-01", "1-01"] }, 400);
  await post(
    {
      action: "showcase",
      ids: Array.from({ length: 7 }, (_, i) => `1-0${i + 1}`),
    },
    400,
  );
  state = await post({
    action: "showcase",
    ids: ["1-03", "1-02", "1-01", "1-04", "1-05", "1-06"],
  });
  assert.equal(state.user.showcase.length, 6);
  assert.equal(state.user.showcase[0].achievementId, "1-03");
  await stop();
  await start();
  state = await (await fetch("http://127.0.0.1:3101/api/state")).json();
  assert.equal(state.user.unlocks.length, 7);
  assert.equal(state.user.showcase.length, 6);
  assert.equal(state.user.unlocks[0].note, "一次值得纪念的经历");
  state = await post({ action: "revoke", id: "1-03" });
  assert.equal(state.user.unlocks.length, 6);
  assert.equal(state.user.showcase.length, 5);
  assert.equal(
    state.achievements.find((a) => a.id === "1-03").unlockedCount,
    0,
  );
  const denied = await fetch("http://127.0.0.1:3101/api/state", {
    method: "POST",
    headers: {
      origin: "https://external.example",
      "content-type": "application/json",
    },
    body: JSON.stringify({ action: "revoke", id: "1-01" }),
  });
  assert.equal(denied.status, 403);
  console.log(
    "PASS: 3 pages; profile; 7 unlocks; date validation; duplicate idempotence; showcase ownership/limit/order; restart persistence; revoke cleanup; live counts; cross-origin rejection.",
  );
} finally {
  await stop();
  await rm(dir, { recursive: true, force: true });
}

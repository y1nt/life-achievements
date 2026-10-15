import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedOrigin } from "../src/lib/origin";
test("accepts browser host even when the internal URL differs", () => {
  assert.equal(
    allowedOrigin(
      "http://127.0.0.1:3000",
      "127.0.0.1:3000",
      "http://localhost:3000/api/state",
    ),
    true,
  );
  assert.equal(
    allowedOrigin(
      "http://localhost:3000",
      "127.0.0.1:3000",
      "http://localhost:3000/api/state",
    ),
    true,
  );
  assert.equal(
    allowedOrigin(
      "http://[::1]:3000",
      "127.0.0.1:3000",
      "http://localhost:3000/api/state",
    ),
    true,
  );
});
test("rejects other sites, ports, protocols, and opaque origins", () => {
  for (const origin of [
    "https://external.example",
    "http://localhost:3001",
    "https://localhost:3000",
    "null",
    "http://localhost.evil:3000",
  ])
    assert.equal(
      allowedOrigin(
        origin,
        "127.0.0.1:3000",
        "http://localhost:3000/api/state",
      ),
      false,
    );
});

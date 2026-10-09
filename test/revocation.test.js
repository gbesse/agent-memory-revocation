import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { audit, summarizeOpenClaw } from "../src/core.js";
test("finds remaining literal copy without returning content", async () => {
  const m = JSON.parse(await readFile("fixtures/manifest.json"));
  const r = JSON.parse(await readFile("fixtures/openclaw-preview.json"));
  const result = await audit(m, "fixtures", r);
  assert.equal(result.status, "review_required");
  assert.equal(result.targets[0].matched_needles, 1);
  assert.equal(result.openclaw.status, "manual_review");
  assert.equal(JSON.stringify(result).includes("CANARY-CLIENT-1"), false);
});
test("no literal match does not certify erasure", async () => {
  const result = await audit(
    {
      source_id: "x",
      needles: ["NEVER-THERE"],
      targets: [{ name: "brain", path: "brain" }],
    },
    "fixtures",
  );
  assert.equal(result.status, "no_literal_match");
  assert.equal(result.limitation, "literal_matches_only");
});
test("rejects path escape and malformed report", async () => {
  await assert.rejects(() =>
    audit(
      {
        source_id: "x",
        needles: ["abc"],
        targets: [{ name: "escape", path: "../" }],
      },
      "fixtures",
    ),
  );
  assert.throws(() => summarizeOpenClaw([]));
});

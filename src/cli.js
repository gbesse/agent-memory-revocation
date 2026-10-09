#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createInterface } from "node:readline";
import { audit } from "./core.js";
const execFileAsync = promisify(execFile);
const ui = {
  fr: {
    usage: "Usage : agent-memory-revocation audit|serve manifeste.json",
    error: "Échec de l’audit",
  },
  en: {
    usage: "Usage: agent-memory-revocation audit|serve manifest.json",
    error: "Audit failed",
  },
  es: {
    usage: "Uso: agent-memory-revocation audit|serve manifiesto.json",
    error: "Error de auditoría",
  },
};
const lang = ["fr", "en", "es"].includes(process.env.LANG?.slice(0, 2))
  ? process.env.LANG.slice(0, 2)
  : "en";
const [mode, path] = process.argv.slice(2);
if (!["audit", "serve"].includes(mode) || !path) {
  process.stderr.write(ui[lang].usage + "\n");
  process.exit(2);
}
async function run() {
  const file = resolve(path);
  const manifest = JSON.parse(await readFile(file, "utf8"));
  let report = null;
  if (manifest.openclaw_report)
    report = JSON.parse(
      await readFile(resolve(dirname(file), manifest.openclaw_report), "utf8"),
    );
  if (manifest.openclaw_live) {
    const { agent, participant, session } = manifest.openclaw_live;
    if (
      typeof agent !== "string" ||
      !agent ||
      Boolean(participant) === Boolean(session)
    )
      throw new Error("invalid_openclaw_selector");
    const args = [
      "memory",
      "forget",
      "--agent",
      agent,
      participant ? "--participant" : "--session",
      participant || session,
      "--dry-run",
      "--json",
    ];
    const response = await execFileAsync("openclaw", args, {
      timeout: 15000,
      maxBuffer: 2_000_000,
    });
    report = JSON.parse(response.stdout);
  }
  return audit(manifest, dirname(file), report);
}
try {
  if (mode === "audit")
    process.stdout.write(JSON.stringify(await run(), null, 2) + "\n");
  else
    for await (const line of createInterface({ input: process.stdin })) {
      let req;
      try {
        req = JSON.parse(line);
      } catch {
        continue;
      }
      if (req.id === undefined) continue;
      try {
        let result;
        if (req.method === "initialize")
          result = {
            protocolVersion: "2025-06-18",
            capabilities: { tools: {} },
            serverInfo: { name: "agent-memory-revocation", version: "0.1.0" },
          };
        else if (req.method === "tools/list")
          result = {
            tools: [
              {
                name: "audit_revocation",
                description:
                  "Auditer les copies observables / Audit observable copies / Auditar copias observables",
                inputSchema: { type: "object", properties: {} },
                annotations: {
                  readOnlyHint: true,
                  destructiveHint: false,
                  openWorldHint: false,
                },
              },
            ],
          };
        else if (
          req.method === "tools/call" &&
          req.params?.name === "audit_revocation"
        )
          result = {
            content: [{ type: "text", text: JSON.stringify(await run()) }],
          };
        else throw new Error("unknown_method");
        process.stdout.write(
          JSON.stringify({ jsonrpc: "2.0", id: req.id, result }) + "\n",
        );
      } catch (e) {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: req.id,
            error: { code: -32000, message: e.message },
          }) + "\n",
        );
      }
    }
} catch (e) {
  process.stderr.write(`${ui[lang].error}: ${e.message}\n`);
  process.exit(2);
}

import { lstat, readFile, readdir } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

const extensions = new Set([".md", ".txt", ".json", ".okf"]);
async function walk(root) {
  const stat = await lstat(root);
  if (stat.isSymbolicLink()) throw new Error("symlink_rejected");
  if (stat.isFile()) return [root];
  if (!stat.isDirectory()) return [];
  const names = (await readdir(root)).sort();
  const nested = await Promise.all(names.map((name) => walk(join(root, name))));
  return nested.flat();
}
export function summarizeOpenClaw(report) {
  if (!report || typeof report !== "object" || Array.isArray(report))
    throw new Error("invalid_openclaw_report");
  const count = (key) => (Array.isArray(report[key]) ? report[key].length : 0);
  return {
    tracked_artifacts: count("artifacts"),
    untargetable_entries: count("untargetableEntryKeys"),
    curated_writes_to_review: count("curatedWrites"),
    refusals: count("refusals"),
    session_resolutions: count("sessionResolutions"),
    status:
      count("untargetableEntryKeys") ||
      count("curatedWrites") ||
      count("refusals")
        ? "manual_review"
        : "preview_only",
  };
}
export async function audit(manifest, baseDir, report = null) {
  if (
    !manifest ||
    typeof manifest.source_id !== "string" ||
    !manifest.source_id ||
    !Array.isArray(manifest.needles) ||
    !manifest.needles.length ||
    !Array.isArray(manifest.targets) ||
    !manifest.targets.length
  )
    throw new Error("invalid_manifest");
  if (
    manifest.needles.some(
      (n) => typeof n !== "string" || n.length < 3 || n.length > 200,
    )
  )
    throw new Error("invalid_needles");
  const targets = [];
  for (const target of manifest.targets) {
    if (
      typeof target.name !== "string" ||
      !target.name ||
      typeof target.path !== "string" ||
      !target.path
    )
      throw new Error("invalid_target");
    const root = resolve(baseDir, target.path);
    if (!root.startsWith(resolve(baseDir) + sep) && root !== resolve(baseDir))
      throw new Error("path_outside_manifest_dir");
    const files = (await walk(root)).filter((f) =>
      extensions.has(extname(f).toLowerCase()),
    );
    let matches = 0;
    let filesWithMatches = 0;
    let scanned = 0;
    for (const file of files) {
      const stat = await lstat(file);
      if (stat.size > 2_000_000) throw new Error("file_too_large");
      const body = await readFile(file, "utf8");
      scanned++;
      const hits = manifest.needles.reduce(
        (sum, needle) => sum + (body.includes(needle) ? 1 : 0),
        0,
      );
      matches += hits;
      if (hits) filesWithMatches++;
    }
    targets.push({
      name: target.name,
      status: matches ? "observed_copy" : "no_literal_match",
      files_scanned: scanned,
      files_with_matches: filesWithMatches,
      matched_needles: matches,
    });
  }
  return {
    source_id: manifest.source_id,
    status: targets.some((t) => t.status === "observed_copy")
      ? "review_required"
      : "no_literal_match",
    targets,
    openclaw: report ? summarizeOpenClaw(report) : { status: "not_checked" },
    limitation: "literal_matches_only",
  };
}

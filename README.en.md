# Agent Memory Revocation

[Français](README.md) · English · [Español](README.es.md)

A read-only MCP extension to inspect what remains **observable** after removing a source. It searches for literal markers in Markdown, JSON, TXT, or OKF exports and summarizes an `openclaw memory forget --dry-run --json` preview. It deletes nothing and never certifies complete erasure: paraphrases, transcripts, and out-of-scope copies may remain.

## Try it

```sh
npm test
node src/cli.js audit fixtures/manifest.json
node src/cli.js serve fixtures/manifest.json
```

Add the last command as a stdio MCP server in OpenClaw or Hermes; `skills/revocation` holds FR/EN/ES instructions. In the manifest, `openclaw_report` points to a saved preview. For a live preview use `openclaw_live: {"agent":"id","participant":"id"}` or `session`, never both. The tool uses only `--dry-run`. Targets must stay below the manifest directory; symbolic links are rejected. The report does not echo the searched markers.

Bruno Brain can be exported as Markdown or OKF, but this repository does not connect to Bruno or delete data in Muse or dots. The example is synthetic. Node.js 22+, MIT.

Sources: [OpenClaw forgetting boundaries](https://docs.openclaw.ai/concepts/memory-provenance), [Muse connectors](https://www.meta.com/help/artificial-intelligence/1687253048996149/), [Bruno Brain export](https://get-bruno.com/fr/tech).

The package includes Agent Plugins `plugin.json` and `mcp.json`. For a compatible local installation, place the file expected by `mcp.json` and every file it references in `${PLUGIN_DATA}`, then replace synthetic data with your private data. Public ChatGPT directory submission requires a hosted HTTPS MCP server; this local stdio version has not been submitted. OCE and Muse have not been tested.

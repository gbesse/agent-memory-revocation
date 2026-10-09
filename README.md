# Agent Memory Revocation

Français · [English](README.en.md) · [Español](README.es.md)

Extension MCP en lecture seule pour examiner ce qui reste **observable** après le retrait d'une source. Elle cherche des marqueurs littéraux dans des exports Markdown, JSON, TXT ou OKF et résume un aperçu `openclaw memory forget --dry-run --json`. Elle ne supprime rien et ne certifie jamais un effacement complet : les paraphrases, transcriptions et copies hors périmètre peuvent subsister.

## Essayer

```sh
npm test
node src/cli.js audit fixtures/manifest.json
node src/cli.js serve fixtures/manifest.json
```

Ajouter le dernier appel comme serveur MCP stdio à OpenClaw ou Hermes ; `skills/revocation` contient les consignes en FR/EN/ES. Dans le manifeste, `openclaw_report` pointe vers un aperçu sauvegardé. Pour un aperçu direct, utiliser plutôt `openclaw_live: {"agent":"id","participant":"id"}` ou `session`, jamais les deux. L'outil exécute uniquement l'option `--dry-run`. Les cibles doivent se trouver sous le dossier du manifeste ; les liens symboliques sont refusés. Le rapport ne répète pas les marqueurs recherchés.

Bruno Brain peut être exporté en Markdown ou OKF, mais ce dépôt ne se connecte pas à Bruno et ne commande aucune suppression dans Muse ou les dots. Le dossier d'exemple est fictif. Node.js 22+, MIT.

Sources : [limites de l'oubli OpenClaw](https://docs.openclaw.ai/concepts/memory-provenance), [connecteurs Muse](https://www.meta.com/help/artificial-intelligence/1687253048996149/), [export Bruno Brain](https://get-bruno.com/fr/tech).

Le paquet contient `plugin.json` et `mcp.json` au format Agent Plugins. Lors d’une installation locale compatible, placez dans `${PLUGIN_DATA}` le fichier attendu par `mcp.json` et tous les fichiers qu’il référence, puis remplacez les données fictives par vos données privées. La publication dans le répertoire public ChatGPT exige un MCP HTTPS hébergé : cette version stdio locale n’y est pas soumise. OCE et Muse ne sont pas testés.

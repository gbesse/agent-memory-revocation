# Agent Memory Revocation

[Français](README.md) · [English](README.en.md) · Español

Extensión MCP de solo lectura para examinar lo que sigue siendo **observable** tras retirar una fuente. Busca marcadores literales en exportaciones Markdown, JSON, TXT u OKF y resume una vista previa de `openclaw memory forget --dry-run --json`. No borra nada ni certifica un borrado completo: pueden quedar paráfrasis, transcripciones y copias fuera del alcance.

## Probar

```sh
npm test
node src/cli.js audit fixtures/manifest.json
node src/cli.js serve fixtures/manifest.json
```

Añade el último comando como servidor MCP stdio en OpenClaw o Hermes; `skills/revocation` contiene instrucciones FR/EN/ES. En el manifiesto, `openclaw_report` señala una vista previa guardada. Para una vista previa directa usa `openclaw_live: {"agent":"id","participant":"id"}` o `session`, nunca ambos. La herramienta solo ejecuta `--dry-run`. Los destinos deben quedar dentro del directorio del manifiesto y se rechazan los enlaces simbólicos. El informe no repite los marcadores buscados.

Bruno Brain puede exportarse como Markdown u OKF, pero este repositorio no se conecta a Bruno ni borra datos en Muse o dots. El ejemplo es ficticio. Node.js 22+, MIT.

Fuentes: [límites de olvido de OpenClaw](https://docs.openclaw.ai/concepts/memory-provenance), [conectores Muse](https://www.meta.com/help/artificial-intelligence/1687253048996149/), [exportación de Bruno Brain](https://get-bruno.com/fr/tech).

El paquete incluye `plugin.json` y `mcp.json` en formato Agent Plugins. Para una instalación local compatible, coloca en `${PLUGIN_DATA}` el archivo esperado por `mcp.json` y todos los archivos que referencia; después sustituye los datos ficticios por tus datos privados. La publicación en el directorio público de ChatGPT exige un servidor MCP HTTPS alojado; esta versión stdio local no se ha enviado. OCE y Muse no se han probado.

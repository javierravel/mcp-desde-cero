# Servidor de notas: resources, tools y prompts (video 10)

Un servidor MCP de 48 líneas que usa las **tres piezas** de MCP sobre una carpeta de notas en Markdown:

| Pieza | En este servidor | Quién decide cuándo se usa |
|---|---|---|
| **Resource** | `notas://{nombre}`: lee una nota | Vos (o la app): la adjuntás a la conversación |
| **Tool** | `crear_nota(nombre, texto)`: crea una nota | El modelo, y la app te pide aprobación |
| **Prompt** | `resumir_nota(nombre)`: plantilla lista para usar | Vos, desde el menú de la app |

📺 Video: https://youtu.be/utAclQMc3uw (se publica el 6 de noviembre)

## Permisos mínimos

- El servidor solo lee y escribe dentro de la carpeta `notas/` que está al lado de `index.js`.
- Los nombres solo aceptan minúsculas, números y guiones, así que algo como `../secreto` se rechaza antes de llegar al disco.
- `crear_nota` nunca pisa una nota que ya existe.
- No hay herramienta para borrar: si no la necesitás, no la expongas.

## Instalación

```bash
npm install
```

### Claude Code

```bash
claude mcp add notas -- node "$(pwd)/index.js"
```

En Claude Code, los resources se adjuntan con `@` (por ejemplo `@notas:notas://reunion-lunes`) y los prompts aparecen como comandos `/mcp__notas__resumir_nota`.

### Claude Desktop

Agregá esto a `claude_desktop_config.json` (en macOS: `~/Library/Application Support/Claude/`) y reiniciá Claude Desktop:

```json
{
  "mcpServers": {
    "notas": {
      "command": "node",
      "args": ["/ruta/completa/a/04-servidor-notas/index.js"]
    }
  }
}
```

En Claude Desktop, los resources y los prompts aparecen en el botón **+** de la caja de texto.

## Prueba reproducible

```bash
npm test
```

`prueba.mjs` se conecta como cliente MCP y revisa:

1. **Contrato:** que el servidor declare las tres capacidades, que liste `notas://reunion-lunes`, que `crear_nota` pida `nombre` y `texto`, y que `resumir_nota` pida `nombre`.
2. **Respuestas esperadas:** leer la nota de ejemplo, crear una nota temporal y armar el prompt.
3. **Errores a propósito:** un nombre con `../`, una nota que ya existe y una nota que no existe.
4. **Traza completa** de los mensajes JSON-RPC.

La nota temporal se borra al final; tus notas no se tocan.

## Ideas para seguir

- Un resource `notas://indice` con la lista de todas las notas
- Un prompt `plan_semana` que junte varias notas
- Probar el mismo servidor con dos clientes distintos (Claude Code y Claude Desktop) y ver qué muestra cada uno

# Servidor de tareas (video 2)

Un servidor MCP de 29 líneas con dos herramientas:

- `agregar_tarea`: recibe un texto y lo guarda en `tareas.json`
- `listar_tareas`: devuelve la lista numerada

Las tareas quedan guardadas en el disco, así que Claude las recuerda aunque abras una conversación nueva.

📺 Video: https://youtu.be/Ir0pmikTY0Q

## Instalación

```bash
npm install
```

### Claude Code

```bash
claude mcp add tareas -- node "$(pwd)/index.js"
claude mcp list   # debería mostrar "tareas ... ✓ Connected"
```

### Claude Desktop

Agregá esto a `claude_desktop_config.json` (en macOS: `~/Library/Application Support/Claude/`), con la ruta completa a tu `index.js`, y reiniciá Claude Desktop:

```json
{
  "mcpServers": {
    "tareas": {
      "command": "node",
      "args": ["/ruta/completa/a/02-servidor-tareas/index.js"]
    }
  }
}
```

## Prueba reproducible

```bash
npm test
```

`prueba.mjs` levanta el servidor, se conecta como un cliente MCP y revisa cuatro cosas:

1. **Contrato:** que existan `agregar_tarea` y `listar_tareas`, y que `agregar_tarea` pida `texto` como string.
2. **Respuesta esperada:** lista vacía, agregar "comprar pan" y verla en la lista.
3. **Error a propósito:** mandar `texto: 42`. El SDK lo rechaza con el error `-32602` (validación de entrada) y la lista no cambia.
4. **Traza completa:** imprime cada mensaje JSON-RPC que va (`->`) y vuelve (`<-`), así ves exactamente qué se dicen cliente y servidor.

Tu `tareas.json` no se toca: la prueba lo guarda antes y lo restaura al final.

## Ideas para seguir

- Una herramienta `completar_tarea` que marque `hecha: true`
- Una herramienta `borrar_tarea`
- Fechas de vencimiento con `z.string().optional()`

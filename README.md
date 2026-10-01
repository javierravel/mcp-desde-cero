# MCP desde cero

Código de la serie **MCP desde cero** del canal de YouTube [Javi Automates](https://www.youtube.com/@javiautomates): servidores MCP (Model Context Protocol) pequeños y explicados línea por línea, en español.

| Video | Carpeta | Qué hace |
|---|---|---|
| 1. [MCP explicado en 5 minutos](https://youtu.be/FQCAvAwu1O8) | — | Qué es MCP, con un ejemplo real |
| 2. [Tu primer servidor MCP](https://youtu.be/Ir0pmikTY0Q) | [`02-servidor-tareas`](02-servidor-tareas) | Lista de tareas en 29 líneas, guardada en un archivo JSON |
| 3. [¿MCP o API?](https://youtu.be/hxq5HLcbQ2A) | [`03-servidor-clima`](03-servidor-clima) | Pronóstico del clima: un servidor MCP que envuelve la API de Open-Meteo |

## Requisitos

- [Node.js](https://nodejs.org) 18 o más nuevo
- [Claude Code](https://docs.claude.com/en/docs/claude-code) o Claude Desktop

## Uso rápido

```bash
git clone https://github.com/javierravel/mcp-desde-cero.git
cd mcp-desde-cero/02-servidor-tareas
npm install
claude mcp add tareas -- node "$(pwd)/index.js"
```

Después abrí Claude Code y pedile, por ejemplo: *"agregá tres tareas: comprar pan, llamar al banco y revisar el correo"*.

Cada carpeta tiene su propio README con los detalles y la configuración para Claude Desktop.

## Un consejo importante

En un servidor MCP que usa stdio, la salida estándar es el canal del protocolo. **No uses `console.log`** para depurar: usá `console.error`, que va a stderr y no se mezcla con los mensajes.

## Licencia

[MIT](LICENSE). Usalo, copialo y modificalo como quieras.

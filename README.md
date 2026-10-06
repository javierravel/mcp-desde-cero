# MCP desde cero

Código de la serie **MCP desde cero** del canal de YouTube [Javi Automates](https://www.youtube.com/@javiautomates): servidores MCP (Model Context Protocol) pequeños y explicados línea por línea, en español.

| Video | Carpeta | Qué hace |
|---|---|---|
| 1. [MCP explicado en 5 minutos](https://youtu.be/FQCAvAwu1O8) | — | Qué es MCP, con un ejemplo real |
| 2. [Tu primer servidor MCP](https://youtu.be/Ir0pmikTY0Q) | [`02-servidor-tareas`](02-servidor-tareas) | Lista de tareas en 29 líneas, guardada en un archivo JSON |
| 3. [¿MCP o API?](https://youtu.be/hxq5HLcbQ2A) | [`03-servidor-clima`](03-servidor-clima) | Pronóstico del clima: un servidor MCP que envuelve la API de Open-Meteo |
| 10. [Resources, tools y prompts](https://youtu.be/utAclQMc3uw) | [`04-servidor-notas`](04-servidor-notas) | Notas en Markdown con las tres piezas de MCP y permisos mínimos |

## Más videos del canal

- Playlist [MCP desde cero](https://www.youtube.com/@javiautomates/playlists): los videos de esta serie, en orden.
- Playlist **n8n + IA**: [instalar n8n en tu propio servidor](https://youtu.be/irb-SZOVJPM) y [conectar n8n con Claude usando MCP](https://youtu.be/ICQpoRzLUco).
- Playlist **Claude + tus apps**: [conectar Gmail a Claude, sin código](https://youtu.be/gnQmeTm7Mvg), [conectar Google Calendar a Claude, sin código](https://youtu.be/o9NsdIDLtK8) y [Claude analiza tus planillas de Google Drive](https://youtu.be/lAPyXn6Vqdc).

Algunos videos están programados y se publican en las próximas semanas: si un link todavía no abre, volvé en unos días o [suscribite al canal](https://www.youtube.com/@javiautomates?sub_confirmation=1).

## Recursos del canal

- 🎁 [Guía gratis en PDF: Tu primer servidor MCP en 15 minutos](https://javiautomates.gumroad.com/l/guia-mcp-gratis)
- 🧰 [MCP Starter Kit](https://javiautomates.gumroad.com/l/mcp-starter-kit) (US$19): una plantilla lista para producción con herramientas, recursos y prompts, manejo de errores, guardado seguro y 6 pruebas de punta a punta. El código de este repo es y va a seguir siendo gratis.

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

Cada carpeta tiene su propio README con los detalles y la configuración para Claude Desktop, y una prueba reproducible que corrés con `npm test`: revisa el contrato de la herramienta, la respuesta esperada y un error a propósito, y muestra la traza completa de mensajes.

## Un consejo importante

En un servidor MCP que usa stdio, la salida estándar es el canal del protocolo. **No uses `console.log`** para depurar: usá `console.error`, que va a stderr y no se mezcla con los mensajes.

## Licencia

[MIT](LICENSE). Usalo, copialo y modificalo como quieras.

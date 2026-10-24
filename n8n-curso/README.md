# Curso de n8n desde cero — flujos para importar

Los flujos del curso "n8n desde cero" del canal Javi Automates (YouTube: @javiautomates).

| Archivo | Capítulo |
|---|---|
| `1-el-clima-de-hoy.json` | 3 · Tu primer flujo: el clima |
| `2-el-clima-en-telegram.json` | 4 · Que te llegue al celular (Telegram) |
| `3-el-clima-en-una-tabla.json` | 5 · Guardarlo en una tabla |
| `4-expresiones-mensaje-en-un-solo-lugar.json` | 6 · Expresiones |
| `5-avisar-solo-si-llueve.json` | 8 · Un flujo que decide |
| `6-clima-para-claude-mcp.json` | 9 · n8n + Claude (MCP Server Trigger) |

## Cómo importarlos

1. Descarga el archivo `.json` (botón "Download raw file").
2. En n8n: **Create workflow** → menú `…` arriba a la derecha → **Import from File**.
3. Completa lo que falta:
   - **Telegram**: crea la credencial con la clave de tu bot (BotFather) y cambia `TU_CHAT_ID` por tu Chat ID (te lo da @userinfobot).
   - **Tabla**: crea una tabla de n8n "Clima diario" con las columnas `fecha`, `maxima`, `minima`, `lluvia` y elígela en el nodo.
   - **Ciudad**: en "Pedir el clima" cambia `latitude` y `longitude` por las de tu ciudad (vienen las de Buenos Aires).
4. Prueba cada nodo y, cuando funcione, **Publish**.

El clima viene de [Open-Meteo](https://open-meteo.com), gratis y sin registro.

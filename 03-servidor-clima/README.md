# Servidor de clima (video 3)

Un servidor MCP de 20 líneas con una herramienta, `pronostico`: recibe una ciudad, busca sus coordenadas y devuelve la temperatura máxima y la probabilidad de lluvia de los próximos 3 días.

Por dentro llama a la API gratuita de [Open-Meteo](https://open-meteo.com) (no necesita clave). Es el ejemplo del video: **MCP no reemplaza a la API, la envuelve**.

📺 Video: https://youtu.be/hxq5HLcbQ2A

## Instalación

```bash
npm install
claude mcp add clima -- node "$(pwd)/index.js"
```

Para Claude Desktop, la configuración es igual a la del [servidor de tareas](../02-servidor-tareas#claude-desktop), con `"clima"` como nombre y la ruta a este `index.js`.

## Probalo

- *"Viajo a Buenos Aires, ¿qué días conviene llevar paraguas?"*
- *"¿Dónde va a hacer más calor, en Madrid o en Ciudad de México?"*

La segunda pregunta no está programada en ningún lado: Claude decide solo llamar a la herramienta dos veces y comparar.

## Prueba reproducible

```bash
npm test
```

Necesita internet, porque consulta Open-Meteo de verdad. Revisa:

1. **Contrato:** que `pronostico` exista y pida `ciudad` como string.
2. **Respuesta esperada:** para Madrid, la primera línea es `Madrid, España` y siguen tres días con el formato `AAAA-MM-DD: máx N°C, lluvia N%`. Como los números cambian todos los días, se revisa la forma, no los valores.
3. **Error a propósito:** llamar sin `ciudad`. El SDK lo rechaza con `-32602`.
4. **Ciudad que no existe:** el servidor contesta `No encontré ...` como texto normal, sin marcar `isError`. Es una decisión de diseño: para el modelo no es una falla, es una respuesta. Si preferís que Claude lo trate como error, devolvé `isError: true`.
5. **Traza completa** de los mensajes JSON-RPC.

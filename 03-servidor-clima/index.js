import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "clima", version: "1.0.0" });

server.registerTool("pronostico", {
  description: "Pronóstico de los próximos 3 días para una ciudad: temperatura máxima y probabilidad de lluvia",
  inputSchema: { ciudad: z.string() },
}, async ({ ciudad }) => {
  const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es`).then(r => r.json());
  const lugar = geo.results?.[0];
  if (!lugar) return { content: [{ type: "text", text: `No encontré ${ciudad}` }] };
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lugar.latitude}&longitude=${lugar.longitude}&daily=temperature_2m_max,precipitation_probability_max&timezone=auto&forecast_days=3`;
  const d = (await fetch(url).then(r => r.json())).daily;
  const dias = d.time.map((f, i) => `${f}: máx ${d.temperature_2m_max[i]}°C, lluvia ${d.precipitation_probability_max[i]}%`);
  return { content: [{ type: "text", text: `${lugar.name}, ${lugar.country}\n${dias.join("\n")}` }] };
});

await server.connect(new StdioServerTransport());

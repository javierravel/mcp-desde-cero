import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";

const ARCHIVO = new URL("./tareas.json", import.meta.url);
const leer = () => fs.existsSync(ARCHIVO) ? JSON.parse(fs.readFileSync(ARCHIVO, "utf8")) : [];
const guardar = (t) => fs.writeFileSync(ARCHIVO, JSON.stringify(t, null, 2));

const server = new McpServer({ name: "tareas", version: "1.0.0" });

server.registerTool("agregar_tarea", {
  description: "Agrega una tarea a mi lista",
  inputSchema: { texto: z.string() },
}, async ({ texto }) => {
  const tareas = leer();
  tareas.push({ texto, hecha: false });
  guardar(tareas);
  return { content: [{ type: "text", text: `Agregada: ${texto}` }] };
});

server.registerTool("listar_tareas", {
  description: "Muestra todas mis tareas",
}, async () => {
  const lista = leer().map((t, i) => `${i + 1}. ${t.texto}`).join("\n");
  return { content: [{ type: "text", text: lista || "No hay tareas" }] };
});

await server.connect(new StdioServerTransport());

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Minimal permissions: this server only ever touches the "notas" folder next to it.
const CARPETA = fileURLToPath(new URL("./notas", import.meta.url));
fs.mkdirSync(CARPETA, { recursive: true });
const nombres = () => fs.readdirSync(CARPETA).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
const ruta = (nombre) => path.join(CARPETA, `${nombre}.md`);
const NOMBRE = z.string().regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones");

const server = new McpServer({ name: "notas", version: "1.0.0" });

// 1) RESOURCE: data the app can read. The user (or the app) decides when to attach it.
server.registerResource("nota", new ResourceTemplate("notas://{nombre}", {
  list: async () => ({ resources: nombres().map((n) => ({ uri: `notas://${n}`, name: n, mimeType: "text/markdown" })) }),
}), { description: "Una nota de mi carpeta de notas", mimeType: "text/markdown" },
async (uri, { nombre }) => {
  if (!nombres().includes(nombre)) throw new Error(`No existe la nota "${nombre}"`);
  return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: fs.readFileSync(ruta(nombre), "utf8") }] };
});

// 2) TOOL: an action the model decides to call. It writes, so the app asks for approval.
server.registerTool("crear_nota", {
  description: "Crea una nota nueva en mi carpeta de notas",
  inputSchema: { nombre: NOMBRE, texto: z.string().min(1) },
}, async ({ nombre, texto }) => {
  if (nombres().includes(nombre)) return { isError: true, content: [{ type: "text", text: `Ya existe "${nombre}"` }] };
  fs.writeFileSync(ruta(nombre), texto);
  return { content: [{ type: "text", text: `Nota creada: notas://${nombre}` }] };
});

// 3) PROMPT: a ready-made template the user picks from a menu.
server.registerPrompt("resumir_nota", {
  description: "Resume una nota en tres puntos",
  argsSchema: { nombre: NOMBRE },
}, async ({ nombre }) => {
  if (!nombres().includes(nombre)) throw new Error(`No existe la nota "${nombre}"`);
  return { messages: [
    { role: "user", content: { type: "resource", resource: { uri: `notas://${nombre}`, mimeType: "text/markdown", text: fs.readFileSync(ruta(nombre), "utf8") } } },
    { role: "user", content: { type: "text", text: "Resume esta nota en tres puntos cortos y dime qué tarea queda pendiente." } },
  ] };
});

await server.connect(new StdioServerTransport());

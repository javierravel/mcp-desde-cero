// Reproducible test for the "notas" MCP server.
// Run: npm test
// Checks 1) the contract (resources, tools and prompts), 2) the expected responses,
// 3) deliberate errors, and prints the full JSON-RPC trace.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const TEMP = fileURLToPath(new URL("./notas/prueba-temporal.md", import.meta.url));
let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -> " + detail : ""}`);
  if (!ok) failed++;
};
const rejects = async (fn) => {
  try { const r = await fn(); return r?.isError === true ? "isError: " + r.content?.[0]?.text : null; }
  catch (e) { return `JSON-RPC error ${e.code}: ${e.message.slice(0, 70)}`; }
};

const transport = new StdioClientTransport({ command: "node", args: [fileURLToPath(new URL("./index.js", import.meta.url))] });
const trace = [];
const origSend = transport.send.bind(transport);
transport.send = async (m) => { trace.push(["->", m]); return origSend(m); };
transport.onmessage = (m) => trace.push(["<-", m]);
const client = new Client({ name: "prueba", version: "1.0.0" });
await client.connect(transport);

try {
  // 1) Contract: one of each primitive
  const caps = client.getServerCapabilities();
  check("contract: server declares resources, tools and prompts", !!caps.resources && !!caps.tools && !!caps.prompts, Object.keys(caps).join(", "));
  const { resources } = await client.listResources();
  check("contract: resources list includes notas://reunion-lunes", resources.some((r) => r.uri === "notas://reunion-lunes"), resources.map((r) => r.uri).join(", "));
  const { tools } = await client.listTools();
  check("contract: tool crear_nota requires nombre and texto", tools[0]?.name === "crear_nota" && ["nombre", "texto"].every((k) => tools[0].inputSchema.required.includes(k)));
  const { prompts } = await client.listPrompts();
  check("contract: prompt resumir_nota takes 'nombre'", prompts[0]?.name === "resumir_nota" && prompts[0].arguments?.[0]?.name === "nombre");

  // 2) Expected responses
  const read = await client.readResource({ uri: "notas://reunion-lunes" });
  check("resource: reading the note returns its text", read.contents[0].text.startsWith("# Reunión del lunes"));
  const created = await client.callTool({ name: "crear_nota", arguments: { nombre: "prueba-temporal", texto: "hola" } });
  check("tool: crear_nota answers with the new URI", created.content[0].text === "Nota creada: notas://prueba-temporal");
  const prompt = await client.getPrompt({ name: "resumir_nota", arguments: { nombre: "reunion-lunes" } });
  check("prompt: returns the note as a resource plus an instruction", prompt.messages[0].content.type === "resource" && prompt.messages[1].content.text.startsWith("Resume"));

  // 3) Deliberate errors
  let how = await rejects(() => client.callTool({ name: "crear_nota", arguments: { nombre: "../fuera", texto: "x" } }));
  check("error: a name with '../' cannot escape the folder", !!how && !fs.existsSync(fileURLToPath(new URL("./fuera.md", import.meta.url))), how);
  how = await rejects(() => client.callTool({ name: "crear_nota", arguments: { nombre: "prueba-temporal", texto: "otra" } }));
  check("error: an existing note is not overwritten", !!how && fs.readFileSync(TEMP, "utf8") === "hola", how);
  how = await rejects(() => client.readResource({ uri: "notas://no-existe" }));
  check("error: reading a missing note fails", !!how, how);
} finally {
  await client.close();
  if (fs.existsSync(TEMP)) fs.unlinkSync(TEMP);
}

console.log("\n--- JSON-RPC trace ---");
for (const [dir, m] of trace) console.log(dir, JSON.stringify(m));
console.log(`\n${failed ? failed + " check(s) failed" : "All checks passed"}`);
process.exit(failed ? 1 : 0);

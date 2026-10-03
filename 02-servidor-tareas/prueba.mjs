// Reproducible test for the "tareas" MCP server.
// Run: npm test
// Checks 1) the contract (tools and input schemas), 2) the expected response,
// 3) a deliberate error, and prints the full JSON-RPC trace.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url"; // handles spaces and accents in the folder path
import fs from "node:fs";

const FILE = new URL("./tareas.json", import.meta.url);
const backup = fs.existsSync(FILE) ? fs.readFileSync(FILE) : null; // keep the user's real list safe
if (backup) fs.unlinkSync(FILE);

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -> " + detail : ""}`);
  if (!ok) failed++;
};

const transport = new StdioClientTransport({ command: "node", args: [fileURLToPath(new URL("./index.js", import.meta.url))] });
// Trace: log every JSON-RPC message in both directions.
const trace = [];
const origSend = transport.send.bind(transport);
transport.send = async (m) => { trace.push(["->", m]); return origSend(m); };
transport.onmessage = (m) => trace.push(["<-", m]); // the SDK keeps this handler and calls it first
const client = new Client({ name: "prueba", version: "1.0.0" });
await client.connect(transport);

try {
  // 1) Contract
  const { tools } = await client.listTools();
  const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
  check("contract: exposes agregar_tarea and listar_tareas", !!byName.agregar_tarea && !!byName.listar_tareas, tools.map((t) => t.name).join(", "));
  check("contract: agregar_tarea requires 'texto' (string)",
    byName.agregar_tarea?.inputSchema?.required?.includes("texto") && byName.agregar_tarea?.inputSchema?.properties?.texto?.type === "string");

  // 2) Expected response
  const empty = await client.callTool({ name: "listar_tareas", arguments: {} });
  check("empty list says 'No hay tareas'", empty.content?.[0]?.text === "No hay tareas", JSON.stringify(empty.content?.[0]?.text));
  const add = await client.callTool({ name: "agregar_tarea", arguments: { texto: "comprar pan" } });
  check("agregar_tarea answers 'Agregada: comprar pan'", add.content?.[0]?.text === "Agregada: comprar pan");
  const list = await client.callTool({ name: "listar_tareas", arguments: {} });
  check("listar_tareas shows '1. comprar pan'", list.content?.[0]?.text === "1. comprar pan", JSON.stringify(list.content?.[0]?.text));

  // 3) Deliberate error: wrong type for 'texto'
  let errorSeen = false, how = "";
  try {
    const bad = await client.callTool({ name: "agregar_tarea", arguments: { texto: 42 } });
    errorSeen = bad.isError === true; how = "isError result: " + bad.content?.[0]?.text?.slice(0, 80);
  } catch (e) { errorSeen = true; how = `JSON-RPC error ${e.code}: ${e.message.slice(0, 80)}`; }
  check("deliberate error: texto = 42 is rejected", errorSeen, how);
  const after = await client.callTool({ name: "listar_tareas", arguments: {} });
  check("the bad call did not change the list", after.content?.[0]?.text === "1. comprar pan");
} finally {
  await client.close();
  if (fs.existsSync(FILE)) fs.unlinkSync(FILE);
  if (backup) fs.writeFileSync(FILE, backup);
}

console.log("\n--- JSON-RPC trace ---");
for (const [dir, m] of trace) console.log(dir, JSON.stringify(m));
console.log(`\n${failed ? failed + " check(s) failed" : "All checks passed"}`);
process.exit(failed ? 1 : 0);

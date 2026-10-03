// Reproducible test for the "clima" MCP server (needs internet).
// Run: npm test
// Checks 1) the contract (tools and input schemas), 2) the expected response,
// 3) a deliberate error, and prints the full JSON-RPC trace.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url"; // handles spaces and accents in the folder path

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
  const tool = tools.find((t) => t.name === "pronostico");
  check("contract: exposes pronostico", !!tool, tools.map((t) => t.name).join(", "));
  check("contract: pronostico requires 'ciudad' (string)",
    tool?.inputSchema?.required?.includes("ciudad") && tool?.inputSchema?.properties?.ciudad?.type === "string");

  // 2) Expected response (live data from Open-Meteo, so we check the shape, not the numbers)
  const ok = await client.callTool({ name: "pronostico", arguments: { ciudad: "Madrid" } });
  const lines = (ok.content?.[0]?.text ?? "").split("\n");
  check("first line is 'Madrid, España'", lines[0] === "Madrid, España", JSON.stringify(lines[0]));
  const day = /^\d{4}-\d{2}-\d{2}: máx -?\d+(\.\d+)?°C, lluvia \d+%$/;
  check("3 day lines like 'YYYY-MM-DD: máx N°C, lluvia N%'", lines.length === 4 && lines.slice(1).every((l) => day.test(l)), JSON.stringify(lines.slice(1)));

  // 3a) Deliberate error: missing 'ciudad'
  let errorSeen = false, how = "";
  try {
    const bad = await client.callTool({ name: "pronostico", arguments: {} });
    errorSeen = bad.isError === true; how = "isError result: " + bad.content?.[0]?.text?.slice(0, 80);
  } catch (e) { errorSeen = true; how = `JSON-RPC error ${e.code}: ${e.message.slice(0, 80)}`; }
  check("deliberate error: missing 'ciudad' is rejected", errorSeen, how);

  // 3b) A city that does not exist: the server answers with text, not with isError.
  // That is a design choice worth knowing: the model sees a normal answer, not a failure.
  const none = await client.callTool({ name: "pronostico", arguments: { ciudad: "Xqzvbnmlk" } });
  check("unknown city answers 'No encontré Xqzvbnmlk' (isError not set)",
    none.content?.[0]?.text === "No encontré Xqzvbnmlk" && !none.isError, JSON.stringify(none.content?.[0]?.text));
} finally {
  await client.close();
}

console.log("\n--- JSON-RPC trace ---");
for (const [dir, m] of trace) console.log(dir, JSON.stringify(m));
console.log(`\n${failed ? failed + " check(s) failed" : "All checks passed"}`);
process.exit(failed ? 1 : 0);

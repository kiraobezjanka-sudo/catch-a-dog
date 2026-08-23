import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const client = join(dist, "client");
await rm(dist, { recursive: true, force: true });
await mkdir(client, { recursive: true });
for (const file of ["index.html", "styles.css", "game.js", "game-core.js"]) await cp(join(root, file), join(client, file));
await cp(join(root, "public"), client, { recursive: true });
const hosting = JSON.parse(await readFile(join(root, ".openai", "hosting.json"), "utf8"));
await mkdir(join(dist, ".openai"), { recursive: true });
await writeFile(join(dist, ".openai", "hosting.json"), `${JSON.stringify(hosting, null, 2)}\n`);
const workerPath = join(dist, "server", "index.js");
await mkdir(dirname(workerPath), { recursive: true });
await writeFile(workerPath, "export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };\n");
console.log("Build complete: dist/client and dist/server/index.js");


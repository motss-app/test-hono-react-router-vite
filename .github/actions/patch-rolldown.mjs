// Pre-build patch for Linux NAPI issue with rolldown
import { join } from "node:path";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

function patchRolldown() {
  const denoDir = join(new URL(".", import.meta.url).pathname, "node_modules/.deno");

  let sharedDir = null;
  const entries = readdirSync(denoDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith("rolldown@")) {
      sharedDir = join(denoDir, entry.name, "node_modules/rolldown/dist/shared");
      break;
    }
  }

  if (!sharedDir) {
    console.log("rolldown shared directory not found, skipping patch");
    return;
  }

  const files = readdirSync(sharedDir);
  const tsconfigFile = files.find(f => f.startsWith("resolve-tsconfig-") && f.endsWith(".mjs"));

  if (!tsconfigFile) {
    console.log("resolve-tsconfig file not found, skipping patch");
    return;
  }

  const filePath = join(sharedDir, tsconfigFile);
  let content = readFileSync(filePath, "utf-8");

  const original = `const result = (0, import_binding.enhancedTransformSync)(filename, sourceText, options, cache, yarnPnp$1);`;
  const patched = `const result = (0, import_binding.enhancedTransformSync)(filename, sourceText, options, null, yarnPnp$1);`;

  if (content.includes(original)) {
    content = content.replace(original, patched);
    writeFileSync(filePath, content, "utf-8");
    console.log("✓ Patched rolldown for Linux NAPI issue");
  } else {
    console.log("Patch already applied or pattern not found");
  }
}

patchRolldown();

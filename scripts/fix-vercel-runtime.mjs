/**
 * Parcha nodejs18.x → nodejs20.x en los configs del output de Vercel.
 * Necesario porque @astrojs/vercel v7 escribe nodejs18.x hardcodeado.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const FUNCTIONS_DIR = '.vercel/output/functions';
const OLD_RUNTIME = 'nodejs18.x';
const NEW_RUNTIME = 'nodejs20.x';

let patched = 0;

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return; // directorio no existe aún
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (entry.endsWith('.json')) {
      const content = readFileSync(fullPath, 'utf-8');
      if (content.includes(OLD_RUNTIME)) {
        const fixed = content.replaceAll(OLD_RUNTIME, NEW_RUNTIME);
        writeFileSync(fullPath, fixed, 'utf-8');
        console.log(`  ✓ Parchado: ${fullPath}`);
        patched++;
      }
    }
  }
}

console.log(`\n🔧 fix-vercel-runtime: ${OLD_RUNTIME} → ${NEW_RUNTIME}`);
walk(FUNCTIONS_DIR);
console.log(`   ${patched} archivo(s) actualizado(s).\n`);

// Launch-checklist guard: fails if placeholder text sneaks into the site.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'content'];
const PATTERNS = [/lorem/i, /000-0000/, /\(000\)/, /\[CHESS:/, /TODO:? *fill/i];
let bad = 0;
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|mdx?|css)$/.test(f)) {
      const text = readFileSync(p, 'utf8');
      for (const re of PATTERNS) {
        if (re.test(text)) {
          console.log(`${p}: matches ${re}`);
          bad++;
        }
      }
    }
  }
}
ROOTS.forEach(walk);
if (bad) {
  console.error(`\n${bad} placeholder hit(s). Remove before launch.`);
  process.exit(1);
}
console.log('Content check passed: no lorem, no 000-0000.');

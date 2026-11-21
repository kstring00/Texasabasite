/* eslint-disable */
// npm run test:e2e            every setup: flags off, as if on Vercel, then the full local demo
// npm run test:e2e -- on      one setup only (off | vercel | on)
// Each setup rebuilds the site, so the whole run takes several minutes. The last build left in
// .next is the "on" build.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const asked = process.argv.slice(2).filter((a) => ['off', 'vercel', 'on'].includes(a));
const modes = asked.length ? asked : ['off', 'vercel', 'on'];
const label = { off: 'Flags off', vercel: 'As if on Vercel, every flag on', on: 'Local demo, every flag on' };
const results = [];
for (const mode of modes) {
  console.log(`\n=== ${label[mode]} ===`);
  const r = spawnSync('npx', ['playwright', 'test', '-c', path.join(here, 'playwright.config.ts')], { stdio: 'inherit', env: { ...process.env, LC_E2E_MODE: mode } });
  results.push([mode, r.status === 0]);
}
console.log('\n=== Summary ===');
for (const [mode, passed] of results) console.log(`${passed ? 'PASS' : 'FAIL'}  ${label[mode]}`);
process.exit(results.every(([, passed]) => passed) ? 0 : 1);

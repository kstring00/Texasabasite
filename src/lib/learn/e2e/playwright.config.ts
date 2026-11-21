import path from 'node:path';
import { defineConfig } from '@playwright/test';

/**
 * Browser tests for the Learning Center. Kept inside the Learning Center's own folder.
 *
 * The site behaves differently in three setups, and each needs its own build, because the main
 * switch is read when the site is built. `run.mjs` runs them one after another:
 *
 *   off     no flags: the Learning Center must not exist at all
 *   vercel  every flag on, but running as if on Vercel: the staff area must stay closed
 *   on      every flag on, on a local machine: the full caregiver and staff demo
 *
 * Tests keep their demo data in `.learn-demo/e2e/`, apart from any demo set up by hand.
 */
const mode = process.env.LC_E2E_MODE === 'off' || process.env.LC_E2E_MODE === 'vercel' ? process.env.LC_E2E_MODE : 'on';
const port = Number(process.env.LC_E2E_PORT ?? 3100);
const root = path.resolve(__dirname, '../../../..');
const flag = mode === 'off' ? '' : '1';

export default defineConfig({
  testDir: __dirname,
  testMatch: new RegExp(`[\\\\/]${mode}-[^\\\\/]+\\.spec\\.(mjs|ts)$`),
  // The staff tests share one demo store and reset it, so they run one at a time, in file-name order.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 15 * 60 * 1000,
  reporter: [['list']],
  outputDir: path.join(root, '.learn-demo', 'test-results'),
  use: { baseURL: `http://localhost:${port}`, trace: 'off', screenshot: 'only-on-failure' },
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    cwd: root,
    url: `http://localhost:${port}/`,
    // LC_E2E_REUSE=1 uses a site you already started on this port yourself, to save the rebuild while writing a test.
    reuseExistingServer: process.env.LC_E2E_REUSE === '1',
    timeout: 6 * 60 * 1000,
    stdout: 'ignore',
    // Set here, these win over anything in .env.local.
    env: { NEXT_PUBLIC_LEARN_ENABLED: flag, LEARN_DEMO_CONTENT: flag, LEARN_DEMO_STAFF: flag, LEARN_DEMO_STORE: 'e2e', VERCEL: mode === 'vercel' ? '1' : '' },
  },
});

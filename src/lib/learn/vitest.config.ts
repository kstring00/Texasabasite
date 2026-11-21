import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Kept inside the Learning Center's own folder, so the unit tests add nothing to the site's root.
const root = path.resolve(__dirname, '../../..');

export default defineConfig({
  root,
  resolve: { alias: { '@': path.resolve(root, 'src') } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});

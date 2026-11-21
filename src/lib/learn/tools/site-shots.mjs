/* eslint-disable */
// Before-and-after pictures of the existing site, to prove the Learning Center changes nothing
// when it is switched off.
//
//   node src/lib/learn/tools/site-shots.mjs shoot <folder> [address]     take the pictures
//   node src/lib/learn/tools/site-shots.mjs compare <before> <after>     compare two folders
//
// How to use it: build and start `main` with no Learning Center settings, shoot into one folder.
// Build and start the Learning Center branch, also with no settings, shoot into another. Compare.
// The address defaults to http://localhost:3000.
//
// Each page is taken full length at 1440 and 390 wide with reduced motion. It is scrolled through
// first so lazy pictures have loaded, and videos are held on their first frame, so two runs of the
// same site give the same picture, with one known exception: /families/care-plan can come out with
// its list of choices one pixel higher or lower, even between two runs of the very same build. If it
// is the only page that differs, compare a build with itself as a control, or picture that page
// again by itself: LC_SHOTS_ONLY=/families/care-plan node ... shoot <folder>.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PAGES = `/ /blog /blog/insurance-in-plain-words /blog/what-the-first-day-looks-like /blog/while-you-wait-for-the-evaluation /contact /es /events
/families /families/at-home /families/calm /families/care-plan /families/caregiver /families/check-in /families/connect /families/crisis /families/find
/families/hard-days /families/help /families/resources /families/what-is-aba /getting-started /insurance /locations /locations/austin /locations/cedar-hill
/locations/katy /locations/pearland /locations/plano /locations/sugar-land /locations/sugar-land/inside /privacy /providers /request-a-tour /services
/services/autism-diagnosis /services/child-aba /services/early-intervention /services/in-home-aba /services/in-school-aba /services/teen-aba /team
/this-page-does-not-exist`.split(/\s+/).filter(Boolean);
const fileFor = (page, width) => `${page === '/' ? 'home' : page.slice(1).replace(/\//g, '__')}-${width}.png`;

const [mode, a, b] = process.argv.slice(2);

if (mode === 'shoot' && a) {
  const base = b ?? 'http://localhost:3000';
  const only = process.env.LC_SHOTS_ONLY ? process.env.LC_SHOTS_ONLY.split(',') : PAGES;
  fs.mkdirSync(a, { recursive: true });
  const browser = await chromium.launch();
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    // One browser session per width, so pictures and videos are already downloaded when a page is pictured.
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const address of only) {
      await page.goto(base + address, { waitUntil: 'load' }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(address === '/' ? 3000 : 900);
      await page.evaluate(async () => {
        const step = Math.round(innerHeight * 0.8);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
        scrollTo(0, document.documentElement.scrollHeight);
        await new Promise((r) => setTimeout(r, 250));
        scrollTo(0, 0);
        await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }))));
        await Promise.all([...document.querySelectorAll('video')].map((v) => new Promise((r) => {
          v.pause();
          const done = () => { try { v.currentTime = 0; } catch {} r(); };
          if (v.readyState >= 2) done(); else { v.addEventListener('loadeddata', done, { once: true }); try { v.load(); } catch {} setTimeout(done, 4000); }
        })));
      });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(a, fileFor(address, width)), fullPage: true });
    }
    await context.close();
  }
  await browser.close();
  console.log(`${only.length * 2} pictures saved in ${a}`);
} else if (mode === 'compare' && a && b) {
  const hash = (f) => createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  let same = 0;
  const different = [];
  for (const name of fs.readdirSync(a).filter((n) => n.endsWith('.png')).sort()) {
    if (!fs.existsSync(path.join(b, name))) { different.push(`${name}: missing from ${b}`); continue; }
    if (hash(path.join(a, name)) === hash(path.join(b, name))) { same++; continue; }
    // Different files can still hold the same picture. If ImageMagick is installed, count the pixels that differ.
    let pixels = 'not counted (ImageMagick "compare" is not installed)';
    try { execFileSync('compare', ['-metric', 'AE', path.join(a, name), path.join(b, name), 'null:'], { stdio: ['ignore', 'pipe', 'pipe'] }); pixels = '0'; }
    catch (e) { const out = String(e.stderr ?? '').trim(); if (/^[\d.e+]+/.test(out)) pixels = out.split(/\s/)[0]; }
    if (pixels === '0') same++; else different.push(`${name}: ${pixels} pixels differ`);
  }
  console.log(`identical: ${same}`);
  console.log(`different: ${different.length}`);
  for (const d of different) console.log(`  ${d}`);
  process.exit(different.length ? 1 : 0);
} else {
  console.log('Usage:\n  node src/lib/learn/tools/site-shots.mjs shoot <folder> [address]\n  node src/lib/learn/tools/site-shots.mjs compare <before> <after>');
  process.exit(2);
}

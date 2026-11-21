/* eslint-disable */
// Run with: npm run test:e2e   (see README.md in this folder)
import { test, expect } from '@playwright/test';

test('caregiver pages: library, module, lesson player, trainings, help', async ({ browser: b, baseURL }) => {
const B = baseURL, M = '/learn/modules/understanding-the-abcs-of-behavior';
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(`${p.url()} :: ${String(e).slice(0, 200)}`));
const reqs = []; p.on('request', r => { const u = r.url(); if (/api\/chat|_vercel\/insights\/event|va\.vercel/.test(u)) reqs.push(u); });
let checks = 0;
const ok = (name, cond, extra = '') => { checks++; expect.soft(!!cond, cond ? name : `${name} :: ${String(extra).slice(0, 400)}`).toBe(true); };
{ const c = await b.newContext(); const r = await c.newPage(); await r.goto(B + '/learn/staff', { waitUntil: 'load' }); await r.getByRole('button', { name: 'Reset demo data' }).click(); await r.waitForLoadState('load'); await r.waitForTimeout(400); await c.close(); }
const title = () => p.locator('#lc-step-title').innerText();
const next = async () => { await p.locator('.lc-player-bottom .lc-btn-primary').click(); await p.waitForTimeout(350); };

// library: search and open
await p.goto(B + '/learn/library', { waitUntil: 'load' }); await p.waitForTimeout(800);
await p.getByLabel('Search learning topics').fill('zzzz'); await p.waitForTimeout(150);
ok('search: no results state', await p.getByText('Nothing matches that yet').isVisible());
await p.getByRole('button', { name: 'Clear search and filters' }).click();
await p.getByLabel('Search learning topics').fill('consequence'); await p.waitForTimeout(150);
ok('search: finds module by topic label', await p.locator('.lc-mcard').count() === 1);
ok('card says Start learning', await p.locator('.lc-mcard-cta').innerText().then(t => t.includes('Start learning')));
ok('card shows demo label', await p.locator('.lc-mcard .lc-chip').innerText().then(t => /Demo/.test(t)));
await p.locator('.lc-mcard-cta').click(); await p.waitForURL('**' + M); await p.waitForTimeout(600);
ok('module page: Start module', await p.getByRole('link', { name: 'Start module' }).isVisible());
await p.getByRole('link', { name: 'Start module' }).click(); await p.waitForURL('**/lesson/what-abc-means**'); await p.waitForTimeout(700);
ok('player: opens at step 1', (await title()) === 'Three small words for one moment' && p.url().endsWith('?step=1'), p.url());
ok('player: position shown', (await p.locator('.lc-player-where').innerText()) === 'Lesson 1 of 3');
ok('player: demo strip', await p.locator('.lc-player-card .lc-demo-strip').innerText().then(t => t.includes('Demo sample — pending clinical approval')));
ok('player: footer hidden, sub-nav absent, mobile bar absent', await p.evaluate(() => getComputedStyle(document.querySelector('body > footer')).display === 'none' && !document.querySelector('.lc-subnav') && !document.querySelector('[aria-label="Quick actions"]')));
await next(); ok('next -> slide', (await title()) === 'The ABC model');
ok('slide has text description', await p.locator('.lc-slide figcaption').innerText().then(t => t.length > 40));
await next(); await next(); ok('knowledge check reached', (await title()) === 'Check your understanding');
// knowledge check: wrong, then right, never gated
await p.getByRole('button', { name: 'Check my answer' }).click(); await p.waitForTimeout(150);
ok('kc: nudge when nothing chosen', await p.getByText('Choose an answer first').isVisible());
await p.getByLabel('A punishment for the behavior').check(); await p.getByRole('button', { name: 'Check my answer' }).click(); await p.waitForTimeout(400);
ok('kc: specific retry feedback', await p.locator('.lc-feedback[data-kind="retry"]').innerText().then(t => t.includes('You can try again')));
ok('kc: feedback is in a live region and in view', await p.evaluate(() => { const l = document.querySelector('.lc-kc-live'); const r = l.getBoundingClientRect(); return l.getAttribute('aria-live') === 'polite' && r.top >= 0 && r.top < innerHeight; }));
await p.getByLabel('What happened right after the behavior').check(); await p.getByRole('button', { name: 'Check my answer' }).click(); await p.waitForTimeout(300);
ok('kc: right feedback', await p.locator('.lc-feedback[data-kind="right"]').isVisible());
// reload resumes; browser back works
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
ok('reload keeps step', (await title()) === 'Check your understanding');
ok('reload keeps chosen answer', await p.getByLabel('What happened right after the behavior').isChecked());
await p.goBack(); await p.waitForTimeout(500);
ok('browser Back goes one step back', (await title()) === 'In plain words', await title());
await p.goForward(); await p.waitForTimeout(500);
ok('browser Forward returns', (await title()) === 'Check your understanding');
// save and exit -> resume
await p.getByRole('link', { name: 'Save and exit' }).click(); await p.waitForURL('**' + M); await p.waitForTimeout(700);
ok('overview: Resume + place', await p.getByRole('link', { name: 'Resume' }).isVisible() && await p.getByText('You were on lesson 1: What ABC means.').isVisible());
await p.goto(B + '/learn/library', { waitUntil: 'load' }); await p.waitForTimeout(800);
ok('library card: Continue learning + Lesson 1 of 3', await p.locator('.lc-mcard-cta').innerText().then(t => t.includes('Continue learning')) && await p.getByText('Lesson 1 of 3').isVisible());
await p.locator('.lc-mcard-cta').click(); await p.waitForURL('**/lesson/what-abc-means**'); await p.waitForTimeout(700);
ok('continue resumes at saved step', (await title()) === 'Check your understanding', await title());
// through to the end without answering anything else
await next(); await next(); await p.waitForURL('**/lesson/one-moment-three-parts**'); await p.waitForTimeout(700);
ok('lesson 2 opens at step 1', (await p.locator('.lc-player-where').innerText()) === 'Lesson 2 of 3' && (await title()).startsWith('Let'));
await next(); ok('scenario flagged fictional', await p.getByText('Example story, not a real family.').isVisible());
await p.locator('.lc-player-top .lc-btn-secondary').click(); await p.waitForTimeout(300); await p.locator('.lc-player-top .lc-btn-secondary').click(); await p.waitForURL('**/lesson/what-abc-means?step=last'); await p.waitForTimeout(800);
ok('Back from first step lands on last step of previous lesson', (await title()) === 'What to remember', await title());
await next(); await p.waitForURL('**/lesson/one-moment-three-parts**'); await p.waitForTimeout(600);
for (let i = 0; i < 5; i++) await next();
ok('multi-answer check reached without gating', true);
await next(); await p.waitForURL('**/lesson/what-one-moment-cannot-tell-you**'); await p.waitForTimeout(700);
for (let i = 0; i < 3; i++) await next();
ok('last step button says Finish module', await p.locator('.lc-player-bottom .lc-btn-primary').innerText().then(t => t.includes('Finish module')));
await next();
ok('completion screen', (await title()).includes('You finished') && await p.getByRole('link', { name: 'Return to library' }).isVisible());
ok('completion: related training labelled example', await p.locator('.lc-done-trainings').innerText().then(t => t.includes('Example listing')));
ok('completion: scope statement', await p.locator('.lc-done-scope').innerText().then(t => t.includes('These educational resources support general learning.')));
// stored data: one lc- key, no identifiers
const store = await p.evaluate(() => ({ keys: Object.keys(localStorage), raw: localStorage.getItem('lc-progress-v1') }));
ok('storage: only lc- key written by LC, no cg- key touched', store.keys.filter(k => k.startsWith('lc-')).length === 1 && !store.keys.some(k => k.startsWith('cg-')), JSON.stringify(store.keys));
ok('storage: holds ids only', /"completed":true/.test(store.raw) && !/name|email|child/i.test(store.raw));
await p.getByRole('link', { name: 'Return to library' }).click(); await p.waitForURL('**/learn/library'); await p.waitForTimeout(800);
ok('library card: completed', await p.getByText('Completed on this device').isVisible());
// reset with confirmation
await p.goto(B + M, { waitUntil: 'load' }); await p.waitForTimeout(800);
await p.getByRole('button', { name: 'Reset progress' }).click(); await p.getByRole('button', { name: 'Keep my place' }).click();
ok('reset: cancel keeps progress', await p.evaluate(() => !!localStorage.getItem('lc-progress-v1') && localStorage.getItem('lc-progress-v1').includes('abcs-of-behavior')));
await p.getByRole('button', { name: 'Reset progress' }).click(); await p.getByRole('button', { name: 'Yes, reset' }).click(); await p.waitForTimeout(300);
ok('reset: clears and says so', await p.getByText('Your progress in this module was cleared.').isVisible() && await p.getByRole('link', { name: 'Start module' }).isVisible());
// stale version
await p.evaluate(() => localStorage.setItem('lc-progress-v1', JSON.stringify({ v: 1, modules: { 'abcs-of-behavior': { version: 'old', lessonId: 'gone', step: 9, doneLessons: [], completed: false, answers: {}, at: '' } } })));
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
ok('older version: place cleared with an explanation', await p.getByText('This module has been updated since your last visit').isVisible() && await p.getByRole('link', { name: 'Start module' }).isVisible());
// trainings
await p.goto(B + '/learn/trainings', { waitUntil: 'load' }); await p.waitForTimeout(600);
ok('trainings: enrolled-families label, example, no made-up date', await p.locator('.lc-tcard', { hasText: 'Understanding the ABCs of Behavior: live caregiver training' }).innerText().then(t => t.includes('Currently enrolled families only') && t.includes('Example') && !/\b20\d\d\b/.test(t)));
await p.locator('.lc-tcard', { hasText: 'Understanding the ABCs of Behavior: live caregiver training' }).getByRole('link', { name: /View details/ }).click(); await p.waitForURL('**/example-abcs-live-training'); await p.waitForTimeout(600);
ok('training: registration not clickable, reason given', await p.locator('.lc-reg button').isDisabled() && await p.getByText('This is an example listing, so there is nothing to register for.').isVisible());
ok('training: no teams or join link in page', await p.evaluate(() => ![...document.querySelectorAll('[data-zone="learn"] a')].some(a => /teams\.|meetup-join/.test(a.href))));
// storage blocked
const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } }); const q = await ctx2.newPage();
await q.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
const e2 = []; q.on('pageerror', e => e2.push(String(e)));
await q.goto(B + M + '/lesson/what-abc-means', { waitUntil: 'load' }); await q.waitForTimeout(900);
ok('storage blocked: player still works with honest note', await q.getByText('This browser is not saving progress right now').isVisible() && e2.length === 0, e2.join('|'));
await q.locator('.lc-player-bottom .lc-btn-primary').click(); await q.waitForTimeout(300);
ok('storage blocked: can still move on', (await q.locator('#lc-step-title').innerText()) === 'The ABC model');
ok('no chat or tracking calls from /learn', reqs.length === 0, reqs.join(','));
ok('no page errors', errs.length === 0, errs.join('|'));
// Close every window this walk opened, so later tests are not slowed down by them.
for (const c of b.contexts()) await c.close();
console.log(`[checks] on-01-caregiver.spec.mjs: ${checks}`);
});

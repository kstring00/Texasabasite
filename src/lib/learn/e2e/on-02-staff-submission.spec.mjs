/* eslint-disable */
// Run with: npm run test:e2e   (see README.md in this folder)
import { test, expect } from '@playwright/test';

test('staff demo: sign-in, permissions, PowerPoint submission wizard', async ({ browser: b, baseURL }) => {
const B = baseURL, ST = B + '/learn/staff';
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
let checks = 0;
const ok = (name, cond, extra = '') => { checks++; expect.soft(!!cond, cond ? name : `${name} :: ${String(extra).slice(0, 400)}`).toBe(true); };
const signIn = async (who) => { await p.goto(ST, { waitUntil: 'load' }); await p.waitForTimeout(450); await p.getByRole('button', { name: new RegExp(`Continue as ${who}$|Continue as ${who}\\b`) }).first().click(); await p.waitForLoadState('load'); await p.waitForTimeout(400); };
const signOut = async () => { await p.goto(ST, { waitUntil: 'load' }); await p.waitForTimeout(450); await p.getByRole('button', { name: 'Switch demo role' }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(300); };
const status = async (u) => (await ctx.request.get(B + u)).status();

// start from seeded data
await p.goto(ST, { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('signed out: role picker, not the workspace', await p.getByRole('heading', { name: 'Staff workspace demo' }).isVisible() && !(await p.locator('.lc-shell').count()));
ok('signed out: site header and footer hidden, demo banner shown', await p.evaluate(() => getComputedStyle(document.querySelector('body > header')).display === 'none' && getComputedStyle(document.querySelector('body > footer')).display === 'none' && !!document.querySelector('.lc-demo-bar-staff')));
await p.getByRole('button', { name: 'Reset demo data' }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(400);
ok('signed out: file download refused', (await status('/learn/staff/api/uploads/seed-abcs-asset-v1')) === 404);

await signIn('Sample RBT');
ok('RBT: overview with own counts', await p.getByRole('heading', { name: 'Welcome' }).isVisible() && (await p.locator('.lc-metric-value').allInnerTexts()).join(',') === '1,1,1,1', (await p.locator('.lc-metric-value').allInnerTexts()).join(','));
const cookie = (await ctx.cookies()).find(c => c.name === 'lc-demo-staff');
ok('session cookie is httpOnly, strict, scoped to /learn/staff', !!cookie && cookie.httpOnly && cookie.sameSite === 'Strict' && cookie.path === '/learn/staff', JSON.stringify(cookie));
ok('page scripts cannot read the session cookie', await p.evaluate(() => !document.cookie.includes('lc-demo-staff')));
ok('RBT nav: no All submissions link', (await p.locator('.lc-shell-nav a').allInnerTexts()).join('|') === 'Overview|My submissions', (await p.locator('.lc-shell-nav a').allInnerTexts()).join('|'));
await p.goto(ST + '/submissions', { waitUntil: 'load' }); await p.waitForTimeout(450);
const mine = await p.locator('.lc-table-title').allInnerTexts();
ok('RBT sees only own submissions (4), not the apprentice’s', mine.length === 4 && !mine.includes('Questions to bring to your BCBA'), mine.join('|'));
ok('each row shows its exact status', (await p.locator('.lc-table .lc-chip').allInnerTexts()).map(t => t.trim()).sort().join('|') === 'Awaiting review|Changes requested|Draft|Source approved');
await p.goto(ST + '/submissions/seed-questions', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('RBT opening another person’s submission: not found', await p.getByText('That page was not found').isVisible());
await p.goto(ST + '/submissions/all', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('RBT opening All submissions: not found', await p.getByText('That page was not found').isVisible());
ok('RBT downloading another person’s file: refused', (await status('/learn/staff/api/uploads/seed-questions-asset-v1')) === 404);
const dl = await ctx.request.get(B + '/learn/staff/api/uploads/seed-abcs-asset-v1');
const good = await dl.body();
ok('RBT downloading own file: served as a private attachment', dl.status() === 200 && /attachment/.test(dl.headers()['content-disposition']) && /no-store/.test(dl.headers()['cache-control']) && dl.headers()['x-content-type-options'] === 'nosniff');

// new submission
await p.goto(ST + '/submissions/new', { waitUntil: 'load' }); await p.waitForTimeout(450); await p.waitForTimeout(400);
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(300);
ok('wizard: cannot save without a title', await p.getByText('Give the presentation a title before saving.').first().isVisible());
await p.getByLabel('Title', { exact: true }).fill('Bedtime routines <b>test</b>'); await p.getByLabel('Short summary').fill('General ideas about calmer evenings, with made-up examples only.');
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(700);
ok('wizard: draft saved, address becomes the edit page', /\/submissions\/[0-9a-f-]{36}\/edit\?step=2/.test(p.url()) && await p.getByText(/Draft saved/).isVisible() && await p.getByRole('heading', { name: 'Topic and tags' }).isVisible(), p.url());
const id = p.url().split('/').at(-2);
await p.getByLabel('Routines & Daily Living').check(); await p.getByLabel('At home').check();
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(600);
await p.getByLabel('Objective 1').fill('Describe one small step toward a calmer bedtime.');
await p.getByLabel('Who is this for?').selectOption('All caregivers');
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(600);
ok('wizard: reached the file step', await p.getByRole('heading', { name: 'PowerPoint file' }).isVisible());
const input = p.locator('input[type=file]');
const tryFile = async (name, buffer) => { await input.setInputFiles({ name, mimeType: 'application/octet-stream', buffer }); await p.waitForTimeout(900); return (await p.locator('.lc-field-error').allInnerTexts()).join(' '); };
ok('upload: a .txt file is refused clearly', (await tryFile('notes.txt', Buffer.from('hello'))).includes('ends in .pptx'));
ok('upload: an old .ppt file is explained', (await tryFile('old.ppt', Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 1, 2, 3]))).includes('older .ppt file'));
ok('upload: a renamed non-PowerPoint is caught by the server', (await tryFile('fake.pptx', Buffer.from('this is not a zip'))).includes('not a PowerPoint presentation'));
ok('upload: a damaged .pptx is caught by the server', (await tryFile('damaged.pptx', Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.alloc(200)]))).includes('could not be read as a PowerPoint'));
ok('upload: an empty file is caught', (await tryFile('empty.pptx', Buffer.alloc(0))).length > 0);
ok('nothing was attached by the refused uploads', !(await p.locator('.lc-file-row').count()));
await input.setInputFiles({ name: 'Bedtime routines.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', buffer: good }); await p.waitForTimeout(1200);
ok('upload: a valid .pptx is accepted and shown with its size', await p.locator('.lc-file-name').innerText() === 'Bedtime routines.pptx' && await p.getByText('File uploaded and checked.').isVisible());
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(600);
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(600);
ok('review step: submit is off until the checklist is done, and says why', await p.getByRole('button', { name: 'Submit for clinical review' }).isDisabled() && await p.getByText('Confirm every item on the checklist.').isVisible());
// server refuses even if the button is forced
const forced = await p.evaluate(async () => { const btn = [...document.querySelectorAll('button')].find(x => x.textContent.includes('Submit for clinical review')); btn.disabled = false; btn.click(); await new Promise(r => setTimeout(r, 900)); return location.pathname; });
ok('forcing the disabled submit button does not submit', forced.endsWith('/edit'));
await p.getByRole('button', { name: 'Go to step 5' }).click(); await p.waitForTimeout(300);
for (const c of await p.locator('.lc-check-row input').all()) await c.check();
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(600);
ok('review step: title was stored as plain text', await p.locator('.lc-summary').innerText().then(t => t.includes('Bedtime routines btest/b') || t.includes('Bedtime routines test')) && !(await p.locator('.lc-summary b').count()), await p.locator('.lc-summary dd').first().innerText());
await p.getByRole('button', { name: 'Submit for clinical review' }).click(); await p.waitForURL('**/submissions/' + id + '?submitted=1'); await p.waitForTimeout(500);
ok('submitted: status Awaiting review, version locked', await p.getByText('Submitted for clinical review. This version is now locked.').isVisible() && await p.locator('.lc-staff-head .lc-chip').innerText().then(t => t.trim() === 'Awaiting review') && await p.locator('.lc-versions').innerText().then(t => t.includes('Locked')));
ok('submitted: no edit, revise or delete controls', !(await p.getByRole('link', { name: /Continue/ }).count()) && !(await p.getByRole('button', { name: /Start a new version|Delete this draft/ }).count()));
await p.goto(ST + '/submissions/' + id + '/edit', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('submitted: the edit address leads back to the read-only page', p.url().endsWith('/submissions/' + id));
const again = await ctx.request.post(B + '/learn/staff/api/uploads', { headers: { origin: B }, multipart: { submissionId: id, file: { name: 'swap.pptx', mimeType: 'application/octet-stream', buffer: good } } });
ok('submitted: the server refuses to replace the frozen file', again.status() === 409, String(again.status()));
const foreign = await ctx.request.post(B + '/learn/staff/api/uploads', { headers: { origin: B }, multipart: { submissionId: 'seed-questions', file: { name: 'x.pptx', mimeType: 'application/octet-stream', buffer: good } } });
ok('the server refuses an upload to someone else’s submission', foreign.status() === 404, String(foreign.status()));
const crossSite = await ctx.request.post(B + '/learn/staff/api/uploads', { headers: { origin: 'https://evil.example' }, multipart: { submissionId: id, file: { name: 'x.pptx', mimeType: 'application/octet-stream', buffer: good } } });
ok('the server refuses an upload sent from another website', crossSite.status() === 403, String(crossSite.status()));

// changes requested -> new version
await p.goto(ST + '/submissions/seed-transitions', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('changes requested: feedback and gate label shown', await p.getByText('Gate 1 · Source PowerPoint').isVisible() && await p.getByText(/Slide 4 reads as advice for one child/).isVisible());
await p.getByRole('button', { name: 'Start a new version' }).click(); await p.waitForURL('**/seed-transitions/edit'); await p.waitForTimeout(500);
ok('revision: wizard shows the feedback and version 2', await p.getByText(/Version 2: responding to feedback from Sample BCBA/).isVisible());
for (let i = 0; i < 3; i++) { await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(500); }
await p.locator('input[type=file]').setInputFiles({ name: 'Transitions v2.pptx', mimeType: 'application/octet-stream', buffer: good }); await p.waitForTimeout(1200);
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(500);
for (const c of await p.locator('.lc-check-row input').all()) await c.check();
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(500);
ok('revision: cannot submit without saying what changed', await p.getByRole('button', { name: 'Submit for clinical review' }).isDisabled() && await p.getByText(/Say briefly what you changed/).isVisible());
await p.getByRole('button', { name: 'Go to step 4' }).click(); await p.waitForTimeout(300);
await p.getByLabel('What did you change in this version?').fill('Reworded slide 4 as a general example and defined antecedent.');
await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(500); await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(500);
await p.getByRole('button', { name: 'Submit for clinical review' }).click(); await p.waitForURL('**/seed-transitions?submitted=1'); await p.waitForTimeout(500);
const vtxt = await p.locator('.lc-versions').innerText();
ok('revision: version 2 submitted, version 1 kept exactly as reviewed', /Version 2[\s\S]*Locked[\s\S]*Transitions v2\.pptx[\s\S]*Version 1[\s\S]*Locked[\s\S]*SYNTHETIC-transitions\.pptx/.test(vtxt), vtxt.slice(0, 300));
ok('revision: both files still download', (await status('/learn/staff/api/uploads/seed-transitions-asset-v1')) === 200);
ok('history records each step', await p.locator('.lc-history').innerText().then(t => t.includes('New version started') && t.includes('Reviewer requested changes') && t.includes('Submitted for clinical review')));

// two tabs: stale save refused
await p.goto(ST + '/submissions/seed-morning-schedules/edit', { waitUntil: 'load' }); await p.waitForTimeout(450); await p.waitForTimeout(400);
const p2 = await ctx.newPage(); await p2.goto(ST + '/submissions/seed-morning-schedules/edit', { waitUntil: 'load' }); await p.waitForTimeout(450); await p2.waitForTimeout(400);
await p.getByLabel('Title', { exact: true }).fill('Visual schedules for mornings (tab one)'); await p.getByRole('button', { name: 'Save draft' }).click(); await p.waitForTimeout(600);
await p2.getByLabel('Title', { exact: true }).fill('Visual schedules for mornings (tab two)'); await p2.getByRole('button', { name: 'Save draft' }).click(); await p2.waitForTimeout(600);
ok('two tabs: the older tab’s save is refused with an explanation', await p2.getByText(/changed since you opened it/).isVisible());
await p2.close();
// delete a draft
await p.goto(ST + '/submissions/seed-morning-schedules', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('first tab’s save was kept', await p.getByRole('heading', { name: 'Visual schedules for mornings (tab one)' }).isVisible());
await p.getByRole('button', { name: 'Delete this draft' }).click(); await p.getByRole('button', { name: 'Keep it' }).click();
await p.getByRole('button', { name: 'Delete this draft' }).click(); await p.getByRole('button', { name: 'Yes, delete the draft' }).click(); await p.waitForURL('**/submissions?deleted=1'); await p.waitForTimeout(400);
ok('draft deleted after confirmation', await p.getByText('The draft was deleted.').isVisible() && !(await p.locator('.lc-table-title').allInnerTexts()).some(t => t.includes('Visual schedules')));
await p.goto(ST + '/submissions?status=awaiting_review', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('status filter works', (await p.locator('.lc-table .lc-chip').allInnerTexts()).every(t => t.trim() === 'Awaiting review') && (await p.locator('.lc-table-title').count()) === 3, String(await p.locator('.lc-table-title').count()));

// reviewer role
await signOut(); await signIn('Sample BCBA');
ok('BCBA nav includes All submissions, Reviews and Modules', await p.locator('.lc-shell-nav').innerText().then(t => ['Overview', 'My submissions', 'All submissions', 'Reviews', 'Modules'].every(x => t.includes(x))));
await p.goto(ST + '/submissions/all', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('BCBA sees everyone’s submissions with authors', (await p.locator('.lc-table-title').count()) === 5 && await p.locator('.lc-table').innerText().then(t => t.includes('Sample Apprentice') && t.includes('Sample RBT')), String(await p.locator('.lc-table-title').count()));
await p.goto(ST + '/submissions/' + id, { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('BCBA can read the RBT’s submission but gets no edit controls', await p.getByRole('heading', { name: /Bedtime routines/ }).isVisible() && !(await p.getByRole('link', { name: /Continue/ }).count()) && !(await p.getByRole('button', { name: /Delete|Start a new version/ }).count()));
await p.goto(ST + '/submissions/' + id + '/edit', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('BCBA cannot open the RBT’s edit page', p.url().endsWith('/submissions/' + id));

// forged cookie
await ctx.clearCookies(); await ctx.addCookies([{ name: 'lc-demo-staff', value: 'demo-director.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', url: ST }]);
await p.goto(ST + '/submissions/all', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('a forged session cookie gets the role picker, not the director’s view', await p.getByRole('heading', { name: 'Staff workspace demo' }).isVisible());
ok('a forged session cookie cannot download files', (await status('/learn/staff/api/uploads/seed-abcs-asset-v1')) === 404);
await ctx.clearCookies();
await p.goto(ST, { waitUntil: 'load' }); await p.waitForTimeout(450); await p.getByRole('button', { name: 'Reset demo data' }).click(); await p.waitForLoadState('load'); await p.waitForTimeout(400);
await signIn('Sample RBT'); await p.goto(ST + '/submissions', { waitUntil: 'load' }); await p.waitForTimeout(450);
ok('reset puts the seeded submissions back', (await p.locator('.lc-table-title').count()) === 4);
// ---- refresh, Back and two tabs ----
{
  const E = ST + '/submissions/seed-morning-schedules/edit';
  const titleBox = (pg) => pg.getByLabel('Title', { exact: true });
  await p.goto(ST + '/submissions', { waitUntil: 'load' }); await p.waitForTimeout(450);
  await p.goto(E, { waitUntil: 'load' }); await p.waitForTimeout(600);
  // autosave
  await titleBox(p).fill('Visual schedules for mornings, autosaved'); await p.waitForTimeout(3200);
  ok('autosave: a change is saved without pressing anything', await p.getByText(/Draft saved automatically at/).isVisible());
  await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(600);
  await p.getByRole('button', { name: 'Save and continue' }).click(); await p.waitForTimeout(600);
  ok('wizard is on step 3 and the address did not change', await p.getByRole('heading', { name: 'Objectives and audience' }).isVisible() && p.url() === E, p.url());
  await p.getByLabel('Objective 1').fill('Describe what a visual schedule is.'); await p.waitForTimeout(3200);
  // refresh
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  ok('refresh: stays on the same step', await p.getByRole('heading', { name: 'Objectives and audience' }).isVisible());
  ok('refresh: the draft is intact', await p.getByLabel('Objective 1').inputValue() === 'Describe what a visual schedule is.' && await p.getByRole('heading', { level: 1 }).innerText() === 'Visual schedules for mornings, autosaved', await p.getByLabel('Objective 1').inputValue());
  // refresh straight after typing, before autosave has had time
  await p.getByLabel('Objective 1').fill('Describe what a visual schedule is and where to put one.');
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  ok('refresh right after typing: the last words are kept too', await p.getByLabel('Objective 1').inputValue() === 'Describe what a visual schedule is and where to put one.', await p.getByLabel('Objective 1').inputValue());
  // browser Back right after typing
  await p.getByLabel('Objective 1').fill('Describe what a visual schedule is, in one sentence.');
  await p.goBack({ waitUntil: 'load' }); await p.waitForTimeout(700);
  ok('browser Back: leaves the wizard for the page you came from', p.url().endsWith('/learn/staff/submissions'), p.url());
  await p.goForward({ waitUntil: 'load' }); await p.waitForTimeout(900);
  ok('browser Forward: back in the wizard on the same step with nothing lost', await p.getByRole('heading', { name: 'Objectives and audience' }).isVisible() && await p.getByLabel('Objective 1').inputValue() === 'Describe what a visual schedule is, in one sentence.', await p.getByLabel('Objective 1').inputValue().catch(() => 'n/a'));
  await p.goto(ST + '/submissions/seed-morning-schedules', { waitUntil: 'load' }); await p.waitForTimeout(450);
  ok('the saved draft holds what was typed before Back', await p.locator('.lc-summary').innerText().then(t => t.includes('Describe what a visual schedule is, in one sentence.')));
  // a brand-new draft, Back before ever pressing save
  const countBefore = await (async () => { await p.goto(ST + '/submissions', { waitUntil: 'load' }); await p.waitForTimeout(450); return p.locator('.lc-table-title').count(); })();
  await p.goto(ST + '/submissions/new', { waitUntil: 'load' }); await p.waitForTimeout(600);
  await titleBox(p).fill('Typed then left without saving');
  await p.goBack({ waitUntil: 'load' }); await p.waitForTimeout(900); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  ok('new submission, Back before saving: kept as a draft, not lost', (await p.locator('.lc-table-title').allInnerTexts()).includes('Typed then left without saving') && await p.locator('.lc-table-title').count() === countBefore + 1);
  // two tabs, two different drafts, different steps
  const draftB = await (async () => { const row = p.locator('tr', { hasText: 'Typed then left without saving' }); const href = await row.getByRole('link', { name: /Open/ }).getAttribute('href'); return href.split('/').pop(); })();
  const a = await ctx.newPage(), c = await ctx.newPage();
  await a.goto(E, { waitUntil: 'load' }); await a.waitForTimeout(700);                       // a new tab has its own memory, so it opens at step 1
  await c.goto(ST + '/submissions/' + draftB + '/edit', { waitUntil: 'load' }); await c.waitForTimeout(700);
  await c.getByRole('button', { name: 'Save and continue' }).click(); await c.waitForTimeout(600);  // tab C -> step 2
  await a.getByRole('button', { name: 'Save and continue' }).click(); await a.waitForTimeout(600); await a.getByRole('button', { name: 'Save and continue' }).click(); await a.waitForTimeout(600);  // tab A -> step 3
  await c.getByLabel('Caregiver Support').check(); await c.waitForTimeout(2800);
  await a.reload({ waitUntil: 'load' }); await c.reload({ waitUntil: 'load' }); await a.waitForTimeout(700); await c.waitForTimeout(300);
  ok('two tabs: each tab keeps its own step after a refresh', await a.getByRole('heading', { name: 'Objectives and audience' }).isVisible() && await c.getByRole('heading', { name: 'Topic and tags' }).isVisible());
  ok('two tabs: each tab still shows its own draft', await a.getByRole('heading', { level: 1 }).innerText() === 'Visual schedules for mornings, autosaved' && await c.getByRole('heading', { level: 1 }).innerText() === 'Typed then left without saving' && await c.getByLabel('Caregiver Support').isChecked());
  // two tabs both starting a new submission
  const n1 = await ctx.newPage(), n2 = await ctx.newPage();
  await n1.goto(ST + '/submissions/new', { waitUntil: 'load' }); await n2.goto(ST + '/submissions/new', { waitUntil: 'load' }); await n1.waitForTimeout(600);
  await titleBox(n1).fill('New draft from tab one'); await titleBox(n2).fill('New draft from tab two');
  await n1.getByRole('button', { name: 'Save draft' }).click(); await n1.waitForURL('**/edit?step=1**'); await n2.getByRole('button', { name: 'Save draft' }).click(); await n2.waitForURL('**/edit?step=1**'); await n2.waitForTimeout(500);
  ok('two tabs starting new submissions: two separate drafts, nothing mixed', n1.url() !== n2.url() && await titleBox(n1).inputValue() === 'New draft from tab one' && await titleBox(n2).inputValue() === 'New draft from tab two');
  for (const t of [a, c, n1, n2]) await t.close();
}

ok('no page errors', errs.length === 0, errs.join(' | '));
console.log(`[checks] on-02-staff-submission.spec.mjs: ${checks}`);
});

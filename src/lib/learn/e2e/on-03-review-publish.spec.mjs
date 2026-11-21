/* eslint-disable */
// Run with: npm run test:e2e   (see README.md in this folder)
import { test, expect } from '@playwright/test';

test('two approvals, producer import, publish and withdraw, with everything that must be refused', async ({ browser: b, baseURL }) => {
const B = baseURL, ST = B + '/learn/staff';
const errs = [];
let checks = 0;
const ok = (name, cond, extra = '') => { checks++; expect.soft(!!cond, cond ? name : `${name} :: ${String(extra).slice(0, 400)}`).toBe(true); };
const settle = (p, ms = 450) => p.waitForTimeout(ms);
/** A browser with its own cookie jar, signed in as one fictional role. */
async function as(who) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 800 } }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(`${p.url()} :: ${String(e).slice(0, 200)}`));
  if (who) { await p.goto(ST, { waitUntil: 'load' }); await p.getByRole('button', { name: new RegExp('Continue as ' + who) }).click(); await p.locator('.lc-shell').waitFor(); }
  const go = async (u) => { const r = await p.goto(u.startsWith('http') ? u : ST + u, { waitUntil: 'load' }); await settle(p); return r; };
  /** Change who this browser is signed in as, leaving any open page exactly as it was. */
  const become = async (other) => { await ctx.clearCookies(); const t = await ctx.newPage(); await t.goto(ST, { waitUntil: 'load' }); await t.getByRole('button', { name: new RegExp('Continue as ' + other) }).click(); await t.locator('.lc-shell').waitFor(); await t.close(); };
  return { ctx, p, go, become };
}
const text = (p, sel = '#lc-staff-main') => p.locator(sel).innerText();
const refusal = async (p) => { await p.locator('.lc-field-error').first().waitFor({ timeout: 6000 }).catch(() => {}); return (await p.locator('.lc-field-error').allInnerTexts()).join(' '); };
const tickAll = async (p) => { for (const c of await p.locator('.lc-decision .lc-check-row input').all()) await c.check(); };
const notFound = async (x, u) => { await x.go(u); return (await text(x.p)).includes('That page was not found'); };

// ---------- setup ----------
{ const x = await as(null); await x.go(''); await x.p.getByRole('button', { name: 'Reset demo data' }).click(); await x.p.waitForLoadState('load'); await settle(x.p); await x.ctx.close(); }
const rbt = await as('Sample RBT'), bcba = await as('Sample BCBA'), cd = await as('Sample Clinical Director'), prod = await as('Sample Producer'), pub = await as(null);
const good = await (await rbt.ctx.request.get(B + '/learn/staff/api/uploads/seed-abcs-asset-v1')).body();
const statusOf = async (id) => { await cd.go('/submissions/' + id); return (await cd.p.locator('.lc-staff-head .lc-chip').first().innerText()).trim(); };

// ── Gate 1: source review ──
ok('RBT: no Reviews or Modules in the menu', (await rbt.p.locator('.lc-shell-nav a').allInnerTexts()).join('|') === 'Overview|My submissions');
ok('RBT: the review queue address is not found', await notFound(rbt, '/reviews'));
ok('RBT: a source review address is not found', await notFound(rbt, '/reviews/source/seed-abcs'));
ok('RBT: the modules board is not found', await notFound(rbt, '/modules'));
await bcba.go('/reviews');
ok('BCBA: queue has two tabs that name the two gates', await text(bcba.p).then(t => t.includes('Gate 1 · PPTX sources') && t.includes('Gate 2 · Final modules')));
ok('BCBA: two sources are waiting', (await bcba.p.locator('.lc-queue-list > li').count()) === 2);

// BCBA writes and submits their own presentation
await bcba.go('/submissions/new');
await bcba.p.getByLabel('Title', { exact: true }).fill('Reviewer’s own presentation'); await bcba.p.getByLabel('Short summary').fill('A general presentation written by a reviewer, with made-up examples only.');
await bcba.p.getByRole('button', { name: 'Save and continue' }).click(); await bcba.p.waitForURL(/edit\?step=2/); await settle(bcba.p, 600);
const ownId = bcba.p.url().split('/').at(-2);
await bcba.p.getByLabel('Caregiver Support').check(); await bcba.p.getByRole('button', { name: 'Save and continue' }).click(); await settle(bcba.p, 600);
await bcba.p.getByLabel('Objective 1').fill('Describe one general idea from this presentation.'); await bcba.p.getByLabel('Who is this for?').selectOption('All caregivers');
await bcba.p.getByRole('button', { name: 'Save and continue' }).click(); await settle(bcba.p, 600);
await bcba.p.locator('input[type=file]').setInputFiles({ name: 'Own deck.pptx', mimeType: 'application/octet-stream', buffer: good }); await bcba.p.getByText('File uploaded and checked.').waitFor();
await bcba.p.getByRole('button', { name: 'Save and continue' }).click(); await settle(bcba.p, 600);
for (const c of await bcba.p.locator('.lc-check-row input').all()) await c.check();
await bcba.p.getByRole('button', { name: 'Save and continue' }).click(); await settle(bcba.p, 600);
await bcba.p.getByRole('button', { name: 'Submit for clinical review' }).click(); await bcba.p.waitForURL(/submitted=1/); await settle(bcba.p);
await bcba.go('/reviews/source/' + ownId);
ok('own submission: the reviewer is told someone else must review it, and gets no decision form', await text(bcba.p).then(t => t.includes('You submitted this presentation, so someone else has to review it.')) && !(await bcba.p.locator('.lc-decision').count()));
// server-side: a decision form opened by an allowed reviewer, then sent while signed in as the author
await cd.go('/reviews/source/' + ownId); await tickAll(cd.p);
await cd.become('Sample BCBA');
await cd.p.getByRole('button', { name: 'Approve source' }).click(); await cd.p.getByRole('button', { name: 'Yes, approve' }).click();
ok('own submission: the server refuses the approval even when the form is sent', (await refusal(cd.p)).includes('You submitted this presentation, so someone else has to review it.'), await refusal(cd.p));
// server-side: the same form sent while signed in as an RBT, then an apprentice
await cd.become('Sample RBT');
await cd.p.getByRole('button', { name: 'Approve source' }).click(); await cd.p.getByRole('button', { name: 'Yes, approve' }).click();
ok('RBT: the server refuses a source approval', (await refusal(cd.p)).includes('Your role does not allow that.'), await refusal(cd.p));
await cd.become('Sample Apprentice');
await cd.p.getByRole('button', { name: 'Request changes' }).click();
ok('Apprentice: the server refuses a request for changes too', (await refusal(cd.p)).includes('Your role does not allow that.'), await refusal(cd.p));
await cd.become('Sample Producer');
await cd.p.getByRole('button', { name: 'Approve source' }).click(); await cd.p.getByRole('button', { name: 'Yes, approve' }).click();
ok('Producer: the server refuses a source approval', (await refusal(cd.p)).includes('Your role does not allow that.'), await refusal(cd.p));
await cd.become('Sample Clinical Director');
ok('after those attempts the submission is still only awaiting review', (await statusOf(ownId)) === 'Awaiting review');
// checklist and notes rules
await cd.go('/reviews/source/seed-abcs');
ok('approve is off until every checklist item is ticked', await cd.p.getByRole('button', { name: 'Approve source' }).isDisabled());
await cd.p.getByRole('button', { name: 'Request changes' }).click();
ok('requesting changes without a note is refused', (await refusal(cd.p)).includes('Write a note for the contributor'));
await cd.p.getByRole('button', { name: 'Start review' }).click(); await cd.p.getByText('In review by Sample Clinical Director').waitFor({ timeout: 8000 }).catch(() => {}); await settle(cd.p);
ok('starting a review marks it In review and names the reviewer', await text(cd.p).then(t => t.includes('In review by Sample Clinical Director')));
await tickAll(cd.p); await cd.p.getByRole('button', { name: 'Approve source' }).click(); await cd.p.getByRole('button', { name: 'Yes, approve' }).click(); await cd.p.waitForURL(/gate=source&done=approved/); await settle(cd.p);
ok('Clinical Director approves the ABCs source', await text(cd.p).then(t => t.includes('Approval recorded.')));
await rbt.go('/submissions/seed-abcs');
ok('contributor sees Source approved with a Gate 1 record', await text(rbt.p).then(t => t.includes('Source approved') && t.includes('Gate 1 · Source PowerPoint') && t.includes('Approved as a source by Sample Clinical Director')));
ok('contributor still has no approve, publish or module controls', !(await rbt.p.getByRole('link', { name: /Open the source review|Open the module workspace/ }).count()));

// ── Production ──
ok('Producer menu: Overview and Modules only', (await prod.p.locator('.lc-shell-nav a').allInnerTexts()).join('|') === 'Overview|Modules');
ok('Producer: review queue not found', await notFound(prod, '/reviews'));
ok('Producer: All submissions not found', await notFound(prod, '/submissions/all'));
ok('Producer: a source that is not approved yet cannot be opened', await notFound(prod, '/modules/seed-questions') && (await prod.ctx.request.get(B + '/learn/staff/api/uploads/seed-questions-asset-v1')).status() === 404);
ok('Producer: an approved source can be downloaded', (await prod.ctx.request.get(B + '/learn/staff/api/uploads/seed-group-trainings-asset-v1')).status() === 200);
await prod.go('/modules');
ok('Producer sees the two approved sources ready for production', await text(prod.p).then(t => /Approved sources, ready for production\s*2/.test(t)), (await text(prod.p)).slice(0, 200));
await bcba.go('/modules/seed-group-trainings');
ok('a reviewer cannot collect for production (no control)', !(await bcba.p.getByRole('button', { name: 'Collect for production' }).count()));
await prod.go('/modules/seed-group-trainings');
await prod.p.getByRole('button', { name: 'Collect for production' }).click(); await prod.p.getByRole('heading', { name: 'Import the module' }).waitFor(); await settle(prod.p);
await prod.p.getByLabel('Module package').fill('this is not a module'); await prod.p.getByLabel('How was it made?').selectOption('written_by_hand'); await prod.p.getByLabel('What is new compared with the PowerPoint?').fill('Nothing new beyond the slides.');
await prod.p.getByRole('button', { name: 'Check and import' }).click();
ok('import: text that is not a package is refused with a reason', (await refusal(prod.p)).includes('not valid JSON'));
await prod.p.getByRole('button', { name: 'Fill in the synthetic sample package' }).click();
const sample = JSON.parse(await prod.p.getByLabel('Module package').inputValue());
await prod.p.getByLabel('Module package').fill(JSON.stringify({ ...sample, review: { status: 'final_approved', reviewerLabel: 'Self', reviewedOn: '2026-01-01' } }));
await prod.p.getByRole('button', { name: 'Check and import' }).click();
ok('import: a package that declares itself approved is refused', (await refusal(prod.p)).includes('cannot declare itself approved'), await refusal(prod.p));
await prod.p.getByLabel('Module package').fill(JSON.stringify({ ...sample, slug: 'understanding-the-abcs-of-behavior' }));
await prod.p.getByRole('button', { name: 'Check and import' }).click(); await settle(prod.p, 700);
ok('import: a package that reuses a published address is refused', (await refusal(prod.p)).includes('already uses the address'), await refusal(prod.p));
await prod.p.getByLabel('Module package').fill(JSON.stringify(sample));
await prod.p.getByRole('button', { name: 'Check and import' }).click(); await prod.p.getByText('Module draft').first().waitFor(); await settle(prod.p);
const xId = (await prod.p.getByRole('link', { name: /Preview/ }).first().getAttribute('href')).split('/').pop();
ok('import: the valid sample package is imported as a draft', await text(prod.p).then(t => t.includes('Module version 1') && t.includes('Module draft')));
ok('a draft module is not public', (await pub.go(B + '/learn/modules/how-group-trainings-work')).status() === 404);
await prod.p.getByRole('button', { name: 'Send for final review' }).click(); await prod.p.locator('.lc-versions .lc-chip', { hasText: 'Final review' }).waitFor(); await settle(prod.p);
ok('the module is sent for final review and locked', await text(prod.p).then(t => t.includes('Final review')) && !(await prod.p.getByRole('button', { name: 'Send for final review' }).count()) && !(await prod.p.getByLabel('Module package').count()));
ok('Producer has no approve or publish control', !(await prod.p.getByRole('button', { name: /Publish|Approve/ }).count()) && await notFound(prod, '/reviews/module/' + xId));
// a second module (for the ABCs source) that will stay unapproved
await prod.go('/modules/seed-abcs'); await prod.p.getByRole('button', { name: 'Collect for production' }).click(); await prod.p.getByRole('heading', { name: 'Import the module' }).waitFor(); await settle(prod.p);
await prod.p.getByRole('button', { name: 'Fill in the synthetic sample package' }).click();
await prod.p.getByLabel('Module package').fill(JSON.stringify({ ...sample, id: 'unapproved-sample', slug: 'unapproved-sample', title: 'Unapproved sample module' }));
await prod.p.getByRole('button', { name: 'Check and import' }).click(); await prod.p.getByText('Module draft').first().waitFor(); await settle(prod.p);
const yId = (await prod.p.getByRole('link', { name: /Preview/ }).first().getAttribute('href')).split('/').pop();
await prod.p.getByRole('button', { name: 'Send for final review' }).click(); await prod.p.locator('.lc-versions .lc-chip', { hasText: 'Final review' }).waitFor(); await settle(prod.p);

// ── Gate 2: final module review ──
await cd.go('/reviews?gate=module');
ok('Clinical Director: sees the module in Gate 2 but is told a second reviewer is needed', await text(cd.p).then(t => t.includes('How group trainings work') && t.includes('You approved the source PowerPoint. The final module needs a second reviewer')));
await cd.go('/reviews/module/' + xId);
ok('one person, both approvals: no decision form for the person who approved the source', await text(cd.p).then(t => t.includes('so the two approvals come from two people')) && !(await cd.p.locator('.lc-decision').count()));
await cd.go('/modules/seed-group-trainings');
ok('before the final approval there is no publish control at all', !(await cd.p.getByRole('button', { name: 'Publish' }).count()));
await bcba.go('/reviews/module/' + xId);
ok('BCBA: the final review names Gate 2, the source approval and what is new', await text(bcba.p).then(t => t.includes('Gate 2 · Final module') && t.includes('Gate 1 approval') && t.includes('Sample Clinical Director') && t.includes('What is new compared with the PowerPoint')));
await tickAll(bcba.p);
await bcba.become('Sample Clinical Director');
await bcba.p.getByRole('button', { name: 'Approve final module' }).click(); await bcba.p.getByRole('button', { name: 'Yes, approve' }).click();
ok('one person, both approvals: the server refuses when the source approver sends the final approval', (await refusal(bcba.p)).includes('The final module needs a second reviewer, so the two approvals come from two people.'), await refusal(bcba.p));
await bcba.become('Sample RBT');
await bcba.p.getByRole('button', { name: 'Approve final module' }).click(); await bcba.p.getByRole('button', { name: 'Yes, approve' }).click();
ok('RBT: the server refuses a final approval', (await refusal(bcba.p)).includes('Your role does not allow that.'), await refusal(bcba.p));
await bcba.become('Sample Apprentice');
await bcba.p.getByRole('button', { name: 'Reject' }).click();
ok('Apprentice: the server refuses a rejection too', (await refusal(bcba.p)).includes('Your role does not allow that.'), await refusal(bcba.p));
await bcba.become('Sample Producer');
await bcba.p.getByRole('button', { name: 'Approve final module' }).click(); await bcba.p.getByRole('button', { name: 'Yes, approve' }).click();
ok('Producer: the server refuses a final approval', (await refusal(bcba.p)).includes('Your role does not allow that.'), await refusal(bcba.p));
await bcba.become('Sample BCBA');
// preview in the real player
await bcba.go('/modules/preview/' + xId);
ok('preview: the real lesson player with a watermark on the step', bcba.p.url().includes('/preview/' + xId + '/lesson/') && await bcba.p.locator('.lc-player .lc-demo-strip').innerText().then(t => t.includes('Pending final clinical approval')));
await bcba.p.locator('.lc-player-bottom .lc-btn-primary').click(); await settle(bcba.p);
ok('preview: steps move and nothing is saved to the browser', (await bcba.p.locator('#lc-step-title').innerText()) === 'Three things to know' && await bcba.p.evaluate(() => !localStorage.getItem('lc-progress-v1')));
ok('preview is not public: a signed-out visitor gets the role picker, no module', await pub.go('/modules/preview/' + xId).then(async () => (await pub.p.locator('body').innerText()).includes('Staff workspace demo') && !(await pub.p.locator('.lc-player').count())));
ok('preview is not open to a contributor', await notFound(rbt, '/modules/preview/' + xId));
await bcba.go('/reviews/module/' + xId); await tickAll(bcba.p);
await bcba.p.getByRole('button', { name: 'Approve final module' }).click(); await bcba.p.getByRole('button', { name: 'Yes, approve' }).click(); await bcba.p.waitForURL(/gate=module&done=approved/); await settle(bcba.p);
ok('BCBA gives the final approval (a second person)', await text(bcba.p).then(t => t.includes('Approval recorded.')));
await bcba.go('/modules/seed-group-trainings');
ok('BCBA can approve but has no publish control', await text(bcba.p).then(t => t.includes('Final approval by Sample BCBA') && t.includes('Waiting for someone with permission to publish.')) && !(await bcba.p.getByRole('button', { name: 'Publish' }).count()));
ok('approved but not published is still not public', (await pub.go(B + '/learn/modules/how-group-trainings-work')).status() === 404);

// ── Publish ──
await cd.go('/modules/seed-abcs');
ok('a module without its final approval shows no publish control', !(await cd.p.getByRole('button', { name: 'Publish' }).count()) && await text(cd.p).then(t => t.includes('Unapproved sample module') || t.includes('Final review')));
await cd.go('/modules/seed-group-trainings');
await cd.p.getByRole('button', { name: 'Publish' }).click();
// tamper: send the publish request for the other module, which holds only one approval
await cd.p.locator('[data-lc-publish-id]').evaluate((el, id) => { el.value = id; }, yId);
await cd.p.getByRole('button', { name: 'Yes, publish' }).click();
ok('publishing without both approvals: the server refuses and says which approval is missing', (await refusal(cd.p)).includes('This module cannot be published. This exact module version has no recorded final clinical approval.'), await refusal(cd.p));
ok('…and the unapproved module is not public', (await pub.go(B + '/learn/modules/unapproved-sample')).status() === 404);
// RBT, apprentice, producer and BCBA try to publish the approved one
await cd.go('/modules/seed-group-trainings'); await cd.p.getByRole('button', { name: 'Publish' }).click();
for (const who of ['Sample RBT', 'Sample Apprentice', 'Sample Producer', 'Sample BCBA']) {
  await cd.become(who); await cd.p.getByRole('button', { name: 'Yes, publish' }).click();
  ok(`${who.replace('Sample ', '')}: the server refuses to publish`, (await refusal(cd.p)).includes('Your role does not allow that.'), await refusal(cd.p));
}
ok('after every refused attempt it is still not public', (await pub.go(B + '/learn/modules/how-group-trainings-work')).status() === 404);
await cd.become('Sample Clinical Director');
await cd.go('/modules/seed-group-trainings'); await cd.p.getByRole('button', { name: 'Publish' }).click(); await cd.p.getByRole('button', { name: 'Yes, publish' }).click();
await cd.p.locator('.lc-versions .lc-chip-solid', { hasText: 'Published' }).waitFor(); await settle(cd.p);
ok('Clinical Director publishes the module that holds both approvals', await text(cd.p).then(t => t.includes('Published by Sample Clinical Director')));
const M = B + '/learn/modules/how-group-trainings-work';
ok('public: the module page opens', (await pub.go(M)).status() === 200 && await pub.p.getByRole('heading', { level: 1 }).innerText() === 'How group trainings work');
ok('public: it is labelled as demo content', await pub.p.locator('.lc-pagehead .lc-chip').innerText().then(t => /Demo/.test(t)) && await pub.p.locator('body').innerText().then(t => t.includes('published through the staff demo by fictional reviewers')));
ok('public: a lesson opens in the player', (await pub.go(M + '/lesson/what-a-group-training-is')).status() === 200 && await pub.p.locator('#lc-step-title').innerText() === 'Learning together, live');
await pub.go(B + '/learn/library');
ok('public: the library lists it', (await pub.p.locator('.lc-mcard-title').allInnerTexts()).includes('How group trainings work'));
await pub.go(B + '/learn/topics/caregiver-support');
ok('public: its topic page lists it', (await pub.p.locator('.lc-mcard-title').allInnerTexts()).includes('How group trainings work'));
await rbt.go('/submissions/seed-group-trainings');
ok('contributor sees Published and two separate review records', await text(rbt.p).then(t => t.includes('Published') && t.includes('Gate 1 · Source PowerPoint') && t.includes('Gate 2 · Final module') && t.includes('Final module approved by Sample BCBA')));

// ── Withdraw ──
await cd.go('/modules/seed-group-trainings'); await cd.p.getByRole('button', { name: 'Withdraw' }).click();
await cd.become('Sample RBT'); await cd.p.getByLabel('Why is it being withdrawn?').fill('An RBT trying to withdraw a module.'); await cd.p.getByRole('button', { name: 'Yes, withdraw' }).click();
ok('RBT: the server refuses to withdraw', (await refusal(cd.p)).includes('Your role does not allow that.'), await refusal(cd.p));
await cd.become('Sample Clinical Director');
await cd.go('/modules/seed-group-trainings'); await cd.p.getByRole('button', { name: 'Withdraw' }).click(); await cd.p.getByRole('button', { name: 'Yes, withdraw' }).click();
ok('withdrawing needs a reason', (await refusal(cd.p)).includes('Say briefly why this module is being withdrawn'));
await cd.p.getByLabel('Why is it being withdrawn?').fill('A slide needs correcting before families see it again.'); await cd.p.getByRole('button', { name: 'Yes, withdraw' }).click();
await cd.p.locator('.lc-versions .lc-chip', { hasText: 'Withdrawn' }).waitFor(); await settle(cd.p);
ok('withdrawn: the module page under /learn is gone', (await pub.go(M)).status() === 404);
ok('withdrawn: every lesson address is gone', (await pub.go(M + '/lesson/what-a-group-training-is')).status() === 404 && (await pub.go(M + '/lesson/registering-and-joining')).status() === 404);
await pub.go(B + '/learn/library');
ok('withdrawn: the library no longer lists it', !(await pub.p.locator('.lc-mcard-title').allInnerTexts()).includes('How group trainings work'));
await pub.go(B + '/learn');
ok('withdrawn: the Learning Center home page no longer lists it', !(await pub.p.locator('body').innerText()).includes('How group trainings work'));
await pub.go(B + '/learn/topics/caregiver-support');
ok('withdrawn: its topic page no longer lists it', !(await pub.p.locator('.lc-mcard-title').allInnerTexts()).includes('How group trainings work'));
await pub.go(B + '/learn/library'); await pub.p.getByLabel('Search learning topics').fill('group trainings'); await settle(pub.p, 300);
ok('withdrawn: search does not find it', (await pub.p.locator('.lc-mcard').count()) === 0);
await cd.go('/modules/seed-group-trainings');
ok('withdrawn: staff keep the full record, with the reason and both approvals', await text(cd.p).then(t => t.includes('Withdrawn by Sample Clinical Director') && t.includes('A slide needs correcting') && t.includes('Final approval by Sample BCBA') && t.includes('Module withdrawn') && t.includes('Module published')));
ok('a withdrawn version cannot simply be published again (no control)', !(await cd.p.getByRole('button', { name: 'Publish' }).count()));
ok('no page errors', errs.length === 0, errs.join(' | '));
// Close every window this walk opened, so later tests are not slowed down by them.
for (const c of b.contexts()) await c.close();
console.log(`[checks] on-03-review-publish.spec.mjs: ${checks}`);
});

/* eslint-disable */
// Phase 4 walk: training listings and aggregate-only reporting, including what must be refused.
// Needs the site running locally with all three flags on. Resets the local demo store first.
import { chromium } from 'playwright';
const B = 'http://localhost:3000', ST = B + '/learn/staff';
const b = await chromium.launch();
let fails = 0; const errs = [];
const ok = (name, cond, extra = '') => { if (!cond) fails++; console.log(cond ? 'PASS' : 'FAIL', name, cond ? '' : String(extra).slice(0, 400)); };
const settle = (p, ms = 700) => p.waitForTimeout(ms);
async function as(who) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 800 } }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  const signIn = async (page, name) => { await page.goto(ST, { waitUntil: 'load' }); await page.getByRole('button', { name: new RegExp('Continue as ' + name) }).click(); await page.locator('.lc-shell').waitFor(); };
  if (who) await signIn(p, who);
  const go = async (u, page = p) => { const r = await page.goto(u.startsWith('http') ? u : ST + u, { waitUntil: 'load' }); await settle(page, 450); return r; };
  /** Change who this browser is signed in as, leaving any open page exactly as it was. */
  const become = async (other) => { await ctx.clearCookies(); const t = await ctx.newPage(); await signIn(t, other); await t.close(); };
  return { ctx, p, go, become };
}
const text = (p, sel = '#lc-staff-main') => p.locator(sel).innerText();
const refusal = async (p) => { await p.locator('.lc-field-error').first().waitFor({ timeout: 6000 }).catch(() => {}); return (await p.locator('.lc-field-error').allInnerTexts()).join(' '); };
const notFound = async (x, u) => { await x.go(u); return (await text(x.p)).includes('That page was not found'); };
const focused = (p) => p.evaluate(() => document.activeElement?.getAttribute('data-field') ?? document.activeElement?.tagName);
const tile = async (p, label) => (await p.locator(`[data-lc-tile="${label}"] .lc-metric-value`).innerText()).trim();
const tileNote = async (p, label) => (await p.locator(`[data-lc-tile="${label}"] .lc-metric-note`).innerText()).trim();
const press = async (p, name) => { await p.getByRole('button', { name, exact: true }).click(); };
const TEAMS = 'https://events.teams.microsoft.com/event/example-not-a-real-event';
const nextYear = new Date().getFullYear() + 1;

// ---------- setup ----------
{ const x = await as(null); await x.go(''); await x.p.getByRole('button', { name: 'Reset demo data' }).click(); await x.p.waitForLoadState('load'); await settle(x.p); await x.ctx.close(); }
const cd = await as('Sample Clinical Director'), pub = await as(null);

console.log('--- Who can open trainings and reporting ---');
for (const who of ['Sample RBT', 'Sample Apprentice', 'Sample BCBA', 'Sample Producer']) {
  const x = await as(who);
  const menu = (await x.p.locator('.lc-shell-nav a').allInnerTexts()).join('|');
  ok(`${who}: no Trainings or Reporting in the menu`, !/Trainings|Reporting/.test(menu), menu);
  let hidden = true;
  for (const u of ['/trainings', '/trainings/new', '/trainings/seed-training-mornings', '/analytics', '/analytics?range=ytd', '/analytics/reports/seed-training-questions']) hidden = (await notFound(x, u)) && hidden;
  ok(`${who}: every trainings and reporting address is "not found"`, hidden);
  const csv = await x.ctx.request.get(ST + '/api/reports/export?range=ytd');
  ok(`${who}: the download is "not found"`, csv.status() === 404 && !(await csv.text()).includes('Registrations'), csv.status());
  await x.ctx.close();
}
{ const csv = await pub.ctx.request.get(ST + '/api/reports/export?range=ytd'); ok('signed out: the download is "not found"', csv.status() === 404, csv.status()); }
{ const menu = (await cd.p.locator('.lc-shell-nav a').allInnerTexts()).join('|'); ok('Clinical Director: Trainings and Reporting are in the menu', /Trainings/.test(menu) && /Reporting/.test(menu), menu); }

console.log('--- Reporting: what the Clinical Director sees ---');
await cd.go('/analytics');
ok('demo banner uses the exact words', (await text(cd.p)).includes('Illustrative demo data — not actual caregiver attendance'));
ok('last 90 days: trainings held is 3', (await tile(cd.p, 'Trainings held')) === '3', await tile(cd.p, 'Trainings held'));
ok('last 90 days: registrations 85, from 4 of 5', (await tile(cd.p, 'Registrations submitted')) === '85' && (await tileNote(cd.p, 'Registrations submitted')).includes('From 4 of 5'), await tileNote(cd.p, 'Registrations submitted'));
ok('last 90 days: approved 53, from 2 of 5, and says three are not available', (await tile(cd.p, 'Approved registrations')) === '53' && (await tileNote(cd.p, 'Approved registrations')).includes('From 2 of 5') && (await tileNote(cd.p, 'Approved registrations')).includes('3 not yet available'));
ok('last 90 days: attendances 55, from 3 of 4', (await tile(cd.p, 'Attendances')) === '55' && (await tileNote(cd.p, 'Attendances')).includes('From 3 of 4'));
ok('attendance rate uses only trainings with both numbers: 41 of 53 is 77%', (await tile(cd.p, 'Attendance rate')) === '77%' && (await tileNote(cd.p, 'Attendance rate')).includes('41 attendances out of 53 approved registrations, from 2 of 3'), await tileNote(cd.p, 'Attendance rate'));
const cellOf = async (row, label) => (await cd.p.locator(`[data-lc-row="${row}"] td[data-label="${label}"]`).innerText()).trim();
ok('a number that was not entered reads "Not yet available", never 0', (await cellOf('seed-training-routines', 'Approved')) === 'Not yet available');
ok('a finished training with no numbers says so on every figure', (await cellOf('seed-training-questions', 'Registrations')) === 'Not yet available' && (await cellOf('seed-training-questions', 'Status')) === 'Held, numbers not entered yet');
ok('a cancelled training shows "Not held", with its registrations', (await cellOf('seed-training-cancelled', 'Attendances')) === 'Not held' && (await cellOf('seed-training-cancelled', 'Registrations')) === '9');
ok('the corrected training shows its newest entry (19, revision 2)', (await cellOf('seed-training-communication', 'Attendances')) === '19' && (await cd.p.locator('[data-lc-row="seed-training-communication"]').innerText()).includes('revision 2'));
ok('"Numbers waiting to be entered" lists the one finished training', (await cd.p.locator('#lc-rep-waiting').locator('xpath=..').innerText()).includes('Questions to bring to your BCBA'));

const centerCells = async () => (await cd.p.locator('#lc-rep-centers').locator('xpath=..').locator('tbody td').allInnerTexts()).map(s => s.trim());
{ const cells = await centerCells(); const nums = cells.filter(c => /^\d/.test(c)).map(c => Number(c.replace(/,/g, '')));
  ok('by center: no figure under 5 is shown', nums.length > 0 && nums.every(n => n >= 5), cells.join('|'));
  ok('by center: small counts are folded into "Other / not displayed"', (await cd.p.locator('#lc-rep-centers').locator('xpath=..').innerText()).includes('Other / not displayed') && cells.includes('None, or too few to show')); }
await cd.go('/analytics?range=ytd&training=seed-training-communication');
{ const cells = await centerCells(); ok('by center, one training: Cedar Hill (2) and Pearland (5) are folded together, shown as 7', cells.join('|') === 'None, or too few to show|12|8|None, or too few to show|None, or too few to show|None, or too few to show|7', cells.join('|')); }

await cd.go('/analytics?range=30');
ok('last 30 days: 1 held, registrations 27 from 1 of 2', (await tile(cd.p, 'Trainings held')) === '1' && (await tile(cd.p, 'Registrations submitted')) === '27' && (await tileNote(cd.p, 'Registrations submitted')).includes('From 1 of 2'));
await cd.go('/analytics?range=ytd');
ok('year to date: 4 held, registrations 109, attendances 72, rate 78%', (await tile(cd.p, 'Trainings held')) === '4' && (await tile(cd.p, 'Registrations submitted')) === '109' && (await tile(cd.p, 'Attendances')) === '72' && (await tile(cd.p, 'Attendance rate')) === '78%');
await cd.go('/analytics?range=ytd&topic=cat-understanding-behavior');
ok('topic filter: one training, registrations 31', (await tile(cd.p, 'Trainings held')) === '1' && (await tile(cd.p, 'Registrations submitted')) === '31');
await cd.go('/analytics?range=custom&from=2020-01-01&to=2020-12-31');
ok('a period with no trainings says "Not yet available", not 0', (await tile(cd.p, 'Registrations submitted')) === 'Not yet available' && (await tile(cd.p, 'Attendance rate')) === 'Not yet available' && (await tile(cd.p, 'Trainings held')) === '0');
await cd.go('/analytics?range=custom&from=2026-12-31&to=2026-01-01');
ok('dates the wrong way round: says so and shows the last 90 days', (await refusal(cd.p)).includes('start date is after the end date') && (await tile(cd.p, 'Trainings held')) === '3');
await cd.go('/analytics?range=ytd');
await cd.p.getByLabel('Period', { exact: true }).selectOption('30'); await cd.p.getByRole('button', { name: 'Show' }).click(); await cd.p.waitForURL(/range=30/); await settle(cd.p);
ok('the filter form works: choosing "Last 30 days" and pressing Show', (await tile(cd.p, 'Trainings held')) === '1');
await cd.go('/analytics?range=ytd');
ok('the chart is drawn and described for people who cannot see it', (await cd.p.locator('.lc-chart-canvas canvas[role="img"]').count()) === 1 && ((await cd.p.locator('.lc-chart-canvas canvas').getAttribute('aria-label')) ?? '').includes('Attendances total 72'));
await press(cd.p, 'View as table');
ok('"View as table" shows the same figures as a table, by month', (await cd.p.locator('.lc-chart table tbody tr').count()) >= 11 && (await cd.p.locator('.lc-chart').innerText()).includes('No trainings'));
await press(cd.p, 'View as chart');
ok('"View as chart" brings the chart back', (await cd.p.locator('.lc-chart-canvas canvas').count()) === 1);

console.log('--- Reporting: the download ---');
{ const r = await cd.ctx.request.get(ST + '/api/reports/export?range=ytd'); const csv = await r.text();
  ok('download: a spreadsheet file, marked never to be cached', r.status() === 200 && (r.headers()['content-type'] ?? '').includes('text/csv') && r.headers()['cache-control'] === 'no-store' && (r.headers()['content-disposition'] ?? '').includes('learning-center-participation'));
  ok('download: carries the demo banner and the definitions', csv.includes('Illustrative demo data — not actual caregiver attendance') && csv.includes('"What the numbers mean"') && csv.includes('"Not yet available","The number has not been entered. It does not mean zero."'));
  ok('download: same totals as the page', csv.includes('"Registrations submitted",109,"from 5 of 6 trainings"') && csv.includes('"Trainings held",4'));
  const centerPart = csv.split('"Registrations submitted, by center"')[1]?.split('"What the numbers mean"')[0] ?? '';
  const small = [...centerPart.matchAll(/,(\d+)\r/g)].map(m => Number(m[1])).filter(n => n < 5);
  ok('download: no center or source figure under 5', centerPart.length > 0 && small.length === 0, small.join(','));
  ok('download: nothing that looks like a person', !/@/.test(csv) && !/attendee name|email/i.test(csv)); }

console.log('--- Reporting: entering numbers ---');
await cd.go('/analytics/reports/seed-training-questions');
ok('entry page: banner and the "totals only" guidance', await text(cd.p).then(t => t.includes('Illustrative demo data — not actual caregiver attendance') && t.includes('Do not paste names, email addresses, attendance spreadsheets')));
ok('entry page: every box is a number, a date or a fixed list (no free text on a first entry)', (await cd.p.locator('form.lc-form textarea').count()) === 0 && (await cd.p.locator('form.lc-form input[type="file"]').count()) === 0);
await cd.p.getByLabel('Registrations submitted', { exact: true }).fill('20');
await cd.p.getByLabel('Approved registrations', { exact: true }).fill('18');
await cd.p.getByLabel('Attendances', { exact: true }).fill('Ana Lopez');
await press(cd.p, 'Save numbers');
{ const r = await refusal(cd.p);
  ok('a name typed into a number box is refused', r.includes('Use a whole number') && r.includes('Nothing was saved'));
  ok('after the refusal: focus is on that box and the other numbers are still there', (await focused(cd.p)) === 'attendancesTotal' && (await cd.p.getByLabel('Registrations submitted', { exact: true }).inputValue()) === '20' && (await cd.p.getByLabel('Approved registrations', { exact: true }).inputValue()) === '18'); }
await cd.p.getByLabel('Attendances', { exact: true }).fill('15');
await cd.p.getByLabel('Approved registrations', { exact: true }).fill('25');
await press(cd.p, 'Save numbers');
ok('approved above submitted is refused', (await refusal(cd.p)).includes('Approved registrations cannot be more than registrations submitted'));
await cd.p.getByLabel('Approved registrations', { exact: true }).fill('18');
await cd.p.getByLabel('Sugar Land').fill('15'); await cd.p.getByLabel('Katy').fill('9');
await press(cd.p, 'Save numbers');
ok('a center split that adds up to more than the total is refused', (await refusal(cd.p)).includes('These add up to 24, which is more than the 20 registrations submitted'));
await cd.p.getByLabel('Sugar Land').fill('11'); await cd.p.getByLabel('Katy').fill('6'); await cd.p.getByLabel('Pearland').fill('3');
// A second tab opens the same empty form before the first one saves.
const tab2 = await cd.ctx.newPage(); await cd.go('/analytics/reports/seed-training-questions', tab2);
// A different role takes over this browser while the filled form is still on screen.
await cd.become('Sample BCBA');
await press(cd.p, 'Save numbers');
ok('a role without permission pressing Save on an open form is refused', (await refusal(cd.p)).includes('Your role cannot see or enter participation numbers'));
await cd.become('Sample Clinical Director');
await cd.go('/analytics');
ok('... and nothing was saved by that attempt', (await cellOf('seed-training-questions', 'Registrations')) === 'Not yet available');
await cd.p.goBack({ waitUntil: 'load' }); await settle(cd.p);
await cd.go('/analytics/reports/seed-training-questions');
await cd.p.getByLabel('Registrations submitted', { exact: true }).fill('20'); await cd.p.getByLabel('Approved registrations', { exact: true }).fill('18'); await cd.p.getByLabel('Attendances', { exact: true }).fill('15');
await cd.p.getByLabel('Sugar Land').fill('11'); await cd.p.getByLabel('Katy').fill('6'); await cd.p.getByLabel('Pearland').fill('3');
await press(cd.p, 'Save numbers'); await cd.p.waitForURL(/saved=numbers/); await settle(cd.p);
ok('valid totals are saved, and reporting says so', (await text(cd.p)).includes('Numbers saved.'));
ok('totals update: registrations 105 from all 5, attendances 70 from all 4, 4 held', (await tile(cd.p, 'Registrations submitted')) === '105' && (await tileNote(cd.p, 'Registrations submitted')).includes('From all 5') && (await tile(cd.p, 'Attendances')) === '70' && (await tile(cd.p, 'Trainings held')) === '4', (await tile(cd.p, 'Registrations submitted')) + ' ' + (await tile(cd.p, 'Attendances')));
ok('rate now covers 3 of 4 trainings: 56 of 71 is 79%', (await tile(cd.p, 'Attendance rate')) === '79%' && (await tileNote(cd.p, 'Attendance rate')).includes('56 attendances out of 71'), await tileNote(cd.p, 'Attendance rate'));
// The second tab still shows the empty first-entry form.
await tab2.getByLabel('Registrations submitted', { exact: true }).fill('99'); await press(tab2, 'Save numbers');
ok('a second tab saving over it from an old page is refused', (await refusal(tab2)).includes('changed somewhere else'));
await tab2.close();

console.log('--- Reporting: correcting numbers ---');
await cd.go('/analytics/reports/seed-training-questions');
{ const t = await text(cd.p);
  ok('correction page: says which revision, and shows the entry with who and when', t.includes('Correction to revision 1') && t.includes('Revision 1 · in use') && t.includes('Entered by Sample Clinical Director'));
  ok('correction page: the small center count (3) is not sent back to the screen', t.includes('Split by center: entered') && !/Pearland\s*3/.test(t) && (await cd.p.getByLabel('Pearland').count()) === 0 && !(await cd.p.content()).includes('value="3"')); }
await cd.p.getByLabel('Attendances', { exact: true }).fill('16');
await press(cd.p, 'Save correction');
ok('a correction with no reason is refused', (await refusal(cd.p)).includes('Say in a sentence why the numbers are changing') && (await focused(cd.p)) === 'reason');
await cd.p.getByLabel('Why are the numbers changing?').fill('Parent ana.lopez@example.org said she attended');
await press(cd.p, 'Save correction');
ok('a reason holding an email address is refused', (await refusal(cd.p)).includes('Leave out names, email addresses and phone numbers'));
await cd.p.getByLabel('Why are the numbers changing?').fill('The first count was read before the Teams report was final.');
await press(cd.p, 'Save correction'); await cd.p.waitForURL(/saved=correction/); await settle(cd.p);
ok('a correction with a reason is saved', (await text(cd.p)).includes('Correction saved. The earlier entry is kept in the history.') && (await cellOf('seed-training-questions', 'Attendances')) === '16');
await cd.go('/analytics/reports/seed-training-questions');
{ const t = await text(cd.p); ok('history keeps both entries, the reason, and marks the newest as in use', t.includes('Revision 2 · in use') && t.includes('Revision 1') && t.includes('Attendances: 15') && t.includes('Attendances: 16') && t.includes('Reason for the change: The first count was read before the Teams report was final.')); }
await cd.go('/analytics/reports/seed-training-communication');
ok('seeded training with a count of 2 for one center: the 2 is not on its entry page either', await text(cd.p).then(async t => !/Cedar Hill\s*2/.test(t) && !(await cd.p.content()).includes('value="2"')));
ok('numbers cannot be entered for a draft or an upcoming training', (await notFound(cd, '/analytics/reports/seed-training-team')) && (await notFound(cd, '/analytics/reports/seed-training-mornings')));

console.log('--- Listings: creating and what is refused ---');
await cd.go('/trainings');
ok('trainings list groups listings by where they are', await text(cd.p).then(t => t.includes('Public and upcoming') && t.includes('Finished, not yet marked completed') && t.includes('Drafts') && t.includes('Completed') && t.includes('Cancelled')));
await cd.go('/trainings/new');
const f = { title: () => cd.p.getByLabel('Title', { exact: true }), summary: () => cd.p.getByLabel('Short summary'), desc: () => cd.p.getByLabel('Description'), obj: () => cd.p.getByLabel('Learning objectives'), topic: () => cd.p.getByLabel('Topic'), date: () => cd.p.getByLabel('Date', { exact: true }), start: () => cd.p.getByLabel('Starts'), end: () => cd.p.getByLabel('Ends'), presenter: () => cd.p.getByLabel(/^Presenter/), link: () => cd.p.getByLabel(/Microsoft Teams registration link/) };
await f.summary().fill('A made-up listing created by the scripted walk to test the editor.');
await press(cd.p, 'Create draft');
ok('no title: refused beside the field, focus moves there, typing is kept', (await refusal(cd.p)).includes('Give the training a title') && (await focused(cd.p)) === 'title' && (await f.summary().inputValue()).startsWith('A made-up listing'));
await f.title().fill('Walk test: summer session');
for (const [bad, why] of [['javascript:alert(1)', 'https://'], ['http://events.teams.microsoft.com/event/abc', 'https://'], ['https://example.com/register', 'Microsoft Teams registration page'], ['https://events.teams.microsoft.com.evil.example/event/abc', 'Microsoft Teams registration page'], ['https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc', 'joining a meeting']]) {
  await f.link().fill(bad); await press(cd.p, 'Create draft');
  const r = await refusal(cd.p);
  ok(`link refused: ${bad.slice(0, 48)}`, r.includes(why) && r.includes('Nothing was saved') && (await focused(cd.p)) === 'registrationUrl' && (await f.link().inputValue()) === bad, r);
}
await f.link().fill('');
await f.date().fill(`${nextYear}-07-15`); await f.start().fill('18:00'); await f.end().fill('17:00');
await press(cd.p, 'Create draft');
ok('end before start is refused', (await refusal(cd.p)).includes('The end time must be after the start time'));
await f.date().fill(`${nextYear}-03-14`); await f.start().fill('02:30'); await f.end().fill('03:30');
await press(cd.p, 'Create draft');
ok('a time skipped by the March clock change is refused', (await refusal(cd.p)).includes('do not exist in Central Time'), await refusal(cd.p));
await f.date().fill(`${nextYear}-07-15`); await f.start().fill('18:00'); await f.end().fill('19:00');
await f.presenter().fill('Sample presenter'); await press(cd.p, 'Create draft');
ok('a presenter name without the "agreed to be named" tick is refused', (await refusal(cd.p)).includes('confirm the presenter has agreed to be named'));
await f.presenter().fill('');
await cd.go('/trainings');
ok('none of those refused attempts created a listing', !(await text(cd.p)).includes('Walk test'));

await cd.go('/trainings/new');
await f.title().fill('Walk test: summer session'); await press(cd.p, 'Create draft'); await cd.p.waitForURL(/\/trainings\/[0-9a-f-]{36}\?saved=1/); await settle(cd.p);
const summerId = cd.p.url().split('/').pop().split('?')[0];
ok('a draft with only a title can be saved', (await text(cd.p)).includes('Draft created. Only staff can see it until you publish.') && (await cd.p.locator('.lc-staff-head .lc-chip').innerText()).trim() === 'Draft');
await pub.go(B + '/learn/trainings');
ok('a draft is not on the public trainings page', !(await pub.p.locator('main').innerText()).includes('Walk test'));
ok('a draft has no public address', (await pub.go(B + '/learn/trainings/walk-test-summer-session')).status() === 404);
await press(cd.p, 'Publish listing'); await press(cd.p, 'Yes, publish');
{ const r = await refusal(cd.p); ok('publishing an unfinished draft is refused, with the list of what is missing', r.includes('not ready to publish') && r.includes('Add a short summary') && r.includes('Add at least one learning objective') && r.includes('Add the date, start time and end time') && r.includes('Choose a topic'), r); }
ok('... and it is still a draft, still not public', (await pub.go(B + '/learn/trainings/walk-test-summer-session')).status() === 404);

await f.summary().fill('A made-up listing created by the scripted walk to test the editor.'); await f.desc().fill('First paragraph of a made-up description.\n\nSecond paragraph.'); await f.obj().fill('Learn one general idea.\nKnow who to ask.');
await f.topic().selectOption('cat-routines'); await f.date().fill(`${nextYear}-07-15`); await f.start().fill('18:00'); await f.end().fill('19:00');
await cd.p.getByLabel('Understanding the ABCs of Behavior').check();
await press(cd.p, 'Save draft'); await cd.p.locator('.lc-saved', { hasText: 'Saved.' }).waitFor(); await settle(cd.p);
ok('the preview shows the Central Time date and time', await cd.p.locator('.lc-listing-preview').innerText().then(t => t.includes(`July 15, ${nextYear}`) && t.includes('6:00 to 7:00 PM CT')));
await press(cd.p, 'Publish listing'); await press(cd.p, 'Yes, publish'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Scheduled' }).waitFor(); await settle(cd.p);
ok('published without a link: staff are warned', (await text(cd.p)).includes('No registration link has been added. Caregivers will see “Registration details coming soon”'));
await pub.go(B + '/learn/trainings/walk-test-summer-session');
{ const t = await pub.p.locator('main').innerText();
  ok('public page: listed, with date, CT time, the audience line and the example label', t.includes('Walk test: summer session') && t.includes(`July 15, ${nextYear}`) && t.includes('6:00 to 7:00 PM CT') && t.includes('Currently enrolled families only') && t.includes('Example listing'));
  ok('public page, no link: "Registration details coming soon" and nothing to click through to Teams', t.includes('Registration details coming soon') && (await pub.p.locator('main a[href*="teams.microsoft.com"]').count()) === 0);
  ok('public page: the linked module is shown', t.includes('Understanding the ABCs of Behavior')); }

// A winter listing, to see the other side of the clock change.
await cd.go('/trainings/new');
await f.title().fill('Walk test: winter session'); await f.summary().fill('A made-up winter listing created by the scripted walk.'); await f.desc().fill('A made-up description.'); await f.obj().fill('Learn one general idea.');
await f.topic().selectOption('cat-communication'); await f.date().fill(`${nextYear}-01-15`); await f.start().fill('18:00'); await f.end().fill('19:00'); await f.link().fill(TEAMS);
await press(cd.p, 'Create draft'); await cd.p.waitForURL(/saved=1/); await settle(cd.p);
const winterId = cd.p.url().split('/').pop().split('?')[0];
await press(cd.p, 'Publish listing'); await press(cd.p, 'Yes, publish'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Scheduled' }).waitFor(); await settle(cd.p);
{ const store = JSON.parse(await (await import('node:fs/promises')).readFile('.learn-demo/store.json', 'utf8'));
  const iso = (id) => store.listings.find(l => l.id === id).training.startAtUtc;
  ok('daylight saving: 6 PM in July is stored as 23:00 UTC, 6 PM in January as 00:00 UTC the next day', iso(summerId) === `${nextYear}-07-15T23:00:00.000Z` && iso(winterId) === `${nextYear}-01-16T00:00:00.000Z`, iso(summerId) + ' ' + iso(winterId));
  ok('the stored listing has no join link, no registrant and no family field', !JSON.stringify(store.listings).match(/meetup-join|attendee|registrant|email/i)); }
await pub.go(B + '/learn/trainings/walk-test-winter-session');
{ const a = pub.p.locator('main a[href^="https://events.teams.microsoft.com/"]');
  ok('public page with a checked link: an active registration button that opens Teams in a new tab', (await a.count()) >= 1 && (await a.first().getAttribute('target')) === '_blank' && ((await a.first().getAttribute('rel')) ?? '').includes('noopener') && (await pub.p.locator('main').innerText()).includes('6:00 to 7:00 PM CT')); }

console.log('--- Listings: close, reopen, cancel, complete, archive ---');
await cd.go('/trainings/' + winterId);
const tabB = await cd.ctx.newPage(); await cd.go('/trainings/' + winterId, tabB);
await press(cd.p, 'Close registration'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Registration closed' }).waitFor(); await settle(cd.p);
await pub.go(B + '/learn/trainings/walk-test-winter-session');
ok('registration closed: the public page says so and the Teams button is gone', (await pub.p.locator('main').innerText()).includes('Registration closed') && (await pub.p.locator('main a[href*="teams.microsoft.com"]').count()) === 0);
await press(tabB, 'Cancel training'); await press(tabB, 'Yes, cancel it');
ok('a second tab acting on an out-of-date page is refused', (await refusal(tabB)).includes('changed somewhere else'));
await tabB.close();
await press(cd.p, 'Reopen registration'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Scheduled' }).waitFor(); await settle(cd.p);
await pub.go(B + '/learn/trainings/walk-test-winter-session');
ok('registration reopened: the Teams button is back', (await pub.p.locator('main a[href^="https://events.teams.microsoft.com/"]').count()) >= 1);
ok('an upcoming training cannot be marked completed (no button)', (await cd.p.getByRole('button', { name: 'Mark completed' }).count()) === 0);

// Another role takes over this browser with the listing page still open.
await cd.become('Sample RBT');
await press(cd.p, 'Close registration');
ok('an RBT pressing a status button on an open page is refused', (await refusal(cd.p)).includes('Your role cannot manage training listings'));
await cd.p.getByLabel('Title', { exact: true }).fill('Changed by someone without permission'); await press(cd.p, 'Save changes to the public listing');
ok('an RBT pressing Save on an open editor is refused', (await refusal(cd.p)).includes('Your role cannot manage training listings'));
await cd.become('Sample Clinical Director');
await pub.go(B + '/learn/trainings/walk-test-winter-session');
ok('... and the public listing is unchanged', await pub.p.locator('main').innerText().then(async t => t.includes('Walk test: winter session') && !t.includes('Changed by someone') && (await pub.p.locator('main a[href^="https://events.teams.microsoft.com/"]').count()) >= 1));

await cd.go('/trainings/' + winterId);
await f.link().fill('https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc'); await press(cd.p, 'Save changes to the public listing');
ok('swapping the link on a public listing for a join link is refused', (await refusal(cd.p)).includes('joining a meeting'));
await pub.go(B + '/learn/trainings/walk-test-winter-session');
ok('... the public page keeps the registration link and never shows a join link', (await pub.p.locator('main a[href^="https://events.teams.microsoft.com/event/"]').count()) >= 1 && !(await pub.p.content()).includes('meetup-join'));
await cd.go('/trainings/' + winterId);
await f.obj().fill(''); await press(cd.p, 'Save changes to the public listing');
ok('a public listing cannot be saved incomplete', (await refusal(cd.p)).includes('has to stay complete'));

await cd.go('/trainings/' + winterId);
await press(cd.p, 'Cancel training'); await press(cd.p, 'Yes, cancel it'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Cancelled' }).waitFor(); await settle(cd.p);
await pub.go(B + '/learn/trainings/walk-test-winter-session');
{ const t = await pub.p.locator('main').innerText(); ok('cancelled: the public page says so plainly and has no registration button', t.includes('Cancelled') && t.includes('This training was cancelled. It will not take place.') && (await pub.p.locator('main a[href*="teams.microsoft.com"]').count()) === 0); }
await pub.go(B + '/learn/trainings');
ok('cancelled and still ahead: stays in the upcoming list so families see the change', (await pub.p.locator('#lc-trainings-upcoming').locator('xpath=..').innerText()).includes('Walk test: winter session'));
ok('a cancelled listing can no longer be edited', (await cd.p.locator('form.lc-form').count()) === 0 && (await text(cd.p)).includes('can no longer be edited'));
await press(cd.p, 'Archive listing'); await press(cd.p, 'Yes, archive'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Archived' }).waitFor(); await settle(cd.p);
ok('archived: gone from the public pages', (await pub.go(B + '/learn/trainings/walk-test-winter-session')).status() === 404 && !(await (await pub.go(B + '/learn/trainings')).text()).includes('Walk test: winter session'));
ok('archived: the history shows every step and who took it', await text(cd.p).then(t => ['Draft created', 'Published', 'Registration closed', 'Registration reopened', 'Cancelled', 'Archived'].every(s => t.includes(s)) && t.includes('Sample Clinical Director')));

await cd.go('/trainings/seed-training-questions');
ok('a finished training: staff are told caregivers already see it as completed', (await text(cd.p)).includes('end time has passed'));
await pub.go(B + '/learn/trainings');
ok('public: finished and past-cancelled trainings sit under "Past trainings", not "Upcoming"', await pub.p.locator('#lc-trainings-past').locator('xpath=..').innerText().then(async t => t.includes('Questions to bring to your BCBA') && t.includes('Getting ready for transitions') && !(await pub.p.locator('#lc-trainings-upcoming').locator('xpath=..').innerText()).includes('Getting ready for transitions')));
await press(cd.p, 'Mark completed'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Completed' }).waitFor(); await settle(cd.p);
ok('marked completed, and its numbers are still attached', await text(cd.p).then(t => t.includes('Registrations submitted: 20') && t.includes('Attendances: 16') && t.includes('Revision 2')));
await press(cd.p, 'Archive listing'); await press(cd.p, 'Yes, archive'); await cd.p.locator('.lc-staff-head .lc-chip', { hasText: 'Archived' }).waitFor(); await settle(cd.p);
await cd.go('/analytics');
ok('archiving a finished training keeps its numbers in reporting', (await cellOf('seed-training-questions', 'Registrations')) === '20' && (await tile(cd.p, 'Trainings held')) === '4');

console.log('--- Public pages stay clean ---');
for (const u of ['/learn', '/learn/trainings', '/learn/trainings/walk-test-summer-session']) {
  const html = await (await pub.go(B + u)).text();
  ok(`${u}: no participation number, staff address or join link reaches caregivers`, !/Registrations submitted|Attendances|meetup-join|\/learn\/staff\/analytics|\/learn\/staff\/trainings/.test(html));
}
ok('no page errors', errs.length === 0, errs.join(' | '));
console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
await b.close();

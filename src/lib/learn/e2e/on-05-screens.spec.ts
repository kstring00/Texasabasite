import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';

/**
 * Every Learning Center screen, at four widths: nothing spills sideways, every button and link is
 * big enough to tap, every page has one main heading, every form control has a name a screen
 * reader can say, and an automated accessibility scan finds nothing. Then the header rules from the integration brief, keyboard-only use, reduced
 * motion, and what the pages leave behind in the browser.
 */
const WIDTHS: [number, number][] = [[320, 700], [390, 844], [768, 1024], [1366, 900]];
const MODULE = '/learn/modules/understanding-the-abcs-of-behavior';
const LESSON = `${MODULE}/lesson/what-abc-means`;
const CAREGIVER = [
  '/learn', '/learn/library', '/learn/topics/understanding-behavior', '/learn/topics/safety-elopement', MODULE, LESSON,
  '/learn/trainings', '/learn/trainings/example-abcs-live-training', '/learn/trainings/example-cancelled-live-session', '/learn/trainings/example-mornings-live-session',
  '/learn/help', '/learn/privacy', '/learn/accessibility', '/learn/this-page-does-not-exist',
];
const STAFF: Record<string, string[]> = {
  'Sample Clinical Director': [
    '', '/submissions', '/submissions/all', '/submissions/seed-transitions', '/reviews', '/reviews/source/seed-abcs', '/modules', '/modules/seed-group-trainings',
    '/trainings', '/trainings/new', '/trainings/seed-training-mornings', '/trainings/seed-training-team', '/trainings/seed-training-abcs',
    '/analytics', '/analytics?range=ytd', '/analytics?range=custom&from=2020-01-01&to=2020-12-31', '/analytics/reports/seed-training-questions', '/analytics/reports/seed-training-communication', '/this-page-does-not-exist',
  ],
  'Sample RBT': ['', '/submissions', '/submissions/new', '/submissions/seed-transitions', '/submissions/seed-morning-schedules/edit', '/analytics'],
  'Sample Producer': ['', '/modules', '/modules/seed-group-trainings'],
};

/**
 * The axe accessibility scanner. The site's lint tooling already installs it, so the scan runs
 * without adding a package. If a future update removes it, the scan is skipped and says so.
 */
let axeFile: string | null = null;
try {
  axeFile = require.resolve('axe-core/axe.min.js');
} catch {
  axeFile = null;
}
type AxeResult = { passes: unknown[]; violations: { id: string; impact: string | null; nodes: { target: string[] }[] }[] };

async function signIn(context: BrowserContext, who: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto('/learn/staff');
  await page.getByRole('button', { name: new RegExp(`Continue as ${who}`) }).click();
  await page.locator('.lc-shell').waitFor();
  return page;
}

async function resetDemo(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/learn/staff');
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await page.waitForLoadState('load');
  await context.close();
}

/** What is wrong with the page on screen, in words. An empty list means nothing. */
async function problems(page: Page): Promise<string[]> {
  await page.waitForTimeout(350);
  return page.evaluate(() => {
    const out: string[] = [];
    const zone = document.querySelector('[data-zone="learn"]');
    if (!zone) return ['the page is not inside the Learning Center zone'];
    const spill = document.documentElement.scrollWidth - window.innerWidth;
    if (spill > 0) out.push(`spills ${spill}px sideways`);

    const shown = (el: Element) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    const controls = [...zone.querySelectorAll<HTMLElement>('a, button, summary, select, textarea, input:not([type=hidden])')].filter((el) => shown(el) && !el.closest('[inert]'));
    for (const el of controls) {
      // A tick box or radio button is tapped through its whole row. A link inside a sentence follows the text size.
      const target = el.matches('input[type=checkbox], input[type=radio]') ? el.closest('label') ?? el : el;
      if (el.closest('p, .lc-prose, li > strong')) continue;
      const h = target.getBoundingClientRect().height;
      if (h < 43.5) out.push(`tap target ${Math.round(h)}px tall: ${(el.textContent ?? '').trim().slice(0, 30) || el.tagName}`);
    }

    const name = (el: HTMLElement) => {
      const labelled = (el.getAttribute('aria-labelledby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
      const forLabel = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent ?? '' : '';
      return [el.getAttribute('aria-label'), labelled, forLabel, el.closest('label')?.textContent, el.matches('button, a, summary') ? el.textContent : '', el.getAttribute('title')].join(' ').trim();
    };
    for (const el of controls) if (!name(el)) out.push(`no name for a screen reader: <${el.tagName.toLowerCase()} class="${el.className}">`);

    const h1 = document.querySelectorAll('h1').length;
    if (h1 !== 1) out.push(`${h1} main headings (expected 1)`);
    if (!document.documentElement.lang) out.push('page language is not set');
    for (const img of zone.querySelectorAll('img:not([alt])')) out.push(`picture with no description: ${(img as HTMLImageElement).src.slice(-40)}`);
    const ids = [...zone.querySelectorAll('[id]')].map((el) => el.id);
    const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (twice.length) out.push(`the same id used twice: ${[...new Set(twice)].slice(0, 3).join(', ')}`);
    return out;
  }).then(async (out) => {
    if (!axeFile) return out;
    // WCAG 2.2 level A and AA rules, on the Learning Center part of the page.
    await page.addScriptTag({ path: axeFile });
    const result = await page.evaluate(() => {
      const axe = (window as unknown as { axe: { run: (el: Element, opts: object) => Promise<unknown> } }).axe;
      return axe.run(document.querySelector('[data-zone="learn"]')!, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
    }) as AxeResult;
    if (!result.passes?.length) out.push('the accessibility scan ran no rules');
    return [...out, ...result.violations.map((v) => `accessibility scan: ${v.id} (${v.impact}) on ${v.nodes.slice(0, 2).map((n) => n.target[0]).join(' and ')}`)];
  });
}

test.beforeAll(async ({ browser }) => resetDemo(browser));

test('the accessibility scanner is available', () => {
  test.skip(axeFile === null, 'axe-core is not installed, so screens are checked without the automated accessibility scan');
  expect(axeFile).not.toBeNull();
});

test('every caregiver screen, at four widths', async ({ browser }) => {
  for (const [width, height] of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const address of CAREGIVER) {
      await page.goto(address);
      expect.soft(await problems(page), `${address} at ${width}px`).toEqual([]);
    }
    await context.close();
  }
});

test('every staff screen, at four widths, as three roles', async ({ browser }) => {
  for (const [width, height] of WIDTHS) {
    for (const [who, addresses] of Object.entries(STAFF)) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await signIn(context, who);
      for (const address of addresses) {
        await page.goto(`/learn/staff${address}`);
        expect.soft(await problems(page), `${who}: /learn/staff${address} at ${width}px`).toEqual([]);
      }
      await context.close();
    }
  }
  // The sign-in screen itself.
  const context = await browser.newContext({ viewport: { width: 320, height: 700 } });
  const page = await context.newPage();
  await page.goto('/learn/staff');
  expect.soft(await problems(page), 'sign-in screen at 320px').toEqual([]);
  await context.close();
});

test('header and phone bar rules from the integration brief', async ({ browser }) => {
  for (const width of [1280, 1366, 1440, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto('/learn/library');
    const items = page.getByRole('navigation', { name: 'Main' }).locator('> a, > div');
    expect.soft(await items.count(), `${width}px: six header items`).toBe(6);
    const learn = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Learn', exact: true });
    expect.soft(await learn.getAttribute('aria-current'), `${width}px: "Learn" is marked as the current section`).toBe('page');
    const phone = page.locator('header a[href^="tel:"]').first();
    const oneLine = await phone.evaluate((el) => el.getBoundingClientRect().height < parseFloat(getComputedStyle(el).lineHeight || '24') * 2.6 && el.scrollWidth <= el.clientWidth + 1);
    expect.soft(oneLine, `${width}px: the phone number stays on one line`).toBe(true);
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  expect.soft(await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Learn', exact: true }).getAttribute('aria-current'), '"Learn" is not marked current on the home page').toBeNull();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Menu' }).getByRole('link', { name: 'Learning Center' })).toBeVisible();
  await context.close();

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await phone.newPage();
  for (const address of ['/learn', '/learn/library', LESSON, '/learn/trainings', '/learn/staff']) {
    await p.goto(address);
    expect.soft(await p.getByRole('region', { name: 'Quick actions' }).count(), `${address}: the site's phone bar is not shown`).toBe(0);
  }
  await p.goto('/locations/sugar-land');
  await expect(p.getByRole('region', { name: 'Quick actions' })).toBeVisible();
  await phone.close();
});

test('keyboard only: skip link, focus you can see, a lesson, a knowledge check, the staff menu', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const focus = () => page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const row = el.matches('input[type=checkbox], input[type=radio]') ? el.closest('label') : null;
    const ring = (st: CSSStyleDeclaration) => (st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0) || st.boxShadow !== 'none';
    return { text: (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 40), inZone: !!el.closest('[data-zone="learn"]'), visible: ring(s) || (row ? ring(getComputedStyle(row)) : false), id: el.id };
  });

  await page.goto('/learn');
  await page.keyboard.press('Tab');
  expect((await focus())?.text).toBe('Skip to content');
  await page.keyboard.press('Enter');
  expect(page.url()).toContain('#main');

  // Tab through the page: everything that takes focus inside the Learning Center shows that it has it.
  await page.goto('/learn/library');
  const unseen: string[] = [];
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press('Tab');
    const f = await focus();
    if (f?.inZone && !f.visible) unseen.push(f.text);
  }
  expect.soft(unseen, 'focus is always visible on the library page').toEqual([]);

  // A lesson, start to knowledge check, without a mouse.
  await page.goto(LESSON);
  const title = () => page.locator('#lc-step-title').innerText();
  const next = page.locator('.lc-player-bottom .lc-btn-primary');
  // The player reads saved progress first, so the title appears a moment after the page.
  await expect.poll(title).not.toBe('');
  const first = await title();
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#lc-step-title')).not.toHaveText(first);
  expect.soft((await focus())?.id, 'after moving on, focus goes to the new step title').toBe('lc-step-title');
  await page.locator('.lc-player-bottom').getByRole('button', { name: 'Back' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#lc-step-title')).toHaveText(first);
  for (let i = 0; i < 12 && (await page.locator('.lc-kc-option input').count()) === 0; i++) {
    await next.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
  }
  const option = page.locator('.lc-kc-option input').first();
  await option.focus();
  expect.soft((await focus())?.visible, 'an answer choice shows focus').toBe(true);
  await page.keyboard.press('Space');
  await expect(option).toBeChecked();
  await page.getByRole('button', { name: 'Check my answer' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.lc-kc-live')).not.toBeEmpty();
  await expect(next, 'a knowledge check never blocks moving on').toBeEnabled();

  // The staff menu on a phone: opens with Enter, closes with Escape.
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const staff = await signIn(phone, 'Sample Clinical Director');
  const menu = staff.getByRole('button', { name: 'Menu', exact: true });
  // The existing site drops input for about half a second after a page change (fixed on main by the
  // page-transition change). Until that fix is on this branch, wait it out as a person would.
  await staff.waitForTimeout(800);
  await menu.focus();
  await staff.keyboard.press('Enter');
  await expect(staff.getByRole('button', { name: 'Close menu' }).first()).toHaveAttribute('aria-expanded', 'true');
  await expect(staff.getByRole('link', { name: /Reporting/ })).toBeVisible();
  await staff.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');

  // The reporting filter, keyboard only.
  await staff.setViewportSize({ width: 1366, height: 900 });
  await staff.goto('/learn/staff/analytics');
  await staff.waitForTimeout(800);
  await staff.getByLabel('Period', { exact: true }).focus();
  await staff.getByLabel('Period', { exact: true }).selectOption('ytd');
  await staff.getByRole('button', { name: 'Show' }).focus();
  await staff.keyboard.press('Enter');
  await staff.waitForURL(/range=ytd/);
  const unseenStaff: string[] = [];
  for (let i = 0; i < 40; i++) {
    await staff.keyboard.press('Tab');
    const f = await staff.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body || !el.closest('[data-zone="learn"]')) return null;
      const s = getComputedStyle(el);
      return { text: (el.textContent ?? '').trim().slice(0, 40), visible: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none' };
    });
    if (f && !f.visible) unseenStaff.push(f.text);
  }
  expect.soft(unseenStaff, 'focus is always visible on the reporting page').toEqual([]);
  await phone.close();
  await context.close();
});

test('reduced motion: nothing in the Learning Center keeps moving', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const address of ['/learn', '/learn/library', LESSON, '/learn/trainings']) {
    await page.goto(address);
    await page.waitForTimeout(600);
    const moving = await page.evaluate(() =>
      document.getAnimations().filter((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target;
        const timing = a.effect?.getComputedTiming();
        return a.playState === 'running' && !!target?.closest('[data-zone="learn"]') && Number(timing?.duration ?? 0) > 50;
      }).length,
    );
    expect.soft(moving, `${address}: running animations`).toBe(0);
  }
  await context.close();
});

test('what the pages leave in the browser, and where they send things', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const sent: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (/api\/chat|_vercel\/insights\/event|va\.vercel-scripts/.test(u.href)) sent.push(u.pathname);
    if (u.hostname !== 'localhost') sent.push(u.hostname);
  });
  await page.goto('/learn');
  await page.goto(MODULE);
  await page.goto(LESSON);
  await page.locator('.lc-player-bottom .lc-btn-primary').click();
  await page.goto('/learn/trainings/example-abcs-live-training');
  await page.goto('/learn/help');
  const kept = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  // The existing site may keep its own notes (for example which center you picked). The Learning Center may only add keys that start with "lc-".
  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await other.goto('/');
  const siteKeys = await other.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
  await fresh.close();
  const added = [...kept.local, ...kept.session].filter((k) => !siteKeys.includes(k));
  expect.soft(added.filter((k) => !k.startsWith('lc-')), 'storage keys added by /learn that do not start with "lc-"').toEqual([]);
  expect.soft(added.filter((k) => k.startsWith('cg-')), 'Common Ground keys touched').toEqual([]);
  expect.soft(kept.local.some((k) => k.startsWith('lc-progress')), 'lesson progress is kept on this device').toBe(true);
  expect.soft((await context.cookies()).map((c) => c.name), 'caregiver pages set no cookie').toEqual([]);
  expect.soft(sent, 'no chat, no tracking events, nothing sent to another website').toEqual([]);
  await context.close();
});

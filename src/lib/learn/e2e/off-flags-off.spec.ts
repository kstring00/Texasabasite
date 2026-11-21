import { expect, test } from '@playwright/test';

/** With no flags set, the Learning Center must not exist: no page, no link, no file route, no trace in the site map. */
const ADDRESSES = [
  '/learn', '/learn/library', '/learn/topics/understanding-behavior', '/learn/modules/understanding-the-abcs-of-behavior',
  '/learn/modules/understanding-the-abcs-of-behavior/lesson/what-abc-means', '/learn/trainings', '/learn/trainings/example-abcs-live-training',
  '/learn/help', '/learn/privacy', '/learn/accessibility',
  '/learn/staff', '/learn/staff/submissions', '/learn/staff/submissions/new', '/learn/staff/reviews', '/learn/staff/modules',
  '/learn/staff/trainings', '/learn/staff/trainings/new', '/learn/staff/analytics', '/learn/staff/analytics/reports/seed-training-questions',
  '/learn/staff/api/uploads/seed-abcs-asset-v1', '/learn/staff/api/drafts', '/learn/staff/api/reports/export',
];

test('every Learning Center address is "not found"', async ({ request }) => {
  for (const address of ADDRESSES) expect.soft((await request.get(address)).status(), address).toBe(404);
  for (const address of ['/learn/staff/api/uploads', '/learn/staff/api/drafts']) expect.soft((await request.post(address, { data: {} })).status(), `POST ${address}`).toBe(404);
});

test('the site shows no way in', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  expect(await page.locator('a[href="/learn"], a[href^="/learn/"]').count(), 'links to /learn on the home page').toBe(0);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Menu' })).toBeVisible();
  expect(await page.getByRole('navigation', { name: 'Menu' }).getByText('Learning Center').count(), '"Learning Center" in the menu').toBe(0);
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/learn');
});

test('the phone bar still shows on the existing site', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/locations/sugar-land');
  await expect(page.getByRole('region', { name: 'Quick actions' })).toBeVisible();
});

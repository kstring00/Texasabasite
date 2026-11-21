import { expect, test } from '@playwright/test';

/**
 * Every flag is on, but the site believes it is running on Vercel. The staff demo must refuse to
 * open: one closed page whatever the address, no role picker, no data, and no file route.
 */
const STAFF = [
  '/learn/staff', '/learn/staff/submissions', '/learn/staff/submissions/new', '/learn/staff/submissions/all', '/learn/staff/submissions/seed-abcs',
  '/learn/staff/reviews', '/learn/staff/reviews/source/seed-abcs', '/learn/staff/modules', '/learn/staff/modules/seed-group-trainings',
  '/learn/staff/trainings', '/learn/staff/trainings/new', '/learn/staff/trainings/seed-training-mornings',
  '/learn/staff/analytics', '/learn/staff/analytics?range=ytd', '/learn/staff/analytics/reports/seed-training-questions',
];
const LEAKS = /Continue as|Sample Clinical Director|Sample RBT|Reset demo data|Registrations submitted|not actual caregiver attendance|Visual schedules for mornings|SYNTHETIC-|Waiting on you/;

test('every staff address is the same closed page', async ({ request }) => {
  for (const address of STAFF) {
    const html = await (await request.get(address)).text();
    expect.soft(html.includes('Staff sign-in is not set up yet'), `${address}: closed page`).toBe(true);
    expect.soft(LEAKS.test(html), `${address}: nothing from the demo`).toBe(false);
  }
});

test('staff file routes are "not found"', async ({ request }) => {
  for (const address of ['/learn/staff/api/reports/export?range=ytd', '/learn/staff/api/uploads/seed-abcs-asset-v1', '/learn/staff/api/drafts']) expect.soft((await request.get(address)).status(), address).toBe(404);
  for (const address of ['/learn/staff/api/uploads', '/learn/staff/api/drafts']) expect.soft((await request.post(address, { data: {} })).status(), `POST ${address}`).toBe(404);
});

test('the staff sign-in screen cannot be reached in a browser', async ({ page }) => {
  await page.goto('/learn/staff');
  await expect(page.getByRole('heading', { name: 'Staff sign-in is not set up yet' })).toBeVisible();
  expect(await page.getByRole('button', { name: /Continue as/ }).count()).toBe(0);
  expect((await page.context().cookies()).filter((c) => c.name.startsWith('lc-')).length, 'no staff cookie is set').toBe(0);
});

test('caregiver pages show only the labelled sample, and are hidden from search engines', async ({ page, request }) => {
  await page.goto('/learn/trainings');
  await expect(page.getByRole('link', { name: 'Understanding the ABCs of Behavior: live caregiver training', exact: true })).toBeVisible();
  // Listings made in a local staff demo never reach a deployment.
  expect(await page.locator('.lc-tcard').count(), 'training cards').toBe(1);
  expect((await request.get('/learn/trainings/example-mornings-live-session')).status()).toBe(404);
  await page.goto('/learn');
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
  await expect(page.getByText(/Demo mode/).first()).toBeVisible();
});

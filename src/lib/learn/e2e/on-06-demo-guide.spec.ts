import { expect, test, type Page } from '@playwright/test';

/**
 * Follows docs/learning-center/HOW_TO_DEMO.md, step by step, pressing the buttons it names.
 * If a button is renamed or a step stops working, this fails and the guide needs updating.
 */
test('the demo guide can be followed exactly as written', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 850 } });
  const page = await context.newPage();
  const settle = () => page.waitForTimeout(700);
  const click = async (name: string | RegExp, role: 'button' | 'link' = 'button', target: Page = page) => {
    await target.getByRole(role, { name, exact: typeof name === 'string' }).first().click();
    await target.waitForTimeout(700);
  };
  const become = async (who: string) => {
    await click('Switch demo role');
    await click(new RegExp(`Continue as ${who}`));
    await page.locator('.lc-shell').waitFor();
  };

  // Before every demo
  await page.goto('/learn/staff');
  await click('Reset demo data');

  await test.step('1. The caregiver side', async () => {
    await page.goto('/learn');
    await expect(page.getByText(/Demo mode/).first()).toBeVisible();
    await expect(page.getByText('Explore Learning Modules', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Upcoming Live Trainings', { exact: true }).first()).toBeVisible();
    await page.getByText('Explore modules', { exact: true }).first().click();
    await page.waitForURL(/\/learn\/library/);
    await page.getByLabel('Search learning topics').fill('behavior');
    await click('Understanding the ABCs of Behavior', 'link');
    await click('Start module', 'link');
    await expect.poll(() => page.locator('#lc-step-title').innerText()).not.toBe('');
    for (let i = 0; i < 12 && (await page.getByRole('button', { name: 'Check my answer' }).count()) === 0; i++) await click('Next');
    await page.locator('summary', { hasText: 'Lesson outline' }).first().click();
    await page.locator('.lc-kc-option input').first().check();
    await click('Check my answer');
    await page.goto('/learn');
    await click('Live Trainings', 'link');
    await click(/View details/, 'link');
    await expect(page.getByText('Currently enrolled families only').first()).toBeVisible();
  });

  await test.step('2. A staff member submits a PowerPoint', async () => {
    await page.goto('/learn');
    await click('Staff sign-in', 'link');
    await click(/Continue as Sample RBT/);
    // A synthetic file stands in for demo.pptx.
    const file = await (await context.request.get(`${baseURL}/learn/staff/api/uploads/seed-abcs-asset-v1`)).body();
    await click('Submit a PowerPoint', 'link');
    await expect(page.getByRole('heading', { name: 'Title and summary' })).toBeVisible();
    await page.getByLabel('Title', { exact: true }).fill('Demo guide: calm mornings');
    await page.getByLabel('Short summary').fill('A general presentation written for the demo, with made-up examples only.');
    await click('Save and continue');
    await expect(page.getByRole('heading', { name: 'Topic and tags' })).toBeVisible();
    await page.getByLabel('Routines & Daily Living').check();
    await click('Save and continue');
    await expect(page.getByRole('heading', { name: 'Objectives and audience' })).toBeVisible();
    await page.getByLabel('Objective 1').fill('Describe one general idea for a calmer morning.');
    await page.getByLabel('Who is this for?').selectOption('All caregivers');
    await click('Save and continue');
    await expect(page.getByRole('heading', { name: 'PowerPoint file' })).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({ name: 'demo.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', buffer: file });
    await expect(page.getByText('File uploaded and checked.')).toBeVisible();
    await click('Save and continue');
    await expect(page.getByRole('heading', { name: 'Checklist' })).toBeVisible();
    const ticks = page.locator('.lc-wizard-card .lc-check-row input[type="checkbox"]');
    await expect(ticks).toHaveCount(5);
    for (const box of await ticks.all()) await box.check();
    await click('Save and continue');
    await expect(page.getByRole('heading', { name: 'Review and submit' })).toBeVisible();
    await click('Submit for clinical review');
    await expect(page.getByText('Submitted for clinical review. This version is now locked.')).toBeVisible();
  });

  await test.step('3. The first approval: the PowerPoint', async () => {
    await become('Sample BCBA');
    await click(/^Reviews/, 'link');
    await expect(page.getByText(/Gate 1 · PPTX sources/)).toBeVisible();
    await page.locator('.lc-queue-list > li', { hasText: 'Demo guide: calm mornings' }).getByRole('link', { name: /Open review/ }).click();
    await settle();
    const ticks = page.locator('.lc-decision .lc-check-row input');
    await expect(ticks).toHaveCount(7);
    for (const box of await ticks.all()) await box.check();
    await click('Approve source');
    await click('Yes, approve');
    await page.waitForURL(/done=approved/);
  });

  await test.step('4. The module is made and brought in', async () => {
    await become('Sample Producer');
    await click(/^Modules/, 'link');
    await page.locator('section[aria-labelledby="lc-mod-ready"] .lc-queue-list > li', { hasText: 'Demo guide: calm mornings' }).getByRole('link', { name: /Open/ }).click();
    await settle();
    await click('Collect for production');
    await expect(page.getByRole('heading', { name: 'Import the module' })).toBeVisible();
    await click('Fill in the synthetic sample package');
    await click('Check and import');
    await expect(page.getByText('Module draft').first()).toBeVisible();
    await click('Send for final review');
    await expect(page.locator('.lc-versions .lc-chip', { hasText: 'Final review' })).toBeVisible();
  });

  await test.step('5. The second approval: the finished module', async () => {
    await become('Sample Clinical Director');
    await click(/^Reviews/, 'link');
    await click(/Gate 2 · Final modules/, 'link');
    await page.locator('.lc-queue-list > li', { hasText: 'How group trainings work' }).getByRole('link', { name: /Open review/ }).click();
    await settle();
    const review = page.url();
    await click(/Preview in the lesson player/, 'link');
    await expect(page.locator('.lc-player, .lc-preview').first()).toBeVisible();
    await page.goto(review);
    const ticks = page.locator('.lc-decision .lc-check-row input');
    await expect(ticks).toHaveCount(7);
    for (const box of await ticks.all()) await box.check();
    await click('Approve final module');
    await click('Yes, approve');
    await page.waitForURL(/done=approved/);
  });

  await test.step('6. Publishing', async () => {
    await click(/^Modules/, 'link');
    await page.locator('section[aria-labelledby="lc-mod-approved"] .lc-queue-list > li').getByRole('link', { name: /Open/ }).click();
    await settle();
    await click('Publish');
    await click('Yes, publish');
    await expect(page.locator('.lc-versions .lc-chip-solid')).toBeVisible();
    const library = await context.newPage();
    await library.goto('/learn/library');
    await expect(library.getByRole('link', { name: 'How group trainings work', exact: true }).first()).toBeVisible();
    await click('Withdraw');
    await page.getByLabel('Why is it being withdrawn?').fill('Shown as part of the demo.');
    await click('Yes, withdraw');
    await library.reload();
    await expect(library.getByRole('link', { name: 'How group trainings work', exact: true })).toHaveCount(0);
    await library.close();
  });

  await test.step('7. A training listing', async () => {
    await click(/^Trainings/, 'link');
    await page.locator('.lc-queue-list > li', { hasText: 'Visual schedules for mornings: live session' }).getByRole('link', { name: /Open/ }).click();
    await settle();
    const link = page.getByLabel(/Microsoft Teams registration link/);
    await link.fill('https://teams.microsoft.com/l/meetup-join/example');
    await click('Save changes to the public listing');
    await expect(page.locator('.lc-field-error').first()).toContainText('joining a meeting');
    await link.fill('https://events.teams.microsoft.com/event/example-not-a-real-event');
    await click('Save changes to the public listing');
    await expect(page.locator('.lc-saved', { hasText: 'Saved.' })).toBeVisible();
    await expect(page.getByText(/Caregivers see a “Request registration” button/)).toBeVisible();
  });

  await test.step('8. Reporting', async () => {
    await click(/^Reporting/, 'link');
    await expect(page.getByText('Illustrative demo data — not actual caregiver attendance')).toBeVisible();
    await page.getByLabel('Period', { exact: true }).selectOption({ label: 'Year to date' });
    await click('Show');
    await page.waitForURL(/range=ytd/);
    await expect(page.locator('[data-lc-tile="Registrations submitted"] .lc-metric-note')).toContainText('From 5 of 6 finished trainings');
    await expect(page.getByText('Not yet available').first()).toBeVisible();
    await page.locator('[data-lc-row="seed-training-questions"]').getByRole('link', { name: /Enter numbers/ }).click();
    await settle();
    await page.getByLabel('Registrations submitted', { exact: true }).fill('20');
    await page.getByLabel('Approved registrations', { exact: true }).fill('18');
    await page.getByLabel('Attendances', { exact: true }).fill('15');
    await click('Save numbers');
    await page.waitForURL(/saved=numbers/);
    await expect(page.getByRole('heading', { name: 'Registrations by center' })).toBeVisible();
    await expect(page.getByText('Other / not displayed').first()).toBeVisible();
    const download = page.getByRole('link', { name: 'Download totals (CSV)' });
    expect((await context.request.get(`${baseURL}${await download.getAttribute('href')}`)).status()).toBe(200);
  });

  await context.close();
});

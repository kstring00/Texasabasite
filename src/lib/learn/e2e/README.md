# Browser tests

Tests that open the site in a real browser and click through it the way a person would, including everything that must be refused.

```
npm run test:e2e            every setup, one after another (about 15 minutes)
npm run test:e2e -- on      one setup only: off, vercel or on
```

The first time on a new machine, download the test browser once: `npx playwright install chromium`.

## The three setups

The Learning Center behaves differently depending on its three settings, and the main one is read when the site is built. So each setup builds the site again and starts it on port 3100.

| Setup | Settings | What must be true | Files |
|---|---|---|---|
| `off` | none | The Learning Center does not exist: every address is "not found", no link, nothing in the site map | `off-*.spec.ts` |
| `vercel` | all three on, running as if on Vercel | Every staff address is one closed page. Staff file routes are "not found". Caregiver pages show only the labelled sample | `vercel-*.spec.ts` |
| `on` | all three on, local machine | The whole caregiver side and staff demo work, and every refusal holds | `on-*.spec.*` |

The settings are set by the test command itself, so what is in `.env.local` does not matter.

## The `on` files

| File | What it walks through |
|---|---|
| `on-01-caregiver` | Library, search, module, lesson player, knowledge check, saved progress, trainings, help |
| `on-02-staff-submission` | Sign-in, what each role can see, the six-step PowerPoint form, uploads, drafts, revisions |
| `on-03-review-publish` | Both approvals, the independence rules, producer import, publish, withdraw |
| `on-04-trainings-reporting` | Listings from draft to archive, link checking, entering and correcting numbers, small-number hiding, the download |
| `on-05-screens` | Every screen at four widths, with an automated accessibility scan of each. Header rules, keyboard-only use, reduced motion, what is left in the browser |
| `on-06-demo-guide` | `docs/learning-center/HOW_TO_DEMO.md`, step by step |

The first four are long scripted walks. Each prints `[checks] name: N` with the number of checks it made. A failed check does not stop the walk, so one run lists everything that is wrong.

## Things to know

- **Your own demo data is safe.** The tests keep their data in `.learn-demo/e2e/`. A demo you have set up by hand in `.learn-demo/` is not touched.
- **The tests rebuild the site.** Afterwards the build left behind is the `on` build. If you were running the site with different settings, run `npm run build` again before `npm start`.
- **Nothing real is used.** Fictional roles, synthetic files, made-up numbers. No tour request, no email, no call to Microsoft Teams.
- Screenshots of any failure are saved under `.learn-demo/test-results/`.
- **The accessibility scan** uses the axe scanner that the site's lint tooling already installs. It checks WCAG 2.2 level A and AA rules. It finds many common problems, but it cannot prove a page is usable: that still needs a person with a screen reader.

## Other tools

`../tools/review-sheet.mts` rebuilds `docs/learning-center/REVIEW_SHEET.md` from the source, so the sheet cannot drift from what the pages say:

```
npx vite-node -c src/lib/learn/vitest.config.ts src/lib/learn/tools/review-sheet.mts
```

`../tools/site-shots.mjs` takes full-page pictures of the existing site's pages, for a before-and-after comparison. See the comment at the top of that file.

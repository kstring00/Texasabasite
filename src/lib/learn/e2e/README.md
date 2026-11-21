# Scripted walks

Browser scripts that click through the Learning Center the way a person would, including the things that must be refused. They are plain Node scripts that use Playwright.

They need the site running locally with all three flags on (see `.env.example`):

```
npm run build && npx next start -p 3000
node src/lib/learn/e2e/caregiver-walk.mjs
node src/lib/learn/e2e/staff-walk.mjs
node src/lib/learn/e2e/review-publish-walk.mjs
node src/lib/learn/e2e/trainings-reporting-walk.mjs
```

Each prints PASS or FAIL per check and ends with a total. The staff walks press "Reset demo data" first, so they wipe the local demo store in `.learn-demo/`. They use synthetic files and fictional roles only.

`../tools/review-sheet.mts` rebuilds `docs/learning-center/REVIEW_SHEET.md` from the source, so the sheet cannot drift from what the pages say:

```
npx vite-node -c src/lib/learn/vitest.config.ts src/lib/learn/tools/review-sheet.mts
```

# Learning Center: where the build stands

Written at the end of phase 5. Plain words, for Kyle, the Clinical Director and IT.

**In one paragraph.** The Caregiver Learning Center is built as a working demo inside the existing Texas ABA Centers site, under `/learn`. It is switched off by default, and with it off the existing site is unchanged. The caregiver side can be shown on a Vercel preview. The staff side only runs on a local machine, with fictional roles and made-up data. The code is merged into `main` with every setting off, so the public site looks and works exactly as before. Nothing is switched on for the public, and nothing is clinically approved. It is ready to be shown and reviewed. It is not ready for real families, real staff or real files.

How to show it: `HOW_TO_DEMO.md`. What was tested: `TEST_RESULTS.md`. What needs sign-off: `IT_APPROVAL_CHECKLIST.md`. Every sentence to review: `REVIEW_SHEET.md`.

## Done and working

**For caregivers**

- Home page with both paths side by side: learning modules and live trainings.
- Learning Library with search and topic filters, six topic pages, a module overview page.
- Guided lesson player: where you are, Back and Next, a lesson outline, slides with text descriptions, knowledge checks with specific feedback and no score, a completion screen.
- Progress saved only in the visitor's own browser. No login. No account. Nothing about a child is asked anywhere.
- Live Trainings list and detail pages, in Central Time, marked "Currently enrolled families only". A registration button appears only for a checked Microsoft Teams registration link. Past and cancelled trainings are shown as such.
- Help, a draft privacy note, a draft accessibility statement, a "not available" page and an error page.
- One sample module and one example training, shown only when the demo-content setting is on, labelled as samples, and hidden from search engines.

**For staff who contribute (local demo)**

- A fictional role picker in place of sign-in. Five roles: RBT, Apprentice, BCBA, Clinical Director, Producer.
- A six-step PowerPoint submission form with autosave. Files are checked on the server and kept in a private folder on the local machine.
- "My submissions" with exact status, reviewer feedback, version history, and a way to revise after changes are requested.

**For clinical leadership and production (local demo)**

- Two separate approvals on two separate records: Gate 1 for the source PowerPoint, Gate 2 for the finished module.
- Three independence rules, all switched on: nobody reviews their own submission, the two approvals come from two different people, and whoever imported a module cannot approve it.
- A producer collects an approved source and brings in the finished module as a package. The package is checked before anything is saved.
- A preview of the module in the real lesson player, for reviewers.
- Publish and withdraw, by the Clinical Director role only. A module needs both approvals to be published. A withdrawn module disappears from the caregiver pages at once and stays in the staff history.

**For trainings and reporting (local demo)**

- Website listings for Microsoft Teams trainings: draft, publish, close and reopen registration, cancel, mark completed, archive.
- Only a Teams registration address is accepted. A link for joining a meeting is refused and never stored.
- Totals typed in by staff after each training. Whole numbers only. No field for a person.
- A reporting page with five summary figures, a chart with a table view, topics, a row per training, registrations by center and by source, definitions, a spreadsheet download and a print layout.
- A number not entered shows "Not yet available", never zero. A count under 5 for one center or source is never shown. Corrections need a reason and keep the earlier entry.

**Safety rails**

- Three settings control everything. All are off unless set. The staff demo refuses to run anywhere on Vercel. Demo content refuses to show on the live production site.
- Every staff page, button and file route checks the role on the server. Hiding a button is never the check.
- Its own styles and storage names. It does not use the site's chat assistant, sends no tracking events, and does not touch Common Ground's saved data.

**Tests and documents**

- 147 unit tests, and browser tests that run with `npm run test:e2e` in three setups: switched off, as if on Vercel, and the full local demo.
- This file, `TEST_RESULTS.md`, `HOW_TO_DEMO.md`, the review sheet, the IT checklist, and a Learning Center section in the main README.

## Partly done

| Item | What exists | What is missing |
|---|---|---|
| Accessibility | Automated scans, keyboard-only tests, small-screen and tap-size checks, reduced motion. All pass. | Nobody has yet tested with a real screen reader or on real phones. An automated scan cannot prove a page is usable. |
| Wording | Every line is written and listed on the review sheet. | All of it is draft. None is approved. |
| Look and feel | Compared against reference images 01 and 03 during phases 0 and 1. | The Clinical Director and Kyle have not signed off the look. References 05 to 07 do not exist. |
| Reviewer assignment | Any person in a reviewer role can pick up a review. | Assigning a named reviewer to a named item. |
| Presenter on a listing | One optional presenter name, only if staff confirm the presenter agreed. | A second presenter. |

## Not started

- Notices to staff, such as an email when changes are requested.
- A staff settings page, and a demo role for IT.
- Registration deadline and number of seats on a listing. Nothing reliable supplies them yet, and a guessed number must never be shown.
- Page-view or module-completion figures in reporting. No approved, privacy-preserving analytics exists for them.
- Other languages. The content format has room for them.
- Converting a PowerPoint into a module. By design this happens outside the website, after Gate 1. `CLAUDE_PPTX_CONVERSION_PROMPT.md` is for that later job.

## Waiting on the organization

None of these can be built until someone outside the project decides or provides something. They are listed in full in `IT_APPROVAL_CHECKLIST.md`.

| Needed | Who |
|---|---|
| Real staff sign-in through the organization's approved system | IT |
| Scanning of every uploaded file, and private storage for files | IT |
| A database for submissions, reviews, listings and totals. Today they live in one file on a local machine. | IT |
| The Teams registration form asking every family which center their child attends. Per-center numbers depend on it. | Clinical Director, IT |
| Confirmation of the Teams event type, licences, and registration addresses for this tenant | IT |
| Who may review, publish, manage listings, and enter and see numbers | Clinical Director |
| The three reviewer-independence rules confirmed or changed | Clinical Director |
| The small-number minimum of 5 confirmed | Compliance |
| Clinical review of every module before any family sees it. The sample modules are not approved. | Clinical Director |
| Approved wording for the privacy note, the accessibility statement and the education statement | Clinical Director, compliance |
| Approval to run on the same site and domain, and of site-wide page-view analytics covering `/learn` | IT |

## The acceptance tests from the master prompt

"Tested by" names the test file in `src/lib/learn/`.

| Area | Result | Tested by |
|---|---|---|
| Caregiver: both paths on the landing page, no sideways scrolling at 320 pixels, search and open a module with no login | Pass | `e2e/on-01-caregiver`, `e2e/on-05-screens` |
| Caregiver: player shows position, Back and Next, outline. Knowledge check gives feedback, allows retries, never blocks | Pass | `e2e/on-01-caregiver`, `e2e/on-05-screens` |
| Caregiver: progress resumes after a refresh, kept on the device only | Pass | `e2e/on-01-caregiver`, `progress.test` |
| Caregiver: screen-reader names and keyboard use | Pass in automated tests. Not yet tried by a person with a screen reader. | `e2e/on-05-screens` |
| Caregiver: linked trainings only, "currently enrolled families only", registration never a join link, nothing asked about a child | Pass | `e2e/on-01-caregiver`, `e2e/on-04-trainings-reporting`, `registration.test` |
| Contributor: own submissions and status, valid submissions only, clear file errors, cannot self-approve or publish, revise after changes requested | Pass | `e2e/on-02-staff-submission`, `staff/submissions.test` |
| Reviewer and producer: two separate approvals and records, version, checklist and preview, producer import, no publishing without the final approval, withdrawn module gone from caregiver pages, authority checked on the server | Pass | `e2e/on-03-review-publish`, `staff/pipeline.test` |
| Trainings: draft, publish, close, cancel, archive. Registration link kept apart from any join link. Central Time with daylight saving. Empty states. A missing or bad link cannot be clicked | Pass | `e2e/on-04-trainings-reporting`, `staff/listings.test`, `time.test` |
| Reporting: totals only, correct sums and rate, small counts hidden including by subtraction, source and revision history visible, demo figures clearly marked | Pass | `e2e/on-04-trainings-reporting`, `staff/reports.test` |
| Look: matches reference 01, soft colour fields like reference 03, caregiver side calmer than staff side, readable everywhere, reduced motion honoured | Checked by eye during the build, and reduced motion by test. Needs Kyle's and the Clinical Director's eye. | `e2e/on-05-screens` for reduced motion |

## The integration checks from the brief

| Check | Result |
|---|---|
| Lint, typecheck, content check and build pass | Pass |
| Switched off: `/learn` and `/learn/staff` are "not found", no menu entry, existing pages unchanged pixel for pixel | Pass. See `TEST_RESULTS.md` |
| Only the existing files the brief allows were edited. `src/app/globals.css` untouched | Pass |
| No Learning Center style outside its folders, and no site style inside them | Pass |
| The settings are unit-tested, including "staff demo refused on Vercel" and "demo content refused on production" | Pass |
| The site's phone bar never shows under `/learn` | Pass |
| "Learn" is the sixth header item, marked current on `/learn` pages. The phone number stays on one line at 1280, 1366, 1440 and 1920 wide. The menu lists "Learning Center" | Pass |
| Nothing under `/learn` uses the chat assistant, tracking events or Common Ground's saved data | Pass |

## Existing files that were edited, and why

| File | Why |
|---|---|
| `src/components/site/Header.tsx` | Adds the "Learn" item, only when the Learning Center is switched on |
| `src/components/site/MobileBar.tsx` | Hides the phone bar on Learning Center pages |
| `tailwind.config.ts` | Adds the Learning Center's colour names |
| `src/app/robots.ts`, `src/app/sitemap.ts` | Keeps staff pages out of search engines, and lists caregiver pages in the site map only when the Learning Center is on and no sample content is showing |
| `src/app/layout.tsx` | Stops staff page views being counted by site analytics |
| `package.json` and its lock file | Adds `zod`, `vitest`, `@playwright/test` and the two test commands |
| `.env.example`, `.gitignore`, `README.md` | Documents the three settings, ignores the local demo folder, adds one README section |

## Things to know before going further

- **The site's Next.js version has published security advisories.** `npm audit` reports them against `next@15.5.15`, with fixes in `15.5.29`. This is the whole site, not the Learning Center, and the build rules for this project said not to upgrade Next. It needs its own small change on `main`.
- **The demo store is one file.** It is fine for one person on one laptop. It is not safe for several people at once.
- **The demo sign-in cookie** is signed and limited to staff pages, but it is not real authentication and must never be treated as such.
- **`zod` was upgraded** from version 3 to 4.6.7 during phase 5 because of a published advisory. It is used only to check module packages.

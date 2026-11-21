# Learning Center: test results

Written at the end of phase 5, November 2026. Every command below was run on the `feat/learning-center` branch, and the result is what it printed.

## Summary

| Check | Command | Result |
|---|---|---|
| Code style | `npm run lint` | Pass, no warnings |
| Types | `npm run typecheck` | Pass |
| Placeholder text and fake phone numbers | `npm run check:content` | Pass |
| Build | `npm run build` | Pass |
| Unit tests | `npm test` | 147 of 147 pass |
| Browser tests, switched off | `npm run test:e2e -- off` | 3 of 3 pass |
| Browser tests, as if on Vercel | `npm run test:e2e -- vercel` | 4 of 4 pass |
| Browser tests, full local demo | `npm run test:e2e -- on` | 12 of 12 pass, 291 scripted checks inside the four walks |
| Automated accessibility scan | part of `npm run test:e2e -- on` | 169 screens, no findings |
| Existing site unchanged when switched off | `node src/lib/learn/tools/site-shots.mjs` | 86 of 86 pictures identical to `main` |

The final run of every setup passed completely. It was made after `main`, including the tour form and page-transition fixes, had been merged into the Learning Center branch.

**One thing that is not a test failure.** Two older Common Ground pages download their fonts from Google while the site is being built. In one run that download failed twice in the test machine and those builds stopped. Google's font server was reachable, the next builds succeeded, and Vercel's own builds have not shown it. It is unrelated to the Learning Center, which downloads no fonts.

**How the browser tests got there.** Five earlier full runs during phase 5 each ended with one failed check out of about 300. Each was looked into before it was accepted as fixed:

| What failed | Cause | What was done |
|---|---|---|
| Three different checks, one per run, each reading a page a moment too early | The four long walks left their browser windows open, so the machine was crowded and slow by the time later tests ran | Each walk now closes its windows. Tests wait for the page itself, not for a fixed pause. The run fell from about 18 minutes to 10 |
| A key press on the staff menu was ignored | The existing site ignores clicks and key presses for about half a second after every page change. A separate pull request to `main` fixes it (`fix/tour-form-and-page-transitions`) | That fix is now part of this code. The tests still pause briefly after a page change, as a person naturally would |
| The browser reported a React "hydration" error once, during the reporting walk | Not found. It did not happen again in four repeats of that walk, or in 196 loads of the pages it visits. React recovers from this error by redrawing the page, so nothing visible breaks | The tests now record which page an error came from. After the page-transition fix was merged in, a full run of every setup reported no page error |

## Unit tests

`npm test` runs 14 files in `src/lib/learn/`. They test the rules directly, with no browser.

| File | Tests | What it covers |
|---|---|---|
| `flags.test` | 8 | The three settings, including "staff demo refused on Vercel" and "demo content refused on production" |
| `manifest.test` | 8 | Checking a module package: required parts, plain text only, at least one correct answer |
| `registration.test` | 5 | Only a Microsoft Teams registration address is accepted. Join links are refused |
| `time.test` | 12 | Central Time, both sides of the clock change, the skipped hour in March |
| `trainings.test` | 4 | What a caregiver sees for each listing status, and the order of the list |
| `progress.test` | 8 | Saved progress, and what happens when a module changes |
| `search.test` | 3 | Library search |
| `staff/roles.test` | 6 | What each role may do |
| `staff/session.test` | 4 | The demo sign-in cookie cannot be forged or altered |
| `staff/pptx.test` | 5 | File checks: wrong type, old `.ppt`, too large, not really a PowerPoint |
| `staff/submissions.test` | 17 | Drafts, submitting, locked versions, revisions, who can see what |
| `staff/pipeline.test` | 21 | Both approvals, the independence rules, import, publish, withdraw |
| `staff/listings.test` | 16 | Listing lifecycle, link checking, Central Time storage |
| `staff/reports.test` | 30 | Entering and correcting numbers, sums and rate, small-number hiding, the download |

## Browser tests

`npm run test:e2e` opens the site in a real browser. It builds and runs the site three times, once per setup.

**Switched off (no settings)**

| Test | Result |
|---|---|
| All 22 Learning Center addresses, and both upload routes, are "not found" | Pass |
| No link to `/learn` on the home page, none in the menu, none in the site map | Pass |
| The site's phone bar still shows on existing pages | Pass |

**As if on Vercel (every setting on)**

| Test | Result |
|---|---|
| All 15 staff addresses show the same closed page, with nothing from the demo | Pass |
| The five staff file routes are "not found" | Pass |
| No role picker, and no staff cookie is set | Pass |
| Caregiver pages show only the one labelled sample, and are hidden from search engines | Pass |

**Full local demo (every setting on)**

| File | What it walks through | Result |
|---|---|---|
| `on-01-caregiver` | Library, search, module, lesson player, knowledge check, saved progress, trainings, help | Pass, 44 checks |
| `on-02-staff-submission` | Sign-in, what each role sees, the six-step form, uploads, drafts, revisions | Pass, 62 checks |
| `on-03-review-publish` | Both approvals, independence rules, import, publish, withdraw | Pass, 73 checks |
| `on-04-trainings-reporting` | Listings, link checking, numbers, corrections, small-number hiding, the download | Pass, 112 checks |
| `on-05-screens` | 169 screens at 320, 390, 768 and 1366 wide. Header rules. Keyboard only. Reduced motion. What is left in the browser | Pass, 7 tests |
| `on-06-demo-guide` | `HOW_TO_DEMO.md`, every step as written | Pass |

## Things that must be refused, and are

Each of these is tried by a test, nearly all of them in the browser. "Session swap" means a page was opened by someone allowed, then the browser was switched to another role before the button was pressed, so only the server could stop it.

| Attempt | What happens |
|---|---|
| Any Learning Center address with the settings off | "Not found" |
| Any staff address on Vercel, with every setting on | One closed page. File routes "not found" |
| RBT or apprentice opens reviews, modules, trainings or reporting | "Not found", and no menu item |
| RBT opens someone else's submission | "Not found" |
| Uploading an old `.ppt` file or a damaged file | Refused with a plain reason. Nothing stored |
| Uploading a file over 40 MB (unit test) | Refused |
| Uploading to someone else's submission, or from another website | Refused |
| RBT downloading someone else's file | Refused |
| Editing a version after it was submitted | Refused. The version is locked |
| Approving your own submission | Refused at both gates |
| The same person giving both approvals | Refused |
| The person who imported a module approving it | Refused |
| RBT, apprentice or producer approving or publishing (session swap) | Refused |
| Publishing without both approvals, including a tampered request | Refused |
| A module package that calls itself approved, or is not valid | Refused, with the list of problems |
| A withdrawn module's address under `/learn` | "Not available" |
| A join link, a non-Teams link or an `http` link on a listing | Refused beside the field. Nothing saved |
| Publishing an unfinished listing | Refused, with what is missing |
| Managing a listing or saving numbers without the role (session swap) | Refused |
| A name typed into a number box | Refused |
| Approved registrations higher than registrations submitted | Refused |
| A center split that adds up to more than the total | Refused |
| A correction with no reason, or with an email address or phone number in the reason | Refused |
| Saving from an out-of-date tab | Refused, "changed somewhere else" |
| Pressing a button after the session has ended | Refused, "Your demo session has ended" |
| The download, for anyone without the reporting role | "Not found" |

## The existing site, with the Learning Center switched off

The integration brief asks for before and after pictures of four pages. This check covers 43 pages, each at 1440 and 390 wide, 86 pictures in all, compared pixel by pixel with `main`.

- 86 of 86 are identical.
- One page, `/families/care-plan`, can come out with its list of choices one pixel higher or lower between two captures of the very same build. Comparing `main` with itself shows the same thing. Captured again by itself three times from each build, it matched exactly every time.
- Only the existing files the brief allows were changed. `src/app/globals.css` is untouched.

## Accessibility

**What was checked, and passed**

- An automated scan of every screen against WCAG 2.2 level A and AA rules, at four widths.
- Nothing spills sideways at 320 pixels wide.
- Every button, link and form control is at least 44 pixels tall, or is a link inside a sentence.
- Every page has exactly one main heading and a set language. Every form control has a name a screen reader can say.
- Keyboard only: the skip link works, focus is always visible, a lesson and a knowledge check can be completed, the staff menu opens and closes, the reporting filter works.
- On the listing form and the numbers form, after a refusal, focus moves to the first field that needs attention and nothing typed is lost.
- With reduced motion on, nothing in the Learning Center keeps moving.
- The chart has a text description and a table view with the same figures.

**Limits. Please read these.**

- An automated scan finds many common problems. It cannot tell whether a page makes sense when read aloud.
- Nobody has tested with a real screen reader such as VoiceOver, TalkBack or NVDA.
- Nobody has tested on real phones or tablets. All testing used one desktop browser engine (Chromium) at phone, tablet and laptop sizes. Safari and Firefox were not tested.
- Reading level was aimed at plain language but not measured.
- The accessibility statement on the site is a draft and makes no certified claim.

## Privacy checks

- Caregiver pages set no cookie and send nothing to another website.
- The only things saved in a caregiver's browser start with `lc-`. Common Ground's saved data is not touched.
- No chat request and no tracking event is sent from any `/learn` page. Staff page views are dropped from site analytics.
- The reporting store has no field for a person. A test confirms that extra fields sent by a browser, such as names or an email address, are not stored.
- No test sent a tour request, an email or a call to Microsoft Teams.

## Dependency audit

`npm audit --omit=dev` reports published advisories against three packages that come with the existing site: `next@15.5.15`, and `postcss` and `sharp` inside it. The fix it offers is `next@15.5.29`. That is outside this project's rules, which said not to upgrade Next, and it affects the whole public site. It is listed in the IT checklist as its own item.

`zod`, which this project added, also had an advisory. It was upgraded to 4.6.7 in phase 5, and a module package is now refused if it is far larger than a real one.

## Not tested

- Real sign-in, real file storage, real file scanning. None exists yet.
- Several people using the staff side at the same moment. The demo store is one file on one machine.
- Speed under load.
- A real Microsoft Teams registration page. The tests use an address in the right form that leads nowhere.
- The caregiver side on an actual Vercel preview with the settings on. That needs two settings added in Vercel, which this project did not change. The "as if on Vercel" tests run locally with the same switch Vercel sets.

## Running the tests yourself

```
npm install
npx playwright install chromium     (once per machine)
npm run lint && npm run typecheck && npm run check:content && npm test
npm run test:e2e
```

The browser tests take about 15 minutes, keep their data apart from yours, and rebuild the site. Run `npm run build` again afterwards before `npm start`. More detail is in `src/lib/learn/e2e/README.md`.

# INTEGRATION BRIEF
## Building the Caregiver Learning Center into the existing Texas ABA Centers site

`MASTER_PROMPT.md` was written as if the Learning Center were a new, standalone website. It is not. It is a new section of a site that already exists, is already designed, and is already deployed. This brief says how the master prompt lands in this repo. Read it first.

---

## 1. Reading order and who wins

Read in this order, fully, before writing code:

1. `INTEGRATION_BRIEF.md` (this file)
2. `MASTER_PROMPT.md`
3. `DESIGN_REFERENCE_GUIDE.md`, then every image in `references/`
4. The host site's own `README.md` and `docs/REDESIGN-NOTES.md`, to understand the site you are building inside. Their design rules apply to the host site, not to the Learning Center.

Not yet: `CLAUDE_PPTX_CONVERSION_PROMPT.md` is for a later job. `IT_APPROVAL_CHECKLIST.md` already exists; update it at the end, do not recreate it.

| Question | The answer comes from |
|---|---|
| What does the product do? What is safe, private, clinically in scope? Who can approve what? | `MASTER_PROMPT.md`. Nothing here weakens it. |
| Where do files and routes go? What may change in the existing site? Branches, flags, deploys? | This brief |
| What does it look like? | `DESIGN_REFERENCE_GUIDE.md` |

If something in the repo contradicts this brief, trust the repo, say so in your plan, and carry on.

---

## 2. The host repo

Checked on November 18, 2026 against branch `main` (commit `67a5240`), which matches the live preview at `siteforthetexas.vercel.app`.

- **Repo:** `kstring00/Texasabasite`. **Work from `main`.** GitHub's default branch is `claude/optimistic-euler-kr120e`, which is older. Before you start, confirm you are on a tree that contains `src/app/locations/sugar-land/inside/page.tsx`. If it is missing, you are on the wrong branch.
- **Stack:** Next.js 15.5 App Router, React 19, TypeScript (strict), Tailwind CSS 3.4, `src/` directory, `@/*` path alias. Already installed and to be reused: `lucide-react`, `framer-motion`, `chart.js` with `react-chartjs-2`, `clsx`, `tailwind-merge`, `@vercel/analytics`.
- **Design system:** "Open World". Tokens are CSS variables on `:root` in `src/app/globals.css`, stored as RGB triplets that Tailwind reads. Fonts are Bricolage Grotesque, DM Sans and Instrument Serif, self-hosted in `public/fonts`.
- **Zones:** Common Ground is mounted at `/families` inside `<div data-zone="families">`, with a sticky sub-nav (`CgSubNav`) under the site header. Copy this pattern.
- **Chrome:** the root layout wraps every page in `Header`, `Footer` and `MobileBar`. The header hides on scroll down and exposes `--nav-offset` for sticky elements below it.
- **Data:** site facts live in `src/data/*.ts`. The house rule is that missing content hides its section and nothing is faked. The master prompt asks for the same thing.
- **Checks that exist:** `npm run lint`, `npm run typecheck`, `npm run check:content`, `npm run build`. There is no test runner yet.
- **There is no database and no authentication in this repo.**

---

## 3. Branch and deploy rules

- Create `feat/learning-center` from `main`. Commit in small steps, one phase at a time.
- **Do not merge into `main`. Do not push without asking Kyle.** Pushing a branch creates a public Vercel preview URL.
- Do not change Vercel settings or environment variables. Do not deploy.
- Do not upgrade Next, React or Tailwind. Tailwind stays on v3.

---

## 4. Where everything goes

All new code lives in four folders. Nothing new goes anywhere else.

```
src/app/learn/                 routes, the zone layout, learn.css
src/components/learn/          every Learning Center component
src/lib/learn/                 types, schema, adapters, flags, permissions, time, validation
src/data/learn/                categories, and demo/ for the labelled sample module and example event
docs/learning-center/          these briefs, references/, and the status docs you write
```

One suggested route layout, using route groups so each kind of page gets the right chrome:

```
src/app/learn/
  layout.tsx          zone wrapper: data-zone="learn", imports learn.css, renders the atmosphere once, applies the enable flag
  learn.css           the tokens and recipes from the design guide
  (caregiver)/        layout adds the sub-nav and the education band
  (player)/           the lesson player: no sub-nav, footer hidden
  staff/              layout is the app shell: sidebar, auth gate, demo banner
```

The repo already has components named `EventCard`, `Section`, `Breadcrumb` and `BreathingOrb`. Keep yours inside `src/components/learn/` and do not import or modify theirs.

---

## 5. Routes

The master prompt's homepage cannot be `/`, and `/privacy` already belongs to the site. Everything moves under `/learn`.

| Master §13 | In this repo |
|---|---|
| `/` | `/learn` |
| `/learn` (library) | `/learn/library` |
| category pages (master §05) | `/learn/topics/[categorySlug]` |
| `/learn/[moduleSlug]` | `/learn/modules/[moduleSlug]` |
| `/learn/[moduleSlug]/lesson/[lessonId]` | `/learn/modules/[moduleSlug]/lesson/[lessonId]` |
| `/trainings` | `/learn/trainings` |
| `/trainings/[eventSlug]` | `/learn/trainings/[eventSlug]` |
| `/help` | `/learn/help` |
| `/privacy` | `/learn/privacy`: a draft note about the Learning Center only, linking to the site's `/privacy` |
| `/accessibility` | `/learn/accessibility` |
| `/staff` and everything under it | `/learn/staff` with the same sub-paths |

**Leave these alone.** They are related but separate, and at most get a plain text link to or from the Learning Center:
- `/events`: community events fed by Eventbrite. Not the Teams trainings.
- `/families/what-is-aba`, `/families/at-home`, `/families/help` and the rest of Common Ground.
- `/families/client`: an older portal prototype. Do not extend it or reuse its data.
- `/privacy`: the site's own page.
- `/api/chat` and the `ChatWidget` component: an AI assistant from Common Ground. **Do not mount it or call it anywhere in the Learning Center.** The master prompt forbids AI at runtime.

**The entry point: a top-level item in the site header.** Kyle wants the Learning Center to be its own section in the main navigation, beside Locations, Services, Getting started, Insurance and Common Ground. In `src/components/site/Header.tsx`:

- Add one item to the end of the `primary` array, only when the enable flag is on: `{ href: '/learn', label: 'Learn' }`. A plain link, no mega-menu. The header's existing logic already underlines it on every `/learn` page.
- **The label in the desktop row is "Learn", not "Learning Center".** The header's container is capped at 1184px of content and the five current items leave about 10px spare. Tested here: "Learning Center" squeezes the phone button until its number wraps onto three lines, at every desktop width. "Learn" fits with about 40px spare at 1280, 1366, 1440 and 1920.
- When there are six items, the nav's gap becomes `gap-6` in place of `gap-8 xl:gap-10`. With the flag off the array has five items and the header is pixel-identical to today.
- In the full-screen Menu overlay, where there is room, show "Learning Center": give the item an optional `menuLabel` and render `n.menuLabel ?? n.label` there.
- Change nothing else in the header: not the logo, phone button, tour button, colors or scroll behaviour.

Do not also add it to the Common Ground menus. It is its own section now.

---

## 6. Site chrome

| Pages | Site header | Sub-nav | Site footer | Mobile bar |
|---|---|---|---|---|
| Caregiver pages under `/learn` | shown, untouched | Learning Center sub-nav | shown, untouched, with the education band above it | hidden |
| Lesson player | shown (it hides itself on scroll) | not rendered | hidden | hidden |
| Everything under `/learn/staff` | hidden | none (the sidebar is the nav) | hidden | hidden |

How:
- **Mobile bar:** it is a sales bar ("Call" and "Request a tour") that would cover the lesson player's Back and Next. `MobileBar.tsx` already returns `null` on `/families`; add `/learn` to that same condition. Tested: this works.
- **Hiding the header and footer:** use the pattern the repo already uses in `src/app/families/(hub)/care-plan/FlowChromeIsolation.tsx`, which hides the footer with `body:has(...)`. Put a marker on your layout (`data-lc-chrome="app"` for staff, `data-lc-chrome="focus"` for the player) and hide `body > header` and `body > footer` from `learn.css`. This needs no edit to the root layout. It was not tested here, so check the real DOM and adjust the selectors.
- **Do not** restructure the app into multiple root layouts or move existing routes into groups.
- The master prompt's "minimal branded header" (§04 item 1) is the site header plus the sub-nav. Its "accessible footer" (§04 item 9) is the education band plus the site footer. The design guide specifies both.

---

## 7. Styling isolation

The design guide's §0 has the rules. In short:

- All tokens are `--lc-*`, declared on `[data-zone="learn"]`, never on `:root`. The master prompt's proposed token names (`--ink`, `--paper`, `--lavender` and others) collide with site tokens and must not be used as written.
- All classes are `lc-*`.
- `src/app/globals.css` is not edited. One new stylesheet: `src/app/learn/learn.css`.
- Inside the zone, use no site tokens, site color utilities or site component classes. Outside the zone, use nothing `lc`.
- Fonts are the site's Bricolage Grotesque and DM Sans. No new font files. Not Inter.
- The zone is light only. Do not write `dark:` utilities.

---

## 8. Existing files you may edit

This is the complete list. Anything else in the existing site is read-only.

| File | The only change allowed |
|---|---|
| `src/components/site/MobileBar.tsx` | add `/learn` to the existing hide condition |
| `src/components/site/Header.tsx` | the one flagged nav item, its gap and its `menuLabel`, exactly as §5 describes |
| `tailwind.config.ts` | add the `lc` color group from the design guide. Additive only. |
| `src/app/robots.ts` | add `/learn/staff` to `disallow` |
| `src/app/sitemap.ts` | add public `/learn` pages, only when enabled and not showing demo content |
| `src/app/layout.tsx` | only to pass `beforeSend` to `<Analytics />` so `/learn/staff` page views are dropped |
| `package.json`, lockfile | the dependencies and scripts in §11 |
| `.env.example`, `.gitignore`, `README.md` | add the flags, ignore `.learn-demo/`, add one "Learning Center" section |

If you believe another existing file must change, stop and explain why before touching it.

---

## 9. Flags: off by default, closed on Vercel

This repo deploys to a public URL. The master prompt requires that demo staff access never appears on a live deployment and that privileged routes fail closed. Three flags, read in one place only (`src/lib/learn/flags.ts`), with a unit test for the truth table.

| Flag | When on | Guard |
|---|---|---|
| `NEXT_PUBLIC_LEARN_ENABLED=1` | The zone exists. | When off (the default): every `/learn` route returns `notFound()`, the header item is absent, the sitemap omits it. Merging changes nothing visible until this is set. |
| `LEARN_DEMO_CONTENT=1` | Caregiver pages show the labelled sample module and the example training. | Ignored when `VERCEL_ENV` is `production`. When off, the caregiver pages show the honest empty states from master §18. |
| `LEARN_DEMO_STAFF=1` | The fictional role switcher and the seeded staff workflow work. | Ignored whenever `process.env.VERCEL` is set, so it runs on a local machine only. When off, every `/learn/staff` page shows one closed page ("Staff sign-in is not set up yet") and every staff server action rejects. |

- Create `.env.local` with all three set to `1` for local work. If the file exists, append; do not overwrite anything in it.
- All `/learn` pages send `noindex` while demo content is on. Staff pages are always `noindex`.
- Demo mode is still enforced on the server. The role switcher sets an `httpOnly` demo session; every restricted action checks capability on the server, so the tests can prove a contributor cannot approve or publish.

---

## 10. Data, storage, analytics

- **No database, no new services, no accounts.** Build the adapter interfaces from master §20 with demo implementations: an in-memory store seeded from `src/data/learn/demo/`, optionally persisted to a gitignored `.learn-demo/` folder on a local machine. Nothing is written on Vercel.
- **Uploads:** demo only, local only, stored under `.learn-demo/uploads/`. Never under `public/`.
- **Browser storage:** Learning Center keys start with `lc-` and carry a version (`lc-progress-v1`). Common Ground owns the `cg-` keys; never read, write or clear them.
- **Analytics:** Vercel Analytics is already on for the whole site and records anonymous page views. Do not call `track()` from any Learning Center code: no module starts, no quiz answers, no registration clicks. Drop `/learn/staff` page views with `beforeSend`. Record in `IT_APPROVAL_CHECKLIST.md` that site-wide page-view analytics covers `/learn` and needs sign-off.
- **Time:** one utility in `src/lib/learn/` for America/Chicago formatting. Do not rely on server time zone.
- **Facts about the organization** (name, phone, the Sugar Land address) come from `src/data/site.ts` and `src/data/locations.ts`. Never type a phone number or a clinician's name into Learning Center content. `npm run check:content` fails on placeholder phone numbers and filler text.

---

## 11. Dependencies

You may add: `zod` (manifest and form schemas), `vitest` (unit tests), `@playwright/test` (browser tests), plus `test` and `test:e2e` scripts. Ask before adding anything else. No UI kit, no chart library, no icon set, no font package, no animation library: the repo already has what is needed.

---

## 12. Master prompt, section by section

Only the sections that change. Every section not listed applies as written.

| Master section | Adjustment in this repo |
|---|---|
| §00 items 1, 9 | This is an established repo. Use its stack. The "if starting fresh" defaults do not apply. |
| §00 item 2 | `DESIGN_REFERENCE_GUIDE.md` is the long version in this folder. Read this brief before it. |
| §01 product name, brand slot | The site header already carries the organization's brand. The Learning Center adds only its product name as text and a "Sugar Land pilot" label. Organization facts come from `src/data/site.ts`. |
| §02 | References are in `docs/learning-center/references/`, plus two new specimen images, 06 and 07. |
| §03 palette, typography | Replaced by the design guide §4 and §5: `--lc-*` token names, Bricolage Grotesque and DM Sans instead of Inter. |
| §04 items 1 and 9 | Header is the site header plus the sub-nav. Footer is the education band plus the site footer. Items 2 to 8 are unchanged and live at `/learn`. |
| §12 authentication | The repo has no auth. Demo role switcher on a local machine only, behind the flags in §9. |
| §13 | Routes in §5 above. |
| §14 | Component names are fine. `PublicHeader` becomes the sub-nav. `AppShell` is the staff shell only. Everything lives in `src/components/learn/`. |
| §15 | Types and in-memory demo adapters only. No migrations. |
| §20 | Skip "preferred starting point if repo is new". The adapter pattern still applies. Icons, charts and motion use what is installed. |
| §21 | Replaced by the design guide. |
| §22 phase 0 | Also: create the branch, take "before" screenshots of `/`, `/families`, `/locations/sugar-land` and `/events`, add the flags, the zone layout and `learn.css`, then show the first `/learn` screen before building further. |
| §23 | All acceptance tests apply, with paths from §5. Add the checks in §13 below. |
| §24 items 8 to 12 | Write `IMPLEMENTATION_STATUS.md` and `TEST_RESULTS.md` into `docs/learning-center/`. Update the existing `IT_APPROVAL_CHECKLIST.md`. Add one section to the existing `README.md`; do not replace it. |

---

## 13. Integration is done when

- [ ] `npm run lint`, `npm run typecheck`, `npm run check:content` and `npm run build` all pass.
- [ ] With `NEXT_PUBLIC_LEARN_ENABLED` unset: `/learn` and `/learn/staff` return 404, no nav entry appears, and the "before" and "after" screenshots of `/`, `/families`, `/locations/sugar-land` and `/events` are identical.
- [ ] `git diff main --stat` shows changes to existing files only from the list in §8. `src/app/globals.css` is untouched.
- [ ] No `lc-` class or `--lc-` token outside the four Learning Center folders, except the `lc` color group in `tailwind.config.ts`. No site token or site component class inside them.
- [ ] The flag truth table is unit-tested, including "staff demo is refused when `VERCEL` is set" and "demo content is refused when `VERCEL_ENV` is production".
- [ ] On a 390 wide screen the site's mobile bar does not appear anywhere under `/learn`.
- [ ] The sub-nav stays attached to the site header as it hides and returns.
- [ ] With the flag on, the header shows "Learn" as the sixth item, underlined on every `/learn` page, and the phone number stays on one line at 1280, 1366, 1440 and 1920 wide. The Menu overlay lists "Learning Center".
- [ ] Nothing under `/learn` calls `/api/chat`, mounts `ChatWidget`, calls `track()`, or touches a `cg-` storage key.
- [ ] Every acceptance test in master §23 passes with the new paths, and the visual QA list at the end of the design guide passes.

## 14. What to tell Kyle when you finish

Use the format in master §24, in plain words. Kyle is the product owner, not an engineer. Also say: which existing files changed and why, how to turn the zone on locally, and what he should click first to see it.

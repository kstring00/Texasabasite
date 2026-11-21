# START HERE

**What this is:** everything Claude Code needs to build the Caregiver Learning Center into the existing Texas ABA Centers site (`kstring00/Texasabasite`, live preview at `siteforthetexas.vercel.app`).

## For Kyle: three steps

1. Unzip this package in the root of the `Texasabasite` repo. You should end up with a `docs/learning-center/` folder next to the existing `docs/` files.
2. Open that repo in Claude Code and make sure you are on the `main` branch.
3. Paste the kickoff prompt below.

After the first build, ask Claude Code for screenshots of `/learn` on a phone-sized screen and on a laptop, and compare them with `references/06_IDENTITY_SPECIMEN.png` and `references/07_IDENTITY_SPECIMEN_MOBILE.png`.

## Kickoff prompt (copy all of it)

```
I'm adding a new section to this site: the Caregiver Learning Center. This is my existing Texas ABA Centers site, so you are building inside it, not starting a new project. Everything you need is in docs/learning-center/.

Before writing any code, read these fully, in this order:
1. docs/learning-center/INTEGRATION_BRIEF.md  (how this fits into this repo; it wins on routes, files, branches and flags)
2. docs/learning-center/MASTER_PROMPT.md  (what to build and every safety, privacy and approval rule; it wins on those)
3. docs/learning-center/DESIGN_REFERENCE_GUIDE.md and every image in docs/learning-center/references/  (what it looks like)
Then skim README.md and docs/REDESIGN-NOTES.md so you understand the site you're working in. Ignore CLAUDE_PPTX_CONVERSION_PROMPT.md for now; that's a later job.

Ground rules, all spelled out in the brief:
- Start from main and confirm it contains src/app/locations/sugar-land/inside/page.tsx. Create the branch feat/learning-center. Don't merge, push or deploy without asking me.
- The existing site must look and work exactly as it does now. Only edit the existing files the brief lists. Don't touch src/app/globals.css.
- The Learning Center is its own top-level section: a "Learn" item in the main header nav, exactly as the brief describes. Everything lives under /learn, in its own zone (data-zone="learn") with its own --lc- tokens and lc- classes. Use the site's fonts and its installed libraries. No new fonts, UI kits or chart libraries.
- Build it behind the three flags in the brief, off by default. Staff demo access must only work on my local machine, never on Vercel.
- Synthetic demo data only, clearly labelled. No real Teams connection, no real logins, no real family data, no AI at runtime.

How to work:
- First, show me a short plan and take "before" screenshots of /, /families, /locations/sugar-land and /events.
- Then build in the phases from the master prompt. After phase 0, show me the first /learn screen at 390px and 1366px next to references/06 and 07 before going further.
- Run lint, typecheck, check:content and build as you go, and fix what breaks.
- I'm the product owner, not an engineer. Make the engineering calls yourself and only stop to ask me when you're truly blocked or the brief says to ask. When you report back, use plain words and tell me exactly what to click to see it.

Don't answer with only a plan or a mockup. Build it.
```

## What is in this folder

| File | What it is |
|---|---|
| `INTEGRATION_BRIEF.md` | New. How the build fits this repo: routes, folders, allowed edits, flags, deploy rules. |
| `MASTER_PROMPT.md` | The full product spec. Unchanged except for a short note at the top pointing to the brief. |
| `DESIGN_REFERENCE_GUIDE.md` | New, replaces the earlier short one. Tokens, type, recipes and component looks, tested inside this site. |
| `references/00` to `05` | The original reference images. |
| `references/06`, `07` | New. The design guide's styles running inside this site, desktop and mobile. |
| `CLAUDE_PPTX_CONVERSION_PROMPT.md` | For later, after a source PowerPoint is clinically approved. A short note at the top gives this repo's paths. |
| `IT_APPROVAL_CHECKLIST.md` | The original checklist plus four items that come from building inside the existing site. |
| `HOW_TO_DEMO.md` | Added during the build. One page: how to show the Learning Center, on a Vercel preview or a laptop, click by click. |
| `IMPLEMENTATION_STATUS.md` | Added during the build. What is done, partly done, not started, and waiting on the organization. |
| `TEST_RESULTS.md` | Added during the build. What was tested, how, and the results. |
| `REVIEW_SHEET.md` | Added during the build. Every sentence written for the Learning Center, numbered, for the Clinical Director and IT to mark. |

## The launch boundary has not changed

The first build is a working local demo, not a public clinical launch. Real use still needs organizational approval of hosting, staff sign-in, private file storage, Microsoft Teams registration settings, brand use, privacy and content review. See `IT_APPROVAL_CHECKLIST.md`.

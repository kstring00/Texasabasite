# Texas ABA Centers — site rebuild (demo)

A Next.js (App Router) rebuild of texasabacenters.com around one idea: **one front door.**
A parent is part of the care team from the first click, not a lead until intake.
Common Ground, the parent hub, is mounted at `/families` as the second half of the journey.

The site's one action is **Request a tour** at a specific center. Tap-to-call and directions are the lighter actions.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build, also runs lint + types
npm run check:content  # fails on "lorem" or "000-0000" anywhere in src/ or content/
```

No environment variables are required for the demo. See `.env.example` for the optional ones.

## Where things live

| What | Where | Who edits it |
| --- | --- | --- |
| The six centers (address, phone, availability, clinical lead, photos) | `src/data/locations.ts` | Dom's team |
| Services copy | `src/data/services.ts` | Dom's team / clinical |
| People (Marcie, Regional Executive Directors, clinical directors) | `src/data/people.ts` | Dom's team |
| The 5-step path (who you meet, how long, what to bring) | `src/data/steps.ts` | Dom's team |
| Insurance list, mandate wording, cost explainer | `src/data/insurance.ts` | Dom's team / billing |
| Events (Eventbrite id, manual events, recap photos) | `src/data/events.ts` | Marketing |
| Parent circles and "While You Wait" links | `src/data/circles.ts` | Common Ground owner |
| Phone numbers, hours, careers link, Vimeo id | `src/data/site.ts` | Dom's team |
| Blog posts | `content/blog/*.mdx` | Any writer |
| Common Ground pages | `src/app/families/**` and `src/components/**` (the original Common Ground codebase) | Kyle |

**Rule baked into the components: missing content hides its section.** An empty `people` list hides the "Your people" section. A center with `availability: null` shows no badge. An empty insurance list shows no logo row. Nothing is ever faked to fill a gap.

### Edit a center

Open `src/data/locations.ts`. Each center is one object. Things you will want to set:

- `availability`: `'open' | 'limited' | 'waitlist' | null`. Only set it when someone at the center confirms it.
- `clinicalLead`: `{ name, credentials, title, photo }` or `null`. Photos go in `public/images/people/`.
- `photos`: real photos of that center in `public/images/centers/<slug>/`. The first is the hero; the next four are the walkthrough.
- `hours`: center hours as a string, or `null` (the current site only lists phone-line hours).
- `arrivalNote`, `googleReviewUrl`: optional.
- `addressVerified: false` on Katy means the current site shows two different addresses. Confirm before launch.

### Add a person

Add an object to `people` in `src/data/people.ts`. Cards appear automatically on Home, Team, Contact, Providers, the location pages for their region, and the tour form. A person with an empty `name` never renders.

### Add a blog post

Create `content/blog/my-post.mdx`:

```mdx
---
title: "Plain title"
excerpt: "One sentence a parent would read in a list."
author: "Full name"
authorTitle: "BCBA, Clinical Director"   # optional
center: "pearland"                        # optional, a slug from locations.ts
category: "Getting started"
date: "2026-11-01"
---

Write in Markdown. Links to the site work: [request a tour](/request-a-tour).
```

The three seeded posts are bylined "Texas ABA Centers, draft" until a real author is assigned. Do not publish them with an invented name.

**Post-demo:** a non-technical daily writer should not edit MDX in Git. Options, cheapest first: (1) Keep MDX and give the writer a Git-backed CMS like Decap or Tina (free, edits land as commits). (2) Sanity or Contentful with a small fetch in `src/lib/site/blog.ts`. (3) WordPress headless if the team already lives there. The blog loader is one file, so swapping the source is a half-day job.

### Add an event

Two ways:

1. **Eventbrite (recommended):** set `NEXT_PUBLIC_EVENTBRITE_ORGANIZER_ID` in Vercel. The Events page embeds the public organizer feed. Later, pull events server-side from `https://www.eventbriteapi.com/v3/organizers/{id}/events/?status=live&order_by=start_asc` with a private token and map them into the `SiteEvent` shape so they show on Home and on each center's page.
2. **Manual:** add to `events.manual` in `src/data/events.ts` with the center slug and the Eventbrite RSVP URL. These show on Home, Events, the location page, and the tour confirmation.

Recap photos go in `events.recaps` with a real caption.

### Tour requests

The form posts to a server action in `src/app/request-a-tour/actions.ts`. It logs every submission (visible in Vercel → Functions logs) and, when `RESEND_API_KEY` is set, emails it to `TOUR_REQUEST_TO`. Honeypot spam field, no CAPTCHA. The form never asks for diagnosis, history, or insurance ids. Attribution (`utm_*`, referrer, landing page) rides along in a hidden field.

### Analytics

Vercel Analytics plus custom events: `tour_request_submit` (center), `call_tap` (center, place), `directions_tap`, `coverage_check_click`, `event_rsvp_click`, `circle_join_click`, `blog_read`. Defined in `src/lib/site/analytics.ts`.

### Spanish

`/es` is a stub with the real phone number and tour link. The header toggle and `alternates.languages` are wired. Spanish copy is the post-demo step; the plan is a `dictionaries/` folder keyed by route, with `/es/...` mirroring every page.

### Common Ground (`/families`)

The original Common Ground codebase lives here unchanged in substance. Its routes moved from `/support/*` to `/families/*` (old URLs redirect). Three hub pages were added on top and read from the site data: While You Wait, Parent Pulse (demo UI over the existing bandwidth check, device-only), and Your Care Team. The voice guide is in `docs-common-ground-voice.md`.

## Design system

Tokens are CSS variables in `src/app/globals.css` (`--ink`, `--paper`, `--sun`, `--plum`, `--rose`, …) with a dark set. Dark mode is opt-in (`<html data-theme="dark">`) because the Common Ground pages still hard-code light surfaces. Fonts: Fraunces (serif, headlines) and Plus Jakarta Sans (UI), self-hosted via fontsource. Body text is 18px.

Motion lives in `src/components/site/motion.tsx` (fade-ups, staggers) and `FirstVisitIntro.tsx` (the flower-mark loading screen: once per session, budgeted to end 1.2s after navigation start, tap to skip, skipped entirely under `prefers-reduced-motion`). Page transitions use Next's experimental View Transitions flag with a 200ms cross-fade.

## Logins and services

- **Vercel:** connect this repo in the Vercel dashboard (Add New → Project → import `kstring00/Texasabasite`). Framework preset: Next.js. Add the env vars from `.env.example`. Set both `www` and apex domains so both resolve.
- **Resend:** create an API key, verify the sending domain, set `RESEND_API_KEY`, `TOUR_REQUEST_TO`, `TOUR_REQUEST_FROM`.
- **Eventbrite:** the organizer id is in the organizer page URL (`eventbrite.com/o/name-1234567890` → `1234567890`).
- **Vercel Analytics:** turns on in the project's Analytics tab; custom events need the Pro plan.

## What is still pending from Texas ABA (hidden until supplied)

- Full names, titles, photos for the Regional Executive Directors and clinical directors.
- Marcie Pena's direct phone or email and photo.
- Center photos (hero + 3 to 4 rooms each).
- The accepted insurance list.
- Availability per center and a confirmed "typical time from call to first day" (the launch press release said 47 days; the site does not show it until Dom confirms it).
- Google review links per center.
- The Katy address (two versions on the current site).
- The Vimeo id for "A Mother's Mission."
- Eventbrite organizer id or 2 to 3 real events.

See `docs/USER-TEST.md` for the 5-minute parent test and `docs/VERIFY-WITH-DOM.md` for every line that is an assumption.

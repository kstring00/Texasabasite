# DESIGN REFERENCE GUIDE
## Caregiver Learning Center · visual identity, built into the Texas ABA Centers site

This file replaces the earlier, shorter `DESIGN_REFERENCE_GUIDE.md`. It says what the Learning Center looks like. `MASTER_PROMPT.md` says what to build and what is safe. `INTEGRATION_BRIEF.md` says where it goes in this repo. Read all three before writing UI.

**If they disagree**
- Function, safety, privacy, clinical scope, approvals: the master prompt wins. Always.
- Where things live, routes, branches, flags, what existing files may change: the integration brief wins.
- A visual value (color, size, radius, font, shadow, motion): this file wins. It refines master §03 and §21.

Every value here was rendered and contrast-tested, and the token set and recipes were then mounted in this repo (branch `main`, Next 15, Tailwind 3.4) under the real header and footer and screenshotted at 1440, 1366 and 390 wide.

**Files this guide refers to**

| File | What it is |
|---|---|
| `references/01` to `05` | The five references named in the master prompt |
| `references/06_IDENTITY_SPECIMEN.png` | Two stitched browser captures of this guide's tokens and recipes running inside this site at 1440 wide. Proof that the CSS below produces the look here. Not a page layout to copy. |
| `references/07_IDENTITY_SPECIMEN_MOBILE.png` | The same at 390 wide |

---

## 0. How this fits the existing site

The site already has a design system, Open World: warm cream canvas, cobalt, persimmon, butter, arches, Bricolage Grotesque and DM Sans. Common Ground is a zone inside it (`data-zone="families"`). **The Learning Center is a second zone: `data-zone="learn"`.** Inside the zone the look changes. Outside it nothing changes.

| Shared with the site | Different inside the zone |
|---|---|
| The site header and its logo, with one new "Learn" item | A cool pale canvas with the soft color field, instead of warm cream |
| The site footer, untouched | Glass panels in three tiers |
| Both fonts: Bricolage Grotesque and DM Sans | The orb and its six hues |
| The `.wrap` page container | Ink pill buttons (the site's are cobalt) |
| `lucide-react`, `framer-motion`, `chart.js` | Its own tokens, all named `--lc-*` |
| The rule that missing content hides its section | No arches, portals, cobalt, persimmon, butter or serif italic |

**Three rules that keep the two systems apart**

1. **Every token is `--lc-*` and lives on `[data-zone="learn"]`, never on `:root`.** The site already defines `--ink`, `--paper`, `--lavender`, `--s-1` to `--s-5`, `--t-base`, `--font-display` and `--font-body` on `:root`, as RGB triplets that Tailwind reads. Redefining any of them breaks the whole site. Do not use the token names proposed in master §03 as written; use the `--lc-` names in §4.
2. **Every class is `lc-*`.** The site already owns `.btn`, `.card`, `.chip`, `.eyebrow`, `.label`, `.note`, `.photo`, `.portal`, `.h1` to `.h3` and more.
3. **`src/app/globals.css` is not edited.** Everything in this guide goes in one new stylesheet, `src/app/learn/learn.css`, imported by `src/app/learn/layout.tsx`.

The site's globals still reach into the zone in two places, and the zone base rule in §7 undoes both: body text color and size, and the global `h1, h2, h3` rule (line-height 1.02, letter-spacing -0.025em, site ink).

---

## 1. The idea: clear glass over soft light

Every screen is three layers, always in this order.

1. **Light.** A soft field of blurred color behind everything. It lives at the edges and corners. (Reference 03.)
2. **Glass.** White, slightly see-through panels that float on the light. All content sits on glass.
3. **Ink.** Dark navy text and one dark button. Sharp, plain, easy to read.

Color belongs to the light. Reading belongs to the glass. They never trade places: no colored text blocks, no glow behind a paragraph.

**One light, six colors.** The orb in the hero is the single source of color for the whole product. Its six hues (teal, blue, iris, rose, coral, amber) are the only accent colors anywhere. Each of the six topic categories owns one hue. That is how a parent learns where they are without reading a label.

**The squint test.** Squint at any screen. You should see soft color at the edges, calm white in the middle, and exactly one dark thing inside the zone: the primary button on caregiver pages, the sidebar on staff pages. (The site's own header and footer sit outside the zone and do not count.) If you see more than that, simplify.

---

## 2. What to take from each reference

Priority order is unchanged from the master prompt: 01, then 03, then 02 and 05, then 04.

| Ref | Take this | Leave this |
|---|---|---|
| **01** North star | Frosted panels on a pastel field. Dark teal-navy sidebar. A big dimensional orb cropped by the hero's right edge. Two equal choice cards, teal cast and peach cast. Six topic tiles, each with its own hue. Pill buttons and pill status chips. Gradient on the last words of the headline. | The orb-flower logo (invented, not real). Its own top header (the site header replaces it). White text sitting directly on pastel color (fails contrast). Arrow-only buttons. All numbers. The dark top-left corner. The words "Inter" in its design strip (see §5). |
| **03** Vignette | The technique: three to five very large blurred color fields on a pale cool canvas (`#EEF2F3` measured), with fine film grain. Cores are fairly strong; edges fade over more than half the radius. Big quiet areas between them. | The charcoal blob. Thin (Light weight) type. Small grey captions. |
| **02** Healthcare dashboard | Lightly tinted metric tiles. A small icon tile in each card's corner. Tidy sidebar rhythm. Dense but calm. | Anything patient-related. The yellow-green highlight. Tiny text. |
| **05** Bold dashboard | Confident big numerals. Strong dark-nav against light-content contrast. Roomy rounded tiles. | Flat saturated tile fills. The cream background. Decorative shapes inside tiles. |
| **04** Orbs | A sphere made of two or three soft bands of color, a blurred edge, and a halo of the same colors spilling past it. | Using more than one. Hard dark bands. |

---

## 3. Brand and logo

**The Learning Center has no logo of its own.** Every caregiver page sits under the site header, which already shows the Texas ABA Centers logo. Do not place a second logo anywhere in the zone, do not add a logo file, and do not draw one.

- **Product name:** "Caregiver Learning Center", as text. It appears in the sub-nav, in page titles and at the top of the staff sidebar. "Sugar Land pilot" appears as the eyebrow on the `/learn` hero and in the education band.
- **Organization name, phone and other facts** come from `src/data/site.ts` and `src/data/locations.ts`, never typed into a component. That file is the easily replaceable brand slot master §01 asks for.
- **Page titles** follow Common Ground's pattern: `%s · Caregiver Learning Center | Texas ABA Centers`.
- **Favicon:** the site's existing one. No change.
- **Never** use the invented orb-flower mark from reference 01. The orb is decoration, not a logo.

**The logo's colors are not UI colors.** Measured from the logo, for reference only: `#CE1F3D` red, `#9B1C46` crimson, `#67174D` plum, `#341E56` purple, `#212A5B` navy. Do not add them to the zone's tokens. Red in particular must never appear as a button, badge or accent: beside this logo it would read as brand, and everywhere else it reads as an error.

Why the zone still looks at home under that logo: the logo's cool end (plum, purple, navy) sits right beside the zone's iris, blue and navy, and the headline gradient (iris to rose to coral) is a soft echo of the logo's own sweep.

---

## 4. Color

### 4.1 Tokens
This block goes at the top of `src/app/learn/learn.css`. Values are hex, unlike the site's RGB-triplet tokens, so Tailwind opacity modifiers (`/50`) do not work on them; use the steps instead.

```css
[data-zone="learn"] {
  /* ── Neutrals ─────────────────────────────────────────── */
  --lc-ink: #172138;            /* headings, body, primary button fill */
  --lc-ink-muted: #4A5A72;      /* secondary text: AA on every light surface and 300 tint */
  --lc-white: #FFFFFF;
  --lc-paper: #F8FAFD;          /* opaque page fallback, form backgrounds */
  --lc-canvas: #EEF2F6;         /* the base under the atmosphere */
  --lc-slate-100: #EEF1F6;
  --lc-slate-700: #44526A;
  --lc-border: rgba(23, 33, 56, 0.10);
  --lc-border-strong: rgba(23, 33, 56, 0.18);
  --lc-border-glass: rgba(255, 255, 255, 0.70);

  /* ── Dark anchors ─────────────────────────────────────── */
  --lc-navy-900: #0B1F3B;
  --lc-deep-teal: #103F4A;
  --lc-on-dark: #FFFFFF;
  --lc-on-dark-muted: rgba(255, 255, 255, 0.72);

  /* ── The six orb hues ─────────────────────────────────────
     100 wash · 300 tint · 500 glow · 600 graphic (≥3:1) · 700 text/icon (≥4.5:1) */
  --lc-teal-100: #E3F6F4;  --lc-teal-300: #BFECE8;  --lc-teal-500: #178A90;  --lc-teal-600: #12787D;  --lc-teal-700: #0E6B70;
  --lc-blue-100: #E9F1FC;  --lc-blue-300: #D0E1F5;  --lc-blue-500: #76A1F3;  --lc-blue-600: #3F74DE;  --lc-blue-700: #2756BD;
  --lc-iris-100: #F1EEFB;  --lc-iris-300: #E4DFF5;  --lc-iris-500: #A78BFA;  --lc-iris-600: #7B5CE6;  --lc-iris-700: #5A3EC8;
  --lc-rose-100: #FCEDF3;  --lc-rose-300: #F8D3E0;  --lc-rose-500: #EE8FB4;  --lc-rose-600: #D4578F;  --lc-rose-700: #A8326A;
  --lc-coral-100: #FEF0EA; --lc-coral-300: #FADBCA; --lc-coral-500: #FF9E88; --lc-coral-600: #D4542F; --lc-coral-700: #AE3D20;
  --lc-amber-100: #FEF4E3; --lc-amber-300: #FDE9D0; --lc-amber-500: #F5B95C; --lc-amber-600: #B8770A; --lc-amber-700: #855400;

  /* ── Type ─────────────────────────────────────────────── */
  --lc-font-display: var(--font-display);   /* the site's Bricolage Grotesque */
  --lc-font-body: var(--font-sans);         /* the site's DM Sans */

  --lc-text-hero: clamp(2.125rem, 1.4rem + 3.1vw, 3.75rem);    /* 34 → 60 */
  --lc-text-h1: clamp(1.75rem, 1.4rem + 1.5vw, 2.75rem);      /* 28 → 44 */
  --lc-text-h2: clamp(1.375rem, 1.2rem + 0.75vw, 1.875rem);   /* 22 → 30 */
  --lc-text-h3: 1.25rem;                                      /* 20 */
  --lc-text-lead: clamp(1.0625rem, 1rem + 0.3vw, 1.25rem);    /* 17 → 20 */
  --lc-text-body: 1.0625rem;                                  /* 17, caregiver default */
  --lc-text-body-dense: 0.9375rem;                            /* 15, staff tables only */
  --lc-text-small: 0.875rem;                                  /* 14, floor for information */
  --lc-text-eyebrow: 0.75rem;                                 /* 12, decorative labels only */

  /* ── Shape ────────────────────────────────────────────── */
  --lc-r-xs: 8px;    /* checkboxes, small tags */
  --lc-r-sm: 12px;   /* inputs, selects, table containers */
  --lc-r-md: 16px;   /* tiles, small cards */
  --lc-r-lg: 20px;   /* standard cards */
  --lc-r-xl: 28px;   /* hero panel, app shell */
  --lc-r-pill: 999px;/* buttons, chips */

  /* ── Space (4px base) ─────────────────────────────────── */
  --lc-s-1: 4px; --lc-s-2: 8px; --lc-s-3: 12px; --lc-s-4: 16px; --lc-s-5: 24px;
  --lc-s-6: 32px; --lc-s-7: 48px; --lc-s-8: 64px; --lc-s-9: 96px;

  /* ── Elevation: always layered, always navy-tinted, never grey ── */
  --lc-shadow-1: 0 1px 2px rgba(11, 31, 59, 0.05), 0 2px 8px rgba(11, 31, 59, 0.04);
  --lc-shadow-2: 0 1px 2px rgba(11, 31, 59, 0.05), 0 8px 24px rgba(11, 31, 59, 0.07),
              0 24px 48px -12px rgba(11, 31, 59, 0.10);
  --lc-shadow-3: 0 2px 4px rgba(11, 31, 59, 0.06), 0 16px 40px rgba(11, 31, 59, 0.10),
              0 40px 80px -20px rgba(11, 31, 59, 0.18);
  --lc-ring: 0 0 0 3px var(--lc-white), 0 0 0 6px var(--lc-blue-700);

  /* ── Motion ───────────────────────────────────────────── */
  --lc-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  --lc-t-fast: 140ms;
  --lc-t-base: 220ms;
  --lc-t-slow: 420ms;
}
```

Optional, and additive only: expose them to Tailwind so components can write `text-lc-ink` or `bg-lc-teal-100`. Add one `lc` key under `theme.extend.colors` in `tailwind.config.ts` and change nothing else in that file.

```ts
lc: {
  ink: 'var(--lc-ink)', 'ink-muted': 'var(--lc-ink-muted)', paper: 'var(--lc-paper)', canvas: 'var(--lc-canvas)',
  navy: 'var(--lc-navy-900)', 'deep-teal': 'var(--lc-deep-teal)',
  teal:  { 100: 'var(--lc-teal-100)',  300: 'var(--lc-teal-300)',  500: 'var(--lc-teal-500)',  600: 'var(--lc-teal-600)',  700: 'var(--lc-teal-700)' },
  blue:  { 100: 'var(--lc-blue-100)',  300: 'var(--lc-blue-300)',  500: 'var(--lc-blue-500)',  600: 'var(--lc-blue-600)',  700: 'var(--lc-blue-700)' },
  iris:  { 100: 'var(--lc-iris-100)',  300: 'var(--lc-iris-300)',  500: 'var(--lc-iris-500)',  600: 'var(--lc-iris-600)',  700: 'var(--lc-iris-700)' },
  rose:  { 100: 'var(--lc-rose-100)',  300: 'var(--lc-rose-300)',  500: 'var(--lc-rose-500)',  600: 'var(--lc-rose-600)',  700: 'var(--lc-rose-700)' },
  coral: { 100: 'var(--lc-coral-100)', 300: 'var(--lc-coral-300)', 500: 'var(--lc-coral-500)', 600: 'var(--lc-coral-600)', 700: 'var(--lc-coral-700)' },
  amber: { 100: 'var(--lc-amber-100)', 300: 'var(--lc-amber-300)', 500: 'var(--lc-amber-500)', 600: 'var(--lc-amber-600)', 700: 'var(--lc-amber-700)' },
},
```

### 4.2 Names in the master prompt
Master §03 proposes token names. Several collide with the site. Use the names on the right.

| Master prompt | This guide | Note |
|---|---|---|
| `--ink` `#172138` | `--lc-ink` | the site's `--ink` is a different thing: leave it alone |
| `--muted-ink` `#53637B` | `--lc-ink-muted` `#4A5A72` | darkened so it passes on every tint |
| `--paper`, `--white` | `--lc-paper`, `--lc-white` | the site's `--paper` is warm cream |
| `--navy-900`, `--deep-teal` | `--lc-navy-900`, `--lc-deep-teal` | same values |
| `--teal` `#178A90` | `--lc-teal-500` | |
| `--mint` `#BFECE8` | `--lc-teal-300` | |
| `--iris` `#A78BFA` | `--lc-iris-500` | |
| `--lavender` `#E4DFF5` | `--lc-iris-300` | reference 03 color. The site's `--lavender` is a different color |
| `--blue` `#76A1F3` | `--lc-blue-500` | reference 03 color |
| `--sky` `#D0E1F5` | `--lc-blue-300` | reference 03 color |
| `--coral` `#FF9E88` | `--lc-coral-500` | |
| `--peach` `#FADBCA` | `--lc-coral-300` | reference 03 color |
| (new) | rose and amber families | completes the six orb hues; amber-300 is the cream swatch in reference 01 |

### 4.3 How to use the five steps
Each hue has five steps. The step decides the job. This is the rule that keeps the pastel look accessible.

| Step | Job | Never |
|---|---|---|
| **100** wash | Card and tile backgrounds, feedback panels, chip fills | |
| **300** tint | Atmosphere fields, icon-tile gradients, soft fills | |
| **500** glow | The orb, halos, coloured shadows, chart area fills | Text. The only edge of a control. Icons. (Most fail 3:1 on white.) |
| **600** graphic | Chart lines and bars, gradient headline text, large icons | Text under 24px |
| **700** text | Coloured text, icons, links, chip labels, focus ring | |

Neutrals: `--lc-ink` for headings and body. `--lc-ink-muted` for supporting text. Nothing lighter than `--lc-ink-muted` ever carries information.

### 4.4 Casts
A cast is one attribute that tints a whole component with one hue. It is how the six colors reach the UI.

```css
[data-zone="learn"] [data-cast="teal"]  { --lc-c100: var(--lc-teal-100);  --lc-c300: var(--lc-teal-300);  --lc-c500: var(--lc-teal-500);  --lc-c600: var(--lc-teal-600);  --lc-c700: var(--lc-teal-700); }
[data-zone="learn"] [data-cast="blue"]  { --lc-c100: var(--lc-blue-100);  --lc-c300: var(--lc-blue-300);  --lc-c500: var(--lc-blue-500);  --lc-c600: var(--lc-blue-600);  --lc-c700: var(--lc-blue-700); }
[data-zone="learn"] [data-cast="iris"]  { --lc-c100: var(--lc-iris-100);  --lc-c300: var(--lc-iris-300);  --lc-c500: var(--lc-iris-500);  --lc-c600: var(--lc-iris-600);  --lc-c700: var(--lc-iris-700); }
[data-zone="learn"] [data-cast="rose"]  { --lc-c100: var(--lc-rose-100);  --lc-c300: var(--lc-rose-300);  --lc-c500: var(--lc-rose-500);  --lc-c600: var(--lc-rose-600);  --lc-c700: var(--lc-rose-700); }
[data-zone="learn"] [data-cast="coral"] { --lc-c100: var(--lc-coral-100); --lc-c300: var(--lc-coral-300); --lc-c500: var(--lc-coral-500); --lc-c600: var(--lc-coral-600); --lc-c700: var(--lc-coral-700); }
[data-zone="learn"] [data-cast="amber"] { --lc-c100: var(--lc-amber-100); --lc-c300: var(--lc-amber-300); --lc-c500: var(--lc-amber-500); --lc-c600: var(--lc-amber-600); --lc-c700: var(--lc-amber-700); }
[data-zone="learn"] [data-cast="slate"] { --lc-c100: var(--lc-slate-100); --lc-c300: #DDE2EA; --lc-c500: #8793A6; --lc-c600: #5E6B80; --lc-c700: var(--lc-slate-700); }

/* The icon tile: the one coloured object most cards carry */
.lc-icon-tile {
  display: grid; place-items: center; flex: none;
  width: 56px; height: 56px; border-radius: var(--lc-r-md);
  color: var(--lc-c700);
  background: linear-gradient(140deg, var(--lc-white) 0%, var(--lc-c300) 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(255,255,255,.6), 0 6px 16px -6px var(--lc-c500);
}
```

**Fixed assignments.** Store the cast and icon on the category record in `src/data/learn/` so they never drift. Icon names are Lucide names; every one in this guide exists in the installed `lucide-react` 0.468 (in React they are PascalCase: `book-open` is `BookOpen`).

| Where | Cast | Lucide icon |
|---|---|---|
| Home path: Explore Learning Modules | teal | `book-open` |
| Home path: Upcoming Live Trainings | coral | `video` |
| ABA Foundations | blue | `blocks` |
| Understanding Behavior | teal | `activity` |
| Communication & Connection | iris | `message-circle` |
| Routines & Daily Living | amber | `calendar-days` |
| Safety & Elopement | rose | `shield-check` |
| Caregiver Support | coral | `heart-handshake` |

A module inherits its category's cast: its card, its overview header, its progress bar and the lesson player's accents all use it. One screen shows one cast, except the topic grid and the library, which show all six.

### 4.5 Status language (staff side)
Every chip is an icon plus a word. Color is the third signal, never the only one. Chip: pill, 32px tall, 14px DM Sans SemiBold, fill `--lc-c100`, text and icon `--lc-c700`, 1px inset ring of `--lc-c700` at 22%.

| Status | Cast | Icon |
|---|---|---|
| Draft | slate | `pencil-line` |
| Submitted / Awaiting review | amber | `clock` |
| In review | iris | `eye` |
| Changes requested | coral | `message-square-warning` |
| Declined / Rejected | rose | `ban` |
| Source approved | teal | `circle-check` |
| Awaiting production / In production | blue | `loader` (still, never spinning) |
| Final review | iris | `clipboard-check` |
| Final approved | teal | `check-check` |
| **Published** | **solid `--lc-deep-teal` fill, white text** | `globe` |
| Withdrawn | slate | `eye-off` |
| Archived | slate | `archive` |
| Event: Scheduled | teal | `calendar-check` |
| Event: Registration closed | amber | `lock` |
| Event: Completed | slate | `circle-check` |
| Event: Cancelled | rose | `calendar-x` |

Published is the only solid chip in the product. It should be findable in a table at a glance.

**The two approval gates must never look alike** (master §08 and §09):
- **Gate 1, source PowerPoint:** blue cast, `presentation` icon, label "Gate 1 · Source PowerPoint".
- **Gate 2, final module:** iris cast, `layers` icon, label "Gate 2 · Final module".

Each review page opens with a full-width strip in its gate's cast (`--lc-c100` fill, 4px left bar in `--lc-c700`) carrying that label. Queue tabs and queue rows repeat the same icon and cast. A single check means source approved. A double check means final approved.

**Other fixed meanings**
- Demo and sample labels: amber, the same meaning the site's existing `DemoDataNotice` already gives amber. `--lc-amber-100` fill, `--lc-amber-700` text, 1px ring, `info` icon. Used for the top-of-page "Illustrative demo data" banner and the "DEMO · NOT CLINICALLY APPROVED" label on sample content. Visible, tidy, never hidden and never red.
- Form errors: `--lc-coral-700` text with `circle-alert` icon on `--lc-coral-100`.
- Destructive buttons (Decline, Withdraw, Delete draft): `--lc-rose-700` fill, white text.
- Knowledge-check feedback: see §9. A wrong answer is amber, never red.

### 4.6 Tested contrast
Measured with the WCAG formula on the values above.

| Pair | Ratio | Verdict |
|---|---|---|
| `--lc-ink` on white / canvas / any 300 tint | 16.0 / 14.2 / 11.7 or better | Any text |
| `--lc-ink-muted` on white / canvas / any 100 / any 300 | 7.0 / 6.2 / 6.1+ / 5.1+ | Any text |
| Any 700 on white / its own 100 / its own 300 | 6.0+ / 5.4+ / 4.6+ | Any text |
| 600s on white: teal 5.2, iris 4.7, blue 4.4, coral 4.1, rose 3.8, amber 3.7 | 3.3+ on canvas | Graphics and 24px+ text only |
| 500s on white: teal 4.1, iris 2.7, blue 2.6, rose 2.3, coral 2.0, amber 1.8 | | Decoration only |
| White on `--lc-ink` / `--lc-navy-900` / `--lc-deep-teal` / `--lc-rose-700` | 16.0 / 16.5 / 11.5 / 6.3 | Any text |
| `--lc-on-dark-muted` on the sidebar's lightest point | 6.7 | Any text |
| `--lc-ink-muted` on `.lc-surface` over the strongest atmosphere color | 6.2 | Passes |
| `--lc-ink-muted` on `.lc-glass` over the orb's dark side | 3.2 | **Fails. This is why glass never carries body text.** |

Re-measure on the real screen, not the swatch, any time text ends up over color.

These ratios are for the `--lc-*` values only. The site's own tokens are a different palette and were not measured here.

---

## 5. Type

**No new fonts.** The zone uses the two families the site already self-hosts and preloads: **Bricolage Grotesque** for display and **DM Sans** for everything a person reads or operates. `--lc-font-display` and `--lc-font-body` simply point at the site's `--font-display` and `--font-sans`.

Reference 01 names Inter and reference 03 shows Poppins. Neither is loaded. The zone sits under the site's header and above its footer, so one set of letterforms keeps it reading as one site, and tired parents on older phones download nothing extra. DM Sans is the same kind of clean geometric sans the references show. Instrument Serif is not used in the zone.

| Role | Font | Size token | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Hero headline | Bricolage | `--lc-text-hero` (34 to 60px) | 600 | 1.06 | -0.02em |
| Page title | Bricolage | `--lc-text-h1` (28 to 44px) | 600 | 1.12 | -0.02em |
| Section title | Bricolage | `--lc-text-h2` (22 to 30px) | 600 | 1.2 | -0.02em |
| Card title | Bricolage | `--lc-text-h3` (20px) | 500 | 1.3 | -0.01em |
| Metric numeral | Bricolage | 32px (40px on leadership) | 600 | 1.1 | -0.02em, tabular numbers |
| Lead paragraph | DM Sans | `--lc-text-lead` (17 to 20px) | 400 | 1.6 | 0 |
| Caregiver body | DM Sans | `--lc-text-body` (17px) | 400 | 1.6 | 0 |
| Buttons, nav, labels | DM Sans | 16px | 600 / 500 | 1 | 0 |
| Staff tables | DM Sans | `--lc-text-body-dense` (15px) | 400 | 1.5 | 0 |
| Small print | DM Sans | `--lc-text-small` (14px) | 400 | 1.5 | 0 |
| Eyebrow | DM Sans | `--lc-text-eyebrow` (12px) | 600 | 1 | 0.14em, uppercase |

**Rules**
- Set heading line-height and weight yourself on every heading. The site's global rule would otherwise give 1.02, which is too tight for this look.
- Use the `--lc-text-*` sizes, not the site's `--t-*` scale. Note the trap: the site's `--t-base` is a font size, the zone's `--lc-t-base` is a duration.
- The display font is never used below 16px, and never for paragraphs, table cells, form fields or chips.
- No weight below 400 anywhere. The thin type in reference 03 is a poster treatment; it breaks down on older phone screens.
- The hero is capped at 60px, a little under the master prompt's upper figure. The site header and sub-nav use 136px, and at 60px the headline sets in two lines with both choice cards above the fold on a 1366 by 768 laptop.
- 14px is the floor for information. 12px exists only for uppercase eyebrows, and an eyebrow never carries anything a person needs.
- Caregiver reading width: 60 to 68 characters. Set `max-width: 66ch` on lesson text.
- Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.
- **Gradient text:** at most one phrase per page, on the hero or a completion screen, 28px or larger, using `.lc-text-light` from §7. Never on body text, buttons or links.
- Form inputs are 16px or larger so iOS does not zoom on focus.
- Sentence case for headings and labels in the zone. (Common Ground's lowercase-heading voice rule stays in Common Ground.)

---

## 6. Shape, space, elevation

- **Radius:** 28px for the hero panel and the staff app shell only. 20px for cards. 16px for tiles. 12px for inputs, answer options and tables. Pills for buttons and chips. Nothing else is a pill. Cards never exceed 28px.
- **Borders:** 1px. On glass tiers the border is white at 70% (it reads as a lit edge). On solid tiers it is `--lc-border`. Use `--lc-border-strong` only for inputs and secondary buttons, at 1.5px.
- **Shadows:** always the layered navy-tinted stacks in the tokens. Never a single grey blur. `--lc-shadow-1` for resting cards, `--lc-shadow-2` for hover and the hero, `--lc-shadow-3` for the staff shell and dialogs.
- **Coloured shadow:** only under an icon tile, in its own cast.
- **Spacing:** Tailwind's spacing utilities (same 4px base) or the `--lc-s-*` tokens. Not the site's fluid `--s-1` to `--s-5`. Card padding 24px (16px on mobile). Gaps between cards 24px (16px on mobile). Between page sections 48 to 64px.
- **Widths:** use the site's `.wrap` container for caregiver pages so edges line up with the rest of the site (it is layout only, it carries no look). Lesson column 720px. Staff content up to 1320px. Staff sidebar 248px.
- **Breakpoints:** Tailwind's defaults, as the rest of the repo uses (640, 768, 1024, 1280). Design the 390px layout first and check 320px.
- **Targets:** buttons 48px tall. Nothing tappable under 44 by 44px. Answer options at least 56px tall.
- **Focus:** `box-shadow: var(--lc-ring)` on `:focus-visible` for every interactive element (white gap, then `--lc-blue-700`). On the dark sidebar use a 3px white ring. Never remove an outline without replacing it.

---

## 7. The recipes: zone base, atmosphere, surfaces, orb, sidebar, sub-nav, hero

These are the rendered, tested recipes. They follow the token block in `src/app/learn/learn.css`. Use them as written, then tune position only.

```css
/* ═══ 0. ZONE BASE: undo the site's global text rules inside the zone ═══ */
[data-zone="learn"] {
  font: 400 var(--lc-text-body)/1.6 var(--lc-font-body);
  color: var(--lc-ink);
  color-scheme: light;
}
[data-zone="learn"] :is(h1, h2, h3, h4) {
  font-family: var(--lc-font-display);
  font-weight: 600;
  color: var(--lc-ink);
  letter-spacing: -0.02em;
  line-height: 1.2;            /* then set the exact value per heading from §5 */
  text-wrap: balance;
}

/* ═══ 1. ATMOSPHERE: the soft vignette field (reference 03) ═══ */
.lc-atmosphere {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: var(--lc-canvas);
}
.lc-atmosphere::before {
  content: "";
  position: absolute;
  inset: -15%;
  background:
    radial-gradient(36% 34% at 20% 14%, var(--lc-coral-300) 0%, transparent 70%),
    radial-gradient(40% 38% at 86% 18%, var(--lc-blue-300) 0%, transparent 72%),
    radial-gradient(32% 34% at 70% 78%, rgba(118, 161, 243, 0.85) 0%, transparent 70%),
    radial-gradient(34% 32% at 20% 86%, var(--lc-iris-300) 0%, transparent 72%),
    radial-gradient(22% 24% at 4% 52%, var(--lc-teal-300) 0%, transparent 72%);
  filter: blur(48px);
}
/* film grain: kills gradient banding, gives the printed-paper softness of ref 03 */
.lc-atmosphere::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.05;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
}
/* Variants: move the light, never add more of it */
.lc-atmosphere[data-scene="reading"]::before { opacity: 0.55; }           /* lesson player, forms */
.lc-atmosphere[data-scene="staff"]::before {
  background:
    radial-gradient(36% 34% at 88% 10%, var(--lc-iris-300) 0%, transparent 72%),
    radial-gradient(30% 30% at 70% 92%, var(--lc-blue-300) 0%, transparent 72%),
    radial-gradient(26% 26% at 30% 96%, var(--lc-coral-300) 0%, transparent 70%);
  opacity: 0.8;
}
@media (max-width: 640px) {
  .lc-atmosphere::before { inset: -30% -40%; filter: blur(36px); opacity: 0.8; }
}

/* ═══ 2. SURFACES: three tiers, picked by what sits on them ═══ */
.lc-glass {            /* decoration + large ink headings ONLY. Never body text. */
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid var(--lc-border-glass);
  border-radius: var(--lc-r-xl);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), var(--lc-shadow-2);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  backdrop-filter: blur(24px) saturate(140%);
}
.lc-surface {          /* default for anything a caregiver reads */
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--lc-border-glass);
  border-radius: var(--lc-r-lg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), var(--lc-shadow-1);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  backdrop-filter: blur(16px) saturate(120%);
}
.lc-solid {            /* forms, tables, the lesson player, review panels */
  background: var(--lc-white);
  border: 1px solid var(--lc-border);
  border-radius: var(--lc-r-lg);
  box-shadow: var(--lc-shadow-1);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .lc-glass { background: rgba(255, 255, 255, 0.90); }
  .lc-surface { background: var(--lc-white); }
}

/* ═══ 3. THE ORB: one light source, six colors (references 01 + 04) ═══ */
.lc-orb {
  position: relative;
  width: clamp(200px, 32vw, 440px);
  aspect-ratio: 1;
  border-radius: 50%;
  isolation: isolate;
  background:
    radial-gradient(36% 32% at 30% 22%, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(60% 54% at 76% 22%, var(--lc-amber-500) 0%, transparent 70%),
    radial-gradient(52% 48% at 26% 34%, var(--lc-rose-500) 0%, transparent 72%),
    radial-gradient(58% 58% at 16% 76%, var(--lc-teal-500) 0%, transparent 68%),
    radial-gradient(72% 62% at 82% 86%, var(--lc-iris-700) 0%, transparent 72%),
    linear-gradient(160deg, var(--lc-coral-500) 0%, var(--lc-iris-500) 46%, var(--lc-blue-500) 100%);
  filter: blur(3px) saturate(112%);
}
.lc-orb::before {      /* halo: the color that spills past the edge */
  content: "";
  position: absolute;
  inset: -14%;
  z-index: -1;
  border-radius: 50%;
  background: conic-gradient(from 200deg,
    var(--lc-blue-500), var(--lc-iris-500), var(--lc-rose-500), var(--lc-coral-500),
    var(--lc-amber-500), var(--lc-teal-300), var(--lc-blue-500));
  filter: blur(44px);
  opacity: 0.55;
}
.lc-orb::after {       /* terminator shadow: makes a disc into a sphere */
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(78% 78% at 34% 28%, transparent 52%, rgba(11, 31, 59, 0.34) 100%);
  mix-blend-mode: multiply;
}

/* ═══ 4. Gradient headline word ═══ */
.lc-text-light {
  background: linear-gradient(92deg, var(--lc-iris-600) 0%, var(--lc-rose-600) 52%, var(--lc-coral-600) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
@media (forced-colors: active) { .lc-text-light { color: CanvasText; background: none; } }

/* ═══ 5. Dark sidebar ═══ */
.lc-sidebar {
  background:
    radial-gradient(120% 40% at 50% 108%, rgba(118, 161, 243, 0.42) 0%, rgba(167, 139, 250, 0.16) 45%, transparent 75%),
    linear-gradient(180deg, var(--lc-deep-teal) 0%, var(--lc-navy-900) 70%);
  color: var(--lc-on-dark);
}
.lc-sidebar a[aria-current="page"] {
  background: linear-gradient(90deg, rgba(250, 219, 202, 0.30), rgba(255, 158, 136, 0.42));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
}

/* ═══ 6. Motion ═══ */
@media (prefers-reduced-motion: no-preference) {
  .lc-atmosphere::before { animation: lc-drift 60s var(--lc-ease) infinite alternate; }
  .lc-lift { transition: transform var(--lc-t-base) var(--lc-ease), box-shadow var(--lc-t-base) var(--lc-ease); }
  .lc-lift:hover { transform: translateY(-3px); box-shadow: var(--lc-shadow-2); }
}
@keyframes lc-drift { to { transform: translate3d(2%, -1.5%, 0) scale(1.04); } }

/* ═══ 7. Sub-nav: sits under the site header and follows it ═══ */
.lc-subnav {
  position: sticky;
  top: var(--nav-offset, 0px);   /* the SITE's variable, not an lc one: 0 while its header is hidden */
  z-index: 30;                   /* below the site header's z-40 */
  background: rgba(255, 255, 255, 0.86);
  border-block: 1px solid var(--lc-border-glass);
  box-shadow: var(--lc-shadow-1);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  backdrop-filter: blur(16px) saturate(120%);
  transition: top 300ms;
}
.lc-subnav-links a {
  display: inline-flex; align-items: center; min-height: 44px;
  padding: 0 var(--lc-s-3); border-radius: var(--lc-r-pill);
  font: 500 1rem/1 var(--lc-font-body); color: var(--lc-ink-muted);
}
.lc-subnav-links a[aria-current="page"] {
  color: var(--lc-ink); background: var(--lc-white);
  box-shadow: inset 0 0 0 1px var(--lc-border);
}
@media (max-width: 767px) {
  .lc-subnav-links { display: grid; grid-template-columns: repeat(4, 1fr); width: 100%; }
  .lc-subnav-links a { justify-content: center; padding: 0; font-size: 0.9375rem; }
}

/* ═══ 8. Hero: compact, because 136px of site chrome sits above it ═══ */
.lc-hero { position: relative; overflow: hidden; display: grid; gap: var(--lc-s-5); padding: clamp(20px, 2.6vw, 40px); }
.lc-hero-copy { position: relative; max-width: min(62%, 720px); padding-block: var(--lc-s-3) var(--lc-s-2); }
.lc-hero-orb { position: absolute; right: -7%; top: -16%; }     /* out of the grid flow: it must never set the hero's height */
.lc-hero-choices { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: var(--lc-s-5); }
@media (max-width: 767px) {
  .lc-hero { padding: var(--lc-s-5) var(--lc-s-4); }
  .lc-hero-copy { max-width: none; padding: 0 56px 0 0; }
  .lc-hero-orb { right: -120px; top: -110px; opacity: 0.85; }
  .lc-hero-orb .lc-orb { width: 240px; }
  .lc-hero-choices { grid-template-columns: 1fr; gap: var(--lc-s-4); }
}
```

### Atmosphere rules
- One `<div class="lc-atmosphere" aria-hidden="true">` rendered once in the zone layout, fixed behind the page. Never one per section, never one per card. Tested in this repo: it shows through the site's transparent header and the site's dark footer covers it at the bottom.
- Five fields at most. To change the mood of a screen, move or dim the fields. Do not add more.
- No dark field on any caregiver page. Dark belongs to the staff sidebar, the site footer and the primary button.
- The strongest color (the blue field) goes low and to one side, away from the first screen of reading.
- Scenes:

| Scene | Where | Setting |
|---|---|---|
| default | `/learn`, library, topics, trainings, help | full strength |
| `reading` | Lesson player, module overview, all forms | 55% strength. In the player, you may swap the top-left field for the module's `--lc-c300` |
| `staff` | Everything under `/learn/staff` | three fields, kept to the right and bottom, clear of the sidebar |

- Keep the grain. It stops the gradients from banding on cheap screens and it is most of what makes reference 03 feel soft.
- Performance: the blur is on one static pseudo-element. Scroll the page fast on a real mid-range phone. If the field flickers or blanks, lower the blur to 32px; if it still does, replace the gradients with one pre-rendered image of the same field.
- Do not animate `filter`, `background-position` or gradient stops. The only motion is the slow `transform` drift.
- Reduced motion: the drift is inside a `no-preference` query, so it is simply absent. Nothing else to do.

### Orb rules
- **One orb per screen, and on most screens none.**
- Allowed: the `/learn` hero (large, absolutely positioned and cropped by the hero's top-right corner, as in reference 01 and the specimen). Module completion (96px, behind the check icon). Empty states and the 404 page (120px, 70% opacity).
- On mobile the hero orb is 240px, pinned so only its lower-left quarter peeks in from the top-right corner. It must not touch the headline.
- It is decoration: `aria-hidden="true"`, no alt text, no pointer events, never a button, never a loading spinner, never the logo. Name the component `LcOrb`. The repo already has a `BreathingOrb` for Common Ground's calm tool; that is a different thing, leave it alone.
- It may drift a few pixels with scroll if motion is allowed. It never spins or pulses.
- Do not put text on it. Glass panels may overlap its edge.

---

## 8. Surfaces: three tiers

Pick the tier by what sits on it. This is the single most important rule for keeping the glass look readable.

| Tier | Opacity | Carries | Used for |
|---|---|---|---|
| `.lc-glass` | 55% white, blur 24px | Headings in `--lc-ink` at 20px or larger, decoration, other cards. **Never body text, never muted text, never form fields.** | The hero panel. Decorative frames. |
| `.lc-surface` | 86% white, blur 16px | Anything a caregiver reads | Header, choice cards, topic tiles, module cards, training cards, FAQ |
| `.lc-solid` | 100% white | Dense or critical content | Lesson player, knowledge checks, forms, upload, tables, review panels, dialogs |

- Nesting goes one way: solid on surface on glass on atmosphere. Never glass inside solid.
- At most two glass tiers stacked. Three reads as fog.
- The fallback for browsers without `backdrop-filter` is in the recipe. Test it by disabling the property once.
- A choice card or metric tile may add a cast wash on top of its tier: `background: linear-gradient(135deg, var(--lc-c100), rgba(255,255,255,.9) 62%)`.

---

## 9. Components

**Site header.** It gains one item and nothing else changes: "Learn" as the sixth link in the main row, linking to `/learn`, shown only when the zone is enabled. The integration brief has the exact edit and why the label is the short one (the full name does not fit; tested). It is styled by the site, not by this guide. Do not restyle the header.

**Learning Center sub-nav.** The zone's only navigation chrome, modelled on the existing `CgSubNav`. A full-width bar directly under the site header, sticky at `top: var(--nav-offset)` (the site's own variable, so it follows the header when it hides). `.lc-surface` look with no radius, 56px tall. Left: "Caregiver Learning Center" in the display font, 16px SemiBold, linking to `/learn`. Right: Home, Learning Library, Live Trainings, Help & FAQ as 44px pill links in DM Sans Medium 16px `--lc-ink-muted`; the current one is `--lc-ink` on a white pill with `aria-current="page"`. Far right: "Staff sign-in" in 14px `--lc-ink-muted`. No caregiver login button anywhere. Under 768px: four equal tabs with short labels (Home, Library, Trainings, Help), 52px tall, no sideways scrolling; the product name and Staff sign-in drop out (Staff sign-in moves to the bottom of the Help page and the education band). The sub-nav is hidden inside the lesson player. Recipe in §7.

**Buttons.** Pills, 48px tall, 24px side padding, DM Sans SemiBold 16px, label never wraps. Do not use the site's `.btn-primary` (it is cobalt) or any other `.btn-*` class inside the zone.
- Primary: `--lc-ink` fill, white text, optional `arrow-right` after the label. One per card, one per view.
- Secondary: white fill, `--lc-ink` text, 1.5px `--lc-border-strong` ring.
- Quiet: no fill, `--lc-blue-700` text, underline on hover.
- Destructive: `--lc-rose-700` fill, white text.
- Disabled: `--lc-slate-100` fill, `--lc-slate-700` text, and a line of text nearby saying why.
- Hover: lift 1px and go to `--lc-shadow-2`. Pressed: back to rest.
- Links that leave the site (the Teams registration handoff) carry an `external-link` icon and say where they go.

**Hero (`/learn`).** `.lc-glass`, 28px radius. Eyebrow, headline with `.lc-text-light` on "everyday life.", one lead sentence, then the two choice cards inside the same panel. Orb cropped at the right edge. The site header and the sub-nav take 136px before the hero starts, so the hero is deliberately compact: 40px padding, no tall empty space, the orb positioned absolutely so it never sets the hero's height. Acceptance, tested with the recipe in §7: at 1366 by 768 both choice-card buttons are fully visible without scrolling. At 390 by 844 both cards are visible.

**Choice cards.** Two, identical in size, structure and weight. `.lc-surface` plus cast wash (teal, coral). 64px icon tile, display-font SemiBold 22px title, one muted sentence, one primary button with a text label. The whole card is one link. Stack on mobile with full-width buttons. Under 360px the icon tile moves above the text so nothing overflows.

**Topic tiles.** `.lc-surface`, 16px radius. 56px icon tile in the category cast, then the category name in the display font, Medium 16px. Six across on desktop, three at 1024, two on mobile. The whole tile is the target.

**Module card.** `.lc-surface`. Top row: 40px icon tile in the category cast and the category name in `--lc-c700`, DM Sans SemiBold 14px. Then title (display font, Medium 20px), a two-line summary in `--lc-ink-muted`, a meta row with a `clock` icon and the duration and a `layers` icon and the lesson count, and a primary button: "Start learning" or "Continue learning". If there is local progress, a 4px bar in `--lc-c600` on a `--lc-c100` track with "Lesson 2 of 4" beside it. No ratings, no scores, no avatars.

**Training card.** `.lc-surface`. Left: a date block, 72px wide, `--lc-coral-100` fill, month in an eyebrow, day numeral in the display font, SemiBold 28px, weekday below. Right: title, then the time written like "6:00 to 7:00 PM CT", presenter if approved, and a slate chip reading "Currently enrolled families only". In demo mode with no real date, the block shows a `calendar-days` icon and the word "Example" instead of a made-up date. Buttons: "View details" (secondary) and "Request registration" (primary, `external-link`). A cancelled event keeps its card, gains the Cancelled chip, and its date block goes to `--lc-slate-100` with the date struck through and the word "Cancelled" in text.

**Lesson player.** `reading` scene. One `.lc-solid` card, 720px max, 28px radius on desktop and full-bleed with 0 radius under 480px. Focus mode: the sub-nav is not rendered and the site footer is hidden with the repo's existing `:has()` pattern (see `FlowChromeIsolation.tsx`). The site header stays; it hides itself on scroll.
- Top bar: Back (secondary, icon plus word), "Lesson 2 of 4" in DM Sans SemiBold 14px, "Save and exit" (quiet).
- Progress: one segment per step, 6px tall, 4px gaps, fully rounded. Done `--lc-c600`, current `--lc-c600` with a 2px `--lc-c300` halo, upcoming `--lc-slate-100`.
- Step label: an eyebrow naming the step type (Scenario, Knowledge check, Takeaways) with a 20px icon in `--lc-c700`.
- Body: 17 to 18px DM Sans, 66ch.
- Scenario steps: `--lc-c100` panel, 16px radius, and a line reading "Example story, not a real family."
- Bottom bar: Back on the left, Next on the right, both 48px, sticky on mobile with a white fade above it.
- Sample content carries the amber demo strip (wording from master §06) directly under the top bar on every step.

**Knowledge check.** Options are 56px-plus rows, 12px radius, 1.5px `--lc-border-strong` ring, a real radio or checkbox on the left. Selected: 2px `--lc-ink` ring and `--lc-paper` fill.
- Right answer: a teal panel below the option (`--lc-teal-100`, 3px left bar in `--lc-teal-700`, `circle-check`). It starts with a short bold phrase, then the reason.
- Not-yet answer: an **amber** panel (`--lc-amber-100`, `--lc-amber-700` bar, `undo-2`). It says what to look at and ends with "You can try again."
- No red, no cross icons, no shake, no sound, no confetti, no score. Feedback is announced through an `aria-live` region.

**Module completion.** A 96px orb behind a white 64px circle holding a `check` in `--lc-teal-700`. Title in the display font with one `.lc-text-light` phrase. Then takeaways, related modules, and "Return to library".

**Staff sidebar.** The `.lc-sidebar` recipe, 248px. At the top, text only: "Learning Center" in the display font, 18px SemiBold, white, with a "Staff workspace" eyebrow under it. No logo here (the logo's navy heart disappears on a dark ground). A "Back to site" link sits at the bottom. Items: 44px tall, 12px radius, 20px Lucide icon, DM Sans Medium 15px in `--lc-on-dark-muted`. Current item: white text plus the warm pill from the recipe and `aria-current="page"`. Under 1024px it becomes a drawer opened by a labelled Menu button.

**Staff shell.** A full app shell. The site header, footer and mobile bar are hidden on `/learn/staff` (the brief says how). On desktop, sidebar and content sit together in one 28px-radius frame with `--lc-shadow-3`, as in reference 01. Under 1024px the frame is dropped.

**Metric tiles.** 16px radius. Background `linear-gradient(160deg, var(--lc-c100), var(--lc-white))` with a 1px `--lc-border` ring. 36px icon tile top-left, numeral in the display font, SemiBold, with tabular numbers, label in 14px `--lc-ink-muted`. Every label says exactly what was counted. Missing values show "Not yet available", never 0. Give each tile a different cast so a row does not read as one block: iris, blue, teal, coral.

**Charts.** Use `chart.js` through `react-chartjs-2`, both already installed. Do not add a chart library. Set chart fonts to DM Sans. One series where possible. Line: 2.5px `--lc-iris-600` with a fill that fades from `--lc-iris-300` to transparent. Bars: `--lc-blue-600` on a `--lc-slate-100` track, 8px tall, fully rounded, value in text at the end. Axis text 14px `--lc-ink-muted`. Gridlines `--lc-border`, horizontal only. Every chart has a "View as table" toggle. A second series uses `--lc-teal-600` and a different dash or marker shape as well as a different color.

**Tables.** `.lc-solid` container, 12px radius. Header row `--lc-paper`, DM Sans SemiBold 14px `--lc-ink-muted`. Rows 56px, 15px text, `--lc-border` dividers, no zebra stripes. Hover `--lc-paper`. Under 768px each row becomes a card.

**Forms.** Do not use the site's `.input-field` or `.label` classes. Label above the field in DM Sans SemiBold 15px. Field 52px tall, 12px radius, white, 1.5px `--lc-border-strong`, 16px text. Helper text 14px `--lc-ink-muted` below. Error: border `--lc-coral-700`, message with `circle-alert` below. Wizard steps use the same segmented bar as the lesson player, in blue.

**Upload dropzone.** 20px radius, 2px dashed `--lc-iris-600`, `--lc-iris-100` fill, `cloud-upload` icon in a 56px iris icon tile, "Drop your PowerPoint here", and a real "Browse files" secondary button. Dragging over it: solid border and `--lc-iris-300` fill. After upload it becomes a file row with a `file-text` icon, the file name, its size, and a Remove button.

**Demo banner.** Full-width amber strip at the very top of every demo-mode staff page, above the shell. Not dismissible.

**Empty states.** A 120px orb at 70% (or none on dense staff pages), a display-font Medium 20px line, one muted sentence from master §18, one button.

**Search.** A full-width field, never an icon alone: 52px tall, `search` icon inside on the left, the visible label "Search learning topics" above it, and a clear button once there is text.

**Education band and footer.** The site's own footer is the dark block at the bottom of every caregiver page. Leave it untouched. Directly above it, inside the zone, sits one quiet band on `.lc-surface`: the educational-use statement from master §16, links to `/learn/privacy` and `/learn/accessibility`, the pilot notice, and "Staff sign-in".

**Icons.** `lucide-react` only, as the rest of the site uses. Stroke 1.75. 20px in navigation and buttons, 24 to 30px in icon tiles, 16px in chips. Icons that carry meaning always have a text label beside them.

---

## 10. Three densities, one system

Same tokens, same components. Only the dial changes.

| | Caregiver | Contributor | Leadership |
|---|---|---|---|
| Atmosphere | default or `reading` | `staff` | `staff` |
| Navigation | site header plus sub-nav | dark sidebar, site chrome hidden | dark sidebar, site chrome hidden |
| Main tier | `.lc-surface` | `.lc-solid` | `.lc-solid` |
| Body text | 17px | 16px | 15px in tables, 16px elsewhere |
| Colors on screen | one cast, plus the orb on `/learn` | status chips only | status chips, gate colors, chart |
| Orb | `/learn` hero, completion | empty states only | none |
| Things per screen | one decision | one task | queue first, numbers second |

The caregiver side must always look calmer and simpler than the staff side. If a caregiver page starts to feel like a dashboard, remove things.

---

## 11. Motion

- Use `framer-motion`, already installed, and its `useReducedMotion` as the site's `motion.tsx` does. Durations and easing come from the tokens: 140ms for presses and color, 220ms for hover lift and panels, 420ms for a step changing in the player.
- Hover lift: 3px for cards, 1px for buttons. No tilt.
- Player step change: 12px slide plus fade, in the direction of travel.
- Atmosphere: 60 second drift, `transform` only.
- Nothing loops except that drift. No autoplay, no pulse, no shimmer except loading skeletons (`--lc-slate-100` to `--lc-paper`, 1.2s).
- Wrap every animation in `@media (prefers-reduced-motion: no-preference)`. With motion reduced, state changes are instant and nothing moves.

---

## 12. Never

- More than one orb on a screen, or an orb standing in for a picture that would explain something.
- Body text, muted text or form fields on `.lc-glass`.
- A 500-step color used for text, icons or a control's only edge.
- Logo red, or any red, as a UI color.
- Site tokens or site classes inside the zone: no `bg-paper`, `text-ink`, `bg-cobalt`, `.btn-*`, `.card`, `.chip`, `.eyebrow`, `.h1`, `Section`, `Portal`, arches. And no `lc-` anything outside the zone.
- Instrument Serif. The site's one-italic-word headline device stays on the site; the zone's equivalent is the one gradient phrase.
- `dark:` utilities. The zone is light only for the pilot.
- A new font file, a new icon set, a new chart library.
- A dark atmosphere field on a caregiver page.
- Rainbow or multi-hue gradients on borders, buttons or cards. Gradients belong to the atmosphere, the orb, icon tiles and one headline phrase.
- Glow behind a paragraph. Neon. Pure black. Grey single-layer shadows.
- Arrow-only or icon-only buttons.
- Type under 14px that matters. The display font under 16px. Any weight under 400.
- Cartoon illustration, stock photos of families, clip art, emoji as icons.
- Screenshots of the references used as page content.
- Anything from the references' fake data, names or logos.

---

## 13. Visual QA before calling a screen done

Screenshot each key screen at 390 by 844, 768 by 1024, 1366 by 768 and 1440 by 900. Put `/learn` next to reference 01 and `06_IDENTITY_SPECIMEN.png`. Put the bare atmosphere next to reference 03.

- [ ] Squint test passes: color at the edges, white in the middle, one dark thing.
- [ ] `/learn` at 1366 by 768: both choice cards and both buttons visible without scrolling. At 390 by 844: both cards visible.
- [ ] The two choice cards are the same size and weight.
- [ ] No text sits on `.lc-glass` except `--lc-ink` headings of 20px or more.
- [ ] Every text and surface pair measured on the real screen: 4.5:1 for text, 3:1 for large text and graphics.
- [ ] Tab through the page: every stop shows the focus ring, including on the sidebar.
- [ ] Reduced motion on: nothing moves.
- [ ] `backdrop-filter` off: every panel is still readable.
- [ ] 320px wide and 200% zoom: no sideways scroll, nothing cut off.
- [ ] Each screen shows one cast (topic grid and library excepted).
- [ ] Source and final-module reviews are told apart at a glance by color, icon and words.
- [ ] Published is the only solid chip.
- [ ] Site header, logo and footer look exactly as they do on the rest of the site.
- [ ] Before and after screenshots of `/`, `/families` and `/locations/sugar-land` are identical: nothing outside the zone changed.
- [ ] No `lc-` class or `--lc-` token appears outside `src/app/learn`, `src/components/learn`, `src/lib/learn`, `src/data/learn`. The one exception is the `lc` color group in `tailwind.config.ts`.
- [ ] Scroll down and back up: the sub-nav stays attached to the site header in both states.
- [ ] Demo banner and demo labels present wherever sample data shows.
- [ ] Score the ten-point rubric in master §21. Fix anything under 4.


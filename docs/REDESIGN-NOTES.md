# The Open World redesign: decisions, tests, limits

## The idea in one line

**The world is bigger here.** Every shape on the site is a doorway: an arch you walk through, a horizon you walk toward. Not a door icon. A way of framing type, data and (eventually) photography so the site is recognizable with the logo removed.

## Significant visual and UX decisions

| Decision | Why |
| --- | --- |
| One signature shape family (arch, threshold, horizon) instead of cards | The brief rejects rounded-card templates. Arches frame headlines, mask images, hold data, and become the location pins on the map. |
| Deep Ink on Warm Canvas as the reading environment; Electric Cobalt as the only brand anchor; Butter, Persimmon, Sage, Lavender as section identities | Accents mean something: butter marks "you are here" moments (tour, closing CTA), lavender is Common Ground, sage is Texas law, persimmon is "you pay." They never all appear at once. |
| Bricolage Grotesque (display), DM Sans (UI), Instrument Serif italic for one word per headline | The italic word is where the emotion sits ("happens *next.*", "day *one.*"). Everything else stays calm and legible. 18px minimum body. |
| Homepage as nine acts with a composition shift every third section | Opening (type + portal), three doors, journey, map, explorer, Common Ground shift, insurance explainer, humans, closing. |
| Journey: sticky portal that opens as you scroll | The motif literally opens as the family gets closer to day one. Fully readable with no scroll effects; keyboard buttons jump between steps. |
| Dot-field Texas map with six arch pins | Texas-inspired, not western. The list of buttons is the accessible truth; the map is the same list drawn. |
| Service explorer as an index + one composed panel | Six identical cards were the thing to avoid. Keyboard tabs on desktop; everything stacked on mobile, nothing hidden. |
| Insurance as one illustrative year drawn as a bar | Five words, one picture, labeled "example numbers, not yours." No calculator, no estimate. |
| Common Ground gets a lavender zone | `[data-zone="families"]` shifts the canvas tokens so the product feels like a calmer room in the same house. Existing Common Ground code is untouched in substance. |
| Reveals that can never hide content | Server HTML is visible. JS hides only below-the-fold elements, reveals on intersection, and a 3.5s timeout reveals everything regardless. Reduced motion never animates. |
| First-visit loading screen removed | The brief says no forced loaders or elaborate entrances. The arch now opens inside the hero, in CSS, before JavaScript arrives. |
| Hero actions are "Find a center" and "Talk to someone"; "Request a tour" stays in the header, menu, finder result, sticky mobile bar and closing | The hero orients, the next screen converts. |

## Copy and honesty audit (changes made)

- Parent Pulse: the home page used to say "your team sees the pattern." Parent Pulse stores on-device only. Copy now says "It stays on your device. Never a score, never a streak," matching the product.
- Tour step: "If it feels right, we schedule your first day" implied therapy starts right after the tour. Now: "we finish benefits and authorization, your BCBA writes the plan with you, and we set a start date."
- The hero headline "A whole lot of life happens next." is sample creative copy for stakeholder approval.
- Every step duration is labeled "typical, to confirm" in the Journey facts.

## Tests run

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next lint` | clean |
| `next build` | 72 routes, clean |
| `npm run check:content` | no lorem, no 000-0000 |
| Horizontal overflow at 375 and 1440 on 21 templates | none |
| One H1 per page on 21 templates | yes |
| axe-core WCAG 2.0/2.1/2.2 A+AA on 12 templates at 375 and 1440 | no violations after fixes (contrast tokens, decorative SVG, 24px targets, inert sidebar, no butter-on-cobalt small text) |
| No-JS render of a center page | all content visible |
| Lighthouse mobile, simulated throttling, headless Chromium | Home 90 (FCP 1.1s, CLS 0.001, TBT 120ms, LCP 3.5s). Pearland center page 91 (LCP 3.0s, CLS 0). |
| Page errors in headless Chromium across 21 templates | none |

Not measured: real-device Core Web Vitals, screen reader walkthroughs, color-blind simulation. Do those before launch.

## Known limits and incomplete areas

- **No photography.** Every center and service uses the illustrated Doorway placeholder, labeled "Center photos coming." The site is designed to receive real photos in `locations[].photos` and will mask them in the arch automatically.
- **People.** Only Marcie Pena is named. Clinical directors and the Regional Executive Directors are hidden until supplied.
- **Spanish** is a labeled stub at `/es`, not a translated site.
- **Common Ground inner pages** keep their original component styling (white surfaces, their own buttons). They inherit the new fonts, cobalt and the lavender canvas, but a page-by-page pass inside `/families/**` is still to do.
- **Events** show the designed empty state until an Eventbrite organizer id or manual events exist.
- **Dark mode** tokens exist but are opt-in (`data-theme="dark"`) because Common Ground pages hard-code light surfaces.
- **Lighthouse LCP** on simulated slow mobile is above the 2.5s field target. Fonts are self-hosted, preloaded and `swap`; the hero paints without JS. Measure in the field after deploy; the next lever is trimming the display font to the glyphs used.

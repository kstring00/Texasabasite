# Verify with Dom

Everything on the site is either on texasabacenters.com today ("verified") or a draft to confirm ("assumed"). Headlines are drafts, not proven winners.

## Verified (on the current site or in its press)

- Six centers: Austin, Cedar Hill, Katy, Pearland, Plano, Sugar Land, with the addresses in `src/data/locations.ts`. Katy shows two addresses on the current site; we used the contact-page one.
- Phone lines (877) 771-5725 and (844) 620-8837; phone hours every day 8:00 AM to 10:00 PM.
- "Without a long waiting list."
- Diagnostic evaluations offered; a diagnosis is needed before ABA starts; some children can be evaluated at 12 to 18 months.
- Child ABA ages 2 to 12; 20 to 40 hours a week; programs up to three years; BCBAs with RBTs.
- Teen ABA: social, communication, self-care, focus, future planning, money management, reading; age-appropriate activities; regular progress reviews.
- Early intervention from about age two; earlier starts generally tied to better outcomes.
- In-home and in-school ABA offered; the team checks coverage and explains authorization before treatment.
- Texas insurance mandate for state-regulated plans (diagnosis before 10th birthday). Texas Medicaid has covered ABA since Feb 2022.
- Spanish is offered on the current site.
- Common Ground scope: While You Wait, parent circles (pilot), caregiver tools, resource library.

## Assumed (confirm, change, or remove)

| Line on the site | Where | What to confirm |
| --- | --- | --- |
| "A real person texts you within one business day" | Hero, form, confirmation, every CTA | Is one business day the real promise? By text? |
| Step durations: "10-minute call," "one or two visits," "a few business days," "30 to 45 minutes," "first days are shorter" | Getting Started, Home path | Each number. |
| "Typically within 47 days" from first contact to therapy | Hidden. In the 2023 launch press release. | Still true? If yes, set `typicalStart` per center and it appears. |
| "If the answer is autism, we can start planning care the same week" | Diagnosis service | Clinical sign-off. |
| "Neurodiversity-affirming, play-based, parents included in every plan" | Services, Home bridge | Exact wording Texas ABA wants. |
| "Parent training in every plan, not an add-on" | Home bridge, Child ABA | Is it in every plan? |
| Teen label "13 and up" | Teen service | The current site says teens without an age. |
| What to bring to each step | Getting Started | Front-desk review. |
| "Kids and siblings welcome on the tour" | Tour page | Confirm. |
| Marcie Pena, Business Development, as the named tour responder | Home, Tour, Contact, Providers | Her title, photo, direct line, and whether she wants to be the name on the form. |
| Regional Executive Directors by name | Team page (hidden until supplied) | Names, titles, regions, photos. Dom included. |
| Clinical directors per center | Team page, location pages (hidden) | Names, credentials, photos. |
| Parent Pulse | /families/pulse | Demo UI only, device-only storage. Whether anything ever goes to the care team is a clinical + compliance decision. |
| Privacy policy | /privacy | Draft for legal. |
| Careers link | Footer, Contact | `https://www.texasabacenters.com/about-us/careers/` |
| Center hours | Location pages (hidden) | The current site only lists phone-line hours. |
| Service area for in-home | In-home service | Radius per center. |

## Not on the site on purpose

- No reviews, ratings, awards, outcome statistics, wait-time numbers, or "spots available" counts.
- No stock photos presented as our centers or staff. Centers show an illustrated placeholder that says "Center photos coming."
- No invented blog authors. Posts are bylined "Texas ABA Centers, draft" until assigned.
- No diagnosis, medical history, or insurance ids on the tour form.

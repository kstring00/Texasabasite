# IT / Clinical / Organizational Approval Checklist

This project has a **locally runnable prototype-first** plan. The following items must be confirmed before storing real staff submissions, using corporate systems, or making the website public.

## Required before any real use

These are not optional and nothing below replaces them. The demo deliberately has none of the three, and says so on its own screens. **Do not put a real staff member, a real PowerPoint or a real family anywhere near the staff workspace until the first two are in place and signed off. Do not enter or quote a per-center number until the third is.**

- [ ] **Real staff sign-in.** Staff must sign in through the organization's approved identity provider, with accounts that can be added, changed and removed by IT. What exists today is a demo role picker with five fictional roles and no password. It is not authentication. It works only on a local machine and is refused on every deployment (`LEARN_DEMO_STAFF` is ignored whenever `VERCEL` is set).
- [ ] **Malware scanning of every uploaded file.** Every PowerPoint must be scanned by an approved service before anyone can open or download it, with a clear state for "scan pending" and "scan failed". What exists today only checks that a file really is a `.pptx` and is under 40 MB. Every stored file is marked "not scanned", and the screens say "Not scanned for malware in the demo".
- [ ] **The Microsoft Teams registration form asks every family which center their child attends.** The "Registrations by center" figures on the reporting page can only come from this one question. The website has no other way to know a family's center, and staff must never estimate it or look families up to fill it in. Before the first real training: add the question to the registration form as a required question with the six centers as a fixed list (Pearland, Sugar Land, Katy, Plano, Cedar Hill, Austin), use the same form for every training, tell families on the form why it is asked, and confirm who may see the answers inside Teams. Until this is done, leave the per-center boxes empty when entering numbers. The reporting page then says "Not yet available" for centers, which is correct. If the clinic decides not to ask, per-center reporting should be switched off, not left empty.

Two more that follow directly from those:

- [ ] **Private, organization-approved file storage.** Today, uploads are written to a `.learn-demo/` folder on the developer's own computer and nowhere else. That folder is not a storage system.
- [ ] **A way to detect client information in uploads, or a staffed check.** The contributor checklist is a set of tick boxes. It does not inspect the file.

## Corporate identity and authorization
- [ ] Written approval to build and operate official Sugar Land clinic website.
- [ ] Owner of product and designated Clinical Director responsible for content governance.
- [ ] Official branding/logo, domain, hosting, content policies, and legal disclaimers approved.
- [ ] Production staff sign-in identity provider and provisioning/deprovisioning rules approved.
- [ ] Server-side permission matrix for contributors, reviewers, producers, publishers, event managers, analysts, IT administrators.

## PowerPoint submissions and content
- [ ] Organization-approved encrypted private file storage; file-size and format policy.
- [ ] Malware scanning, safe private downloads, retention/deletion policy, access audit logs.
- [ ] Staff training on no PHI/client identifiers/real case data in submissions.
- [ ] Defined authority for source-PPTX clinical approval and separate final-module approval.
- [ ] External AI use approved for **only sanitized, source-approved** material; organizational AI policy/vendor review satisfied.

## Microsoft Teams events
- [ ] Teams event/webinar type and licenses verified for external caregiver registration.
- [ ] Manual approval and lobby restrictions verified in this tenant.
- [ ] Appropriate registration form questions and storage disclosures approved.
- [ ] Organizer and backup process established for attendance reporting.
- [ ] Event recording/transcription, Q&A, chat, privacy and retention rules agreed.
- [ ] Official registration URL handling tested with a non-employee external test account.

## Reporting/privacy
- [ ] Aggregate-only dashboard metrics and metric definitions approved.
- [ ] No individual family attendance stored or presented in website analytics.
- [ ] Small group threshold and suppression rules reviewed to avoid reidentification.
- [ ] Approved analytics service or privacy-safe manual event aggregation selected.
- [ ] Appropriate public privacy notice, cookie/accessibility text, and contact options approved.

## Production readiness
- [ ] Security review: auth, role checks, upload/download access, sensitive file metadata, dependency updates, logs, backups.
- [ ] Accessibility review at WCAG 2.2 AA target including actual device and screen reader testing.
- [ ] Clinically reviewed real launch modules available; demo content hidden from production.
- [ ] Testing passed for the parent registration handoff and the two approval gates.
- [ ] Formal sign-off by IT/security/compliance and clinical leadership prior to public deployment.

## Added for the existing-site integration
- [ ] Approval for the Learning Center to live on the same site and domain as the main Texas ABA Centers site, under `/learn`.
- [ ] Site-wide Vercel Analytics already records anonymous page views, which will include `/learn` pages. Confirm this is acceptable or exclude `/learn`. No Learning Center events (module starts, quiz answers, registration clicks) are tracked.
- [ ] Vercel preview deployments are reachable by anyone with the link. Confirm who may be sent a preview, and that staff demo access stays local-only until real sign-in exists.
- [ ] The site's existing AI assistant route (`/api/chat`, from Common Ground) is not used anywhere in the Learning Center. Confirm that stays the rule.

## Added during the build (phases 2 and 3)
- [ ] **Reviewer independence rules confirmed by clinical leadership.** Three rules are built in and switched on: nobody reviews their own submission, the two approvals come from two different people, and whoever imported a module cannot approve it. They live in one place (`LC_REVIEW_POLICY` in `src/lib/learn/staff/pipeline.ts`). See section 24 of `REVIEW_SHEET.md`.
- [ ] **Role permissions confirmed.** RBTs and apprentices contribute only. BCBA reviewers approve but cannot publish. Only the Clinical Director role publishes and withdraws. A producer imports but cannot approve or publish. IT administrators get no clinical permissions by default. The table is `src/lib/learn/staff/roles.ts`.
- [ ] **Draft wording reviewed.** `REVIEW_SHEET.md` lists every line written during the build. Nothing in it has been clinically approved.
- [ ] **Unsaved typing in the submission form.** To survive a refresh, the form keeps a contributor's unsaved typing in that browser tab's session storage until it is saved. It holds only what they typed into the form (title, summary, objectives), is cleared when the tab closes or the role changes, and is never sent anywhere except the save. Confirm this is acceptable.
- [ ] **Audit trail retention.** Every review, import, publish and withdraw is recorded with who and when. Today that record lives in the local demo store. Decide where it lives and how long it is kept.
- [ ] **Where a module is made.** The website has no connection to any AI service and no "generate" button. Turning an approved PowerPoint into a module happens outside the website. Confirm which tools are approved for that, and that only approved, client-free material goes into them.

## Added during the build (phase 4: training listings and reporting)
- [ ] **No connection to Microsoft Teams.** The website does not sign in to Teams, read from it or write to it. A member of staff pastes the registration link and, after each training, types in totals read from the organizer report. Confirm this manual process, or plan a later integration separately.
- [ ] **Which registration links are accepted.** A listing accepts only an `https` address on `events.teams.microsoft.com` or `teams.microsoft.com`, and refuses anything that looks like a link for joining a meeting. Confirm these are the right addresses for this tenant (also open question 2 on the review sheet).
- [ ] **What the reporting store holds.** For each training: three whole-number totals, whether it was held, the date the report was read, where the numbers came from, an optional split by center and by "how did you hear", who entered it and when. There is no field for a name, an email address, a child or a row per person, and no file upload. Confirm that is the complete list the clinic wants kept.
- [ ] **Small-number rule.** A count under 5 for one center or one source at one training is never shown, on screen or in the download. It is folded into "Other / not displayed" with at least one other count, so it cannot be worked out by subtracting, and the folding is done per training so comparing two date ranges cannot reveal it. The 5 is one setting (`LC_SMALL_CELL_MINIMUM`). Compliance to confirm the number and the method.
- [ ] **The raw splits are stored.** The person entering a split can type a small count. It is kept in the store so it can be corrected, but it is not shown again to anyone. In a real system that store needs the same access control as the dashboard.
- [ ] **Who may enter and see numbers.** One permission covers both, and in the demo only the Clinical Director role has it, along with managing listings. Decide who holds it, and whether entering and viewing should be separate.
- [ ] **Metric definitions approved.** The eight definitions on the reporting page (review sheet, section 32) are draft wording. In particular: attendances are not a count of different people, and the rate is only shown for trainings with both numbers.
- [ ] **Download and print.** The reporting page can download a spreadsheet file of the same totals and print the page. Both carry the definitions. Decide whether downloads are allowed, who may make them and where they may be stored.
- [ ] **Corrections.** A correction needs a reason and adds a new revision. Earlier revisions are kept and never edited. Decide how long revisions and the history are kept.
- [ ] **Registration form questions.** The splits only make sense if the Teams registration form asks for the family's center or how they heard about the training. Decide whether to ask, with what notice to families. The five answers in the demo are placeholders.
- [ ] **Example listings in the local demo.** Eight made-up listings with made-up totals are seeded on a local machine so the screens have something to show. Their dates are counted from the day the demo is reset. They never appear on a deployed site, and every reporting page carries the banner "Illustrative demo data — not actual caregiver attendance".
- [ ] **Not built.** Registration deadline and capacity are left out, because nothing reliable supplies them yet and a guessed number of seats must never be shown. Page-view or module-completion figures are also left out of reporting: no approved, privacy-preserving analytics exists for them, and progress saved in a caregiver's browser is never read by the site.

## Useful official references to verify when IT work begins
- Microsoft Teams event planning: https://learn.microsoft.com/en-us/microsoftteams/plan-webinars
- Teams registration form admin settings: https://learn.microsoft.com/en-us/microsoftteams/manage-registration-form-events
- Microsoft Graph webinars API overview: https://learn.microsoft.com/en-us/graph/cloud-communications-virtual-events-webinar-usecases
- WCAG 2.2 recommendation: https://www.w3.org/TR/WCAG22/

These are planning references, not evidence that the organization's account has specific licenses, permissions, agreements, or a compliant configuration.

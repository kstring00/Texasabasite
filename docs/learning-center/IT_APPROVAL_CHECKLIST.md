# IT / Clinical / Organizational Approval Checklist

This project has a **locally runnable prototype-first** plan. The following items must be confirmed before storing real staff submissions, using corporate systems, or making the website public.

## Required before any real use

These are not optional and nothing below replaces them. The demo deliberately has neither, and says so on its own screens. **Do not put a real staff member, a real PowerPoint or a real family anywhere near the staff workspace until both are in place and signed off.**

- [ ] **Real staff sign-in.** Staff must sign in through the organization's approved identity provider, with accounts that can be added, changed and removed by IT. What exists today is a demo role picker with five fictional roles and no password. It is not authentication. It works only on a local machine and is refused on every deployment (`LEARN_DEMO_STAFF` is ignored whenever `VERCEL` is set).
- [ ] **Malware scanning of every uploaded file.** Every PowerPoint must be scanned by an approved service before anyone can open or download it, with a clear state for "scan pending" and "scan failed". What exists today only checks that a file really is a `.pptx` and is under 40 MB. Every stored file is marked "not scanned", and the screens say "Not scanned for malware in the demo".

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

## Useful official references to verify when IT work begins
- Microsoft Teams event planning: https://learn.microsoft.com/en-us/microsoftteams/plan-webinars
- Teams registration form admin settings: https://learn.microsoft.com/en-us/microsoftteams/manage-registration-form-events
- Microsoft Graph webinars API overview: https://learn.microsoft.com/en-us/graph/cloud-communications-virtual-events-webinar-usecases
- WCAG 2.2 recommendation: https://www.w3.org/TR/WCAG22/

These are planning references, not evidence that the organization's account has specific licenses, permissions, agreements, or a compliant configuration.

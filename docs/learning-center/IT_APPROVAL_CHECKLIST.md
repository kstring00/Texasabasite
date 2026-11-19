# IT / Clinical / Organizational Approval Checklist

This project has a **locally runnable prototype-first** plan. The following items must be confirmed before storing real staff submissions, using corporate systems, or making the website public.

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

## Useful official references to verify when IT work begins
- Microsoft Teams event planning: https://learn.microsoft.com/en-us/microsoftteams/plan-webinars
- Teams registration form admin settings: https://learn.microsoft.com/en-us/microsoftteams/manage-registration-form-events
- Microsoft Graph webinars API overview: https://learn.microsoft.com/en-us/graph/cloud-communications-virtual-events-webinar-usecases
- WCAG 2.2 recommendation: https://www.w3.org/TR/WCAG22/

These are planning references, not evidence that the organization's account has specific licenses, permissions, agreements, or a compliant configuration.

# REUSABLE CLAUDE CODE PROMPT — APPROVED PPTX → GUIDED LEARNING MODULE

**Use this prompt separately after** a BCBA or Clinical Director has approved the source PowerPoint. This is **not** an instruction to automatically convert every uploaded presentation.

> **In this repo.** The Learning Center lives inside the Texas ABA Centers site. The manifest schema and validators are in `src/lib/learn/`, module data in `src/data/learn/`, components in `src/components/learn/`, and the look is defined in `docs/learning-center/DESIGN_REFERENCE_GUIDE.md` (the `--lc-*` tokens and `lc-` classes). Check `docs/learning-center/IMPLEMENTATION_STATUS.md` for the exact file names before you start. Work on a branch; do not merge or deploy.

## Input requirements

You will receive:
- A **clinically approved**, PHI-free PowerPoint file or approved exported text/slides.
- The source submission ID/version, date, title/category, and clinical reviewer confirmation.
- The Caregiver Learning Center codebase with its module manifest schema and style system.
- Any reviewer-supplied learning objectives, guardrails, and final-review expectations.

**Do not proceed if the input is missing clinical source approval, contains client identifiers/PHI, or appears to contain confidential clinical material.** Do not send data to other tools or external services without approved authorization.

## What to build

Transform the clinically approved source into a **reviewable draft** of a guided self-paced educational module for non-tech-savvy caregivers. Maintain the source's teaching objectives and terminology. Structure it with:
1. A module intro, title, estimated completion time, and objectives.
2. 3–5 short lessons, if supported by source content; don't invent additional clinically substantive lessons just to fill a quota.
3. Approved slide content or accessible faithful reconstructions.
4. Plain-language educational explanations grounded in the provided source.
5. Optional **fictional** illustrative scenarios only where appropriate and labeled as new material requiring review.
6. Simple knowledge checks with clear stems, plausible choices, correct answers, and **feedback for each choice**. All generated questions/feedback are unapproved until clinical review.
7. Key takeaways and related topics, only when grounded in approved material.
8. An unmissable education-only statement; individualized treatment recommendations belong to the child's BCBA.

## Non-negotiable safeguards

- The source PowerPoint's first approval **does not approve the new AI-written module**. Output status must remain `module_draft` or `pending_final_clinical_review`.
- Preserve meaning. Do not insert treatment protocols, restraint guidance, instructions for managing physical aggression/elopement, diagnostic claims, clinical claims not present in source, or claims of guaranteed outcomes.
- Avoid naming or describing any real clients. Any examples must be fictional and explicitly flagged as additions.
- Separate source-backed text from AI-authored extensions. Create a section-by-section **source mapping**: module lesson/step → original slide number or source paragraph.
- Flag ambiguity rather than inventing missing information. Use `CLINICAL_REVIEW_NEEDED` annotations for generated examples, answer keys, explanations, or inferred statements.
- Preserve accessibility: HTML-text equivalent for any slide image, alt text, keyboard-safe question controls, and readable contrast.
- Use the existing versioned typed module manifest schema and design system; don't hardcode a new separate mini-site.
- Do not auto-publish, change published records, or claim the content has received final review.

## Deliverables

1. A valid module manifest or code-data package compatible with the app schema.
2. Any referenced assets in an organized folder with accessible descriptions.
3. A reviewer-friendly **content comparison / traceability report** mapping each lesson step back to source slides and identifying AI-authored additions.
4. A clinical-review checklist specifically for this new module: correctness, vocabulary, examples, quiz answers/feedback, safety, privacy, accessibility, and publication readiness.
5. A preview in the real caregiver lesson player, clearly watermarked `Pending final clinical approval`.
6. A validation report: missing assets, invalid schema, unresolved questions, accessibility issues, source deviations.

## Final instruction

Build a delightful, accurate, useful **draft** and make clinical approval straightforward. Never confuse AI transformation with clinical approval. Do not push it into the public library until an authorized BCBA or Clinical Director signs off on the **exact final version** and an authorized publisher explicitly publishes it.

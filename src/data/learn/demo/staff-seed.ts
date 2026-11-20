import { createHash } from 'node:crypto';
import { LC_PPTX_MIME, makeSyntheticPptx } from '@/lib/learn/staff/pptx';
import { emptyChecklist, emptyStaffStore, type LcAsset, type LcChecklistState, type LcStaffStore, type LcSubmission, type LcSubmissionVersion, type LcWorkflowStatus } from '@/lib/learn/staff/submissions';

/**
 * DEMO SAMPLE. Seeded submissions for the local staff demo, so each status has something to show.
 * Titles, feedback and files are all made up. The files are tiny synthetic stand-ins, not real
 * presentations. Nothing here came from a clinician or a family.
 */
const allChecked: LcChecklistState = { noClientIdentifiers: true, noCaseNotes: true, noConfidentialMaterial: true, plainLanguageObjective: true, eligibleContributor: true };

type Seed = {
  id: string; by: string; status: LcWorkflowStatus; title: string; summary: string; categoryId: string; tags: string[]; objectives: string[]; audience: string;
  created: string; updated: string; file?: string; submitted?: string;
  review?: { by: string; decision: 'approved' | 'changes_requested'; at: string; comments: string };
};

const SEEDS: Seed[] = [
  {
    id: 'seed-morning-schedules', by: 'demo-rbt', status: 'draft', title: 'Visual schedules for mornings', summary: '', categoryId: 'cat-routines', tags: [], objectives: [], audience: '',
    created: '2026-11-10T15:10:00Z', updated: '2026-11-10T15:12:00Z',
  },
  {
    id: 'seed-abcs', by: 'demo-rbt', status: 'submitted', title: 'Understanding the ABCs of Behavior', summary: 'An introduction to describing one moment as antecedent, behavior and consequence, with a made-up everyday example.',
    categoryId: 'cat-understanding-behavior', tags: ['Getting started'], objectives: ['Say what antecedent, behavior and consequence mean in plain words.', 'Pick out the three parts in a short everyday example.'], audience: 'Caregivers new to ABA',
    created: '2026-11-03T16:00:00Z', updated: '2026-11-05T19:30:00Z', file: 'SYNTHETIC-abcs-of-behavior.pptx', submitted: '2026-11-05T19:30:00Z',
  },
  {
    id: 'seed-transitions', by: 'demo-rbt', status: 'changes_requested', title: 'Getting ready for transitions', summary: 'General ideas about why moving from one activity to the next can be hard, and words caregivers can use with their clinical team.',
    categoryId: 'cat-routines', tags: ['At home'], objectives: ['Describe what a transition is.', 'List questions to bring to your clinical team about transitions.'], audience: 'All caregivers',
    created: '2026-10-27T14:00:00Z', updated: '2026-11-06T21:15:00Z', file: 'SYNTHETIC-transitions.pptx', submitted: '2026-10-29T17:45:00Z',
    review: { by: 'demo-bcba', decision: 'changes_requested', at: '2026-11-06T21:15:00Z', comments: 'Good start. Two changes please.\n\n1. Slide 4 reads as advice for one child. Reword it as a general example and add a line pointing families to their own BCBA.\n\n2. Explain the word “antecedent” the first time it appears.' },
  },
  {
    id: 'seed-group-trainings', by: 'demo-rbt', status: 'source_approved', title: 'How group trainings work', summary: 'What a live caregiver group training is, who it is for, and what to expect when joining in Microsoft Teams.',
    categoryId: 'cat-caregiver-support', tags: ['For new families'], objectives: ['Explain what happens in a group training.', 'Know where registration and joining details come from.'], audience: 'All caregivers',
    created: '2026-10-20T15:00:00Z', updated: '2026-10-30T18:00:00Z', file: 'SYNTHETIC-group-trainings.pptx', submitted: '2026-10-22T16:20:00Z',
    review: { by: 'demo-director', decision: 'approved', at: '2026-10-30T18:00:00Z', comments: 'Approved as a source. Clear and general. This approval covers the PowerPoint only. The finished module needs its own review.' },
  },
  {
    id: 'seed-questions', by: 'demo-apprentice', status: 'submitted', title: 'Questions to bring to your BCBA', summary: 'A short list of general questions caregivers can ask at their next meeting, grouped by topic.',
    categoryId: 'cat-caregiver-support', tags: ['Working with your clinical team'], objectives: ['Prepare three questions for your next meeting with your clinical team.'], audience: 'All caregivers',
    created: '2026-11-07T15:00:00Z', updated: '2026-11-08T17:05:00Z', file: 'SYNTHETIC-questions-for-your-bcba.pptx', submitted: '2026-11-08T17:05:00Z',
  },
];

export function buildDemoStaffStore(): { store: LcStaffStore; files: Map<string, Uint8Array> } {
  const store = emptyStaffStore();
  const files = new Map<string, Uint8Array>();
  for (const s of SEEDS) {
    const submission: LcSubmission = {
      id: s.id, createdBy: s.by, status: s.status, rev: 1, title: s.title, summary: s.summary, categoryId: s.categoryId, tags: s.tags, objectives: s.objectives, audience: s.audience,
      checklist: emptyChecklist(), createdAt: s.created, updatedAt: s.updated,
    };
    store.submissions.push(submission);
    let asset: LcAsset | null = null;
    if (s.file) {
      const bytes = makeSyntheticPptx(`Seeded for “${s.title}”.`);
      const objectKey = `${s.id}-v1.pptx`;
      files.set(objectKey, bytes);
      asset = { id: `${s.id}-asset-v1`, objectKey, fileName: s.file, mimeType: LC_PPTX_MIME, byteSize: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), scanState: 'not_configured', uploadedBy: s.by, createdAt: s.submitted ?? s.created, synthetic: true };
      store.assets.push(asset);
    }
    const frozen = s.submitted ?? null;
    const version: LcSubmissionVersion = {
      id: `${s.id}-v1`, submissionId: s.id, versionNumber: 1, assetId: asset?.id ?? null, revisionNotes: '', createdBy: s.by, createdAt: s.created, frozenAt: frozen,
      snapshot: frozen ? { title: s.title, summary: s.summary, categoryId: s.categoryId, tags: s.tags, objectives: s.objectives, audience: s.audience, checklist: allChecked } : null,
    };
    store.versions.push(version);
    const role = s.by === 'demo-apprentice' ? 'apprentice' : 'rbt';
    store.audit.push({ id: `${s.id}-a1`, actorId: s.by, actorRole: role, action: 'draft_created', targetType: 'submission', targetId: s.id, targetVersionId: version.id, at: s.created, note: '' });
    if (frozen) store.audit.push({ id: `${s.id}-a2`, actorId: s.by, actorRole: role, action: 'submitted_for_review', targetType: 'submission', targetId: s.id, targetVersionId: version.id, at: frozen, note: 'Version 1' });
    if (s.review) {
      store.reviews.push({ id: `${s.id}-r1`, targetType: 'source_pptx', targetVersionId: version.id, submissionId: s.id, reviewerId: s.review.by, decision: s.review.decision, comments: s.review.comments, decidedAt: s.review.at });
      store.audit.push({ id: `${s.id}-a3`, actorId: s.review.by, actorRole: s.review.by === 'demo-director' ? 'clinical_director' : 'bcba_reviewer', action: s.review.decision === 'approved' ? 'source_approved' : 'changes_requested', targetType: 'submission', targetId: s.id, targetVersionId: version.id, at: s.review.at, note: 'Version 1' });
    }
  }
  return { store, files };
}

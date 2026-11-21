import { createHash } from 'node:crypto';
import { LC_PPTX_MIME, makeSyntheticPptx } from '@/lib/learn/staff/pptx';
import type { LcListing } from '@/lib/learn/staff/listings';
import type { LcAggregateReport, LcReportValues } from '@/lib/learn/staff/reports';
import { ctDay, ctWallTimeToUtc } from '@/lib/learn/time';
import type { LcListingStatus } from '@/lib/learn/trainings';
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

/**
 * DEMO SAMPLE. Example training listings and made-up totals for the local staff demo.
 * Dates are counted from the day the demo is reset, so the reporting page always has something
 * in "last 30 days" and "last 90 days". No date here is a real event, no number here is real
 * attendance, and no presenter is named. Every listing is labelled as an example on the public pages.
 */
type TrainingSeed = {
  id: string; title: string; summary: string; description: string[]; objectives: string[]; categoryId: string; related?: string[];
  /** Days from the reset day. Negative is in the past. */
  dayOffset: number; status: LcListingStatus;
  reports?: (Omit<LcReportValues, 'reportReviewedOn' | 'sourceLabel'> & { reviewedAfterDays: number; reason?: string })[];
};

const none = { registrationsApproved: null, attendancesTotal: null, centerCounts: null, sourceCounts: null };
const TRAINING_SEEDS: TrainingSeed[] = [
  {
    id: 'seed-training-groups', title: 'How group trainings work: live session', categoryId: 'cat-caregiver-support', dayOffset: -110, status: 'completed',
    summary: 'An example listing. A walk through what a live caregiver group training is and what to expect when you join.',
    description: ['This is an example listing for the staff demo. It is not a real event.', 'The session explains how virtual group trainings work, who they are for, and where registration and joining details come from.'],
    objectives: ['Explain what happens in a group training.', 'Know where registration and joining details come from.'],
    reports: [{ reviewedAfterDays: 2, trainingHeld: true, registrationsTotal: 24, registrationsApproved: 21, attendancesTotal: 17, centerCounts: { pearland: 4, 'sugar-land': 11, katy: 7, plano: 0, 'cedar-hill': 0, austin: 0 }, sourceCounts: { clinical_team: 14, center_message: 6, website: 2, another_family: 1, other: 1 } }],
  },
  {
    id: 'seed-training-abcs', title: 'Understanding the ABCs of Behavior: live session', categoryId: 'cat-understanding-behavior', related: ['abcs-of-behavior'], dayOffset: -75, status: 'completed',
    summary: 'An example listing. The ABC model explained live, with time for general questions.',
    description: ['This is an example listing for the staff demo. It is not a real event.', 'The session goes alongside the self-paced module of the same name and uses made-up everyday examples.'],
    objectives: ['Hear the ABC model explained and ask general questions.', 'Practice sorting everyday examples into the three parts.'],
    reports: [{ reviewedAfterDays: 1, trainingHeld: true, registrationsTotal: 31, registrationsApproved: 28, attendancesTotal: 22, centerCounts: { pearland: 6, 'sugar-land': 13, katy: 9, plano: 3, 'cedar-hill': 0, austin: 0 }, sourceCounts: null }],
  },
  {
    id: 'seed-training-routines', title: 'Everyday routines: questions and answers', categoryId: 'cat-routines', dayOffset: -47, status: 'completed',
    summary: 'An example listing. A general question and answer session about mornings, mealtimes and bedtime.',
    description: ['This is an example listing for the staff demo. It is not a real event.', 'Caregivers bring general questions about daily routines. Nothing in the session is advice for an individual child.'],
    objectives: ['Hear general ideas about daily routines.', 'Leave with questions to take to your own clinical team.'],
    // Approved registrations were not on the report, so that number is left unknown. It is not zero.
    reports: [{ reviewedAfterDays: 3, trainingHeld: true, registrationsTotal: 18, registrationsApproved: null, attendancesTotal: 14, centerCounts: null, sourceCounts: null }],
  },
  {
    id: 'seed-training-cancelled', title: 'Getting ready for transitions: live session', categoryId: 'cat-routines', dayOffset: -33, status: 'cancelled',
    summary: 'An example listing. General ideas about moving from one activity to the next.',
    description: ['This is an example listing for the staff demo. It is not a real event.', 'It is shown as cancelled so staff can see how a cancelled training looks to caregivers.'],
    objectives: ['Describe what a transition is.', 'List questions to bring to your clinical team about transitions.'],
    reports: [{ reviewedAfterDays: 1, trainingHeld: false, registrationsTotal: 9, ...none }],
  },
  {
    id: 'seed-training-communication', title: 'Many ways to communicate: live session', categoryId: 'cat-communication', dayOffset: -19, status: 'completed',
    summary: 'An example listing. A general look at the different ways children communicate.',
    description: ['This is an example listing for the staff demo. It is not a real event.', 'The session uses made-up examples only and points families to their own clinical team for anything specific.'],
    objectives: ['Name several ways a child may communicate.', 'Know what to share with your clinical team.'],
    reports: [
      { reviewedAfterDays: 1, trainingHeld: true, registrationsTotal: 27, registrationsApproved: 25, attendancesTotal: 16, centerCounts: { pearland: 5, 'sugar-land': 12, katy: 8, plano: 0, 'cedar-hill': 2, austin: 0 }, sourceCounts: null },
      { reviewedAfterDays: 4, reason: 'The first entry was read before the Teams report was final. Attendances corrected.', trainingHeld: true, registrationsTotal: 27, registrationsApproved: 25, attendancesTotal: 19, centerCounts: { pearland: 5, 'sugar-land': 12, katy: 8, plano: 0, 'cedar-hill': 2, austin: 0 }, sourceCounts: null },
    ],
  },
  {
    // Finished, and nobody has entered its numbers yet. The reporting page shows that plainly.
    id: 'seed-training-questions', title: 'Questions to bring to your BCBA: live session', categoryId: 'cat-caregiver-support', dayOffset: -8, status: 'scheduled',
    summary: 'An example listing. Preparing general questions for your next meeting with your clinical team.',
    description: ['This is an example listing for the staff demo. It is not a real event.', 'The session helps caregivers prepare for meetings with their own clinical team.'],
    objectives: ['Prepare three questions for your next meeting with your clinical team.'],
  },
  {
    id: 'seed-training-mornings', title: 'Visual schedules for mornings: live session', categoryId: 'cat-routines', dayOffset: 16, status: 'scheduled',
    summary: 'An example listing. What a visual schedule is and how families talk about them with their clinical team.',
    description: ['This is an example listing for the staff demo. It is not a real event, and its date is counted from the day the demo was reset.', 'No registration link has been added, so caregivers see “Registration details coming soon”.'],
    objectives: ['Say what a visual schedule is.', 'Know what to ask your clinical team about using one.'],
  },
  {
    id: 'seed-training-team', title: 'Working with your clinical team: live session', categoryId: 'cat-aba-foundations', dayOffset: 44, status: 'draft',
    summary: '', description: [], objectives: [],
  },
];

const dayPlus = (day: string, n: number) => new Date(Date.parse(`${day}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

function seedTrainings(store: LcStaffStore, now: Date) {
  const today = ctDay(now.toISOString());
  const stamp = (day: string, time: string) => ctWallTimeToUtc(day, time) ?? `${day}T18:00:00.000Z`;
  for (const s of TRAINING_SEEDS) {
    const day = dayPlus(today, s.dayOffset);
    const created = stamp(dayPlus(day, -30), '10:00');
    const published = s.status === 'draft' ? null : stamp(dayPlus(day, -28), '10:00');
    const listing: LcListing = {
      id: s.id, rev: 1, presenterApproved: false, createdBy: 'demo-director', createdAt: created, updatedBy: 'demo-director', updatedAt: published ?? created, publishedAt: published,
      training: {
        id: s.id, slug: `example-${s.id.replace('seed-training-', '')}-live-session`, title: s.title, summary: s.summary, description: s.description, objectives: s.objectives,
        startAtUtc: stamp(day, '18:00'), endAtUtc: stamp(day, '19:00'), timeZone: 'America/Chicago', presenterLabel: null, categoryId: s.categoryId, relatedModuleIds: s.related ?? [],
        registrationUrl: null, listingStatus: s.status, isExample: true, lastUpdated: published ?? created,
      },
    };
    store.listings.push(listing);
    const log = (n: number, action: string, at: string, type: 'training' | 'report' = 'training', note = '', versionId: string | null = null) =>
      store.audit.push({ id: `${s.id}-a${n}`, actorId: 'demo-director', actorRole: 'clinical_director', action, targetType: type, targetId: s.id, targetVersionId: versionId, at, note });
    log(1, 'listing_created', created);
    if (published) log(2, 'listing_published', published);
    if (s.status === 'completed') log(3, 'listing_completed', stamp(dayPlus(day, 1), '09:00'));
    if (s.status === 'cancelled') log(3, 'listing_cancelled', stamp(dayPlus(day, -2), '09:00'));
    (s.reports ?? []).forEach((r, i) => {
      const { reviewedAfterDays, reason, ...values } = r;
      const reviewed = dayPlus(day, reviewedAfterDays);
      const report: LcAggregateReport = { ...values, id: `${s.id}-r${i + 1}`, trainingId: s.id, revision: i + 1, reason: reason ?? '', reportReviewedOn: reviewed, sourceLabel: 'Microsoft Teams organizer report', enteredBy: 'demo-director', enteredAt: stamp(reviewed, '11:00') };
      store.reports.push(report);
      log(10 + i, i === 0 ? 'report_entered' : 'report_corrected', report.enteredAt, 'report', i === 0 ? 'Revision 1' : `Revision ${i + 1}: ${reason ?? ''}`, report.id);
    });
  }
}

export function buildDemoStaffStore(now: Date = new Date()): { store: LcStaffStore; files: Map<string, Uint8Array> } {
  const store = emptyStaffStore();
  seedTrainings(store, now);
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

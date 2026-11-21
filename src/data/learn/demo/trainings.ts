import type { LcTraining } from '@/lib/learn/trainings';

/**
 * DEMO SAMPLE. One example listing that shows how a live training will appear.
 * It has no date, no presenter and no registration link, because none of those exist yet
 * and none may be invented. It only appears when LEARN_DEMO_CONTENT is on.
 */
export const demoTrainings: LcTraining[] = [
  {
    id: 'example-abcs-live-training',
    slug: 'example-abcs-live-training',
    title: 'Understanding the ABCs of Behavior: live caregiver training',
    summary: 'An example listing. It shows how a virtual group training will look here once one is scheduled.',
    description: [
      'This is an example, not a scheduled event. When a real training is scheduled, its date, time and registration link will appear on this page.',
      'Live trainings are virtual group sessions held in Microsoft Teams. They cover general topics for caregivers and go alongside the self-paced modules.',
    ],
    objectives: [
      'Hear the ABC model explained and ask general questions.',
      'Practice sorting everyday examples into the three parts.',
    ],
    startAtUtc: null,
    endAtUtc: null,
    timeZone: 'America/Chicago',
    presenterLabel: null,
    categoryId: 'cat-understanding-behavior',
    relatedModuleIds: ['abcs-of-behavior'],
    registrationUrl: null,
    listingStatus: 'scheduled',
    isExample: true,
    lastUpdated: null,
  },
];

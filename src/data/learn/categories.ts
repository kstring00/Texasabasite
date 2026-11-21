/**
 * The six Learning Center topic categories. IDs are stable; labels may change.
 * Each category owns one orb hue (its "cast") and one icon, fixed here so they never drift.
 * Intros are general education wording. They are drafts pending clinical review.
 */
export type LcCast = 'teal' | 'blue' | 'iris' | 'rose' | 'coral' | 'amber' | 'slate';

export type LcIconName =
  | 'blocks' | 'activity' | 'message-circle' | 'calendar-days' | 'shield-check' | 'heart-handshake'
  | 'book-open' | 'video' | 'search' | 'list-checks';

export type LcCategory = {
  id: string;
  slug: string;
  name: string;
  cast: LcCast;
  icon: LcIconName;
  /** One plain sentence for tiles and the category page. */
  intro: string;
  order: number;
};

export const lcCategories: LcCategory[] = [
  { id: 'cat-aba-foundations', slug: 'aba-foundations', name: 'ABA Foundations', cast: 'blue', icon: 'blocks', order: 1,
    intro: 'What Applied Behavior Analysis (ABA) is, the words you will hear, and how you and your clinical team work together.' },
  { id: 'cat-understanding-behavior', slug: 'understanding-behavior', name: 'Understanding Behavior', cast: 'teal', icon: 'activity', order: 2,
    intro: 'Learn to describe what you see and what happens around it, so conversations with your clinical team are clearer.' },
  { id: 'cat-communication', slug: 'communication-connection', name: 'Communication & Connection', cast: 'iris', icon: 'message-circle', order: 3,
    intro: 'The many ways children communicate, and how to recognize and respond to communication attempts.' },
  { id: 'cat-routines', slug: 'routines-daily-living', name: 'Routines & Daily Living', cast: 'amber', icon: 'calendar-days', order: 4,
    intro: 'Visual schedules, transitions, and the small routines that shape mornings, mealtimes and bedtime.' },
  { id: 'cat-safety', slug: 'safety-elopement', name: 'Safety & Elopement', cast: 'rose', icon: 'shield-check', order: 5,
    intro: 'General safety awareness and what to share with your clinical team so they can plan with you.' },
  { id: 'cat-caregiver-support', slug: 'caregiver-support', name: 'Caregiver Support', cast: 'coral', icon: 'heart-handshake', order: 6,
    intro: 'Questions to bring to your clinical team, how group trainings work, and ways to stay organized.' },
];

export function getLcCategory(slug: string) {
  return lcCategories.find((c) => c.slug === slug) ?? null;
}

export function getLcCategoryById(id: string) {
  return lcCategories.find((c) => c.id === id) ?? null;
}

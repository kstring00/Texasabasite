/**
 * Services. Copy is rewritten in plain parent language from the current site's service pages.
 * Facts marked verified were on texasabacenters.com. Headlines are drafts to confirm with Dom.
 */
export type Service = {
  slug: string;
  name: string;
  short: string; // one line for cards
  ages: string;
  where: string;
  /** Which parent concern this answers (objection map). */
  answers: string;
  intro: string;
  whatHappens: string[];
  whoYouMeet: string[];
  faq: { q: string; a: string }[];
  verified: string[];
  assumed: string[];
};

export const services: Service[] = [
  {
    slug: 'autism-diagnosis',
    name: 'Autism Diagnosis & Testing',
    short: 'An evaluation in-house, so there is no separate waitlist to get a diagnosis.',
    ages: 'Toddlers through teens',
    where: 'At every center',
    answers: '"Does my child need a diagnosis first?"',
    intro:
      'Yes, ABA therapy needs a formal autism diagnosis first, and insurance needs one too. We do the evaluation ourselves. You do not have to find a separate clinic and wait months for an appointment.',
    whatHappens: [
      'You talk with a real person about what you have noticed and what the pediatrician said.',
      'We verify your benefits for the evaluation at no cost to you.',
      'A licensed clinician meets your child and plays with them, and talks with you about their history.',
      'You get a plain-language report and a sit-down to go over it. If the answer is autism, we can start planning care the same week.',
    ],
    whoYouMeet: ['A family contact who answers your questions by phone or text', 'A licensed evaluator'],
    faq: [
      {
        q: 'How early can a child be evaluated?',
        a: 'Some children can be reliably evaluated between 12 and 18 months. Older children and teens can be evaluated too. If you are unsure, ask us; the call is free.',
      },
      {
        q: 'We already have a diagnosis. Do we need another one?',
        a: 'Usually not. Bring the report you have and we will tell you if anything is missing for insurance.',
      },
    ],
    verified: [
      'The current site states a diagnosis is needed before ABA starts and offers diagnostic evaluations.',
      'The current site states some children can be diagnosed by 12 to 18 months.',
    ],
    assumed: ['The "same week" planning line and the report format. Confirm with clinical leadership.'],
  },
  {
    slug: 'early-intervention',
    name: 'Early Intervention',
    short: 'For toddlers and preschoolers. Earlier starts tend to go further.',
    ages: 'About age 2 to 5',
    where: 'At the center and at home',
    answers: '"Is my child too young?"',
    intro:
      'If your child is two, three, or four, this is the program built for them. The sessions look like play because they are play, with a trained therapist guiding it toward communication, taking turns, and everyday routines.',
    whatHappens: [
      'A BCBA (a Board Certified Behavior Analyst, the clinician who designs your child\'s plan) meets your family and sets a few goals you care about.',
      'Your child works one-on-one with an RBT (Registered Behavior Technician) who is supervised by that BCBA.',
      'You join parent training so what works in the room keeps working at home.',
      'Goals get reviewed with you regularly and adjusted as your child grows.',
    ],
    whoYouMeet: ['Your child\'s BCBA', 'An RBT who is with your child during sessions', 'Your family contact'],
    faq: [
      {
        q: 'Is two really old enough?',
        a: 'The current program starts at about age two. Earlier starts are generally tied to better outcomes, which is why we evaluate young children in-house.',
      },
    ],
    verified: ['The current site states intervention is appropriate from age two and that earlier starts are generally tied to better outcomes.'],
    assumed: ['The upper age boundary for this program as a label. Confirm.'],
  },
  {
    slug: 'child-aba',
    name: 'Child ABA Therapy',
    short: 'One-on-one, play-based therapy with a plan built for your child.',
    ages: 'Ages 2 to 12',
    where: 'At the center, at home, or at school',
    answers: '"What even is ABA? I have read it can be harsh."',
    intro:
      'ABA stands for Applied Behavior Analysis. In plain words: a trained therapist helps your child learn skills they want and need, in small steps, with lots of encouragement, and keeps track of what is working. It is play-based and built around your child\'s interests. You are part of every plan.',
    whatHappens: [
      'Your child\'s BCBA writes a plan with you, in words you understand. Nothing goes in that you have not talked about.',
      'Sessions are one-on-one with an RBT. Most families do between 20 and 40 hours a week; your BCBA will recommend what fits your child.',
      'You get parent training as part of the plan, not as an add-on.',
      'Progress is reviewed with you regularly, and the plan changes when your child does.',
    ],
    whoYouMeet: ['Your child\'s BCBA', 'Your child\'s RBT', 'Your family contact'],
    faq: [
      {
        q: 'I have read ABA can be harsh. Is it?',
        a: 'Older versions of ABA earned that reputation. Our care is neurodiversity-affirming: we do not try to make your child look "less autistic." We help them communicate, handle daily life, and enjoy more of it, with you in the room.',
      },
      {
        q: 'How long does a child usually stay in therapy?',
        a: 'Programs commonly run up to three years, but it depends on your child and your goals. Your BCBA will talk with you about what graduating looks like from the start.',
      },
    ],
    verified: [
      'The current site describes child ABA for ages 2 to 12, individualized plans, programs of 20 to 40 weekly hours for up to three years, run by BCBAs with RBTs.',
    ],
    assumed: ['The neurodiversity-affirming language. Texas ABA describes its care this way; confirm the exact wording Dom wants.'],
  },
  {
    slug: 'teen-aba',
    name: 'Teen ABA Therapy',
    short: 'It is not too late. Skills for school, friendships, and independence.',
    ages: 'Ages 13 and up',
    where: 'At the center, at home, or at school',
    answers: '"My kid is a teen. Is it too late?"',
    intro:
      'Teens learn differently from toddlers, so their program looks different. It focuses on what matters at their age: friendships, communication, taking care of themselves, staying focused, handling money, and planning for what comes after school.',
    whatHappens: [
      'Your teen\'s BCBA talks with you and with your teen about what they want to get better at.',
      'Sessions use age-appropriate activities, not preschool materials.',
      'Progress is reviewed regularly with you and your teen.',
    ],
    whoYouMeet: ['Your teen\'s BCBA', 'An RBT matched to work well with teens', 'Your family contact'],
    faq: [
      {
        q: 'My teen does not want therapy. What then?',
        a: 'That is common and worth saying out loud on the tour. Teens do better when they help set the goals, and the plan starts there.',
      },
    ],
    verified: [
      'The current site offers teen ABA and names social, communication, self-care, focus, future planning, money management, and reading skills, with age-appropriate activities and regular progress reviews.',
    ],
    assumed: ['The "13 and up" label. The current site says teens without an exact age.'],
  },
  {
    slug: 'in-home-aba',
    name: 'In-Home ABA Therapy',
    short: 'Therapy where the routines actually happen: your kitchen, your bedtime.',
    ages: 'Ages 2 and up',
    where: 'Your home',
    answers: '"We need in-home."',
    intro:
      'Some skills are easiest to learn where they are used. An RBT comes to your home and works on mealtimes, mornings, bedtime, and the things that are hard in your house, with the same BCBA oversight as the center.',
    whatHappens: [
      'Your BCBA visits to see your home routines and plan around them.',
      'An RBT works with your child at home on a regular schedule.',
      'You are coached in the moment, in the room where it happens.',
    ],
    whoYouMeet: ['Your child\'s BCBA', 'Your child\'s RBT', 'Your family contact'],
    faq: [
      {
        q: 'Can we mix home and center?',
        a: 'Often, yes. Many families do some hours at the center and some at home. Your BCBA will suggest a mix.',
      },
    ],
    verified: ['The current site offers in-home ABA and says its team can check coverage and explain authorization before treatment starts.'],
    assumed: ['Service area radius per center. Confirm with each center.'],
  },
  {
    slug: 'in-school-aba',
    name: 'In-School ABA Therapy',
    short: 'Support during the school day, coordinated with your child\'s teachers.',
    ages: 'School-age children and teens',
    where: 'Your child\'s school',
    answers: '"We need in-school."',
    intro:
      'When school is where the hard parts happen, a therapist can be there. We coordinate with your school and your child\'s IEP team so everyone is working on the same things.',
    whatHappens: [
      'We talk with you and your school about what is allowed and what would help.',
      'An RBT supports your child during the school day on agreed goals.',
      'Your BCBA keeps the school plan and the home plan pointed the same way.',
    ],
    whoYouMeet: ['Your child\'s BCBA', 'Your child\'s RBT', 'Your family contact'],
    faq: [
      {
        q: 'Will the school allow it?',
        a: 'Schools vary. Bring your questions to the tour and we will tell you what we have seen work in your district.',
      },
    ],
    verified: ['The current site offers in-school ABA therapy.'],
    assumed: ['The details of school coordination. Confirm with clinical leadership.'],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug) ?? null;
}

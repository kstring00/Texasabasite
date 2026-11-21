/**
 * DEMO SAMPLE. NOT CLINICALLY APPROVED.
 * A fictional teaching sample that shows how a guided module works. It has not been reviewed by a
 * BCBA or Clinical Director and must never be published as approved content. It only appears when
 * LEARN_DEMO_CONTENT is on, which is refused on Vercel production.
 *
 * It is stored as unknown data on purpose: the content adapter validates it against the manifest
 * schema before anything is shown, the same way an imported module will be.
 */
export const demoAbcsOfBehavior: unknown = {
  schemaVersion: 1,
  id: 'abcs-of-behavior',
  slug: 'understanding-the-abcs-of-behavior',
  version: 'demo-1',
  language: 'en',
  title: 'Understanding the ABCs of Behavior',
  summary: 'A simple way to describe one moment: what happened right before, what you saw, and what happened right after.',
  categoryId: 'cat-understanding-behavior',
  topics: ['ABC model', 'antecedent', 'behavior', 'consequence', 'observing', 'describing behavior'],
  objectives: [
    'Say what antecedent, behavior and consequence mean in plain words.',
    'Pick out the three parts in a short everyday example.',
    'Explain why one moment on its own does not tell you why a behavior happened.',
  ],
  estimatedMinutes: 12,
  lessons: [
    {
      id: 'what-abc-means',
      title: 'What ABC means',
      summary: 'Three plain words for the three parts of one moment.',
      steps: [
        {
          id: 'abc-intro',
          type: 'intro',
          title: 'Three small words for one moment',
          body: [
            'When something happens with your child, it can feel like it came out of nowhere. Slowing one moment down can make it easier to talk about.',
            'Applied Behavior Analysis (ABA) often describes a moment in three parts, called antecedent, behavior and consequence. People shorten this to ABC. This lesson explains each word.',
          ],
          whyItMatters: 'Describing a moment the same way helps you and your child’s clinical team talk about the same thing.',
        },
        {
          id: 'abc-slide',
          type: 'slide',
          title: 'The ABC model',
          layout: 'sequence',
          items: [
            { label: 'A', title: 'Antecedent', text: 'What happened right before' },
            { label: 'B', title: 'Behavior', text: 'What you could see or hear' },
            { label: 'C', title: 'Consequence', text: 'What happened right after' },
          ],
          description: 'Three boxes in a row, read left to right: A, antecedent, what happened right before. B, behavior, what you could see or hear. C, consequence, what happened right after.',
          narration: ['The three parts are always in time order. First the antecedent, then the behavior, then the consequence.'],
        },
        {
          id: 'abc-plain-words',
          type: 'explanation',
          title: 'In plain words',
          body: [
            'Antecedent is a word for “right before.” It is whatever was going on just before the behavior, such as a sound, a request, or a change in the room.',
            'Behavior is what a person does that someone else could see or hear. “Covered his ears” is a behavior. “Was upset” is a guess about a feeling.',
            'Consequence does not mean punishment here. It only means what happened right after the behavior, whatever that was.',
          ],
        },
        {
          id: 'abc-check-consequence',
          type: 'knowledge_check',
          title: 'Check your understanding',
          mode: 'single',
          question: 'In the ABC model, what does “consequence” mean?',
          choices: [
            { id: 'punishment', text: 'A punishment for the behavior', correct: false, feedback: 'In everyday speech it can sound that way. In the ABC model the word is neutral. Look again at what comes last in the sequence. You can try again.' },
            { id: 'right-after', text: 'What happened right after the behavior', correct: true, feedback: 'That’s it. The consequence is simply what happened next. It can be anything, and it is not a judgment.' },
            { id: 'reason', text: 'The reason the behavior happened', correct: false, feedback: 'The reason is a separate question, and one moment cannot answer it. Think about the order: before, during, after. You can try again.' },
          ],
        },
        {
          id: 'abc-takeaways',
          type: 'takeaways',
          title: 'What to remember',
          points: [
            'ABC stands for antecedent, behavior, consequence.',
            'It describes one moment in time order: right before, what you saw, right after.',
            'Consequence means “what happened next.” It does not mean punishment.',
          ],
        },
      ],
    },
    {
      id: 'one-moment-three-parts',
      title: 'One moment, three parts',
      summary: 'Find the three parts in a short everyday example.',
      steps: [
        {
          id: 'moment-intro',
          type: 'intro',
          title: 'Let’s look at one everyday moment',
          body: ['The next screen has a short made-up story. Read it once, then we will sort it into the three parts.'],
        },
        {
          id: 'moment-scenario',
          type: 'scenario',
          title: 'The kitchen timer',
          story: [
            'It is late afternoon. A kitchen timer starts to beep loudly.',
            'A child who is nearby covers both ears with their hands.',
            'An adult walks over and turns the timer off.',
          ],
        },
        {
          id: 'moment-slide',
          type: 'slide',
          title: 'The same moment as A, B, C',
          layout: 'sequence',
          items: [
            { label: 'A', title: 'The timer beeps', text: 'Right before' },
            { label: 'B', title: 'The child covers their ears', text: 'What could be seen' },
            { label: 'C', title: 'An adult turns the timer off', text: 'Right after' },
          ],
          description: 'Three boxes in a row. A: the timer beeps, right before. B: the child covers their ears, what could be seen. C: an adult turns the timer off, right after.',
          narration: ['Let’s look at what happened immediately before the behavior. The timer beeped. That is the antecedent. The child covering their ears is the behavior. The adult turning the timer off is the consequence.'],
        },
        {
          id: 'moment-check-behavior',
          type: 'knowledge_check',
          title: 'Check your understanding',
          mode: 'single',
          question: 'In the timer story, which part is the behavior?',
          choices: [
            { id: 'timer', text: 'The timer beeps', correct: false, feedback: 'The timer came first, before the child did anything. That makes it the antecedent. Look for what the child did. You can try again.' },
            { id: 'ears', text: 'The child covers their ears', correct: true, feedback: 'Yes. It is what the child did, and anyone in the room could have seen it.' },
            { id: 'adult', text: 'An adult turns the timer off', correct: false, feedback: 'That happened after, so it is the consequence. Look for what the child did. You can try again.' },
          ],
        },
        {
          id: 'moment-check-observable',
          type: 'knowledge_check',
          title: 'One more',
          mode: 'multiple',
          question: 'Which of these describe something you could see or hear? Choose every one that fits.',
          choices: [
            { id: 'covered', text: 'The child covered their ears', correct: true, feedback: 'Right. You could see this happen.' },
            { id: 'scared', text: 'The child was scared of the timer', correct: false, feedback: 'This is a guess about a feeling. It might be true, but it is not something you can see. You can try again.' },
            { id: 'walked', text: 'The child walked out of the kitchen', correct: true, feedback: 'Right. You could see this happen.' },
            { id: 'difficult', text: 'The child was being difficult', correct: false, feedback: 'This is an opinion about the child, not a description of what happened. You can try again.' },
          ],
        },
        {
          id: 'moment-takeaways',
          type: 'takeaways',
          title: 'What to remember',
          points: [
            'Any single moment can be sorted into right before, what you saw, and right after.',
            'A behavior is something another person could see or hear.',
            'Feelings and opinions are guesses. Descriptions stick to what happened.',
          ],
        },
      ],
    },
    {
      id: 'what-one-moment-cannot-tell-you',
      title: 'What one moment can’t tell you',
      summary: 'Why a single example describes what happened but not why.',
      steps: [
        {
          id: 'limits-intro',
          type: 'intro',
          title: 'What happened is not the same as why',
          body: ['Sorting a moment into A, B and C tells you what happened and in what order. It is tempting to go one step further and decide why it happened. This lesson is about holding back on that.'],
        },
        {
          id: 'limits-explanation',
          type: 'explanation',
          title: 'One moment is one observation',
          body: [
            'In ABA, the reason a behavior happens is called its function. A single moment does not show the function. The same behavior can happen for different reasons on different days.',
            'In the timer story, we saw a child cover their ears and an adult turn the timer off. We do not know from that one moment why the child covered their ears.',
            'Working out why takes many observations over time, looked at by a trained clinician. For your child, that is the supervising Board Certified Behavior Analyst (BCBA).',
            'What you notice is still useful. If you want to, you can share what you saw, in order, with your child’s clinical team.',
          ],
        },
        {
          id: 'limits-check',
          type: 'knowledge_check',
          title: 'Check your understanding',
          mode: 'single',
          question: 'After seeing the timer moment once, what do we know?',
          choices: [
            { id: 'why', text: 'Why the child covered their ears', correct: false, feedback: 'One moment cannot show the reason. Think about what the three parts actually record. You can try again.' },
            { id: 'order', text: 'What happened, and in what order', correct: true, feedback: 'Exactly. ABC gives a clear description of one moment. The why is a separate question for a clinician.' },
            { id: 'next-time', text: 'What the adult should do next time', correct: false, feedback: 'That would be advice for one child, which this lesson cannot give. Your child’s BCBA makes those recommendations. You can try again.' },
          ],
        },
        {
          id: 'limits-takeaways',
          type: 'takeaways',
          title: 'What to remember',
          points: [
            'ABC describes what happened. It does not explain why.',
            'One moment is one observation. The reason, or function, takes many observations and a trained clinician.',
            'Your child’s BCBA is the person who makes recommendations for your child.',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'ABC stands for antecedent, behavior, consequence: right before, what you saw, right after.',
    'A behavior is something another person could see or hear.',
    'One moment describes what happened. It does not tell you why.',
  ],
  relatedModuleIds: [],
  relatedTrainingIds: ['example-abcs-live-training'],
  review: { status: 'demo_sample', reviewerLabel: null, reviewedOn: null },
  source: null,
};

/**
 * DEMO SAMPLE. NOT CLINICALLY APPROVED.
 * A synthetic module package for the demo: what a producer would import after turning an approved
 * PowerPoint ("How group trainings work") into a guided module. It is here so the import, final
 * review, publish and withdraw steps have something to work on. It was written for the demo and
 * has not been reviewed by a clinician.
 */
export const demoGroupTrainingsPackage: unknown = {
  schemaVersion: 1,
  id: 'how-group-trainings-work',
  slug: 'how-group-trainings-work',
  version: 'demo-1',
  language: 'en',
  title: 'How group trainings work',
  summary: 'What a live caregiver group training is, who it is for, and how registering and joining work.',
  categoryId: 'cat-caregiver-support',
  topics: ['group training', 'Microsoft Teams', 'registration', 'live training'],
  objectives: ['Explain what happens in a group training.', 'Know where registration and joining details come from.'],
  estimatedMinutes: 6,
  lessons: [
    {
      id: 'what-a-group-training-is',
      title: 'What a group training is',
      summary: 'A live online session on a general topic, for enrolled families.',
      steps: [
        {
          id: 'group-intro',
          type: 'intro',
          title: 'Learning together, live',
          body: ['A group training is a live session held online. A member of the clinical team teaches a general topic to several caregivers at once.', 'It goes alongside the lessons you can do on your own here. You can do either, or both.'],
          whyItMatters: 'Knowing what to expect makes it easier to decide whether a session is right for you.',
        },
        {
          id: 'group-slide',
          type: 'slide',
          title: 'Three things to know',
          layout: 'list',
          items: [
            { title: 'It is live and online', text: 'Sessions are held in Microsoft Teams.' },
            { title: 'It is for enrolled families', text: 'Clinic staff confirm enrollment after you ask to register.' },
            { title: 'It covers general topics', text: 'It is not a meeting about your own child.' },
          ],
          description: 'A list of three points. It is live and online, held in Microsoft Teams. It is for enrolled families, and clinic staff confirm enrollment after you ask to register. It covers general topics and is not a meeting about your own child.',
          narration: ['Because it is a group, the presenter teaches general ideas and answers general questions.'],
        },
        {
          id: 'group-check',
          type: 'knowledge_check',
          title: 'Check your understanding',
          mode: 'single',
          question: 'What is a group training for?',
          choices: [
            { id: 'general', text: 'Learning about a general topic with other caregivers', correct: true, feedback: 'Yes. A group session teaches general ideas to several caregivers at once.' },
            { id: 'own-child', text: 'Going over my own child’s plan', correct: false, feedback: 'That conversation belongs with your child’s own clinical team, not in a group. Think about who else is in the session. You can try again.' },
            { id: 'replace', text: 'Replacing meetings with my clinical team', correct: false, feedback: 'Group trainings go alongside your usual meetings. They do not replace them. You can try again.' },
          ],
        },
        { id: 'group-takeaways', type: 'takeaways', title: 'What to remember', points: ['A group training is a live online session on a general topic.', 'It is for currently enrolled families.', 'Questions about your own child go to your clinical team.'] },
      ],
    },
    {
      id: 'registering-and-joining',
      title: 'Registering and joining',
      summary: 'The steps from finding a training to getting your joining details.',
      steps: [
        { id: 'join-intro', type: 'intro', title: 'From finding a training to joining it', body: ['Registering happens in Microsoft Teams, not on this website. This lesson walks through the steps in order.'] },
        {
          id: 'join-slide',
          type: 'slide',
          title: 'The steps, in order',
          layout: 'sequence',
          items: [
            { label: '1', title: 'Find a training', text: 'On the Live Trainings page' },
            { label: '2', title: 'Register', text: 'In Microsoft Teams' },
            { label: '3', title: 'Staff confirm', text: 'That you are enrolled' },
            { label: '4', title: 'Check your email', text: 'For joining details' },
          ],
          description: 'Four boxes in a row, in order. One: find a training on the Live Trainings page. Two: register in Microsoft Teams. Three: staff confirm that you are enrolled. Four: check your email for joining details.',
          narration: ['Your joining details arrive by email from Microsoft Teams after your registration is approved. This website never shows a joining link.'],
        },
        {
          id: 'join-check',
          type: 'knowledge_check',
          title: 'Check your understanding',
          mode: 'single',
          question: 'Where do your joining details come from?',
          choices: [
            { id: 'email', text: 'An email from Microsoft Teams, after your registration is approved', correct: true, feedback: 'That’s right. Look for it in the email account you registered with.' },
            { id: 'website', text: 'A link on this website', correct: false, feedback: 'This website lists trainings but never shows a joining link. Think about where you registered. You can try again.' },
            { id: 'anyone', text: 'Anyone can forward me the link', correct: false, feedback: 'Sessions are for registered, enrolled families, so each family registers for itself. You can try again.' },
          ],
        },
        { id: 'join-takeaways', type: 'takeaways', title: 'What to remember', points: ['You register in Microsoft Teams.', 'Staff confirm enrollment before approving a registration.', 'Joining details come by email from Microsoft Teams.'] },
      ],
    },
  ],
  takeaways: ['A group training is a live online session on a general topic, for enrolled families.', 'You register in Microsoft Teams, and joining details come by email.', 'Questions about your own child go to your clinical team.'],
  relatedModuleIds: [],
  relatedTrainingIds: [],
  review: { status: 'demo_sample', reviewerLabel: null, reviewedOn: null },
  source: null,
};

/** The same package as text, ready to paste into the import form. */
export const demoGroupTrainingsPackageJson = JSON.stringify(demoGroupTrainingsPackage, null, 2);

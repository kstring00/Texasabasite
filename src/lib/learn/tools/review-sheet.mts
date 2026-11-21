import fs from 'node:fs';
import path from 'node:path';
import { lcCategories } from '@/data/learn/categories';
import { demoAbcsOfBehavior } from '@/data/learn/demo/abcs-of-behavior';
import { demoTrainings } from '@/data/learn/demo/trainings';
import { buildDemoStaffStore } from '@/data/learn/demo/staff-seed';
import { validateManifest } from '@/lib/learn/manifest';
import { LC_AUDIENCES, LC_APPROVED_TAGS, LC_CHECKLIST, LC_STATUS, LC_AUDIT_LABEL } from '@/lib/learn/staff/submissions';
import { checkPptxBytes, checkPptxName, LC_TOO_LARGE_MESSAGE } from '@/lib/learn/staff/pptx';
import { checkRegistrationUrl } from '@/lib/learn/registration';
import { demoGroupTrainingsPackage } from '@/data/learn/demo/group-trainings-module';
import { LC_FINAL_CHECKLIST, LC_SOURCE_CHECKLIST, finalReviewBlock, sourceReviewBlock, publishBlock } from '@/lib/learn/staff/pipeline';
import { LC_MODULE_STATUS } from '@/components/learn/staff/LcModuleChip';
import { site } from '@/data/site';
import { LC_LISTING_STATUS, LC_LISTING_AUDIT_LABEL } from '@/lib/learn/staff/listings';
import { LC_GLOSSARY, LC_REFERRAL_SOURCES, LC_REPORT_BANNER, LC_REPORT_SOURCES, LC_ROW_STATE, LC_SMALL_CELL_MINIMUM } from '@/lib/learn/staff/reports';

const ROOT = process.cwd();
const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const norm = (s: string) => s.replace(/&rsquo;/g, '’').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/\{' '\}/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\\n/g, ' ').replace(/\s+/g, ' ');
const soft = (s: string) => s.replace(/&rsquo;/g, '’').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/\{' '\}/g, ' ').replace(/\s+/g, ' ');
const rawFiles = ['src/app/learn', 'src/components/learn', 'src/lib/learn', 'src/data/learn'].flatMap((d) => walk(path.join(ROOT, d))).filter((f) => /\.(tsx?|ts)$/.test(f) && !f.endsWith('.test.ts')).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const corpusRaw = soft(rawFiles);
const corpus = norm(['src/app/learn', 'src/components/learn', 'src/lib/learn', 'src/data/learn'].flatMap((d) => walk(path.join(ROOT, d))).filter((f) => /\.(tsx?|ts)$/.test(f) && !f.endsWith('.test.ts')).map((f) => fs.readFileSync(f, 'utf8')).join('\n'));
const missing: string[] = [];

let out = '';
let sec = '';
let n = 0;
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, '<br>');
const h2 = (t: string) => { out += `\n## ${t}\n`; };
const section = (id: string, title: string, note = '') => { sec = id; n = 0; out += `\n### ${id}. ${title}\n\n${note ? note + '\n\n' : ''}| No. | Where | Draft wording | OK, or change to |\n|---|---|---|---|\n`; };
/** A line that lives in code. `verify: false` for lines assembled from parts. */
const row = (where: string, text: string, verify = true) => {
  n += 1;
  if (verify && !corpus.includes(norm(text)) && !corpusRaw.includes(soft(text))) missing.push(`${sec}.${n} ${text.slice(0, 70)}`);
  out += `| ${sec}.${n} | ${cell(where)} | ${cell(text)} | |\n`;
};
/** A line read straight from data, so it cannot be mistyped here. */
const data = (where: string, text: string) => row(where, text, false);

out += `# Learning Center review sheet

**For:** the Clinical Director and IT. **Prepared:** ${new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: 'long', day: 'numeric' })}.

## Start here

**What this is.** The Caregiver Learning Center is a new section being built for the Texas ABA Centers website. It is not public. This sheet lists every sentence in it that was written during the build instead of being supplied by the organization, so that you can check the wording before anyone outside sees it. All of it is a draft. Nothing in it has been clinically reviewed or approved.

**How to mark a line.** Every line has a number, like 13.4. In the last column:

- write **OK** if the wording is fine,
- or write the wording you want instead,
- or write **remove** if the line should not be there.

You do not need to mark every line in one sitting. Hand the sheet back with whatever you have marked, and the changes will be made by number. Lines you leave blank stay as drafts.

**Three questions need an answer first.** They are short, and each has tick boxes.

| | Question | Who | Where |
|---|---|---|---|
| 1 | Is the main phone number, ${site.phone.display}, the approved contact for Learning Center questions? | Clinical Director | Section 1, just below |
| 2 | Are \`events.teams.microsoft.com\` and \`teams.microsoft.com\` the right addresses for registration pages in our Microsoft Teams? | IT | Section 2, just below |
| 3 | Will the Microsoft Teams registration form ask every family which center their child attends? Per-center numbers only work if it does. | Clinical Director, IT | Section 30, line 30.7 |

**One more thing for the Clinical Director.** Section 24 lists three rules about who may approve what. They are built in and switched on. Please confirm them or say what the clinic's rule is.

**What is in the rest of the sheet**

| Sections | What | Mainly for |
|---|---|---|
| 1 to 2 | The two open questions | Clinical Director, IT |
| 3 to 16 | Pages families see | Clinical Director |
| 17 to 22 | The staff workspace: submitting a PowerPoint | Clinical Director, IT |
| 23 | Wording taken word for word from the project briefs. Listed for reference, not for re-review | |
| 24 to 28 | The staff workspace: the two clinical approvals, building the module, publishing | Clinical Director |
| 29 | A second sample module, used to demonstrate importing and publishing | Clinical Director |
| 30 | Reporting: six decisions to confirm before any real numbers are entered, and open question 3 | Clinical Director, compliance, IT |
| 31 to 34 | Training listings and the reporting pages, including what each number means | Clinical Director |

**How drafts are marked in the product today**

- Every page families see carries this note above the footer: "Sugar Land pilot. The wording on these pages is a draft that is still being reviewed."
- Sample modules show "Demo · not clinically approved" on their card and overview, and "Demo sample — pending clinical approval" on every lesson screen.
- The privacy and accessibility pages each open with a "Draft" notice.
- Every staff page carries an amber "Illustrative demo data" banner.

Section numbers do not change between versions of this sheet. New material is added at the end.
`;

h2('Open questions');
out += `
### 1. For the Clinical Director: is the main phone number the approved contact?

The Help page tells caregivers they can call **${site.name}** on **${site.phone.display}** (${site.phoneHours}). The number is not typed into the Learning Center. It is read from the website's existing contact details, so it always matches the rest of the site.

- [ ] Yes, this is the approved contact for Learning Center questions.
- [ ] No. Use this instead: ______________________
- [ ] No phone number. Tell caregivers to ask their clinical team only.

The exact sentences are lines 13.27 to 13.29 below.

### 2. For IT: are these the right Microsoft Teams addresses for our tenant?

A live training listing may only link to the official Teams **registration** page. The website checks every link before showing a registration button. Today it accepts a link only when all of these are true:

| Rule | Current setting |
|---|---|
| Must start with | \`https://\` |
| Must be on one of these addresses | \`events.teams.microsoft.com\` or \`teams.microsoft.com\` |
| Must not be a link for joining a meeting | rejects links containing \`/l/meetup-join/\`, \`/meet/\` or \`meetingjoin\` |
| Must not contain | a username or password |

Anything else is treated as "no link yet", and the page shows "Registration details coming soon" instead of a button.

- [ ] Yes, registration pages for our tenant are always on those two addresses.
- [ ] No. Registration pages for our tenant are on: ______________________
- [ ] Our tenant uses a different event type (for example Town hall or a third-party form). Details: ______________________

Messages staff will see when a link is refused (shown in the listing editor):
`;
for (const [label, sample] of [['Nothing entered', ''], ['Not a web address', 'not a link'], ['Not https', 'http://events.teams.microsoft.com/event/1'], ['Has a username or password', 'https://u:p@events.teams.microsoft.com/event/1'], ['Another website', 'https://example.com/event'], ['A join link', 'https://teams.microsoft.com/l/meetup-join/abc']] as const) {
  const r = checkRegistrationUrl(sample);
  if (!r.ok) out += `- ${label}: "${r.reason}"\n`;
}

h2('Caregiver pages');

section('3', 'Every caregiver page', 'The strip under the site header, the note above the footer, and the amber banner shown while sample content is on.');
row('Note above the footer', 'Sugar Land pilot. The wording on these pages is a draft that is still being reviewed.');
row('Link above the footer', 'Privacy for the Learning Center');
row('Link above the footer', 'Accessibility');
row('Amber banner, sample content on (wide screens)', 'Demo mode. The module and training shown here are samples. Nothing on these pages has been clinically approved.', false);
row('Amber banner, sample content on (phones)', 'Demo mode. Samples only. Nothing here is clinically approved.', false);
row('Short tab labels on phones', 'Home, Library, Trainings, Help', false);

section('4', 'Home page (/learn)', 'The headline, supporting line, both choice cards, their buttons and the three step titles are the master prompt’s exact words and are listed in section 23.');
row('Section heading', 'Browse by topic');
row('Section heading', 'Learning modules');
row('Link', 'See the whole library');
row('Section heading', 'Upcoming live trainings');
row('Link', 'See all trainings');
row('Empty state title, no modules', 'Modules are on the way');
row('Empty state title, no trainings', 'No live trainings are listed right now');
row('Section heading', 'How learning works');
row('Under "Choose a topic"', 'Pick something you want to understand better. There is no wrong place to start.');
row('Under "Follow simple steps"', 'Each lesson is one small step at a time. You can stop anywhere and come back.');
row('Under "Explore live training options"', 'Currently enrolled families can join virtual group trainings with the clinical team.');
row('Section heading', 'Need help?');
row('Help card', 'Joining a training in Microsoft Teams');
row('Help card', 'What to expect and how to get ready.');
row('Help card', 'Finding your registration email');
row('Help card', 'Where it comes from and what to do if it has not arrived.');
row('Help card', 'Talking with your clinical team');
row('Help card', 'Who to ask about your own child.');

section('5', 'Topic introductions', 'One sentence per topic. Shown on each topic page. The six topic names come from the master prompt.');
for (const c of lcCategories) data(c.name, c.intro);

section('6', 'Learning Library (/learn/library)');
row('Under the page title', 'Short lessons you can do in your own time, one small step at a time. No account needed.');
row('Search box example text', 'For example: routines');
row('Button', 'Clear');
row('Filter button', 'All topics');
row('Result count', 'No modules match.');
row('Result count', '1 module / 2 modules, or "1 module matches" when searching', false);
row('No results, title', 'Nothing matches that yet');
row('No results, text', 'Try a different word, or clear the search to see every module.');
row('No results, button', 'Clear search and filters');
row('Module card', 'About 12 minutes · 3 lessons', false);
row('Module card, in progress', 'Lesson 2 of 3', false);
row('Module card, finished', 'Completed on this device');
row('Module card button, finished', 'Review module');

section('7', 'Topic pages (/learn/topics/…)');
row('Label above the title', 'Topic');
row('Section heading', 'Modules in this topic');
row('Empty state title', 'Nothing here yet');
row('Empty state button', 'Browse all modules');
row('Section heading', 'Other topics');

section('8', 'Module overview page (/learn/modules/…)');
row('Under the button, not started', 'You can stop anywhere and come back.');
row('Under the button, in progress', 'You were on lesson 2: One moment, three parts.', false);
row('Under the button, finished', 'You finished this module on this device.');
row('Button, finished', 'Review from the start');
row('Notice, module updated since last visit', 'This module has been updated since your last visit, so it starts from the beginning.');
row('Notice, browser cannot save', 'This browser is not saving progress right now. You can still do every lesson. It will start from the beginning next time.');
row('Section heading', 'Lessons');
row('Lesson tags', 'Done / You are here', false);
row('Body', 'Your place is kept only in this browser. There is no account and nothing is sent to us. If you clear your browser data or use a different phone or computer, it starts over.');
row('Reset confirmation', 'Clear your saved place in this module on this device?');
row('Reset buttons', 'Yes, reset / Keep my place', false);
row('After reset', 'Your progress in this module was cleared.');
row('Section heading', 'What you will learn');
row('Section heading', 'Clinical review');
row('Clinical review text, sample module', 'Demo sample — pending clinical approval. This module has not been reviewed by a clinician and is here only to show how lessons work.');
row('Clinical review text, approved module', 'Reviewed by [reviewer] on [date].', false);
row('Section heading', 'Live training on this topic');
row('Clinical review text, module published through the staff demo (added)', 'Demo sample — pending clinical approval. This module was published through the staff demo by fictional reviewers. It has not been reviewed by a clinician.');

section('9', 'Lesson player: buttons and messages', 'These appear on every lesson, whatever the module.');
row('Position', 'Lesson 1 of 3', false);
row('Step labels', 'Introduction / Slide / In plain words / Scenario / Knowledge check / Takeaways / Live training', false);
row('Buttons', 'Back / Next / Next lesson / Finish module / Previous lesson / Module overview', false);
row('Notice, browser cannot save', 'This browser is not saving progress right now. You can still finish the lesson.');
row('Introduction steps', 'Why it matters.');
row('Knowledge check button', 'Check my answer');
row('Under the button', 'There is no score. You can try as many times as you like, or move on.');
row('If nothing is chosen', 'Choose an answer first, then check it.');
row('Multi-answer check, some still missing', 'Those fit. There is at least one more to find. You can try again.');
row('Takeaways step', 'Next lesson: [title].', false);
row('Under the lesson card', 'You can always come back to this lesson. Your progress is saved on this device.');
row('Completion title', 'You finished this module.', false);
row('Completion text', 'Well done for making the time. Here is what to keep from [module title].', false);
row('Completion heading', 'Related modules');
row('Completion text', 'For currently enrolled families. You’ll complete registration through Microsoft Teams.');
row('Step that links to a training', 'There is a live caregiver training on this topic for currently enrolled families.');
row('Step that links to a training, none listed', 'There is no live training listed for this topic right now.');
row('Staff preview of an unpublished module: watermark on every step (added)', 'Pending final clinical approval');
row('Staff preview: other watermarks (added)', 'Staff preview · final approved, not yet published / Staff preview of a published module', false);
row('Staff preview: under the lesson card (added)', 'Staff preview. Nothing is saved, and families cannot see this.');
row('Staff preview: button (added)', 'Close preview');

const v = validateManifest(demoAbcsOfBehavior);
if (!v.ok) throw new Error('demo module invalid');
const m = v.manifest;
section('10', `Sample module: “${m.title}”`, 'This is the whole sample module, word for word as it appears on screen. It was written for the demo and **has not been clinically reviewed**. It needs the same review as any real module, including every quiz answer and every piece of feedback. Lines marked ✔ are the answers the module treats as correct.');
data('Title', m.title);
data('Summary', m.summary);
data('Time shown', `About ${m.estimatedMinutes} minutes`);
m.objectives.forEach((o, i) => data(`Objective ${i + 1}`, o));
m.lessons.forEach((l, li) => {
  data(`Lesson ${li + 1} title`, l.title);
  data(`Lesson ${li + 1} summary`, l.summary);
  l.steps.forEach((s, si) => {
    const at = `Lesson ${li + 1}, step ${si + 1}`;
    data(`${at} title`, s.title);
    if (s.type === 'intro') { s.body.forEach((p) => data(`${at} text`, p)); if (s.whyItMatters) data(`${at} "Why it matters"`, s.whyItMatters); }
    if (s.type === 'slide') { s.items.forEach((it) => data(`${at} slide box ${it.label ?? ''}`.trim(), `${it.title}: ${it.text ?? ''}`)); data(`${at} slide description for screen readers`, s.description); s.narration.forEach((p) => data(`${at} text under the slide`, p)); }
    if (s.type === 'explanation') s.body.forEach((p) => data(`${at} text`, p));
    if (s.type === 'scenario') s.story.forEach((p) => data(`${at} story (shown with "Example story, not a real family.")`, p));
    if (s.type === 'knowledge_check') { data(`${at} question (${s.mode === 'multiple' ? 'choose all that fit' : 'one answer'})`, s.question); s.choices.forEach((c) => { data(`${at} choice${c.correct ? ' ✔' : ''}`, c.text); data(`${at} feedback for that choice`, c.feedback); }); }
    if (s.type === 'takeaways') s.points.forEach((p) => data(`${at} takeaway`, p));
  });
});
m.takeaways.forEach((t) => data('Completion screen takeaway', t));

section('11', 'Live Trainings list (/learn/trainings)');
row('Under the page title', 'Virtual group sessions for currently enrolled families, held in Microsoft Teams. This training is available to currently enrolled families.');
row('Under the page title', 'You’ll complete registration through Microsoft Teams. All times are Central Time (CT).');
row('Section headings', 'Upcoming / Past trainings', false);
row('Date block with no date', 'Example / Date to come', false);
row('Card, no date', 'No date. This is an example listing.');
row('Card, no date, real listing', 'Date and time to be announced.');
row('Card', 'Presented by [presenter]', false);
row('Status chips', 'Example listing / Cancelled / Completed / Registration closed', false);
row('Under an active registration button', 'You will continue to Microsoft Teams to register. It opens in a new tab.');
row('Reason, cancelled', 'This training was cancelled, so registration is not available.');
row('Reason, finished', 'This training has finished.');
row('Reason, closed', 'Registration for this training has closed.');
row('Reason, example listing', 'This is an example listing, so there is nothing to register for.');
row('Reason, no link yet', 'A registration link has not been added yet. Please check back.');

section('12', 'Training detail page, and the example training');
for (const t of demoTrainings) { data('Example training title', t.title); data('Example training summary', t.summary); t.description.forEach((p) => data('Example training, "About this training"', p)); t.objectives.forEach((o) => data('Example training, "What it covers"', o)); }
row('Label above the title', 'Live training');
row('Under the title', 'About 60 minutes', false);
row('Cancelled notice', 'This training was cancelled. It will not take place. If you had registered, you do not need to do anything.');
row('Section headings', 'About this training / What it covers / What to expect / Registration / Learn at your own pace', false);
row('"Who can attend"', 'This training is available to currently enrolled families. Clinic staff confirm enrollment after you ask to register. You do not need to share anything about your child on this website.');
row('"How a group session works"', 'It is a group, so the presenter teaches general ideas and answers general questions. For questions about your own child, talk with your child’s supervising BCBA.');
row('"Joining"', 'After your registration is approved, Microsoft Teams sends your joining details by email. This website never shows a joining link.');
row('"Accessibility"', 'Microsoft Teams has live captions you can turn on during the session. If you need something else to take part, tell your clinical team before the training.');
row('Link', 'Help with registration and email');
row('Small print', 'Listing last updated [date].', false);

section('13', 'Help & FAQ (/learn/help)');
row('Under the page title', 'Short answers about the lessons, live trainings and who to ask.');
row('Group heading', 'Using the lessons');
row('Question', 'Do I need an account?');
row('Answer', 'No. The learning modules are open to read. There is no sign-in for caregivers and nothing to install.');
row('Question', 'How do the lessons work?');
row('Answer', 'Each module has a few short lessons. A lesson shows one small step at a time. Use Next to go forward and Back to go back. Nothing is timed.');
row('Question', 'Are the questions a test?');
row('Answer', 'No. The short questions help the ideas stick. There is no score, you can try as many times as you like, and you can always move on.');
row('Question', 'Where is my progress saved?');
row('Answer', 'Your progress is saved on this device, in this browser only. There is no account behind it. If you clear your browser data, or use a different phone or computer, it starts over. You can also clear it yourself with “Reset progress” on any module page.');
row('Question', 'Can these lessons tell me what to do for my child?');
row('Group heading', 'Live trainings in Microsoft Teams');
row('Question', 'Who can attend a live training?');
row('Answer', 'Live trainings are for currently enrolled families. Clinic staff confirm enrollment after you ask to register.');
row('Question', 'How do I register?');
row('Answer', 'Open a training on the Live Trainings page and choose “Register through Microsoft Teams.” You will continue to Microsoft Teams to register. This website does not have its own registration form.');
row('Question', 'What do I need to join?');
row('Answer', 'A phone, tablet or computer with a speaker or headphones. You can join in a web browser or in the free Microsoft Teams app. Joining a few minutes early gives you time to check your sound.');
row('Question', 'Why is there no joining link on this website?');
row('Answer', 'Joining details come only from Microsoft Teams, by email, after your registration is approved. That keeps group sessions limited to the families they are meant for.');
row('Group heading', 'Your registration email');
row('Question', 'Where does the email come from?');
row('Answer', 'It is sent by Microsoft Teams to the email address you typed when you registered. It may arrive after staff have approved your registration, not straight away.');
row('Question', 'I can’t find it. What should I do?');
row('Answer', 'Look in your junk or spam folder, and check that you are looking in the same email account you registered with. If it is still missing, ask your clinical team, who can check with the training organizer.');
row('Section heading', 'Talking with your clinical team');
row('Contact text', 'For anything about your own child, the best person to ask is your child’s supervising BCBA, at your next session or the way you usually reach them.');
row('Contact text (see open question 1)', `You can also call ${site.name} on ${site.phone.display}. ${site.phoneHours}.`, false);
row('Contact text', 'Please do not send details about your child through this website. It has no way to receive them.');
row('Bottom of page', 'Texas ABA Centers staff: Staff sign-in', false);

section('14', 'Privacy for the Learning Center (/learn/privacy)', 'A draft note, not an official privacy notice. IT and whoever owns privacy should confirm each statement is true of the final setup.');
row('Under the page title', 'A plain description of what the Caregiver Learning Center does and does not keep.');
row('Draft notice', 'Draft. This note is waiting for review by the organization and is not an official privacy notice.');
row('Heading', 'What we do not ask for');
row('Text', 'You do not need an account to read lessons or look at trainings. The Learning Center does not ask for your name, your child’s name, a diagnosis, or anything else about your family.');
row('Heading', 'Lesson progress stays on your device');
row('Text', 'When you move through a lesson, your place is saved in this browser so you can come back to it. It records which step of which module you reached and the last answer you chose. It is not sent to us, and it is not linked to a name. Clearing your browser data removes it, and so does “Reset progress” on any module page.');
row('Heading', 'Page visits');
row('Text', 'The Texas ABA Centers website counts page visits without identifying visitors, and that includes pages in the Learning Center. The Learning Center does not record which lessons a person starts, the answers they choose, or whether they open a registration link.');
row('Heading', 'Registering for a live training');
row('Text', 'Registration happens in Microsoft Teams, not on this website. What you type there goes to Microsoft Teams and to the staff who run the training. This website does not receive it and does not keep lists of who registered or attended.');
row('Heading', 'The rest of the website');
row('Text', 'This note covers the Learning Center only. For everything else, see the Texas ABA Centers privacy policy.');

section('15', 'Accessibility (/learn/accessibility)', 'A draft statement. It describes the aim and what is built, and does not claim a certified result.');
row('Under the page title', 'How the Caregiver Learning Center is built to be usable by as many people as possible.');
row('Draft notice', 'Draft. This statement is waiting for review by the organization. It describes what we are aiming for, not a certified result.');
row('Heading', 'What we are aiming for');
row('Text', 'We are building the Learning Center to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It has not yet had an independent review, and it has not yet been tested with a range of screen readers on real devices.');
row('Heading', 'What is built in');
row('List', 'Every lesson works with a keyboard alone, and shows clearly where you are on the page.');
row('List', 'Lesson slides are real text, with a description, not pictures of text.');
row('List', 'Nothing is timed, nothing plays by itself, and no lesson needs you to drag or swipe.');
row('List', 'Feedback on questions is given in words and is read out by screen readers.');
row('List', 'Pages work on a small phone and when text is enlarged.');
row('List', 'Movement on the page is switched off when your device asks for reduced motion.');
row('Heading', 'Live trainings');
row('Text', 'Live trainings are held in Microsoft Teams, which has its own accessibility features, including live captions. If you need something else to take part, tell your clinical team before the training.');
row('Heading', 'If something does not work for you');
row('Text', 'Please tell your clinical team, or use the contact details on the Help page. Say which page you were on and what happened, and we will look into it.');

section('16', 'Page not found, and staff sign-in when it is switched off');
row('Not found, title', 'That page isn’t available');
row('Not found, text', 'It may have moved, or it may not be published. You can still explore our learning modules.');
row('Not found, button', 'Go to the Learning Library');
row('Staff sign-in off, text', 'The staff workspace needs the organization’s approved sign-in before it can open. Nothing is available here yet.');
row('Staff sign-in off, button', 'Back to the Learning Center');

h2('Staff workspace');
out += '\nThe staff workspace is a demo that runs only on a local computer. Its people are fictional and its files are synthetic. The wording still matters, because it is what real staff would read later. The contributor checklist in section 19 is the most important part for the Clinical Director and for privacy.\n';

section('17', 'Demo banner, sign-in and menu');
row('Amber banner (wide screens)', 'Illustrative demo data. Fictional staff and synthetic files, kept only on this computer. This is not real sign-in and nothing here is clinically approved.', false);
row('Amber banner (phones)', 'Illustrative demo data. Fictional staff, not real sign-in.', false);
row('Sign-in title', 'Staff workspace demo');
row('Sign-in text', 'Choose a fictional role to look around. There is no password because this is not real sign-in. It only works on this computer.');
row('Role buttons (updated)', 'Continue as Sample RBT / Sample Apprentice / Sample BCBA / Sample Clinical Director / Sample Producer', false);
row('Role description, RBT and Apprentice', 'Submits PowerPoints and sees only their own.');
row('Role description, BCBA (updated)', 'Reviews source PowerPoints and final modules. Cannot publish.');
row('Role description, Clinical Director (updated)', 'Reviews source PowerPoints and final modules, and publishes or withdraws modules.');
row('Button', 'Reset demo data');
row('Under that button', 'Puts the sample submissions back and removes every file uploaded during the demo.');
row('Menu (updated)', 'Overview / My submissions / All submissions / Reviews / Modules', false);
row('Menu footer', 'Demo role, not a real account');
row('Menu footer buttons', 'Switch demo role / Back to site', false);
row('Not found, title', 'That page was not found');
row('Not found, text', 'It may not exist, or it may not be part of your role.');
row('Role description, Producer (added)', 'Collects approved sources and imports the finished module. Cannot approve or publish.');

section('18', 'Staff overview and submission lists');
row('Overview title', 'Welcome');
row('Overview text', 'You are looking around as [role], a fictional demo role.', false);
row('Count tile', 'Drafts you are working on');
row('Count tile', 'Your submissions awaiting review');
row('Count tile', 'Your submissions with changes requested');
row('Count tile', 'Your approved sources');
row('Section heading', 'Waiting on you');
row('Waiting on you, item', '[Reviewer] asked for changes on [date].', false);
row('Waiting on you, nothing', 'Nothing needs your attention right now.');
row('Button', 'Read the feedback');
row('Reviewer roles only (updated)', 'Your role can read every submission, [n] in total.', false);
row('Section heading', 'How a presentation becomes a module');
row('Step 1', 'You submit a PowerPoint. It must contain no client information of any kind.');
row('Step 2', 'A clinician reviews the PowerPoint. They approve it as a source, ask for changes, or decline it.');
row('Step 3', 'The approved source is turned into an interactive module. This happens outside this website.');
row('Step 4', 'A clinician reviews the finished module. This is a second, separate approval. Approving the PowerPoint does not approve the module.');
row('Step 5', 'The approved module is published to the Learning Library.');
row('My submissions, under the title', 'Every PowerPoint you have started or submitted, and exactly where each one stands.');
row('All submissions, under the title (updated)', 'Every PowerPoint staff have started or submitted. To review one, use Reviews in the menu.');
row('Status filter tabs', 'All / Draft / Awaiting review / Changes requested / Approved source / In production / Final review / Published / Archived', false);
row('Table headings (updated)', 'Presentation / Submitted by / Updated / Reviewer / Status', false);
row('Table cells', 'Topic not chosen yet / Not assigned yet / Version 1 (not submitted)', false);
row('Empty filter', 'Choose another status above to see the rest.');
row('After deleting a draft', 'The draft was deleted.');
row('Overview, reviewers (added)', 'Items needing review');
row('Overview, reviewers (added)', 'Gate 1 · source PowerPoints you can review');
row('Overview, reviewers (added)', 'Gate 2 · final modules you can review');
row('Overview, production roles (added)', '[n] approved sources ready for production, [n] in production, [n] ready to publish, [n] published.', false);

section('19', 'Submission wizard, including the contributor checklist', 'The five checklist lines are what a contributor confirms before sending a PowerPoint for review. **Please read these closely.** A checkbox is not a safeguard on its own. Staff training and a real file check are still needed before real use.');
row('Under the page title, new', 'Six short steps. You can save a draft at any point and come back to it.');
row('Under the page title, editing', 'Save a draft at any point. Nothing is sent for review until you submit on the last step.');
row('Step names', 'Title and summary / Topic and tags / Objectives and audience / PowerPoint file / Checklist / Review and submit', false);
row('Title hint', 'What a caregiver would see. For example: “Getting ready for transitions.”');
row('Summary hint', 'Two or three sentences about what the presentation teaches. General education only. Nothing about a real child or family.');
row('Objectives hint', 'What will a caregiver be able to do afterwards? Start with a plain verb, like “Describe” or “Recognize.” Up to five.');
data('Tag choices', LC_APPROVED_TAGS.join(' / '));
data('Audience choices', LC_AUDIENCES.join(' / '));
row('File step warning', 'Do not upload anything that contains client information. Check hidden slides, speaker notes, comments, screenshots and the file’s properties, not only the slides. Demo mode: use a made-up or blank presentation. Files stay on this computer.');
row('After a file is uploaded', 'Checked: it is a PowerPoint file. Not scanned for malware in the demo.', false);
row('Revision question', 'What did you change in this version?');
row('Checklist step warning', 'Ticking these boxes does not check the file for you. Please open the presentation and look before you confirm.');
row('Checklist heading', 'I confirm that');
LC_CHECKLIST.forEach((c, i) => data(`Checklist item ${i + 1}`, c.label));
row('Review step, something missing', 'Still needed before you can submit');
row('Review step, all in place', 'Everything is in place. When you submit, this version is locked and sent for clinical review. You will not be able to change it, only start a new version if a reviewer asks for changes.');
row('Under a disabled Submit button', 'The submit button turns on once the items listed above are done.');
row('Buttons', 'Back / Save draft / Save and continue / Submit for clinical review', false);
row('Status line (updated)', 'Draft saved at [time]. / Draft saved automatically at [time]. / Saving your changes automatically… / You have changes that are not saved yet.', false);
row('Revision banner', 'Version 2: responding to feedback from [reviewer]', false);
row('Revision banner', 'The version that was reviewed is kept exactly as it was. This is a new version.');
row('After coming back to a draft with unsaved typing (added)', 'We put back the changes you had not saved yet.');
row('If the draft was changed in another tab (added)', 'This draft was changed in another tab, so this tab now shows the saved version.');

section('20', 'Messages when something is missing or a file is refused');
for (const [where, text] of [
  ['No title', 'Give the presentation a title before saving.'], ['Title too short', 'Give the presentation a title of at least 5 characters.'], ['Summary too short', 'Write a short summary of at least 20 characters.'],
  ['No topic', 'Choose one of the six topics.'], ['No objective', 'Add at least one learning objective.'], ['Objective too short', 'Each objective needs at least 10 characters.'], ['No audience', 'Say who this is for.'],
  ['No file', 'Upload your PowerPoint (.pptx) file.'], ['Checklist incomplete', 'Confirm every item on the checklist.'], ['Revision note missing', 'Say briefly what you changed in this version (at least 10 characters).'],
  ['Saved from an old tab', 'This submission changed since you opened it. Reload the page to see the latest version, then try again.'], ['Already submitted', 'This version has been submitted and can no longer be changed.'],
  ['Delete refused', 'Only a draft that has never been submitted can be deleted. Reviewed versions are kept.'], ['Upload interrupted', 'The upload did not finish. Check your connection and try again.'],
] as const) row(where, text);
const nm = checkPptxName('x.ppt'); if (!nm.ok) data('Old .ppt file', nm.message);
const wt = checkPptxName('x.pdf'); if (!wt.ok) data('Not a .pptx name', wt.message);
data('File too large', LC_TOO_LARGE_MESSAGE);
for (const [where, bytes] of [['Empty file', new Uint8Array(0)], ['Not really a PowerPoint', new TextEncoder().encode('plain text')], ['Damaged file', new Uint8Array([0x50, 0x4b, 3, 4, 0, 0, 0, 0])]] as const) { const r = checkPptxBytes(bytes); if (!r.ok) data(where, r.message); }

section('21', 'Status names and the "What happens next" line for each', 'The status names follow the design guide. The sentence beside each one is draft wording.');
for (const s of Object.values(LC_STATUS)) data(s.label, s.next);
data('History entries', Object.values(LC_AUDIT_LABEL).join(' / '));

section('22', 'Submission page, and the seeded sample submissions');
row('After submitting', 'Submitted for clinical review. This version is now locked.');
row('Section headings', 'What happens next / Reviewer feedback / Versions / Details / History', false);
row('Buttons', 'Continue this draft / Continue the new version / Start a new version / Delete this draft / Download', false);
row('Delete confirmation', 'Delete this draft and its uploaded file? This cannot be undone.');
row('Version labels', 'Locked / Not submitted yet', false);
row('Version text', 'Submitted [date]. It cannot be changed. / You can still edit this version.', false);
row('File notes', 'Synthetic demo file, not a real presentation · Not scanned for malware in the demo', false);
row('History footer', 'This record is read-only.');
const seed = buildDemoStaffStore().store;
for (const s of seed.submissions) { data('Sample submission title (fictional)', s.title); if (s.summary) data('Sample submission summary (fictional)', s.summary); s.objectives.forEach((o) => data('Sample submission objective (fictional)', o)); }
for (const r of seed.reviews) data('Sample reviewer feedback (fictional)', r.comments);

h2('Clinical review, production and publishing');
out += '\nAdded in the third build phase. These screens are what a BCBA, the Clinical Director and a content producer would use. They run only in the local demo, with fictional staff.\n';

out += `
### 24. For the Clinical Director: three rules about who may approve what

These rules are built in and switched on. The project brief says not to hard-code a clinic policy that has not been formally agreed, so they are kept in one place (\`src/lib/learn/staff/pipeline.ts\`, \`LC_REVIEW_POLICY\`) and each can be switched off without touching anything else. Please confirm each one, or say what the rule should be. **All three stay switched on until you answer.**

| Rule | What it means | Keep it? |
|---|---|---|
| A reviewer cannot review their own work | Someone who submitted a PowerPoint cannot approve it, and cannot give the final approval of the module made from it. | [ ] Yes  [ ] No |
| The two approvals come from two people | Whoever approved the PowerPoint cannot also give the final approval of the module. | [ ] Yes  [ ] No |
| The person who imported the module cannot approve it | Building a module and approving it are separate jobs. | [ ] Yes  [ ] No |

Not a switch, and always enforced: RBTs and apprentices can never approve or publish anything, a producer cannot approve or publish, a BCBA reviewer can approve but not publish, and only the Clinical Director role can publish or withdraw.

What a person sees when one of these rules stops them:
`;
{
  const a = { id: 'x', displayName: 'x', role: 'bcba_reviewer' as const, active: true };
  const sub = { createdBy: 'x' } as Parameters<typeof sourceReviewBlock>[1];
  out += `- Own submission, source review: "${sourceReviewBlock(a, sub)}"\n`;
  const store = { reviews: [{ targetType: 'source_pptx', targetVersionId: 'v', decision: 'approved', reviewerId: 'x' }] } as unknown as Parameters<typeof finalReviewBlock>[0];
  const mod = (over: object) => ({ importedBy: 'someone', sourceVersionId: 'none', ...over }) as unknown as Parameters<typeof finalReviewBlock>[2];
  out += `- Own submission, final review: "${finalReviewBlock(store, a, mod({}), sub)}"\n`;
  out += `- Imported the module: "${finalReviewBlock(store, a, mod({ importedBy: 'x' }), { createdBy: 'other' } as typeof sub)}"\n`;
  out += `- Approved the source: "${finalReviewBlock(store, a, mod({ sourceVersionId: 'v' }), { createdBy: 'other' } as typeof sub)}"\n`;
  out += `- Role without review rights: "${sourceReviewBlock({ ...a, role: 'rbt' }, sub)}" / "${finalReviewBlock(store, { ...a, role: 'rbt' }, mod({}), sub)}"\n`;
}

section('25', 'Review queue, and Gate 1: reviewing the source PowerPoint', 'The seven checklist lines are what a reviewer confirms before approving a PowerPoint as a source. **Please read these closely.**');
row('Queue title', 'Items needing review');
row('Queue, under the title', 'Two separate approvals. Approving a PowerPoint does not approve the module made from it.');
row('Queue tabs', 'Gate 1 · PPTX sources / Gate 2 · Final modules', false);
row('Gate 1 explanation', 'Is this PowerPoint accurate, general and free of client information? Approving it lets a producer start building the module.');
row('After a decision', 'Approval recorded. / Your request for changes was sent. / Your decision was recorded.', false);
row('Review page, under the gate label', 'You are reviewing the PowerPoint only. The module made from it gets its own review later, by a second person.');
row('Review page', 'There is no slide preview in the demo. Download the file and open it in PowerPoint, including hidden slides, notes and comments.');
row('Section headings', 'The file to review: version [n] / Your decision / Earlier source reviews / What was submitted', false);
row('Button', 'Start review');
row('Checklist heading', 'Review checklist');
row('Checklist hint', 'Every item must be ticked to approve. To request changes or decline, write a note instead.', false);
LC_SOURCE_CHECKLIST.forEach((c, i) => data(`Source checklist item ${i + 1}`, c.label));
row('Notes hint', 'Needed when you request changes or decline. Optional when you approve. Do not write anything about a real child or family.', false);
row('Buttons', 'Approve source / Request changes / Decline', false);
row('Approve confirmation', 'Approve version [n] of “[title]” as a source? This is recorded with your name and the time, and cannot be undone.', false);
row('Under a disabled Approve button', 'The approve button turns on once every checklist item is ticked.');
row('Refusal, checklist incomplete', 'Tick every item on the checklist before approving.');
row('Refusal, no note', 'Write a note for the contributor explaining what is needed (at least 10 characters).');
row('Refusal, a different version is waiting', 'A different version is waiting for review. Reload the page and review that one.');
row('Refusal, not waiting', 'This submission is not waiting for a source review.');
row('Refusal, role', 'Your role does not allow that.');

section('26', 'Gate 2: reviewing the finished module', 'The seven checklist lines are what a reviewer confirms before giving the final approval of a module. **Please read these closely.**');
row('Gate 2 explanation, queue', 'Is the finished module, exactly as a caregiver will see it, accurate and safe to publish? This is its own approval, by a second person.');
row('Review page, under the gate label', 'You are reviewing the finished module itself, exactly as a caregiver will see it. The earlier approval of the PowerPoint does not cover it.');
row('Button', 'Preview in the lesson player');
row('Section heading', 'What is new compared with the PowerPoint');
row('Under the producer’s notes', 'This is what the producer declared. New explanations, examples and questions were not part of the first approval, so check them closely.');
row('Section headings', 'What is in this module / Your decision / Earlier final reviews / Where it came from', false);
row('"Where it came from" labels', 'Source presentation / Gate 1 approval / Written by / Imported by / How it was made / Module version / Content fingerprint / Package check', false);
LC_FINAL_CHECKLIST.forEach((c, i) => data(`Final checklist item ${i + 1}`, c.label));
row('Buttons', 'Approve final module / Request changes / Reject', false);
row('Refusal, no note', 'Write a note for the producer explaining what is needed (at least 10 characters).');
row('Refusal, not waiting', 'This module is not waiting for a final review.');

section('27', 'Production: collecting an approved source and importing the module');
row('Board title', 'From approved source to published module');
row('Board, under the title', 'Only a source with a clinical approval appears here. A module is published only after its own, second approval.');
row('Board groups', 'Approved sources, ready for production / In production / In final review / Final approved, ready to publish / Published / Withdrawn', false);
row('Button', 'Collect for production');
row('Waiting text', 'Waiting for a producer to collect this for production.');
row('Import warning', 'The module is made outside this website, from the approved PowerPoint only. This website does not send anything to an AI service and has no “generate” button. Use only approved material with no client information.');
row('Import field hint', 'Paste the module package made from the approved PowerPoint. It is checked before anything is saved.');
row('Button', 'Fill in the synthetic sample package');
row('Field labels', 'Module package / Date the module was made / How was it made? / What is new compared with the PowerPoint?', false);
row('"How was it made?" choice', 'Made outside this website with an AI assistant, from the approved PowerPoint');
row('"How was it made?" choice', 'Written by hand from the approved PowerPoint');
row('"What is new" hint', 'List any explanations, examples or questions that were not in the source, so the reviewer knows where to look hardest. If nothing is new, say so.');
row('Button', 'Check and import');
row('After a clean import', 'Imported as a draft. No problems were found in the package.');
row('Button', 'Send for final review');
row('Under that button', 'After this the module version is locked. A change means importing a new version, which needs its own review.');
row('Gate 2 panel on the workspace', 'Each module version needs its own final approval, from someone other than the person who approved the source.');
row('Refusal, package problems', 'The module package has problems that need fixing before it can be imported.');
row('Package problem', 'This is not valid JSON. Paste the whole module package, starting with { and ending with }.');
row('Package problem', 'review: a module package cannot declare itself approved. Approval is recorded here by a reviewer, not written into the package.');
row('Package problem', 'slug: another module already uses the address “[address]”.', false);
row('Refusal, nothing new described', 'Describe what is new compared with the PowerPoint, or write that nothing is new (at least 10 characters).');
row('Refusal, wrong moment', 'A module can be imported only while the submission is in production.');
row('Refusal, not approved', 'Only a clinically approved source can be collected for production.');
data('Module version states', Object.values(LC_MODULE_STATUS).map((x) => x.label).join(' / '));

section('28', 'Publishing and withdrawing');
row('Publish confirmation', 'Publish “[title]” to the Learning Library? Families will be able to open it straight away.', false);
row('Buttons', 'Publish / Yes, publish / Not yet / Withdraw / Yes, withdraw / Keep it published', false);
row('Waiting text', 'Waiting for someone with permission to publish.');
row('Withdraw confirmation', 'Withdraw “[title]”? It disappears from the Learning Library at once and its address stops working.', false);
row('Withdraw field', 'Why is it being withdrawn?');
row('Refusal, no reason', 'Say briefly why this module is being withdrawn (at least 10 characters).');
row('Refusal to publish, opening words', 'This module cannot be published.', false);
row('Refusal to publish, reason', 'The source PowerPoint this module was made from has no recorded clinical approval.');
row('Refusal to publish, reason', 'This exact module version has no recorded final clinical approval.');
row('Refusal to publish, reason', 'This module is not in the “Final approved” state.');
row('Refusal to publish, reason', 'Another published module already uses this address.');
row('Refusal to withdraw', 'Only a published module can be withdrawn.');
row('Approval lines on the workspace', 'Version [n] of “[title]” approved as a source by [reviewer] on [date]. / Final approval by [reviewer] on [date]. / Published by [name] on [date]. / Withdrawn by [name] on [date]. Reason: [reason]', false);
row('Link', 'Open it in the Learning Library');
void publishBlock;

{
  const v2 = validateManifest(demoGroupTrainingsPackage);
  if (!v2.ok) throw new Error('sample package invalid');
  const g = v2.manifest;
  section('29', `Second sample module: “${g.title}”`, 'A synthetic module used to demonstrate importing, final review, publishing and withdrawing. It appears in the Learning Library only after it has been taken through the demo workflow on a local machine. It was written for the demo and **has not been clinically reviewed**. Lines marked ✔ are the answers the module treats as correct.');
  data('Title', g.title);
  data('Summary', g.summary);
  data('Time shown', `About ${g.estimatedMinutes} minutes`);
  g.objectives.forEach((o, i) => data(`Objective ${i + 1}`, o));
  g.lessons.forEach((l, li) => {
    data(`Lesson ${li + 1} title`, l.title);
    data(`Lesson ${li + 1} summary`, l.summary);
    l.steps.forEach((st, si) => {
      const at = `Lesson ${li + 1}, step ${si + 1}`;
      data(`${at} title`, st.title);
      if (st.type === 'intro') { st.body.forEach((p) => data(`${at} text`, p)); if (st.whyItMatters) data(`${at} "Why it matters"`, st.whyItMatters); }
      if (st.type === 'slide') { st.items.forEach((it) => data(`${at} slide box ${it.label ?? ''}`.trim(), `${it.title}: ${it.text ?? ''}`)); data(`${at} slide description for screen readers`, st.description); st.narration.forEach((p) => data(`${at} text under the slide`, p)); }
      if (st.type === 'explanation') st.body.forEach((p) => data(`${at} text`, p));
      if (st.type === 'knowledge_check') { data(`${at} question`, st.question); st.choices.forEach((c) => { data(`${at} choice${c.correct ? ' ✔' : ''}`, c.text); data(`${at} feedback for that choice`, c.feedback); }); }
      if (st.type === 'takeaways') st.points.forEach((p) => data(`${at} takeaway`, p));
    });
  });
  g.takeaways.forEach((t) => data('Completion screen takeaway', t));
}


h2('Training listings and reporting (added in phase 4)');
out += `
### 30. For the Clinical Director, compliance and IT: reporting decisions to confirm

These are built in as described. Each one is a choice the clinic should confirm or change before any real number is entered. They are not wording.

| No. | What is built | Please confirm or change |
|---|---|---|
| 30.1 | A count under **${LC_SMALL_CELL_MINIMUM}** for one center, or one "how did you hear" answer, at one training is never shown. It is added to "Other / not displayed" together with at least one other count, so it cannot be worked out by subtracting. The master prompt proposes 5 and says compliance sets the number. | |
| 30.2 | The splits by center and by "how did you hear" count **registrations submitted**, because that is where the Teams registration form would ask. They do not count attendances. | |
| 30.3 | The attendance rate is **attendances divided by approved registrations**, using only trainings that have both numbers, and leaving out any training where attendances are higher than approved registrations. | |
| 30.4 | In the demo, only the Clinical Director role can open reporting, enter numbers, correct them and manage listings. The master prompt allows a BCBA to be given this "if assigned". Who should have it? | |
| 30.5 | The same permission covers entering numbers and seeing the report. The person entering can type a small count; nobody is shown one afterwards, on any screen or in the download. Should entering and viewing be two separate permissions? | |
| 30.6 | The five "how did you hear about it" answers in section 33 are placeholders. They should match the question on the real Teams registration form, if the clinic decides to ask one, with whatever notice to families is required. | |
| 30.7 | **Open question 3 from the cover.** The "Registrations by center" figures can only come from one place: a question on the Microsoft Teams registration form asking which center the child attends. The website cannot work it out, and staff must not estimate it or look families up. | ☐ Yes. The form will ask, as a required question, with the six centers as a fixed list, on every training.<br>☐ No. We will not ask. Switch per-center reporting off.<br>☐ Not decided yet. Leave the per-center boxes empty until it is. |
`;

section('31', 'Staff: training listings', 'Pages under /learn/staff/trainings. The audience line "Currently enrolled families only" and the button names on the public pages come from the master prompt.');
row('Menu and page title', 'Trainings');
row('Page heading', 'Website listings for live trainings');
row('Under the heading', 'The training, its registration and its attendance all live in Microsoft Teams. A listing here is only the public notice. It never holds a link for joining a meeting.');
row('Button', 'New listing');
row('Group headings', 'Public and upcoming / Finished, not yet marked completed / Drafts / Completed / Cancelled / Archived', false);
row('Empty groups', 'No upcoming training is listed. / No drafts.', false);
row('Row, no date', 'No date yet');
row('Chip on a public listing with no link', 'No registration link');
row('New listing, under the heading', 'Create the event in Microsoft Teams first. This saves a draft that only staff can see. You can add the rest later and publish when it is ready.');
row('Field labels', 'Title / Short summary / Description / Learning objectives / Topic / Date and time / Date / Starts / Ends / Presenter / Related modules / Microsoft Teams registration link', false);
row('Hint, summary', 'One or two sentences. Shown on the training card.');
row('Hint, description', 'General education only. Leave a blank line between paragraphs. Nothing about a real child or family.');
row('Hint, objectives', 'One per line, in plain language.');
row('Hint, date and time', 'Central Time (CT). The site works out daylight saving time for the date you choose.');
row('Hint, presenter', 'Leave empty unless the presenter has agreed to be named. In this demo, do not type a real person’s name.');
row('Tick box, presenter', 'The presenter has agreed to be named on the public page.');
row('Related modules, none published', 'No module is published yet, so there is nothing to link.');
row('Hint, related modules', 'Only published modules can be linked.');
row('Hint, registration link', 'Paste the event’s registration page from Microsoft Teams. It starts with https://events.teams.microsoft.com. Never paste a link for joining the meeting. Without a link, caregivers see “Registration details coming soon”.');
row('Under the form', 'Audience: Currently enrolled families only. This is shown on every listing and cannot be changed here.');
row('Save buttons', 'Create draft / Save draft / Save changes to the public listing', false);
row('After creating', 'Draft created. Only staff can see it until you publish.');
row('Refused: no title', 'Give the training a title.');
row('Refused: topic', 'Choose a topic from the list.');
row('Refused: date parts missing', 'Add the date. / Add the start time. / Add the end time.', false);
row('Refused: a time that does not exist', 'That date and start time do not exist in Central Time. Check the date, and remember the clocks change in March.');
row('Refused: end before start', 'The end time must be after the start time.');
row('Refused: too long', 'A training cannot be longer than eight hours.');
row('Refused: presenter not confirmed', 'Tick the box to confirm the presenter has agreed to be named, or leave the name out.');
row('Refused: module not published', 'Only published modules can be linked to a training.');
for (const [where, bad] of [['Refused link: not a full address', 'not a link'], ['Refused link: not https', 'http://events.teams.microsoft.com/event/x'], ['Refused link: not Teams', 'https://example.com/x'], ['Refused link: a join link', 'https://teams.microsoft.com/l/meetup-join/x']] as const) {
  const c = checkRegistrationUrl(bad); if (!c.ok) data(where, c.reason);
}
row('Refused: any field', 'Some details need another look. Nothing was saved.');
row('Refused: public listing left incomplete', 'This listing is public, so it has to stay complete. Nothing was saved.');
row('Refused: edited elsewhere', 'This listing was changed somewhere else since you opened it. Reload the page to see the latest version, then try again.');
row('Refused: role', 'Your role cannot manage training listings.');
row('Refused: closed listing', 'A completed, cancelled or archived listing can no longer be edited.');
(Object.keys(LC_LISTING_STATUS) as (keyof typeof LC_LISTING_STATUS)[]).forEach((k) => data(`Status: ${LC_LISTING_STATUS[k].label}`, LC_LISTING_STATUS[k].note));
row('Preview headings', 'How caregivers see it / Preview', false);
row('Under the preview: link checked', 'Caregivers see a “Request registration” button. It opens the Microsoft Teams registration page in a new tab.');
row('Under the preview: no link', 'Caregivers see “Registration details coming soon” and no registration button.');
row('Under the preview: closed', 'Caregivers see “Registration closed” and no registration button.');
row('Under the preview: completed', 'Caregivers see this training as completed, with no registration button.');
row('Under the preview: cancelled', 'Caregivers see this training as cancelled, with no registration button.');
row('Warning, no link', 'No registration link has been added. Caregivers will see “Registration details coming soon” and no registration button.');
row('Before publishing', 'Before this can be published:');
row('What is missing', 'Add a title. / Add a short summary, one or two sentences. / Add a description. / Add at least one learning objective. / Choose a topic. / Add the date, start time and end time. / The start time has already passed. Choose a date in the future.', false);
row('Refused: not ready', 'This listing is not ready to publish yet.');
row('Status buttons', 'Publish listing / Archive draft / Close registration / Reopen registration / Cancel training / Mark completed / Archive listing', false);
row('Confirm publish', 'Publish this listing? Caregivers will be able to see it straight away.');
row('Confirm cancel', 'Cancel this training? The public page will say it was cancelled. This cannot be undone here.');
row('Confirm archive, draft', 'Archive this draft? It was never public. It will move to the archived list.');
row('Confirm archive, finished or cancelled', 'Archive this listing? It will be removed from the public pages. Any numbers entered for it stay in reporting.');
row('Confirm buttons', 'Yes, publish / Yes, cancel it / Yes, archive / Not yet', false);
row('End time has passed', 'This training’s end time has passed. Caregivers already see it as completed. Mark it completed to finish the listing.');
row('Refused: already finished', 'This training has already finished. Mark it completed instead.');
row('Refused: not finished', 'This training has not finished yet. It can be marked completed after its end time.');
row('Public listing, above the form', 'This listing is public. A saved change shows to caregivers straight away, with today as the “last updated” date.');
row('Numbers, none yet', 'No totals have been entered for this training yet.');
row('Numbers buttons', 'Enter the numbers / Correct the numbers', false);
data('History entries', Object.values(LC_LISTING_AUDIT_LABEL).join(' / '));
row('Staff overview panel', 'Trainings and reporting');
row('Staff overview buttons', 'Open trainings / Open reporting', false);

section('32', 'Staff: the reporting page', 'The page at /learn/staff/analytics, and the file it can download. **The eight definitions at the end are what every reader will rely on to understand the numbers. Please read them closely.** The banner is the master prompt’s exact wording.');
data('Banner on every reporting page and in the download (master prompt wording)', LC_REPORT_BANNER);
row('Menu and page title', 'Reporting');
row('Page heading', 'Caregiver participation');
row('Under the heading', 'Totals only, typed in by staff from the Microsoft Teams report after each training. This page cannot show who registered or attended, and nothing here is connected to Teams.');
row('Buttons', 'Download totals (CSV) / Print / Show', false);
row('Filter labels', 'Period / From / To / Topic / Training', false);
row('Period choices', 'Last 30 days / Last 90 days / Year to date / Custom dates', false);
row('Beside From and To', 'custom dates only');
row('Topic and training choices', 'All topics / All trainings', false);
row('Dates not readable', 'Those dates could not be read, so this shows the last 90 days instead.');
row('Dates the wrong way round', 'The start date is after the end date, so this shows the last 90 days instead.');
row('Period too long', 'That is more than three years, so this shows the last 90 days instead.');
row('Summary tiles', 'Trainings held / Registrations submitted / Approved registrations / Attendances / Attendance rate', false);
data('When a number has not been entered', 'Not yet available');
row('Under "Trainings held"', 'Recorded by staff as having taken place.');
row('Under "Trainings held", when some are waiting', '[n] more finished, numbers not entered yet. [n] cancelled or not held.', false);
row('Under a total', 'No finished trainings in this period.');
row('Under a total', 'Not entered yet for any of the [n] finished trainings.', false);
row('Under a total', 'From [n] of [n] finished trainings. [n] not yet available.', false);
row('Under a total', 'From all [n] finished trainings.', false);
row('Under "Attendances"', 'One caregiver at three trainings counts three times.');
row('Under the rate', '[n] attendances out of [n] approved registrations, from [n] of [n] trainings held.', false);
row('Under the rate, none', 'No trainings held in this period.');
row('Under the rate, not comparable', 'Needs attendances and approved registrations for the same training.');
row('Section', 'Numbers waiting to be entered');
row('Section', 'Participation over time');
row('Under it', 'By [week or month]. A [week or month] with no number entered has no point on the chart. It is not drawn as zero.', false);
row('Chart buttons', 'View as chart / View as table', false);
row('Table headings', 'Week starting / Month / Trainings held / Registrations submitted / Attendances', false);
row('Table, a period with no trainings', 'No trainings');
row('Section', 'Most-attended topics');
row('Section, empty', 'No training was held in this period.');
row('Section', 'By training');
row('Table headings', 'Training / Status / Registrations / Approved / Attendances', false);
data('Status of each training', Object.values(LC_ROW_STATE).join(' / '));
row('Cells', 'Not due yet / Not held', false);
row('Row buttons', 'Enter numbers / Correct', false);
row('Section, empty', 'No training falls in this period. Try a longer period or a different topic.');
row('Sections', 'Registrations by center / How families heard about it', false);
row('Row with nothing to show', 'None, or too few to show');
row('Row', 'Other / not displayed');
row('Under a split', '[n] registrations from [n] of [n] trainings with numbers entered. A count under 5 for one training is never shown on its own. It is added to “Other / not displayed” together with at least one other count, so it cannot be worked out by subtracting.', false);
row('Split not entered', 'No training in this period has this split entered.');
row('Section', 'What the numbers mean');
LC_GLOSSARY.forEach((g) => data(`Definition: ${g.term}`, g.meaning));
row('After saving', 'Numbers saved.');
row('After a correction', 'Correction saved. The earlier entry is kept in the history.');

section('33', 'Staff: entering and correcting the numbers', 'The page reached from "Enter numbers" or "Correct". It has boxes for whole numbers, a date and fixed lists only.');
row('Headings', 'Enter the numbers / Correct the numbers / Totals for this training / Correction to revision [n]', false);
row('Guidance at the top', 'These are totals only. Read them from the Microsoft Teams organizer report and type them in. Do not paste names, email addresses, attendance spreadsheets, or anything about a child or family. This page has nowhere to keep them.');
row('Label', 'Date you read the report');
row('Hint', 'The day you looked at the numbers, in Central Time.');
row('Label', 'Where the numbers came from');
data('Choices', LC_REPORT_SOURCES.join(' / '));
row('Hint', 'Type the totals in by hand. Do not upload or paste the report itself.');
row('Question', 'Was the training held?');
row('Answers', 'Yes, it took place / No, it did not take place', false);
row('Cancelled listing', 'This listing is marked cancelled, so it is recorded as not held.');
row('Hint, registrations submitted', 'How many registration requests Teams received, approved or not. Leave empty if you do not have this number.');
row('Hint, approved registrations', 'How many of those requests were approved in Teams. Leave empty if you do not have this number.');
row('Hint, attendances', 'The attendee count on the Teams report for this one training. Leave empty if you do not have this number.');
row('Hint, attendances, not held', 'Not used for a training that did not take place.');
row('Label', 'Registrations by center');
row('Hint', 'Only if the registration form asked families for their center. These are a split of registrations submitted. If they add up to less, the rest is shown as “Did not say”.');
row('Label', 'Registrations by how families heard about it');
row('Hint', 'Only if the registration form asked. These are a split of registrations submitted.');
data('"How did you hear" answers (placeholders, see 30.6)', LC_REFERRAL_SOURCES.map((x) => x.label).join(' / '));
row('On a correction', 'Keep the split as entered / Type it in again', false);
row('On a correction, split kept', 'The split entered earlier stays as it is. It is not shown here because some of its counts may be small.');
row('On a correction, retyping', 'Leave every box empty to remove the split.');
row('Label', 'Why are the numbers changing?');
row('Hint', 'One sentence about the numbers. The earlier entry is kept, with this reason beside the new one. No names, email addresses or phone numbers.');
row('Buttons', 'Save numbers / Save correction', false);
row('Refused: not a whole number', 'Use a whole number, 0 or more. Leave the box empty if the number is not known.');
row('Refused: approved above submitted', 'Approved registrations cannot be more than registrations submitted.');
row('Refused: attendances for a training not held', 'A training that was not held has no attendances. Leave this empty.');
row('Refused: cancelled but marked held', 'This training is marked cancelled, so it cannot be recorded as held.');
row('Refused: split with no total', 'Enter registrations submitted first. The [center or source] counts are a split of that number.', false);
row('Refused: split too large', 'These add up to [n], which is more than the [n] registrations submitted.', false);
row('Refused: kept split no longer fits', 'The split entered earlier no longer fits the registrations submitted. Choose “Type it in again”.');
row('Refused: date', 'Add the date you read the report. / This date is in the future. / This date is before the training took place.', false);
row('Refused: source', 'Choose where the numbers came from.');
row('Refused: no reason', 'Say in a sentence why the numbers are changing.');
row('Refused: contact details in the reason', 'Leave out names, email addresses and phone numbers. Describe the change to the numbers only.');
row('Refused: nothing changed', 'Nothing was changed, so there is nothing to correct.');
row('Refused: any entry', 'Some entries need another look. Nothing was saved.');
row('Refused: edited elsewhere', 'These numbers were changed somewhere else since you opened this page. Reload to see the latest entry, then try again.');
row('Refused: role', 'Your role cannot see or enter participation numbers.');
row('Refused: not public', 'Numbers can only be entered for a training that was listed publicly.');
row('Refused: not finished', 'This training has not finished yet. Enter its numbers after it ends.');
row('History heading', 'Every entry for this training');
row('Under it', 'Reporting uses the newest entry. Earlier entries are kept and never edited.');
row('History line', 'Split by center: [entered or not collected]. Split by how families heard: [entered or not collected].', false);

section('34', 'Example training listings in the staff demo', 'Eight made-up listings and their made-up totals, so the screens have something to show on a local machine. Their dates are counted from the day the demo is reset. They never appear on a deployed site. Each is labelled "Example listing" on the caregiver pages. **None is a real event, and none of the numbers is real attendance.**');
{
  const st = buildDemoStaffStore(new Date('2026-06-01T12:00:00Z')).store;
  st.listings.forEach((l, i) => {
    const t = l.training;
    data(`Listing ${i + 1} title`, t.title);
    if (t.summary) data(`Listing ${i + 1} summary`, t.summary);
    t.description.forEach((d) => data(`Listing ${i + 1} description`, d));
    t.objectives.forEach((o) => data(`Listing ${i + 1} objective`, o));
  });
  st.reports.filter((r) => r.reason).forEach((r) => data('Reason on the example correction', r.reason));
}

h2('Not listed above');
out += `
### 23. Wording taken word for word from the project briefs

These lines were supplied in the master prompt, the integration brief or the design guide, and are used exactly as written. They are not repeated above. The master prompt notes that the education statement's "exact official wording is subject to organization/clinical review."

- **Home page:** "Practical learning for everyday life." · "Build understanding at your own pace or join a live caregiver training with your clinical team." · "Explore Learning Modules" · "Short, interactive lessons you can complete anytime." · "Explore modules" · "Upcoming Live Trainings" · "Virtual group sessions for currently enrolled families." · "View trainings" · "Choose a topic" · "Follow simple steps" · "Explore live training options"
- **Education statement, on every page and at the end of every module:** "These educational resources support general learning. Your child's supervising BCBA is responsible for individualized recommendations and treatment planning."
- **Empty states:** "There aren't any live trainings listed right now. You can still explore our learning modules." · "Resources are being prepared for clinical review. Check back for new learning materials." · "You haven't submitted a presentation yet. Start with a PowerPoint you created."
- **Names and labels:** Caregiver Learning Center · Sugar Land pilot · Home · Learning Library · Live Trainings · Help & FAQ · Staff sign-in · the six topic names · "Understanding the ABCs of Behavior"
- **Buttons and controls:** Start learning · Continue learning · Start module · Resume · Back · Next · Save and exit · Lesson outline · Reset progress · Return to library · Search learning topics · View details · Request registration · Register through Microsoft Teams · Registration details coming soon · Submit a PowerPoint · Drop your PowerPoint here · Browse files
- **Labels and notices:** "Demo sample — pending clinical approval" · "DEMO · NOT CLINICALLY APPROVED" (shown as "Demo · not clinically approved") · "Currently enrolled families only" · "Example story, not a real family." · "You can try again." · "Your progress is saved on this device." · "This training is available to currently enrolled families." · "You'll complete registration through Microsoft Teams." · "You can always come back to this lesson." · "Let's look at what happened immediately before the behavior." · "Staff sign-in is not set up yet" · "Illustrative demo data" · "Gate 1 · Source PowerPoint" · every status name in section 21
`;

fs.writeFileSync(path.join(ROOT, 'docs/learning-center/REVIEW_SHEET.md'), out.trimStart());
console.log('lines:', (out.match(/^\| \d+\.\d+ /gm) ?? []).length);
console.log('not found in source (' + missing.length + '):'); for (const x of missing) console.log('  ', x);

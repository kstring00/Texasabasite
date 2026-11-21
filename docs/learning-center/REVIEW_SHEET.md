# Learning Center review sheet

**For:** the Clinical Director and IT. **Prepared:** November 20, 2026.

## Start here

**What this is.** The Caregiver Learning Center is a new section being built for the Texas ABA Centers website. It is not public. This sheet lists every sentence in it that was written during the build instead of being supplied by the organization, so that you can check the wording before anyone outside sees it. All of it is a draft. Nothing in it has been clinically reviewed or approved.

**How to mark a line.** Every line has a number, like 13.4. In the last column:

- write **OK** if the wording is fine,
- or write the wording you want instead,
- or write **remove** if the line should not be there.

You do not need to mark every line in one sitting. Hand the sheet back with whatever you have marked, and the changes will be made by number. Lines you leave blank stay as drafts.

**Two questions need an answer first.** They are short, and each has tick boxes.

| | Question | Who | Where |
|---|---|---|---|
| 1 | Is the main phone number, (877) 771-5725, the approved contact for Learning Center questions? | Clinical Director | Section 1, just below |
| 2 | Are `events.teams.microsoft.com` and `teams.microsoft.com` the right addresses for registration pages in our Microsoft Teams? | IT | Section 2, just below |

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

**How drafts are marked in the product today**

- Every page families see carries this note above the footer: "Sugar Land pilot. The wording on these pages is a draft that is still being reviewed."
- Sample modules show "Demo · not clinically approved" on their card and overview, and "Demo sample — pending clinical approval" on every lesson screen.
- The privacy and accessibility pages each open with a "Draft" notice.
- Every staff page carries an amber "Illustrative demo data" banner.

Section numbers do not change between versions of this sheet. New material is added at the end.

## Open questions

### 1. For the Clinical Director: is the main phone number the approved contact?

The Help page tells caregivers they can call **Texas ABA Centers** on **(877) 771-5725** (Every day, 8:00 AM to 10:00 PM). The number is not typed into the Learning Center. It is read from the website's existing contact details, so it always matches the rest of the site.

- [ ] Yes, this is the approved contact for Learning Center questions.
- [ ] No. Use this instead: ______________________
- [ ] No phone number. Tell caregivers to ask their clinical team only.

The exact sentences are lines 13.27 to 13.29 below.

### 2. For IT: are these the right Microsoft Teams addresses for our tenant?

A live training listing may only link to the official Teams **registration** page. The website checks every link before showing a registration button. Today it accepts a link only when all of these are true:

| Rule | Current setting |
|---|---|
| Must start with | `https://` |
| Must be on one of these addresses | `events.teams.microsoft.com` or `teams.microsoft.com` |
| Must not be a link for joining a meeting | rejects links containing `/l/meetup-join/`, `/meet/` or `meetingjoin` |
| Must not contain | a username or password |

Anything else is treated as "no link yet", and the page shows "Registration details coming soon" instead of a button.

- [ ] Yes, registration pages for our tenant are always on those two addresses.
- [ ] No. Registration pages for our tenant are on: ______________________
- [ ] Our tenant uses a different event type (for example Town hall or a third-party form). Details: ______________________

Messages staff will see when a link is refused (shown in the listing editor, built in a later phase):
- Nothing entered: "No registration link has been added yet."
- Not a web address: "This is not a complete web address."
- Not https: "The link must start with https://."
- Has a username or password: "The link must not contain a username or password."
- Another website: "The link must be a Microsoft Teams registration page."
- A join link: "This looks like a link for joining a meeting. Use the event registration link instead."

## Caregiver pages

### 3. Every caregiver page

The strip under the site header, the note above the footer, and the amber banner shown while sample content is on.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 3.1 | Note above the footer | Sugar Land pilot. The wording on these pages is a draft that is still being reviewed. | |
| 3.2 | Link above the footer | Privacy for the Learning Center | |
| 3.3 | Link above the footer | Accessibility | |
| 3.4 | Amber banner, sample content on (wide screens) | Demo mode. The module and training shown here are samples. Nothing on these pages has been clinically approved. | |
| 3.5 | Amber banner, sample content on (phones) | Demo mode. Samples only. Nothing here is clinically approved. | |
| 3.6 | Short tab labels on phones | Home, Library, Trainings, Help | |

### 4. Home page (/learn)

The headline, supporting line, both choice cards, their buttons and the three step titles are the master prompt’s exact words and are listed in section 23.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 4.1 | Section heading | Browse by topic | |
| 4.2 | Section heading | Learning modules | |
| 4.3 | Link | See the whole library | |
| 4.4 | Section heading | Upcoming live trainings | |
| 4.5 | Link | See all trainings | |
| 4.6 | Empty state title, no modules | Modules are on the way | |
| 4.7 | Empty state title, no trainings | No live trainings are listed right now | |
| 4.8 | Section heading | How learning works | |
| 4.9 | Under "Choose a topic" | Pick something you want to understand better. There is no wrong place to start. | |
| 4.10 | Under "Follow simple steps" | Each lesson is one small step at a time. You can stop anywhere and come back. | |
| 4.11 | Under "Explore live training options" | Currently enrolled families can join virtual group trainings with the clinical team. | |
| 4.12 | Section heading | Need help? | |
| 4.13 | Help card | Joining a training in Microsoft Teams | |
| 4.14 | Help card | What to expect and how to get ready. | |
| 4.15 | Help card | Finding your registration email | |
| 4.16 | Help card | Where it comes from and what to do if it has not arrived. | |
| 4.17 | Help card | Talking with your clinical team | |
| 4.18 | Help card | Who to ask about your own child. | |

### 5. Topic introductions

One sentence per topic. Shown on each topic page. The six topic names come from the master prompt.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 5.1 | ABA Foundations | What Applied Behavior Analysis (ABA) is, the words you will hear, and how you and your clinical team work together. | |
| 5.2 | Understanding Behavior | Learn to describe what you see and what happens around it, so conversations with your clinical team are clearer. | |
| 5.3 | Communication & Connection | The many ways children communicate, and how to recognize and respond to communication attempts. | |
| 5.4 | Routines & Daily Living | Visual schedules, transitions, and the small routines that shape mornings, mealtimes and bedtime. | |
| 5.5 | Safety & Elopement | General safety awareness and what to share with your clinical team so they can plan with you. | |
| 5.6 | Caregiver Support | Questions to bring to your clinical team, how group trainings work, and ways to stay organized. | |

### 6. Learning Library (/learn/library)

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 6.1 | Under the page title | Short lessons you can do in your own time, one small step at a time. No account needed. | |
| 6.2 | Search box example text | For example: routines | |
| 6.3 | Button | Clear | |
| 6.4 | Filter button | All topics | |
| 6.5 | Result count | No modules match. | |
| 6.6 | Result count | 1 module / 2 modules, or "1 module matches" when searching | |
| 6.7 | No results, title | Nothing matches that yet | |
| 6.8 | No results, text | Try a different word, or clear the search to see every module. | |
| 6.9 | No results, button | Clear search and filters | |
| 6.10 | Module card | About 12 minutes · 3 lessons | |
| 6.11 | Module card, in progress | Lesson 2 of 3 | |
| 6.12 | Module card, finished | Completed on this device | |
| 6.13 | Module card button, finished | Review module | |

### 7. Topic pages (/learn/topics/…)

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 7.1 | Label above the title | Topic | |
| 7.2 | Section heading | Modules in this topic | |
| 7.3 | Empty state title | Nothing here yet | |
| 7.4 | Empty state button | Browse all modules | |
| 7.5 | Section heading | Other topics | |

### 8. Module overview page (/learn/modules/…)

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 8.1 | Under the button, not started | You can stop anywhere and come back. | |
| 8.2 | Under the button, in progress | You were on lesson 2: One moment, three parts. | |
| 8.3 | Under the button, finished | You finished this module on this device. | |
| 8.4 | Button, finished | Review from the start | |
| 8.5 | Notice, module updated since last visit | This module has been updated since your last visit, so it starts from the beginning. | |
| 8.6 | Notice, browser cannot save | This browser is not saving progress right now. You can still do every lesson. It will start from the beginning next time. | |
| 8.7 | Section heading | Lessons | |
| 8.8 | Lesson tags | Done / You are here | |
| 8.9 | Body | Your place is kept only in this browser. There is no account and nothing is sent to us. If you clear your browser data or use a different phone or computer, it starts over. | |
| 8.10 | Reset confirmation | Clear your saved place in this module on this device? | |
| 8.11 | Reset buttons | Yes, reset / Keep my place | |
| 8.12 | After reset | Your progress in this module was cleared. | |
| 8.13 | Section heading | What you will learn | |
| 8.14 | Section heading | Clinical review | |
| 8.15 | Clinical review text, sample module | Demo sample — pending clinical approval. This module has not been reviewed by a clinician and is here only to show how lessons work. | |
| 8.16 | Clinical review text, approved module | Reviewed by [reviewer] on [date]. | |
| 8.17 | Section heading | Live training on this topic | |
| 8.18 | Clinical review text, module published through the staff demo (added) | Demo sample — pending clinical approval. This module was published through the staff demo by fictional reviewers. It has not been reviewed by a clinician. | |

### 9. Lesson player: buttons and messages

These appear on every lesson, whatever the module.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 9.1 | Position | Lesson 1 of 3 | |
| 9.2 | Step labels | Introduction / Slide / In plain words / Scenario / Knowledge check / Takeaways / Live training | |
| 9.3 | Buttons | Back / Next / Next lesson / Finish module / Previous lesson / Module overview | |
| 9.4 | Notice, browser cannot save | This browser is not saving progress right now. You can still finish the lesson. | |
| 9.5 | Introduction steps | Why it matters. | |
| 9.6 | Knowledge check button | Check my answer | |
| 9.7 | Under the button | There is no score. You can try as many times as you like, or move on. | |
| 9.8 | If nothing is chosen | Choose an answer first, then check it. | |
| 9.9 | Multi-answer check, some still missing | Those fit. There is at least one more to find. You can try again. | |
| 9.10 | Takeaways step | Next lesson: [title]. | |
| 9.11 | Under the lesson card | You can always come back to this lesson. Your progress is saved on this device. | |
| 9.12 | Completion title | You finished this module. | |
| 9.13 | Completion text | Well done for making the time. Here is what to keep from [module title]. | |
| 9.14 | Completion heading | Related modules | |
| 9.15 | Completion text | For currently enrolled families. You’ll complete registration through Microsoft Teams. | |
| 9.16 | Step that links to a training | There is a live caregiver training on this topic for currently enrolled families. | |
| 9.17 | Step that links to a training, none listed | There is no live training listed for this topic right now. | |
| 9.18 | Staff preview of an unpublished module: watermark on every step (added) | Pending final clinical approval | |
| 9.19 | Staff preview: other watermarks (added) | Staff preview · final approved, not yet published / Staff preview of a published module | |
| 9.20 | Staff preview: under the lesson card (added) | Staff preview. Nothing is saved, and families cannot see this. | |
| 9.21 | Staff preview: button (added) | Close preview | |

### 10. Sample module: “Understanding the ABCs of Behavior”

This is the whole sample module, word for word as it appears on screen. It was written for the demo and **has not been clinically reviewed**. It needs the same review as any real module, including every quiz answer and every piece of feedback. Lines marked ✔ are the answers the module treats as correct.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 10.1 | Title | Understanding the ABCs of Behavior | |
| 10.2 | Summary | A simple way to describe one moment: what happened right before, what you saw, and what happened right after. | |
| 10.3 | Time shown | About 12 minutes | |
| 10.4 | Objective 1 | Say what antecedent, behavior and consequence mean in plain words. | |
| 10.5 | Objective 2 | Pick out the three parts in a short everyday example. | |
| 10.6 | Objective 3 | Explain why one moment on its own does not tell you why a behavior happened. | |
| 10.7 | Lesson 1 title | What ABC means | |
| 10.8 | Lesson 1 summary | Three plain words for the three parts of one moment. | |
| 10.9 | Lesson 1, step 1 title | Three small words for one moment | |
| 10.10 | Lesson 1, step 1 text | When something happens with your child, it can feel like it came out of nowhere. Slowing one moment down can make it easier to talk about. | |
| 10.11 | Lesson 1, step 1 text | Applied Behavior Analysis (ABA) often describes a moment in three parts, called antecedent, behavior and consequence. People shorten this to ABC. This lesson explains each word. | |
| 10.12 | Lesson 1, step 1 "Why it matters" | Describing a moment the same way helps you and your child’s clinical team talk about the same thing. | |
| 10.13 | Lesson 1, step 2 title | The ABC model | |
| 10.14 | Lesson 1, step 2 slide box A | Antecedent: What happened right before | |
| 10.15 | Lesson 1, step 2 slide box B | Behavior: What you could see or hear | |
| 10.16 | Lesson 1, step 2 slide box C | Consequence: What happened right after | |
| 10.17 | Lesson 1, step 2 slide description for screen readers | Three boxes in a row, read left to right: A, antecedent, what happened right before. B, behavior, what you could see or hear. C, consequence, what happened right after. | |
| 10.18 | Lesson 1, step 2 text under the slide | The three parts are always in time order. First the antecedent, then the behavior, then the consequence. | |
| 10.19 | Lesson 1, step 3 title | In plain words | |
| 10.20 | Lesson 1, step 3 text | Antecedent is a word for “right before.” It is whatever was going on just before the behavior, such as a sound, a request, or a change in the room. | |
| 10.21 | Lesson 1, step 3 text | Behavior is what a person does that someone else could see or hear. “Covered his ears” is a behavior. “Was upset” is a guess about a feeling. | |
| 10.22 | Lesson 1, step 3 text | Consequence does not mean punishment here. It only means what happened right after the behavior, whatever that was. | |
| 10.23 | Lesson 1, step 4 title | Check your understanding | |
| 10.24 | Lesson 1, step 4 question (one answer) | In the ABC model, what does “consequence” mean? | |
| 10.25 | Lesson 1, step 4 choice | A punishment for the behavior | |
| 10.26 | Lesson 1, step 4 feedback for that choice | In everyday speech it can sound that way. In the ABC model the word is neutral. Look again at what comes last in the sequence. You can try again. | |
| 10.27 | Lesson 1, step 4 choice ✔ | What happened right after the behavior | |
| 10.28 | Lesson 1, step 4 feedback for that choice | That’s it. The consequence is simply what happened next. It can be anything, and it is not a judgment. | |
| 10.29 | Lesson 1, step 4 choice | The reason the behavior happened | |
| 10.30 | Lesson 1, step 4 feedback for that choice | The reason is a separate question, and one moment cannot answer it. Think about the order: before, during, after. You can try again. | |
| 10.31 | Lesson 1, step 5 title | What to remember | |
| 10.32 | Lesson 1, step 5 takeaway | ABC stands for antecedent, behavior, consequence. | |
| 10.33 | Lesson 1, step 5 takeaway | It describes one moment in time order: right before, what you saw, right after. | |
| 10.34 | Lesson 1, step 5 takeaway | Consequence means “what happened next.” It does not mean punishment. | |
| 10.35 | Lesson 2 title | One moment, three parts | |
| 10.36 | Lesson 2 summary | Find the three parts in a short everyday example. | |
| 10.37 | Lesson 2, step 1 title | Let’s look at one everyday moment | |
| 10.38 | Lesson 2, step 1 text | The next screen has a short made-up story. Read it once, then we will sort it into the three parts. | |
| 10.39 | Lesson 2, step 2 title | The kitchen timer | |
| 10.40 | Lesson 2, step 2 story (shown with "Example story, not a real family.") | It is late afternoon. A kitchen timer starts to beep loudly. | |
| 10.41 | Lesson 2, step 2 story (shown with "Example story, not a real family.") | A child who is nearby covers both ears with their hands. | |
| 10.42 | Lesson 2, step 2 story (shown with "Example story, not a real family.") | An adult walks over and turns the timer off. | |
| 10.43 | Lesson 2, step 3 title | The same moment as A, B, C | |
| 10.44 | Lesson 2, step 3 slide box A | The timer beeps: Right before | |
| 10.45 | Lesson 2, step 3 slide box B | The child covers their ears: What could be seen | |
| 10.46 | Lesson 2, step 3 slide box C | An adult turns the timer off: Right after | |
| 10.47 | Lesson 2, step 3 slide description for screen readers | Three boxes in a row. A: the timer beeps, right before. B: the child covers their ears, what could be seen. C: an adult turns the timer off, right after. | |
| 10.48 | Lesson 2, step 3 text under the slide | Let’s look at what happened immediately before the behavior. The timer beeped. That is the antecedent. The child covering their ears is the behavior. The adult turning the timer off is the consequence. | |
| 10.49 | Lesson 2, step 4 title | Check your understanding | |
| 10.50 | Lesson 2, step 4 question (one answer) | In the timer story, which part is the behavior? | |
| 10.51 | Lesson 2, step 4 choice | The timer beeps | |
| 10.52 | Lesson 2, step 4 feedback for that choice | The timer came first, before the child did anything. That makes it the antecedent. Look for what the child did. You can try again. | |
| 10.53 | Lesson 2, step 4 choice ✔ | The child covers their ears | |
| 10.54 | Lesson 2, step 4 feedback for that choice | Yes. It is what the child did, and anyone in the room could have seen it. | |
| 10.55 | Lesson 2, step 4 choice | An adult turns the timer off | |
| 10.56 | Lesson 2, step 4 feedback for that choice | That happened after, so it is the consequence. Look for what the child did. You can try again. | |
| 10.57 | Lesson 2, step 5 title | One more | |
| 10.58 | Lesson 2, step 5 question (choose all that fit) | Which of these describe something you could see or hear? Choose every one that fits. | |
| 10.59 | Lesson 2, step 5 choice ✔ | The child covered their ears | |
| 10.60 | Lesson 2, step 5 feedback for that choice | Right. You could see this happen. | |
| 10.61 | Lesson 2, step 5 choice | The child was scared of the timer | |
| 10.62 | Lesson 2, step 5 feedback for that choice | This is a guess about a feeling. It might be true, but it is not something you can see. You can try again. | |
| 10.63 | Lesson 2, step 5 choice ✔ | The child walked out of the kitchen | |
| 10.64 | Lesson 2, step 5 feedback for that choice | Right. You could see this happen. | |
| 10.65 | Lesson 2, step 5 choice | The child was being difficult | |
| 10.66 | Lesson 2, step 5 feedback for that choice | This is an opinion about the child, not a description of what happened. You can try again. | |
| 10.67 | Lesson 2, step 6 title | What to remember | |
| 10.68 | Lesson 2, step 6 takeaway | Any single moment can be sorted into right before, what you saw, and right after. | |
| 10.69 | Lesson 2, step 6 takeaway | A behavior is something another person could see or hear. | |
| 10.70 | Lesson 2, step 6 takeaway | Feelings and opinions are guesses. Descriptions stick to what happened. | |
| 10.71 | Lesson 3 title | What one moment can’t tell you | |
| 10.72 | Lesson 3 summary | Why a single example describes what happened but not why. | |
| 10.73 | Lesson 3, step 1 title | What happened is not the same as why | |
| 10.74 | Lesson 3, step 1 text | Sorting a moment into A, B and C tells you what happened and in what order. It is tempting to go one step further and decide why it happened. This lesson is about holding back on that. | |
| 10.75 | Lesson 3, step 2 title | One moment is one observation | |
| 10.76 | Lesson 3, step 2 text | In ABA, the reason a behavior happens is called its function. A single moment does not show the function. The same behavior can happen for different reasons on different days. | |
| 10.77 | Lesson 3, step 2 text | In the timer story, we saw a child cover their ears and an adult turn the timer off. We do not know from that one moment why the child covered their ears. | |
| 10.78 | Lesson 3, step 2 text | Working out why takes many observations over time, looked at by a trained clinician. For your child, that is the supervising Board Certified Behavior Analyst (BCBA). | |
| 10.79 | Lesson 3, step 2 text | What you notice is still useful. If you want to, you can share what you saw, in order, with your child’s clinical team. | |
| 10.80 | Lesson 3, step 3 title | Check your understanding | |
| 10.81 | Lesson 3, step 3 question (one answer) | After seeing the timer moment once, what do we know? | |
| 10.82 | Lesson 3, step 3 choice | Why the child covered their ears | |
| 10.83 | Lesson 3, step 3 feedback for that choice | One moment cannot show the reason. Think about what the three parts actually record. You can try again. | |
| 10.84 | Lesson 3, step 3 choice ✔ | What happened, and in what order | |
| 10.85 | Lesson 3, step 3 feedback for that choice | Exactly. ABC gives a clear description of one moment. The why is a separate question for a clinician. | |
| 10.86 | Lesson 3, step 3 choice | What the adult should do next time | |
| 10.87 | Lesson 3, step 3 feedback for that choice | That would be advice for one child, which this lesson cannot give. Your child’s BCBA makes those recommendations. You can try again. | |
| 10.88 | Lesson 3, step 4 title | What to remember | |
| 10.89 | Lesson 3, step 4 takeaway | ABC describes what happened. It does not explain why. | |
| 10.90 | Lesson 3, step 4 takeaway | One moment is one observation. The reason, or function, takes many observations and a trained clinician. | |
| 10.91 | Lesson 3, step 4 takeaway | Your child’s BCBA is the person who makes recommendations for your child. | |
| 10.92 | Completion screen takeaway | ABC stands for antecedent, behavior, consequence: right before, what you saw, right after. | |
| 10.93 | Completion screen takeaway | A behavior is something another person could see or hear. | |
| 10.94 | Completion screen takeaway | One moment describes what happened. It does not tell you why. | |

### 11. Live Trainings list (/learn/trainings)

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 11.1 | Under the page title | Virtual group sessions for currently enrolled families, held in Microsoft Teams. This training is available to currently enrolled families. | |
| 11.2 | Under the page title | You’ll complete registration through Microsoft Teams. All times are Central Time (CT). | |
| 11.3 | Section headings | Upcoming / Finished | |
| 11.4 | Date block with no date | Example / Date to come | |
| 11.5 | Card, no date | No date. This is an example listing. | |
| 11.6 | Card, no date, real listing | Date and time to be announced. | |
| 11.7 | Card | Presented by [presenter] | |
| 11.8 | Status chips | Example listing / Cancelled / Completed / Registration closed | |
| 11.9 | Under an active registration button | You will continue to Microsoft Teams to register. It opens in a new tab. | |
| 11.10 | Reason, cancelled | This training was cancelled, so registration is not available. | |
| 11.11 | Reason, finished | This training has finished. | |
| 11.12 | Reason, closed | Registration for this training has closed. | |
| 11.13 | Reason, example listing | This is an example listing, so there is nothing to register for. | |
| 11.14 | Reason, no link yet | A registration link has not been added yet. Please check back. | |

### 12. Training detail page, and the example training

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 12.1 | Example training title | Understanding the ABCs of Behavior: live caregiver training | |
| 12.2 | Example training summary | An example listing. It shows how a virtual group training will look here once one is scheduled. | |
| 12.3 | Example training, "About this training" | This is an example, not a scheduled event. When a real training is scheduled, its date, time and registration link will appear on this page. | |
| 12.4 | Example training, "About this training" | Live trainings are virtual group sessions held in Microsoft Teams. They cover general topics for caregivers and go alongside the self-paced modules. | |
| 12.5 | Example training, "What it covers" | Hear the ABC model explained and ask general questions. | |
| 12.6 | Example training, "What it covers" | Practice sorting everyday examples into the three parts. | |
| 12.7 | Label above the title | Live training | |
| 12.8 | Under the title | About 60 minutes | |
| 12.9 | Cancelled notice | This training was cancelled. It will not take place. If you had registered, you do not need to do anything. | |
| 12.10 | Section headings | About this training / What it covers / What to expect / Registration / Learn at your own pace | |
| 12.11 | "Who can attend" | This training is available to currently enrolled families. Clinic staff confirm enrollment after you ask to register. You do not need to share anything about your child on this website. | |
| 12.12 | "How a group session works" | It is a group, so the presenter teaches general ideas and answers general questions. For questions about your own child, talk with your child’s supervising BCBA. | |
| 12.13 | "Joining" | After your registration is approved, Microsoft Teams sends your joining details by email. This website never shows a joining link. | |
| 12.14 | "Accessibility" | Microsoft Teams has live captions you can turn on during the session. If you need something else to take part, tell your clinical team before the training. | |
| 12.15 | Link | Help with registration and email | |
| 12.16 | Small print | Listing last updated [date]. | |

### 13. Help & FAQ (/learn/help)

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 13.1 | Under the page title | Short answers about the lessons, live trainings and who to ask. | |
| 13.2 | Group heading | Using the lessons | |
| 13.3 | Question | Do I need an account? | |
| 13.4 | Answer | No. The learning modules are open to read. There is no sign-in for caregivers and nothing to install. | |
| 13.5 | Question | How do the lessons work? | |
| 13.6 | Answer | Each module has a few short lessons. A lesson shows one small step at a time. Use Next to go forward and Back to go back. Nothing is timed. | |
| 13.7 | Question | Are the questions a test? | |
| 13.8 | Answer | No. The short questions help the ideas stick. There is no score, you can try as many times as you like, and you can always move on. | |
| 13.9 | Question | Where is my progress saved? | |
| 13.10 | Answer | Your progress is saved on this device, in this browser only. There is no account behind it. If you clear your browser data, or use a different phone or computer, it starts over. You can also clear it yourself with “Reset progress” on any module page. | |
| 13.11 | Question | Can these lessons tell me what to do for my child? | |
| 13.12 | Group heading | Live trainings in Microsoft Teams | |
| 13.13 | Question | Who can attend a live training? | |
| 13.14 | Answer | Live trainings are for currently enrolled families. Clinic staff confirm enrollment after you ask to register. | |
| 13.15 | Question | How do I register? | |
| 13.16 | Answer | Open a training on the Live Trainings page and choose “Register through Microsoft Teams.” You will continue to Microsoft Teams to register. This website does not have its own registration form. | |
| 13.17 | Question | What do I need to join? | |
| 13.18 | Answer | A phone, tablet or computer with a speaker or headphones. You can join in a web browser or in the free Microsoft Teams app. Joining a few minutes early gives you time to check your sound. | |
| 13.19 | Question | Why is there no joining link on this website? | |
| 13.20 | Answer | Joining details come only from Microsoft Teams, by email, after your registration is approved. That keeps group sessions limited to the families they are meant for. | |
| 13.21 | Group heading | Your registration email | |
| 13.22 | Question | Where does the email come from? | |
| 13.23 | Answer | It is sent by Microsoft Teams to the email address you typed when you registered. It may arrive after staff have approved your registration, not straight away. | |
| 13.24 | Question | I can’t find it. What should I do? | |
| 13.25 | Answer | Look in your junk or spam folder, and check that you are looking in the same email account you registered with. If it is still missing, ask your clinical team, who can check with the training organizer. | |
| 13.26 | Section heading | Talking with your clinical team | |
| 13.27 | Contact text | For anything about your own child, the best person to ask is your child’s supervising BCBA, at your next session or the way you usually reach them. | |
| 13.28 | Contact text (see open question 1) | You can also call Texas ABA Centers on (877) 771-5725. Every day, 8:00 AM to 10:00 PM. | |
| 13.29 | Contact text | Please do not send details about your child through this website. It has no way to receive them. | |
| 13.30 | Bottom of page | Texas ABA Centers staff: Staff sign-in | |

### 14. Privacy for the Learning Center (/learn/privacy)

A draft note, not an official privacy notice. IT and whoever owns privacy should confirm each statement is true of the final setup.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 14.1 | Under the page title | A plain description of what the Caregiver Learning Center does and does not keep. | |
| 14.2 | Draft notice | Draft. This note is waiting for review by the organization and is not an official privacy notice. | |
| 14.3 | Heading | What we do not ask for | |
| 14.4 | Text | You do not need an account to read lessons or look at trainings. The Learning Center does not ask for your name, your child’s name, a diagnosis, or anything else about your family. | |
| 14.5 | Heading | Lesson progress stays on your device | |
| 14.6 | Text | When you move through a lesson, your place is saved in this browser so you can come back to it. It records which step of which module you reached and the last answer you chose. It is not sent to us, and it is not linked to a name. Clearing your browser data removes it, and so does “Reset progress” on any module page. | |
| 14.7 | Heading | Page visits | |
| 14.8 | Text | The Texas ABA Centers website counts page visits without identifying visitors, and that includes pages in the Learning Center. The Learning Center does not record which lessons a person starts, the answers they choose, or whether they open a registration link. | |
| 14.9 | Heading | Registering for a live training | |
| 14.10 | Text | Registration happens in Microsoft Teams, not on this website. What you type there goes to Microsoft Teams and to the staff who run the training. This website does not receive it and does not keep lists of who registered or attended. | |
| 14.11 | Heading | The rest of the website | |
| 14.12 | Text | This note covers the Learning Center only. For everything else, see the Texas ABA Centers privacy policy. | |

### 15. Accessibility (/learn/accessibility)

A draft statement. It describes the aim and what is built, and does not claim a certified result.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 15.1 | Under the page title | How the Caregiver Learning Center is built to be usable by as many people as possible. | |
| 15.2 | Draft notice | Draft. This statement is waiting for review by the organization. It describes what we are aiming for, not a certified result. | |
| 15.3 | Heading | What we are aiming for | |
| 15.4 | Text | We are building the Learning Center to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It has not yet had an independent review, and it has not yet been tested with a range of screen readers on real devices. | |
| 15.5 | Heading | What is built in | |
| 15.6 | List | Every lesson works with a keyboard alone, and shows clearly where you are on the page. | |
| 15.7 | List | Lesson slides are real text, with a description, not pictures of text. | |
| 15.8 | List | Nothing is timed, nothing plays by itself, and no lesson needs you to drag or swipe. | |
| 15.9 | List | Feedback on questions is given in words and is read out by screen readers. | |
| 15.10 | List | Pages work on a small phone and when text is enlarged. | |
| 15.11 | List | Movement on the page is switched off when your device asks for reduced motion. | |
| 15.12 | Heading | Live trainings | |
| 15.13 | Text | Live trainings are held in Microsoft Teams, which has its own accessibility features, including live captions. If you need something else to take part, tell your clinical team before the training. | |
| 15.14 | Heading | If something does not work for you | |
| 15.15 | Text | Please tell your clinical team, or use the contact details on the Help page. Say which page you were on and what happened, and we will look into it. | |

### 16. Page not found, and staff sign-in when it is switched off

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 16.1 | Not found, title | That page isn’t available | |
| 16.2 | Not found, text | It may have moved, or it may not be published. You can still explore our learning modules. | |
| 16.3 | Not found, button | Go to the Learning Library | |
| 16.4 | Staff sign-in off, text | The staff workspace needs the organization’s approved sign-in before it can open. Nothing is available here yet. | |
| 16.5 | Staff sign-in off, button | Back to the Learning Center | |

## Staff workspace

The staff workspace is a demo that runs only on a local computer. Its people are fictional and its files are synthetic. The wording still matters, because it is what real staff would read later. The contributor checklist in section 19 is the most important part for the Clinical Director and for privacy.

### 17. Demo banner, sign-in and menu

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 17.1 | Amber banner (wide screens) | Illustrative demo data. Fictional staff and synthetic files, kept only on this computer. This is not real sign-in and nothing here is clinically approved. | |
| 17.2 | Amber banner (phones) | Illustrative demo data. Fictional staff, not real sign-in. | |
| 17.3 | Sign-in title | Staff workspace demo | |
| 17.4 | Sign-in text | Choose a fictional role to look around. There is no password because this is not real sign-in. It only works on this computer. | |
| 17.5 | Role buttons (updated) | Continue as Sample RBT / Sample Apprentice / Sample BCBA / Sample Clinical Director / Sample Producer | |
| 17.6 | Role description, RBT and Apprentice | Submits PowerPoints and sees only their own. | |
| 17.7 | Role description, BCBA (updated) | Reviews source PowerPoints and final modules. Cannot publish. | |
| 17.8 | Role description, Clinical Director (updated) | Reviews source PowerPoints and final modules, and publishes or withdraws modules. | |
| 17.9 | Button | Reset demo data | |
| 17.10 | Under that button | Puts the sample submissions back and removes every file uploaded during the demo. | |
| 17.11 | Menu (updated) | Overview / My submissions / All submissions / Reviews / Modules | |
| 17.12 | Menu footer | Demo role, not a real account | |
| 17.13 | Menu footer buttons | Switch demo role / Back to site | |
| 17.14 | Not found, title | That page was not found | |
| 17.15 | Not found, text | It may not exist, or it may not be part of your role. | |
| 17.16 | Role description, Producer (added) | Collects approved sources and imports the finished module. Cannot approve or publish. | |

### 18. Staff overview and submission lists

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 18.1 | Overview title | Welcome | |
| 18.2 | Overview text | You are looking around as [role], a fictional demo role. | |
| 18.3 | Count tile | Drafts you are working on | |
| 18.4 | Count tile | Your submissions awaiting review | |
| 18.5 | Count tile | Your submissions with changes requested | |
| 18.6 | Count tile | Your approved sources | |
| 18.7 | Section heading | Waiting on you | |
| 18.8 | Waiting on you, item | [Reviewer] asked for changes on [date]. | |
| 18.9 | Waiting on you, nothing | Nothing needs your attention right now. | |
| 18.10 | Button | Read the feedback | |
| 18.11 | Reviewer roles only (updated) | Your role can read every submission, [n] in total. | |
| 18.12 | Section heading | How a presentation becomes a module | |
| 18.13 | Step 1 | You submit a PowerPoint. It must contain no client information of any kind. | |
| 18.14 | Step 2 | A clinician reviews the PowerPoint. They approve it as a source, ask for changes, or decline it. | |
| 18.15 | Step 3 | The approved source is turned into an interactive module. This happens outside this website. | |
| 18.16 | Step 4 | A clinician reviews the finished module. This is a second, separate approval. Approving the PowerPoint does not approve the module. | |
| 18.17 | Step 5 | The approved module is published to the Learning Library. | |
| 18.18 | My submissions, under the title | Every PowerPoint you have started or submitted, and exactly where each one stands. | |
| 18.19 | All submissions, under the title (updated) | Every PowerPoint staff have started or submitted. To review one, use Reviews in the menu. | |
| 18.20 | Status filter tabs | All / Draft / Awaiting review / Changes requested / Approved source / In production / Final review / Published / Archived | |
| 18.21 | Table headings (updated) | Presentation / Submitted by / Updated / Reviewer / Status | |
| 18.22 | Table cells | Topic not chosen yet / Not assigned yet / Version 1 (not submitted) | |
| 18.23 | Empty filter | Choose another status above to see the rest. | |
| 18.24 | After deleting a draft | The draft was deleted. | |
| 18.25 | Overview, reviewers (added) | Items needing review | |
| 18.26 | Overview, reviewers (added) | Gate 1 · source PowerPoints you can review | |
| 18.27 | Overview, reviewers (added) | Gate 2 · final modules you can review | |
| 18.28 | Overview, production roles (added) | [n] approved sources ready for production, [n] in production, [n] ready to publish, [n] published. | |

### 19. Submission wizard, including the contributor checklist

The five checklist lines are what a contributor confirms before sending a PowerPoint for review. **Please read these closely.** A checkbox is not a safeguard on its own. Staff training and a real file check are still needed before real use.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 19.1 | Under the page title, new | Six short steps. You can save a draft at any point and come back to it. | |
| 19.2 | Under the page title, editing | Save a draft at any point. Nothing is sent for review until you submit on the last step. | |
| 19.3 | Step names | Title and summary / Topic and tags / Objectives and audience / PowerPoint file / Checklist / Review and submit | |
| 19.4 | Title hint | What a caregiver would see. For example: “Getting ready for transitions.” | |
| 19.5 | Summary hint | Two or three sentences about what the presentation teaches. General education only. Nothing about a real child or family. | |
| 19.6 | Objectives hint | What will a caregiver be able to do afterwards? Start with a plain verb, like “Describe” or “Recognize.” Up to five. | |
| 19.7 | Tag choices | Getting started / At home / Out in the community / Working with your clinical team / For new families | |
| 19.8 | Audience choices | All caregivers / Caregivers new to ABA / Caregivers of young children / Caregivers of teens | |
| 19.9 | File step warning | Do not upload anything that contains client information. Check hidden slides, speaker notes, comments, screenshots and the file’s properties, not only the slides. Demo mode: use a made-up or blank presentation. Files stay on this computer. | |
| 19.10 | After a file is uploaded | Checked: it is a PowerPoint file. Not scanned for malware in the demo. | |
| 19.11 | Revision question | What did you change in this version? | |
| 19.12 | Checklist step warning | Ticking these boxes does not check the file for you. Please open the presentation and look before you confirm. | |
| 19.13 | Checklist heading | I confirm that | |
| 19.14 | Checklist item 1 | No client identifiers. No names, initials, photos, dates of birth, schools or anything else that could point to a child or family. | |
| 19.15 | Checklist item 2 | No case notes. Nothing copied from session notes, behavior plans, assessments or reports. | |
| 19.16 | Checklist item 3 | No confidential clinical materials. I checked hidden slides, speaker notes, comments and the file’s properties as well as the slides. | |
| 19.17 | Checklist item 4 | The learning objectives are written in plain language a caregiver would understand. | |
| 19.18 | Checklist item 5 | I am a current staff member who is allowed to contribute, and this is general education, not advice for one child. | |
| 19.19 | Review step, something missing | Still needed before you can submit | |
| 19.20 | Review step, all in place | Everything is in place. When you submit, this version is locked and sent for clinical review. You will not be able to change it, only start a new version if a reviewer asks for changes. | |
| 19.21 | Under a disabled Submit button | The submit button turns on once the items listed above are done. | |
| 19.22 | Buttons | Back / Save draft / Save and continue / Submit for clinical review | |
| 19.23 | Status line (updated) | Draft saved at [time]. / Draft saved automatically at [time]. / Saving your changes automatically… / You have changes that are not saved yet. | |
| 19.24 | Revision banner | Version 2: responding to feedback from [reviewer] | |
| 19.25 | Revision banner | The version that was reviewed is kept exactly as it was. This is a new version. | |
| 19.26 | After coming back to a draft with unsaved typing (added) | We put back the changes you had not saved yet. | |
| 19.27 | If the draft was changed in another tab (added) | This draft was changed in another tab, so this tab now shows the saved version. | |

### 20. Messages when something is missing or a file is refused

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 20.1 | No title | Give the presentation a title before saving. | |
| 20.2 | Title too short | Give the presentation a title of at least 5 characters. | |
| 20.3 | Summary too short | Write a short summary of at least 20 characters. | |
| 20.4 | No topic | Choose one of the six topics. | |
| 20.5 | No objective | Add at least one learning objective. | |
| 20.6 | Objective too short | Each objective needs at least 10 characters. | |
| 20.7 | No audience | Say who this is for. | |
| 20.8 | No file | Upload your PowerPoint (.pptx) file. | |
| 20.9 | Checklist incomplete | Confirm every item on the checklist. | |
| 20.10 | Revision note missing | Say briefly what you changed in this version (at least 10 characters). | |
| 20.11 | Saved from an old tab | This submission changed since you opened it. Reload the page to see the latest version, then try again. | |
| 20.12 | Already submitted | This version has been submitted and can no longer be changed. | |
| 20.13 | Delete refused | Only a draft that has never been submitted can be deleted. Reviewed versions are kept. | |
| 20.14 | Upload interrupted | The upload did not finish. Check your connection and try again. | |
| 20.15 | Old .ppt file | This is an older .ppt file. Open it in PowerPoint, choose Save As, pick “PowerPoint Presentation (.pptx)”, then upload that file. | |
| 20.16 | Not a .pptx name | Please choose a PowerPoint file that ends in .pptx. | |
| 20.17 | File too large | That file is larger than 40 MB. Try compressing its pictures in PowerPoint, then upload it again. | |
| 20.18 | Empty file | That file is empty. Please choose the presentation again. | |
| 20.19 | Not really a PowerPoint | This file is not a PowerPoint presentation, even though its name ends in .pptx. | |
| 20.20 | Damaged file | This file could not be read as a PowerPoint presentation. It may be damaged. Open it in PowerPoint, save it again, and upload the new copy. | |

### 21. Status names and the "What happens next" line for each

The status names follow the design guide. The sentence beside each one is draft wording.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 21.1 | Draft | Finish the steps and submit it for clinical review when you are ready. | |
| 21.2 | Awaiting review | A BCBA or the Clinical Director will review this version. You do not need to do anything. | |
| 21.3 | In review | A reviewer is looking at this version now. | |
| 21.4 | Changes requested | Read the reviewer’s feedback, then start a new version with your changes. | |
| 21.5 | Declined | The reviewer explained why below. Talk with them before starting something new on this topic. | |
| 21.6 | Source approved | This PowerPoint is approved as a source. It still has to be turned into a module and approved a second time before families see it. | |
| 21.7 | Awaiting production | The approved source is waiting to be turned into an interactive module. | |
| 21.8 | In production | The interactive module is being built from the approved source. | |
| 21.9 | Final review | A clinician is reviewing the finished module itself. This is a separate approval from the first one. | |
| 21.10 | Final approved | The finished module is approved and waiting to be published. | |
| 21.11 | Published | Families can now see the module made from this presentation. | |
| 21.12 | Withdrawn | The module made from this presentation has been taken down. | |
| 21.13 | Archived | This submission is closed and kept for the record. | |
| 21.14 | History entries | Draft started / File uploaded / File replaced / File removed / Submitted for clinical review / New version started / Draft deleted / Reviewer requested changes / Source approved / Declined / Source review started / Collected for production / Module imported / Module sent for final review / Final module approved / Changes requested on the module / Module rejected / Module published / Module withdrawn | |

### 22. Submission page, and the seeded sample submissions

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 22.1 | After submitting | Submitted for clinical review. This version is now locked. | |
| 22.2 | Section headings | What happens next / Reviewer feedback / Versions / Details / History | |
| 22.3 | Buttons | Continue this draft / Continue the new version / Start a new version / Delete this draft / Download | |
| 22.4 | Delete confirmation | Delete this draft and its uploaded file? This cannot be undone. | |
| 22.5 | Version labels | Locked / Not submitted yet | |
| 22.6 | Version text | Submitted [date]. It cannot be changed. / You can still edit this version. | |
| 22.7 | File notes | Synthetic demo file, not a real presentation · Not scanned for malware in the demo | |
| 22.8 | History footer | This record is read-only. | |
| 22.9 | Sample submission title (fictional) | Visual schedules for mornings | |
| 22.10 | Sample submission title (fictional) | Understanding the ABCs of Behavior | |
| 22.11 | Sample submission summary (fictional) | An introduction to describing one moment as antecedent, behavior and consequence, with a made-up everyday example. | |
| 22.12 | Sample submission objective (fictional) | Say what antecedent, behavior and consequence mean in plain words. | |
| 22.13 | Sample submission objective (fictional) | Pick out the three parts in a short everyday example. | |
| 22.14 | Sample submission title (fictional) | Getting ready for transitions | |
| 22.15 | Sample submission summary (fictional) | General ideas about why moving from one activity to the next can be hard, and words caregivers can use with their clinical team. | |
| 22.16 | Sample submission objective (fictional) | Describe what a transition is. | |
| 22.17 | Sample submission objective (fictional) | List questions to bring to your clinical team about transitions. | |
| 22.18 | Sample submission title (fictional) | How group trainings work | |
| 22.19 | Sample submission summary (fictional) | What a live caregiver group training is, who it is for, and what to expect when joining in Microsoft Teams. | |
| 22.20 | Sample submission objective (fictional) | Explain what happens in a group training. | |
| 22.21 | Sample submission objective (fictional) | Know where registration and joining details come from. | |
| 22.22 | Sample submission title (fictional) | Questions to bring to your BCBA | |
| 22.23 | Sample submission summary (fictional) | A short list of general questions caregivers can ask at their next meeting, grouped by topic. | |
| 22.24 | Sample submission objective (fictional) | Prepare three questions for your next meeting with your clinical team. | |
| 22.25 | Sample reviewer feedback (fictional) | Good start. Two changes please.<br>1. Slide 4 reads as advice for one child. Reword it as a general example and add a line pointing families to their own BCBA.<br>2. Explain the word “antecedent” the first time it appears. | |
| 22.26 | Sample reviewer feedback (fictional) | Approved as a source. Clear and general. This approval covers the PowerPoint only. The finished module needs its own review. | |

## Clinical review, production and publishing

Added in the third build phase. These screens are what a BCBA, the Clinical Director and a content producer would use. They run only in the local demo, with fictional staff.

### 24. For the Clinical Director: three rules about who may approve what

These rules are built in and switched on. The project brief says not to hard-code a clinic policy that has not been formally agreed, so they are kept in one place (`src/lib/learn/staff/pipeline.ts`, `LC_REVIEW_POLICY`) and each can be switched off without touching anything else. Please confirm each one, or say what the rule should be. **All three stay switched on until you answer.**

| Rule | What it means | Keep it? |
|---|---|---|
| A reviewer cannot review their own work | Someone who submitted a PowerPoint cannot approve it, and cannot give the final approval of the module made from it. | [ ] Yes  [ ] No |
| The two approvals come from two people | Whoever approved the PowerPoint cannot also give the final approval of the module. | [ ] Yes  [ ] No |
| The person who imported the module cannot approve it | Building a module and approving it are separate jobs. | [ ] Yes  [ ] No |

Not a switch, and always enforced: RBTs and apprentices can never approve or publish anything, a producer cannot approve or publish, a BCBA reviewer can approve but not publish, and only the Clinical Director role can publish or withdraw.

What a person sees when one of these rules stops them:
- Own submission, source review: "You submitted this presentation, so someone else has to review it."
- Own submission, final review: "You submitted the presentation this module was made from, so someone else has to review it."
- Imported the module: "You imported this module, so someone else has to give its final approval."
- Approved the source: "You approved the source PowerPoint. The final module needs a second reviewer, so the two approvals come from two people."
- Role without review rights: "Your role does not include reviewing source PowerPoints." / "Your role does not include reviewing final modules."

### 25. Review queue, and Gate 1: reviewing the source PowerPoint

The seven checklist lines are what a reviewer confirms before approving a PowerPoint as a source. **Please read these closely.**

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 25.1 | Queue title | Items needing review | |
| 25.2 | Queue, under the title | Two separate approvals. Approving a PowerPoint does not approve the module made from it. | |
| 25.3 | Queue tabs | Gate 1 · PPTX sources / Gate 2 · Final modules | |
| 25.4 | Gate 1 explanation | Is this PowerPoint accurate, general and free of client information? Approving it lets a producer start building the module. | |
| 25.5 | After a decision | Approval recorded. / Your request for changes was sent. / Your decision was recorded. | |
| 25.6 | Review page, under the gate label | You are reviewing the PowerPoint only. The module made from it gets its own review later, by a second person. | |
| 25.7 | Review page | There is no slide preview in the demo. Download the file and open it in PowerPoint, including hidden slides, notes and comments. | |
| 25.8 | Section headings | The file to review: version [n] / Your decision / Earlier source reviews / What was submitted | |
| 25.9 | Button | Start review | |
| 25.10 | Checklist heading | Review checklist | |
| 25.11 | Checklist hint | Every item must be ticked to approve. To request changes or decline, write a note instead. | |
| 25.12 | Source checklist item 1 | The content is accurate. | |
| 25.13 | Source checklist item 2 | It stays within general education. It gives no advice for an individual child and no treatment protocol. | |
| 25.14 | Source checklist item 3 | A caregiver could understand the language. Terms are explained the first time they appear. | |
| 25.15 | Source checklist item 4 | There is no client information anywhere in the file, including hidden slides, notes, comments and file properties. | |
| 25.16 | Source checklist item 5 | Examples are appropriate, clearly made up, and could not be mistaken for a real family. | |
| 25.17 | Source checklist item 6 | The materials can be made accessible: pictures can be described and no slide depends on colour alone. | |
| 25.18 | Source checklist item 7 | It fits the educational purpose of the Learning Center. | |
| 25.19 | Notes hint | Needed when you request changes or decline. Optional when you approve. Do not write anything about a real child or family. | |
| 25.20 | Buttons | Approve source / Request changes / Decline | |
| 25.21 | Approve confirmation | Approve version [n] of “[title]” as a source? This is recorded with your name and the time, and cannot be undone. | |
| 25.22 | Under a disabled Approve button | The approve button turns on once every checklist item is ticked. | |
| 25.23 | Refusal, checklist incomplete | Tick every item on the checklist before approving. | |
| 25.24 | Refusal, no note | Write a note for the contributor explaining what is needed (at least 10 characters). | |
| 25.25 | Refusal, a different version is waiting | A different version is waiting for review. Reload the page and review that one. | |
| 25.26 | Refusal, not waiting | This submission is not waiting for a source review. | |
| 25.27 | Refusal, role | Your role does not allow that. | |

### 26. Gate 2: reviewing the finished module

The seven checklist lines are what a reviewer confirms before giving the final approval of a module. **Please read these closely.**

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 26.1 | Gate 2 explanation, queue | Is the finished module, exactly as a caregiver will see it, accurate and safe to publish? This is its own approval, by a second person. | |
| 26.2 | Review page, under the gate label | You are reviewing the finished module itself, exactly as a caregiver will see it. The earlier approval of the PowerPoint does not cover it. | |
| 26.3 | Button | Preview in the lesson player | |
| 26.4 | Section heading | What is new compared with the PowerPoint | |
| 26.5 | Under the producer’s notes | This is what the producer declared. New explanations, examples and questions were not part of the first approval, so check them closely. | |
| 26.6 | Section headings | What is in this module / Your decision / Earlier final reviews / Where it came from | |
| 26.7 | "Where it came from" labels | Source presentation / Gate 1 approval / Written by / Imported by / How it was made / Module version / Content fingerprint / Package check | |
| 26.8 | Final checklist item 1 | Every explanation in the module is accurate and matches the approved source. | |
| 26.9 | Final checklist item 2 | Every example and scenario is appropriate and clearly made up, including any that are new. | |
| 26.10 | Final checklist item 3 | Every knowledge-check question is clear, and the answers marked as correct are correct. | |
| 26.11 | Final checklist item 4 | The feedback for every answer choice is accurate, kind and does not blame. | |
| 26.12 | Final checklist item 5 | Every slide reads correctly as text and has a description for people who cannot see it. | |
| 26.13 | Final checklist item 6 | The education-only statement appears, and nothing reads as advice for an individual child. | |
| 26.14 | Final checklist item 7 | I went through the whole module in the caregiver lesson player, not only this page. | |
| 26.15 | Buttons | Approve final module / Request changes / Reject | |
| 26.16 | Refusal, no note | Write a note for the producer explaining what is needed (at least 10 characters). | |
| 26.17 | Refusal, not waiting | This module is not waiting for a final review. | |

### 27. Production: collecting an approved source and importing the module

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 27.1 | Board title | From approved source to published module | |
| 27.2 | Board, under the title | Only a source with a clinical approval appears here. A module is published only after its own, second approval. | |
| 27.3 | Board groups | Approved sources, ready for production / In production / In final review / Final approved, ready to publish / Published / Withdrawn | |
| 27.4 | Button | Collect for production | |
| 27.5 | Waiting text | Waiting for a producer to collect this for production. | |
| 27.6 | Import warning | The module is made outside this website, from the approved PowerPoint only. This website does not send anything to an AI service and has no “generate” button. Use only approved material with no client information. | |
| 27.7 | Import field hint | Paste the module package made from the approved PowerPoint. It is checked before anything is saved. | |
| 27.8 | Button | Fill in the synthetic sample package | |
| 27.9 | Field labels | Module package / Date the module was made / How was it made? / What is new compared with the PowerPoint? | |
| 27.10 | "How was it made?" choice | Made outside this website with an AI assistant, from the approved PowerPoint | |
| 27.11 | "How was it made?" choice | Written by hand from the approved PowerPoint | |
| 27.12 | "What is new" hint | List any explanations, examples or questions that were not in the source, so the reviewer knows where to look hardest. If nothing is new, say so. | |
| 27.13 | Button | Check and import | |
| 27.14 | After a clean import | Imported as a draft. No problems were found in the package. | |
| 27.15 | Button | Send for final review | |
| 27.16 | Under that button | After this the module version is locked. A change means importing a new version, which needs its own review. | |
| 27.17 | Gate 2 panel on the workspace | Each module version needs its own final approval, from someone other than the person who approved the source. | |
| 27.18 | Refusal, package problems | The module package has problems that need fixing before it can be imported. | |
| 27.19 | Package problem | This is not valid JSON. Paste the whole module package, starting with { and ending with }. | |
| 27.20 | Package problem | review: a module package cannot declare itself approved. Approval is recorded here by a reviewer, not written into the package. | |
| 27.21 | Package problem | slug: another module already uses the address “[address]”. | |
| 27.22 | Refusal, nothing new described | Describe what is new compared with the PowerPoint, or write that nothing is new (at least 10 characters). | |
| 27.23 | Refusal, wrong moment | A module can be imported only while the submission is in production. | |
| 27.24 | Refusal, not approved | Only a clinically approved source can be collected for production. | |
| 27.25 | Module version states | Module draft / Final review / Changes requested / Rejected / Final approved / Published / Withdrawn | |

### 28. Publishing and withdrawing

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 28.1 | Publish confirmation | Publish “[title]” to the Learning Library? Families will be able to open it straight away. | |
| 28.2 | Buttons | Publish / Yes, publish / Not yet / Withdraw / Yes, withdraw / Keep it published | |
| 28.3 | Waiting text | Waiting for someone with permission to publish. | |
| 28.4 | Withdraw confirmation | Withdraw “[title]”? It disappears from the Learning Library at once and its address stops working. | |
| 28.5 | Withdraw field | Why is it being withdrawn? | |
| 28.6 | Refusal, no reason | Say briefly why this module is being withdrawn (at least 10 characters). | |
| 28.7 | Refusal to publish, opening words | This module cannot be published. | |
| 28.8 | Refusal to publish, reason | The source PowerPoint this module was made from has no recorded clinical approval. | |
| 28.9 | Refusal to publish, reason | This exact module version has no recorded final clinical approval. | |
| 28.10 | Refusal to publish, reason | This module is not in the “Final approved” state. | |
| 28.11 | Refusal to publish, reason | Another published module already uses this address. | |
| 28.12 | Refusal to withdraw | Only a published module can be withdrawn. | |
| 28.13 | Approval lines on the workspace | Version [n] of “[title]” approved as a source by [reviewer] on [date]. / Final approval by [reviewer] on [date]. / Published by [name] on [date]. / Withdrawn by [name] on [date]. Reason: [reason] | |
| 28.14 | Link | Open it in the Learning Library | |

### 29. Second sample module: “How group trainings work”

A synthetic module used to demonstrate importing, final review, publishing and withdrawing. It appears in the Learning Library only after it has been taken through the demo workflow on a local machine. It was written for the demo and **has not been clinically reviewed**. Lines marked ✔ are the answers the module treats as correct.

| No. | Where | Draft wording | OK, or change to |
|---|---|---|---|
| 29.1 | Title | How group trainings work | |
| 29.2 | Summary | What a live caregiver group training is, who it is for, and how registering and joining work. | |
| 29.3 | Time shown | About 6 minutes | |
| 29.4 | Objective 1 | Explain what happens in a group training. | |
| 29.5 | Objective 2 | Know where registration and joining details come from. | |
| 29.6 | Lesson 1 title | What a group training is | |
| 29.7 | Lesson 1 summary | A live online session on a general topic, for enrolled families. | |
| 29.8 | Lesson 1, step 1 title | Learning together, live | |
| 29.9 | Lesson 1, step 1 text | A group training is a live session held online. A member of the clinical team teaches a general topic to several caregivers at once. | |
| 29.10 | Lesson 1, step 1 text | It goes alongside the lessons you can do on your own here. You can do either, or both. | |
| 29.11 | Lesson 1, step 1 "Why it matters" | Knowing what to expect makes it easier to decide whether a session is right for you. | |
| 29.12 | Lesson 1, step 2 title | Three things to know | |
| 29.13 | Lesson 1, step 2 slide box | It is live and online: Sessions are held in Microsoft Teams. | |
| 29.14 | Lesson 1, step 2 slide box | It is for enrolled families: Clinic staff confirm enrollment after you ask to register. | |
| 29.15 | Lesson 1, step 2 slide box | It covers general topics: It is not a meeting about your own child. | |
| 29.16 | Lesson 1, step 2 slide description for screen readers | A list of three points. It is live and online, held in Microsoft Teams. It is for enrolled families, and clinic staff confirm enrollment after you ask to register. It covers general topics and is not a meeting about your own child. | |
| 29.17 | Lesson 1, step 2 text under the slide | Because it is a group, the presenter teaches general ideas and answers general questions. | |
| 29.18 | Lesson 1, step 3 title | Check your understanding | |
| 29.19 | Lesson 1, step 3 question | What is a group training for? | |
| 29.20 | Lesson 1, step 3 choice ✔ | Learning about a general topic with other caregivers | |
| 29.21 | Lesson 1, step 3 feedback for that choice | Yes. A group session teaches general ideas to several caregivers at once. | |
| 29.22 | Lesson 1, step 3 choice | Going over my own child’s plan | |
| 29.23 | Lesson 1, step 3 feedback for that choice | That conversation belongs with your child’s own clinical team, not in a group. Think about who else is in the session. You can try again. | |
| 29.24 | Lesson 1, step 3 choice | Replacing meetings with my clinical team | |
| 29.25 | Lesson 1, step 3 feedback for that choice | Group trainings go alongside your usual meetings. They do not replace them. You can try again. | |
| 29.26 | Lesson 1, step 4 title | What to remember | |
| 29.27 | Lesson 1, step 4 takeaway | A group training is a live online session on a general topic. | |
| 29.28 | Lesson 1, step 4 takeaway | It is for currently enrolled families. | |
| 29.29 | Lesson 1, step 4 takeaway | Questions about your own child go to your clinical team. | |
| 29.30 | Lesson 2 title | Registering and joining | |
| 29.31 | Lesson 2 summary | The steps from finding a training to getting your joining details. | |
| 29.32 | Lesson 2, step 1 title | From finding a training to joining it | |
| 29.33 | Lesson 2, step 1 text | Registering happens in Microsoft Teams, not on this website. This lesson walks through the steps in order. | |
| 29.34 | Lesson 2, step 2 title | The steps, in order | |
| 29.35 | Lesson 2, step 2 slide box 1 | Find a training: On the Live Trainings page | |
| 29.36 | Lesson 2, step 2 slide box 2 | Register: In Microsoft Teams | |
| 29.37 | Lesson 2, step 2 slide box 3 | Staff confirm: That you are enrolled | |
| 29.38 | Lesson 2, step 2 slide box 4 | Check your email: For joining details | |
| 29.39 | Lesson 2, step 2 slide description for screen readers | Four boxes in a row, in order. One: find a training on the Live Trainings page. Two: register in Microsoft Teams. Three: staff confirm that you are enrolled. Four: check your email for joining details. | |
| 29.40 | Lesson 2, step 2 text under the slide | Your joining details arrive by email from Microsoft Teams after your registration is approved. This website never shows a joining link. | |
| 29.41 | Lesson 2, step 3 title | Check your understanding | |
| 29.42 | Lesson 2, step 3 question | Where do your joining details come from? | |
| 29.43 | Lesson 2, step 3 choice ✔ | An email from Microsoft Teams, after your registration is approved | |
| 29.44 | Lesson 2, step 3 feedback for that choice | That’s right. Look for it in the email account you registered with. | |
| 29.45 | Lesson 2, step 3 choice | A link on this website | |
| 29.46 | Lesson 2, step 3 feedback for that choice | This website lists trainings but never shows a joining link. Think about where you registered. You can try again. | |
| 29.47 | Lesson 2, step 3 choice | Anyone can forward me the link | |
| 29.48 | Lesson 2, step 3 feedback for that choice | Sessions are for registered, enrolled families, so each family registers for itself. You can try again. | |
| 29.49 | Lesson 2, step 4 title | What to remember | |
| 29.50 | Lesson 2, step 4 takeaway | You register in Microsoft Teams. | |
| 29.51 | Lesson 2, step 4 takeaway | Staff confirm enrollment before approving a registration. | |
| 29.52 | Lesson 2, step 4 takeaway | Joining details come by email from Microsoft Teams. | |
| 29.53 | Completion screen takeaway | A group training is a live online session on a general topic, for enrolled families. | |
| 29.54 | Completion screen takeaway | You register in Microsoft Teams, and joining details come by email. | |
| 29.55 | Completion screen takeaway | Questions about your own child go to your clinical team. | |

## Not listed above

### 23. Wording taken word for word from the project briefs

These lines were supplied in the master prompt, the integration brief or the design guide, and are used exactly as written. They are not repeated above. The master prompt notes that the education statement's "exact official wording is subject to organization/clinical review."

- **Home page:** "Practical learning for everyday life." · "Build understanding at your own pace or join a live caregiver training with your clinical team." · "Explore Learning Modules" · "Short, interactive lessons you can complete anytime." · "Explore modules" · "Upcoming Live Trainings" · "Virtual group sessions for currently enrolled families." · "View trainings" · "Choose a topic" · "Follow simple steps" · "Explore live training options"
- **Education statement, on every page and at the end of every module:** "These educational resources support general learning. Your child's supervising BCBA is responsible for individualized recommendations and treatment planning."
- **Empty states:** "There aren't any live trainings listed right now. You can still explore our learning modules." · "Resources are being prepared for clinical review. Check back for new learning materials." · "You haven't submitted a presentation yet. Start with a PowerPoint you created."
- **Names and labels:** Caregiver Learning Center · Sugar Land pilot · Home · Learning Library · Live Trainings · Help & FAQ · Staff sign-in · the six topic names · "Understanding the ABCs of Behavior"
- **Buttons and controls:** Start learning · Continue learning · Start module · Resume · Back · Next · Save and exit · Lesson outline · Reset progress · Return to library · Search learning topics · View details · Request registration · Register through Microsoft Teams · Registration details coming soon · Submit a PowerPoint · Drop your PowerPoint here · Browse files
- **Labels and notices:** "Demo sample — pending clinical approval" · "DEMO · NOT CLINICALLY APPROVED" (shown as "Demo · not clinically approved") · "Currently enrolled families only" · "Example story, not a real family." · "You can try again." · "Your progress is saved on this device." · "This training is available to currently enrolled families." · "You'll complete registration through Microsoft Teams." · "You can always come back to this lesson." · "Let's look at what happened immediately before the behavior." · "Staff sign-in is not set up yet" · "Illustrative demo data" · "Gate 1 · Source PowerPoint" · every status name in section 21

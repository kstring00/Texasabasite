# How to demo the Learning Center

For Kyle, when showing it to the Clinical Director. Plain steps, about 15 minutes. Everything on screen is made-up demo content and says so.

## What can be shown where

| Part | Vercel preview link | Your laptop |
|---|---|---|
| Caregiver side: home, library, the sample module, the lesson player, live trainings, help | Yes, once two settings are added | Yes |
| Staff sign-in, submitting a PowerPoint, the two approvals, publishing | No. It shows "Staff sign-in is not set up yet" | Yes |
| Training listings and the reporting page | No | Yes |
| A module you publish during the demo showing up in the library | No | Yes |

The staff side is built to refuse to open anywhere on Vercel. That is on purpose: it has no real sign-in. So the full demo is always done from your laptop, with screen sharing if the Clinical Director is not in the room.

## Option A: the caregiver side on a Vercel preview

Nothing has been changed in Vercel. The Learning Center code is on `main` with every setting off, so the public site is unchanged. To turn the caregiver side on for preview links only:

1. In Vercel, open the project **siteforthetexas**, then **Settings**, then **Environment Variables**.
2. Add `NEXT_PUBLIC_LEARN_ENABLED` with the value `1`. Tick **Preview** only. Leave Production and Development unticked.
3. Add `LEARN_DEMO_CONTENT` with the value `1`, the same way.
4. Go to **Deployments**, find the newest Preview deployment, for example the one for `feat/learning-center`, open its menu and choose **Redeploy**. The first setting is read when the site is built, so a redeploy is needed.
5. Open https://siteforthetexas-git-feat-learning-center-kstring00s-projects.vercel.app/learn

What the preview shows, tested by running the site locally the way a Vercel preview runs it: the **Learn** link in the header, the Learning Center home, the library with one sample module, the lesson player, one example training with no date, help, and the amber "Demo mode" banner on every page. The pages are hidden from search engines. **Staff sign-in** shows "Staff sign-in is not set up yet", and stays that way even if `LEARN_DEMO_STAFF` is added by mistake. If the link asks for a Vercel login, that is Vercel's own preview protection, and sharing your screen is the simpler route.

To switch it off again, delete the two settings and redeploy.

**If you tick Production instead.** Only do this as a deliberate public launch. `NEXT_PUBLIC_LEARN_ENABLED` in Production puts the **Learn** link in the header of the live site and opens `/learn` to everyone. `LEARN_DEMO_CONTENT` is ignored in Production on purpose, so visitors would see an empty library ("Resources are being prepared for clinical review") and no trainings. The pages would also be listed in the site map and open to search engines, with wording that is still draft. The staff side stays closed there too.

## Option B: the full demo on your laptop

**Set up once**

1. In the project folder, switch to the `main` branch, pull the latest, and run `npm install`.
2. Create a file named `.env.local` in the project folder with these three lines:
   ```
   NEXT_PUBLIC_LEARN_ENABLED=1
   LEARN_DEMO_CONTENT=1
   LEARN_DEMO_STAFF=1
   ```
3. Run `npm run build`, then `npm start`. Leave that window open.
4. Have one small PowerPoint ready, for example a blank one saved as `demo.pptx`. It must contain nothing real.

**Before every demo**

Open http://localhost:3000/learn/staff and click **Reset demo data**. This puts the example submissions, trainings and numbers back to the start. If you see the staff overview instead of the sign-in screen, click **Switch demo role** at the bottom of the left menu first.

## The demo, click by click

**1. The caregiver side (3 minutes)**

1. Open http://localhost:3000/learn. Point out the amber demo banner and the two paths side by side: **Explore Learning Modules** and **Upcoming Live Trainings**.
2. Click **Explore modules**. In **Search learning topics**, type `behavior`.
3. Click **Understanding the ABCs of Behavior**, then **Start module**.
4. Click **Next** a few times. Open **Lesson outline**. On a question, pick an answer and click **Check my answer**. Say: no login, no score, and progress is saved only on this device.
5. Click **Live Trainings** in the bar under the site header. Click **View details** on any listing. Point out "Currently enrolled families only" and that registration happens in Microsoft Teams.

**2. A staff member submits a PowerPoint (3 minutes)**

6. Click **Staff sign-in** on the right of that same bar. Click **Continue as Sample RBT**.
7. Click **Submit a PowerPoint**. There are six steps. Fill each one and click **Save and continue**:
   Title and summary, Topic and tags, Objectives and audience, PowerPoint file (choose `demo.pptx`), Checklist (tick all five), Review and submit.
8. Click **Submit for clinical review**. Say: this version is now locked, and an RBT has no way to approve anything.

**3. The first approval: the PowerPoint (2 minutes)**

9. Click **Switch demo role** at the bottom of the left menu. Click **Continue as Sample BCBA**.
10. Click **Reviews**. Under **Gate 1 · PPTX sources**, click **Open review** on the new submission.
11. Tick the seven checklist items. Click **Approve source**, then **Yes, approve**. Say: this approves the PowerPoint only.

**4. The module is made and brought in (2 minutes)**

12. Click **Switch demo role**, then **Continue as Sample Producer**.
13. Click **Modules**. Under **Approved sources, ready for production**, click **Open** on the presentation you just submitted, then **Collect for production**.
14. Click **Fill in the synthetic sample package**, then **Check and import**, then **Send for final review**. Say: turning a PowerPoint into a module happens outside the website. The website only checks the result and holds it for review.

**5. The second approval: the finished module (2 minutes)**

15. Click **Switch demo role**, then **Continue as Sample Clinical Director**.
16. Click **Reviews**, then **Gate 2 · Final modules**, then **Open review**.
17. Click **Preview in the lesson player** to show the module as a caregiver would see it. Go back, tick the seven items, click **Approve final module**, then **Yes, approve**. Say: the BCBA who approved the PowerPoint is not allowed to give this second approval.

**6. Publishing (1 minute)**

18. Click **Modules**. Under **Final approved, ready to publish**, click **Open**. Click **Publish**, then **Yes, publish**.
19. Open http://localhost:3000/learn/library in a new tab. The new module, **How group trainings work**, is now there.
20. Optional: back in the staff tab, click **Withdraw**, give a reason, and refresh the library. The module is gone.

**7. A training listing (2 minutes)**

21. Click **Trainings**. Click **Open** on **Visual schedules for mornings: live session**.
22. In **Microsoft Teams registration link**, paste `https://teams.microsoft.com/l/meetup-join/example` and click **Save changes to the public listing**. It is refused, because that is a link for joining a meeting.
23. Replace it with `https://events.teams.microsoft.com/event/example-not-a-real-event` and save again. The preview now shows a **Request registration** button. That example address leads nowhere, so do not click through.

**8. Reporting (3 minutes)**

24. Click **Reporting**. Point out the banner: "Illustrative demo data — not actual caregiver attendance".
25. Set **Period** to **Year to date** and click **Show**. Read one tile aloud, including the line under it, such as "From 5 of 6 finished trainings". Point out a "Not yet available".
26. Under **By training**, click **Enter numbers** beside **Questions to bring to your BCBA: live session**. Type 20, 18 and 15 in the three boxes and click **Save numbers**. The totals update.
27. Scroll to **Registrations by center**. Point out "Other / not displayed" and say: a count under 5 for one center is never shown.
28. Click **Download totals (CSV)** to show the same figures as a spreadsheet file.

## Good to say out loud

- Nothing here is connected to Microsoft Teams. Staff paste the registration link and type the totals in.
- The reporting page cannot show who attended. It only holds totals.
- Every sentence written for the demo is on the review sheet, waiting for the Clinical Director's wording.
- Real use needs real staff sign-in and file scanning first. Both are at the top of the IT checklist.

## If something looks wrong

- "Staff sign-in is not set up yet" on your laptop: the third line is missing from `.env.local`, or the site was not rebuilt after adding it. Run `npm run build` and `npm start` again.
- A page says "not found" after `npm run test:e2e`: the tests rebuild the site. Run `npm run build` and `npm start` again.
- The demo data looks used: click **Switch demo role**, then **Reset demo data** on the sign-in screen.

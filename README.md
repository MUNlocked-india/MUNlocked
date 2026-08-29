# MUNlocked — Auth Starter (Next.js + Supabase)

This is a real, working authentication system: signup, login, role selection
(Delegate / Executive Board / Organizer), a protected dashboard, and a
`profiles` table with Row Level Security. It is **not connected to a live
database yet** — you need to create your own free Supabase project and point
this app at it. That takes about 5 minutes.

## 1. Create a Supabase project

1. Go to [database.new](https://database.new) and create a new project (free tier: 500MB database, 50,000 monthly active auth users).
2. Wait for it to finish provisioning (~2 minutes).

## 2. Run the database schema

1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Open `supabase/schema.sql` from this repo, copy its contents, paste into a new query, and run it.
3. This creates the `user_role` enum, the `profiles` table, Row Level Security policies, and a trigger that automatically creates a profile row (with the name/role picked at signup) whenever someone signs up.

## 3. Connect your environment variables

1. In Supabase, go to **Project Settings -> API**.
2. Copy the **Project URL** and the **anon / public key**.
3. In this repo, copy `.env.local.example` to `.env.local` and paste them in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3.5 Make yourself an admin (needed to approve conferences and EB applications)

The signup role picker only offers Delegate / EB / Organizer — admin isn't
self-service, on purpose. After you sign up once:

1. In Supabase, go to **Table Editor -> profiles**.
2. Find your row and change `role` from whatever you picked to `admin`.
3. Visit `/admin/conferences` or `/admin/eb-applications` while logged in — you'll now see each pending queue, and both links also appear on `/dashboard`.

## 3.6 Set up email notifications (optional, but recommended)

Approving or rejecting a conference or EB application now sends the submitter
an email, via [Resend](https://resend.com):

1. Create a free Resend account and copy an API key from the dashboard.
2. Add it to `.env.local` as `RESEND_API_KEY=...`.
3. **Important limitation:** without your own verified sending domain, Resend's
   shared `onboarding@resend.dev` sender can only deliver to the email address
   on your own Resend account — real recipients elsewhere will silently not
   receive it. For real users, add and verify your own domain in the Resend
   dashboard (Domains -> Add Domain) and update `FROM_ADDRESS` in `lib/email.ts`
   to something like `MUNlocked <notifications@yourdomain.com>`.
4. If `RESEND_API_KEY` isn't set at all, approvals/rejections still work —
   the app just logs a warning and skips sending, so this is safe to leave
   unconfigured while you're testing everything else.

## 4. Turn off email confirmation while you're testing locally (optional)

By default Supabase requires clicking a confirmation email before login works.
For local testing, go to **Authentication -> Providers -> Email** in the
Supabase dashboard and toggle "Confirm email" off. Turn it back on before you
launch for real.

## 5. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you can now sign up, pick a role, log in, and
land on a protected `/dashboard` that reads your role back from the database.

## What's actually real here

- **Signup** creates a real Supabase Auth user and a matching `profiles` row via a database trigger (see `supabase/schema.sql`).
- **Login** issues a real session stored in cookies (`@supabase/ssr`).
- **`/dashboard`** is protected server-side by `middleware.ts` — logged-out users get redirected to `/login` before the page even renders.
- **Row Level Security** is on: the database itself enforces that a user can only edit their own profile, not just the UI.
- **The homepage (`/`) is the real MUNlocked landing page design** — dais bar, split hero, voting-placard feature cards, Standing Rules section — ported from the static HTML mockup into real Next.js/React with working `<Link>` navigation instead of dead `href="#"` buttons.
- **The chatbot actually works once deployed.** Earlier versions called the Anthropic API directly from the browser, which only worked inside Claude's own artifact environment and would silently fail (or leak a key) anywhere else. It's now `app/api/chat/route.ts` — a server-side Route Handler that holds your `ANTHROPIC_API_KEY` server-only and the browser only ever talks to your own `/api/chat` endpoint. Add your key to `.env.local` (and to Vercel's environment variables when you deploy) to turn it on.
- **Conferences are fully real.** `/conferences` reads only `status = 'approved'` rows straight from Supabase. `/conferences/submit` (login required) inserts a new row that always starts `status = 'pending'` — enforced by a Row Level Security policy, not just the form, so there's no way to submit a pre-approved listing even by editing the request. `/admin/conferences` (role = `admin` required) lists everything pending with Approve/Reject buttons that update the status via a Server Action. Approve one and it shows up on `/conferences` immediately.

- **The digital marksheet system is fully real.** `/committees` (login required) lists committees you chair or co-chair. `/committees/new` creates one — you're automatically the chair. `/committees/[id]` is the working marksheet:
  - **Quick-add roster bundles** — one click adds all P5, NATO, or EU countries as delegates (skips any already added), or add a single country by hand.
  - **Full gradable sheet** — POI, Chits, Verbal Reply, GSL, MOD, Decorum, Research, and Documentation, plus a free-text notes column, all editable inline and saved via a Server Action straight to Supabase.
  - **Dais sharing** — invite a co-chair by email; they see the *exact same* live marksheet, not a copy, the moment they open the link (enforced by the `can_access_committee()` RLS helper in the schema, not just the UI).
  - **Secretariat visibility** — anyone with `role = 'admin'` can open any committee's marksheet too, even without being explicitly invited, via the same RLS function.
- **EB applications are fully real.** `/hire-eb/apply` (login required) submits an application that always starts `pending`, same enforced-by-RLS pattern as everything else. `/hire-eb` shows only `status = 'approved'` profiles — a real, live directory, not mock cards. `/admin/eb-applications` is the approval queue.
- **Email notifications on approve/reject.** Both the conference queue and the EB application queue now send the submitter an email via Resend when an admin makes a decision — see the Resend setup section above. This is genuinely wired up, not a placeholder, but does need your own `RESEND_API_KEY` (and eventually a verified sending domain) to reach real inboxes.

- **The real MUNlocked logo and contact email are wired in everywhere.** `public/logo.png` (the mark you uploaded, background-trimmed) appears in the landing page nav, the shared header on every inner page, the shared footer, and `app/icon.png` is the site favicon. `munlockedindia@gmail.com` (in `lib/constants.ts` as `ADMIN_EMAIL`) shows as a `mailto:` link in every footer, and is set as the `reply_to` on every outgoing email, so replies land there even though the send-from address is still Resend's shared domain until you verify your own.
- **Admin gets emailed on every real update, not just approvals.** A new conference submission, a new EB application, and every successful login now each send `ADMIN_EMAIL` a notification via `notifyAdmin()` in `lib/email.ts`. Login had to be moved from a client-side Supabase call to a real Server Action (`app/(app)/login/actions.ts`) to make this possible — that's a genuine behavior change, not just decoration.
- **All the "inner" pages now share one header/footer.** They were moved into an `app/(app)/` route group (this doesn't change any URLs — `/conferences` is still `/conferences`) with `app/(app)/layout.tsx` wrapping them in `<SiteHeader />` / `<SiteFooter />`. The landing page (`/`) keeps its own custom nav baked into the hero design, just with the real logo swapped in instead of the placeholder SVG mark.

## What's still a placeholder

- No "Post a Role" flow yet for conferences to recruit specific EBs directly — right now `/hire-eb` is a one-way directory (EBs apply, admin approves, conferences browse) rather than a full two-sided job-posting marketplace.
- **A note on the login notification:** every single successful login now emails the admin inbox. That's exactly what was asked for, but at real scale (dozens/hundreds of users) this will flood `munlockedindia@gmail.com`. Worth revisiting — e.g. a daily digest instead of one email per login — once there's real traffic; the hook lives in one place (`app/(app)/login/actions.ts`) so it's a small change when you're ready.
- The marksheet updates on save/reload, not with live multiplayer cursors — if two co-chairs edit the same delegate's row within the same few seconds, the second save wins. True real-time sync (via Supabase Realtime subscriptions) is a reasonable upgrade later, but everyone always sees the latest saved state on refresh.
- Co-chair invites are matched by email — if someone is invited before they've signed up, they'll get access automatically once they create an account with that same email, but there's no invite/notification email sent yet.
- The chatbot has no persistent history — each page load starts a fresh conversation.
- **The research library is now fully real**, mirroring the conference/EB pattern: `/research` (real search + committee filter + upvote), `/research/submit` (login required, always inserts as pending), `/admin/research` (approval queue with email notification on approve/reject), and `/research/[id]` → `/print/research/[id]` for a genuinely watermarked, printable download (the watermark embeds the downloader's real email and timestamp, tiled across the page — print to PDF from the browser).
- **New pages added, matching the reference site's breadth:** `/topics` (public committee/agenda browse, distinct from the `/committees` marksheet tool), `/founder` (your photo shown naturally this time — no background removal, learned from the earlier bad crop), `/about` (vision + phased roadmap). Nav now covers all of it: Home, Conferences, Committees, Research Library, Hire an EB, Marksheet, Founder, About, List your MUN.
- **The chatbot is now global and far more prominent** — moved from just the landing page into the root layout, so it's on every page. The button is now a pill with a label ("Ask MUNlocked"), a gradient, and a pulsing glow ring. On first load it also shows a brief animated "teaser" bubble cycling through example questions (auto-dismisses after ~16s or on interaction) — a lightweight motion-graphic introduction rather than a full video.
- **Login hardening:** the admin-notification email is no longer awaited on the critical login path (a slow/failing email call can never block or break login now), and a "Resend confirmation email" flow was added to the login page for the most common real-world login failure — an unconfirmed account. If login is still broken after this, the next debugging step is checking your Supabase project's **Authentication → URL Configuration** has your live Vercel domain listed under Redirect URLs (see the warning below) — that mismatch is the #1 cause of "signed up but can't log in" on a fresh Supabase + Vercel setup.
- No email notification when a conference is approved/rejected — the submitter has to check back.

## Deploying

The easiest path is [Vercel](https://vercel.com) — connect this GitHub repo,
add the same two environment variables in the Vercel project settings, and it
deploys automatically. Supabase Auth's redirect URLs (Authentication -> URL
Configuration) need your deployed domain added once you have one, or email
confirmation links will point at `localhost`.

# Agent Instructions

You're working inside the **WAT framework** (Workflows, Agents, Tools). This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

## The WAT Architecture

**Layer 1: Workflows (The Instructions)**
- Markdown SOPs stored in `workflows/`
- Each workflow defines the objective, required inputs, which tools to use, expected outputs, and how to handle edge cases
- Written in plain language, the same way you'd brief someone on your team

**Layer 2: Agents (The Decision-Maker)**
- This is your role. You're responsible for intelligent coordination.
- Read the relevant workflow, run tools in the correct sequence, handle failures gracefully, and ask clarifying questions when needed
- You connect intent to execution without trying to do everything yourself
- Example: If you need to pull data from a website, don't attempt it directly. Read `workflows/scrape_website.md`, figure out the required inputs, then execute `tools/scrape_single_site.py`

**Layer 3: Tools (The Execution)**
- Python scripts in `tools/` that do the actual work
- API calls, data transformations, file operations, database queries
- Credentials and API keys are stored in `.env`
- These scripts are consistent, testable, and fast

**Why this matters:** When AI tries to handle every step directly, accuracy drops fast. If each step is 90% accurate, you're down to 59% success after just five steps. By offloading execution to deterministic scripts, you stay focused on orchestration and decision-making where you excel.

## How to Operate

**1. Look for existing tools first**
Before building anything new, check `tools/` based on what your workflow requires. Only create new scripts when nothing exists for that task.

**2. Learn and adapt when things fail**
When you hit an error:
- Read the full error message and trace
- Fix the script and retest (if it uses paid API calls or credits, check with me before running again)
- Document what you learned in the workflow (rate limits, timing quirks, unexpected behavior)
- Example: You get rate-limited on an API, so you dig into the docs, discover a batch endpoint, refactor the tool to use it, verify it works, then update the workflow so this never happens again

**3. Keep workflows current**
Workflows should evolve as you learn. When you find better methods, discover constraints, or encounter recurring issues, update the workflow. That said, don't create or overwrite workflows without asking unless I explicitly tell you to. These are your instructions and need to be preserved and refined, not tossed after one use.

## The Self-Improvement Loop

Every failure is a chance to make the system stronger:
1. Identify what broke
2. Fix the tool
3. Verify the fix works
4. Update the workflow with the new approach
5. Move on with a more robust system

This loop is how the framework improves over time.

## File Structure

**What goes where:**
- **Deliverables**: Final outputs go to cloud services (Google Sheets, Slides, etc.) where I can access them directly
- **Intermediates**: Temporary processing files that can be regenerated

**Directory layout:**
```
.tmp/           # Temporary files (scraped data, intermediate exports). Regenerated as needed.
tools/          # Python scripts for deterministic execution
workflows/      # Markdown SOPs defining what to do and how
.env            # API keys and environment variables (NEVER store secrets anywhere else)
credentials.json, token.json  # Google OAuth (gitignored)
```

**Core principle:** Local files are just for processing. Anything I need to see or use lives in cloud services. Everything in `.tmp/` is disposable.

## Bottom Line

You sit between what I want (workflows) and what actually gets done (tools). Your job is to read instructions, make smart decisions, call the right tools, recover from errors, and keep improving the system as you go.

Stay pragmatic. Stay reliable. Keep learning.

---

# Project: Vagtplan — DJ Scheduling App

## What this project is
A web app for a small DJ booking business. The boss (the user's employer) is disorganised and needs a simple tool to manage his DJs, venues, bookings and pricing. This is a private internal tool — not a public product.

## Who uses it
- The boss: logs in, manages everything (DJs, venues, bookings, prices)
- Possibly DJs later: view their own schedule (not decided yet)

## Tech stack
- **Framework:** Next.js 14 (React) + TypeScript + Tailwind CSS
- **Local dev:** Docker (`docker compose up` → localhost:3000)
- **Hosting:** Railway (auto-deploys when pushed to GitHub)
- **GitHub repo:** https://github.com/teis2000/vagtplan
- **gh CLI:** installed at `~/bin/gh`

## Workflow rules
- Build and test locally at localhost:3000 first
- Only push to GitHub (and therefore Railway) when the user says they're happy
- Never push broken code live
- Always explain changes in plain non-technical language

## Current state (as of April 2026)

### ✅ Completed
- **Session 1:** Next.js app live on Railway, Docker local dev, PWA manifest
- **Session 2:** Supabase connected, tables created (profiles, venues, bookings), Google OAuth login
- **Session 3:** Role-based routing (boss/dj), DJ shell layout (sidebar + mobile tab bar), Mine vagter screen with real bookings from Supabase (Today/Upcoming/Past sections, orange highlight, duration calc)
- **Session 4:** Boss shell/layout (light cream theme, sidebar + mobile tabs), booking list grouped by month, add booking form with DJ/venue dropdowns + auto-fill price. Also fixed: `force-dynamic` on all pages, `NEXT_PUBLIC_*` env vars added to Railway, `price` column added to bookings table.
- **Session 5:** Railway prerender fix (`force-dynamic`), TypeScript fixes for Railway build.
- **Session 6:** Venue management (`/boss/steder`: add/edit/delete), DJ management (`/boss/djs`: list + invite link + remove), edit/delete bookings (`/boss/vagter/[id]`), booking rows now clickable. Boss can switch to DJ-visning, DJ layout allows boss role.

### Current file structure (relevant files)
```
src/app/
  page.tsx                   ← root: checks role → redirects to /boss or /dj
  login/page.tsx             ← Google OAuth login button
  auth/callback/page.tsx     ← handles OAuth redirect, fires SIGNED_IN event
  boss/layout.tsx            ← Boss shell: light cream sidebar + mobile tabs (Vagter, DJs, Steder, Indstillinger)
  boss/page.tsx              ← All bookings grouped by month, sorted newest first, "Ny vagt" button
  boss/vagter/ny/page.tsx    ← Add booking form (DJ dropdown, venue dropdown, date, time, price, notes)
  dj/layout.tsx              ← DJ shell: dark sidebar desktop + bottom tab bar mobile
  dj/page.tsx                ← Mine vagter (real bookings, Today/Upcoming/Past)
  dj/steder/page.tsx         ← placeholder
  dj/statistik/page.tsx      ← placeholder
  dj/beskeder/page.tsx       ← placeholder
  dj/profil/page.tsx         ← placeholder
src/lib/supabase.ts          ← Supabase client (implicit flow)
```

### Supabase tables
- **profiles** — id (= auth.users.id), full_name, role ('boss' | 'dj')
- **venues** — id, name, price (numeric)
- **bookings** — id, dj_id (→ profiles), venue_id (→ venues), date, start_time, end_time, notes, price (numeric, nullable — falls back to venue.price)

### Role logic
- New user logs in → profile inserted with role = 'dj'
- root page.tsx checks role and redirects: boss → /boss, dj → /dj
- To make someone a boss: manually update their row in Supabase: `UPDATE profiles SET role = 'boss' WHERE id = '...'`

### Supabase join syntax
- Use named foreign key constraint when joining: `profiles!bookings_dj_id_fkey(full_name)`
- Regular join: `venues(name, price)`

---

## SESSION 7 — DJ-oplevelsen (start here next session)

**Goal:** DJ-siden er halvfærdig — 4 faner siger "kommer snart". Fix det og gør DJ-oplevelsen komplet.

### What to build (in order):
1. **Fjern Statistik og Beskeder** fra DJ-navigationen (`dj/layout.tsx` NAV array) — blanke placeholder-sider er værre end ingen faner. Fjern dem nu, tilføj dem igen når de er klar.
2. **Steder-siden for DJ** (`dj/steder/page.tsx`) — vis de spillesteder DJ'en har haft vagter på. Simpel liste: sted-navn, antal gange spillet der, sidst spillet dato. Data hentes fra bookings-tabellen filtreret på dj_id.
3. **Profil-siden for DJ** (`dj/profil/page.tsx`) — vis DJ'ens navn (fra profil), Google-konto email (fra auth session). Evt. log ud-knap her i stedet for (eller i tillæg til) sidepanelet.

### Design language (match existing)
- Font: `system-ui, -apple-system, sans-serif`
- Accent: `#FF6E3C` (orange)
- DJ theme: dark sidebar `#1A1A1A`, white content area
- Muted text: `#9B9189`
- Cards: borderRadius 14
- No Tailwind — inline styles only

---

## SESSION 8 — Dobbeltbooking-check + kalendervisning

**Goal:** Gør systemet smart — forhindre fejl og giv chefen overblik.

### What to build:
1. **Dobbeltbooking-advarsel** — i "Ny vagt"-formularen: når DJ og dato er valgt, tjek om den DJ allerede har en vagt den dag. Vis en tydelig advarsel (ikke blokér, bare advar).
2. **Ugevisning** (`/boss/kalender`) — simpel kalender der viser hvem der spiller hvornår. Uge-grid med DJs på tværs. Link fra boss-navigationen (evt. erstat "Vagter" fanen eller tilføj en ny).
3. **"Hvem er ledig?"**-hjælp — i formularen: når en dato er valgt, vis hvilke DJs der IKKE har en vagt den dag.

---

## SESSION 9 — Boss dashboard + polering

**Goal:** Chefen åbner appen og ser noget nyttigt med det samme.

### What to build:
1. **Dashboard-widget øverst på /boss** — ikke en ny side, bare øverst på Vagter-siden: "Denne måned: X vagter, Y kr omsætning", "Næste 7 dage: [liste]"
2. **Login-siden** — teksten "Til DJs og bookingbureauer" er forkert for et internt værktøj. Ret til noget neutralt.
3. **Mobilgennemgang** — test alle skærme på mobil, fix evt. layoutproblemer.
4. **App-ikon** — bedre ikon end "VP" (kalender eller musiknode).

---

## SESSION 10 — Custom domæne + Railway-stabile udrulning

- Custom domæne (vagtplan.dk eller lignende)
- Gennemgang af Railway-konfiguration
- Evt. Supabase Row Level Security (RLS) — nu er alt åbent, ingen sikkerhed på databaseniveau

---

## Design language (always match this)
- Font: `system-ui, -apple-system, sans-serif`
- Accent: `#FF6E3C` (orange)
- Background: `#FFFFFF` eller `#F9F8F7`
- Muted text: `#9B9189`
- Cards: `#F6F4F1`, borderRadius 14
- Borders: `#E9E6E1`
- Dark text: `#1C1A18`
- **No Tailwind — inline styles only**

## What needs to be built (big picture)
- [x] Database (profiles, venues, bookings)
- [x] Login (Google OAuth)
- [x] DJ management (list, invite, remove)
- [x] Venue management (add/edit/delete)
- [x] Booking management (add/edit/delete, grouped by month)
- [ ] DJ-profil og steder-side
- [ ] Dobbeltbooking-check
- [ ] Kalendervisning
- [ ] Dashboard for boss
- [ ] Custom domæne

## Known issues / lessons learned
- Next.js 14.2.5 had a security vulnerability (CVE-2025-55184) — upgraded to 14.2.35
- `next.config.ts` is not supported in Next.js 14 — must use `next.config.mjs`
- Docker icons were generated as plain blue squares (no text) — fix before showing to anyone
- **Railway PORT:** Railway assigns its own dynamic PORT (was 8080, not 3000). NEVER assume port 3000. After deploy, check Deploy Logs for the actual port, then update Settings → Networking → target port to match
- **railway.json interferes with Nixpacks** — do not use railway.json. Let Nixpacks auto-detect Next.js. It handles everything correctly on its own
- **Debugging Railway:** when app shows "failed to respond", go to Deploy Logs first. "Starting Container" with no further output = app crashed immediately. Look for the port number Next.js reports (e.g. `localhost:8080`) and match it in Networking settings

## User preferences
- Explain everything in plain non-technical language
- Be critical and proactive — challenge decisions, flag problems early
- User is non-technical but wants to understand what's happening and why
- Quality over speed — do things right, not fast

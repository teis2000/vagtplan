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
- Basic Next.js app is live on Railway
- Shows a static weekly schedule (Mandag–Søndag) — no real data yet
- No database, no login, no real functionality yet
- PWA manifest is in place (can be added to iPhone home screen)

## SESSION TO-DO LIST (start here next session)

### User does before next session:
- [ ] Think about what information a booking needs (DJ, venue, date, time, price, paid/unpaid? anything else?)
- [ ] Use claude.ai to create a visual mockup of the main booking screen — describe it as a mobile DJ scheduling app, blue/white, Danish language. Screenshot the result to share next session.
- [ ] Optional: write down the 3 most painful things your boss does manually today (helps us prioritise features)

### We do together next session (in order):
1. [ ] Set up Supabase database (free) — create tables for DJs, venues and bookings based on the data model we agree on
2. [ ] Connect the app to the database so data is actually saved
3. [ ] Build the first real screen — most likely the bookings overview
4. [ ] Add a simple login/password so the app is protected

### Nice to have (later, not urgent):
- [ ] Better app icon (not just "VP" — maybe a calendar or music note)
- [ ] Custom domain name (e.g. vagtplan.dk) instead of the Railway URL
- [ ] Make the app installable on iPhone properly and test the icon

## What needs to be built (big picture)
1. Database to store DJs, venues, bookings, pricing
2. Login system (simple — just for the boss)
3. DJ management page (add/edit/remove DJs)
4. Venue management page (add/edit/remove venues with pricing)
5. Booking/calendar view (who plays where, when, at what price)

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

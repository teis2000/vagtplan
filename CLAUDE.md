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

## What needs to be built next
1. Database to store DJs, venues, bookings, pricing
2. Login system (simple — just for the boss)
3. DJ management page (add/edit/remove DJs)
4. Venue management page (add/edit/remove venues with pricing)
5. Booking/calendar view (who plays where, when, at what price)

## Known issues / lessons learned
- Next.js 14.2.5 had a security vulnerability (CVE-2025-55184) — upgraded to 14.2.35
- Railway requires the app to respect the PORT env var — use `next start -p ${PORT:-3000}`
- `next.config.ts` is not supported in Next.js 14 — must use `next.config.mjs`
- Docker icons were generated as plain blue squares (no text) — acceptable for now

# Vagtplan — To-Do List

Last updated: April 20, 2026

---

## Before next session (Teis does these)

- [ ] Go to claude.ai and ask it to design a mockup of the main booking screen. Tell it: "Design a mobile-friendly booking overview screen for a DJ scheduling app. Blue and white colours, Danish language." Screenshot the result — we use it as our blueprint next session.
- [ ] Optional: write down the 3 most painful things your boss does manually today (helps decide what to build first)

---

## Next session (we do together, in this order)

1. [ ] Build the bookings overview screen (based on the mockup if you have it)
2. [ ] Add a simple login so the app is password protected
3. [ ] Test the full flow: log in → see bookings
4. [ ] Push to Railway when it looks good

---

## Backlog (later, not urgent)

- [ ] Better app icon — something nicer than "VP" on a blue square
- [ ] Custom domain name (e.g. vagtplan.dk) instead of the long Railway URL
- [ ] Test iPhone home screen install with new icon
- [ ] Decide if DJs should have their own login to see their schedule

---

## Completed

- [x] Set up Next.js + TypeScript + Tailwind CSS project
- [x] Set up Docker for local development (localhost:3000)
- [x] Create GitHub repo (github.com/teis2000/vagtplan)
- [x] Deploy to Railway — live at vagtplan-production.up.railway.app
- [x] Fix security vulnerability (Next.js upgraded to 14.2.35)
- [x] Fix PWA icons (proper blue icon with VP text)
- [x] Set up permissions so Claude Code doesn't ask approval for every command
- [x] Clean up duplicate CLAUDE.md file
- [x] Create Supabase project (West EU, free tier, automatic RLS enabled)
- [x] Build all 8 database tables: profiles, venues, venue_djs, open_dates, availability, bookings, shift_swap_requests, messages
- [x] Enable Row Level Security (RLS) on all 8 tables with correct access policies
- [x] Connect app to Supabase — confirmed working (green "Database forbundet" at localhost:3000)
- [x] Commit database work locally (not yet pushed to Railway)

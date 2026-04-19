# Vagtplan — To-Do List

Last updated: April 19, 2026

---

## Before next session (Teis does these)

- [ ] Think about what info a booking needs to store — DJ name, venue, date, time, agreed price, paid or not paid? Anything else? Just write it as a simple list on your phone.
- [ ] Go to claude.ai and ask it to design a mockup of the main booking screen. Tell it: "Design a mobile-friendly booking overview screen for a DJ scheduling app. Blue and white colours, Danish language." Screenshot the result — we use it as our blueprint.
- [ ] Optional: write down the 3 most painful things your boss does manually today (helps decide what to build first)

---

## Next session (we do together, in this order)

- [ ] Set up Supabase database (free) — create tables for DJs, venues and bookings
- [ ] Connect the app to the database so data actually saves
- [ ] Build the first real screen based on the mockup
- [ ] Add a simple login so the app is password protected

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

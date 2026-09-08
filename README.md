# 💌 Roshan & Pranjali — Interactive Wedding Invitation

A single-page, mobile-first digital wedding invitation with a scratch-to-reveal date, a photo carousel, animated event cards, and a live RSVP form — inspired by the "envelope + wax seal" style invites shared over WhatsApp.

**[Live Demo →](#)** *(add your deployed link here once hosted)*

![Made with HTML](https://img.shields.io/badge/Made%20with-HTML%2FCSS%2FJS-orange)
![No framework](https://img.shields.io/badge/Framework-None-lightgrey)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

- **Envelope intro** — a wax-seal "tap to reveal" gate before the invitation opens
- **Scratch-to-reveal date** — three heart-shaped scratch cards (Day / Month / Year) with a live countdown timer
- **Photo carousel** — swipeable gallery of moments with captions
- **Illustrated event cards** — Sangeet, Wedding Ceremony, and Reception, each with date, time, venue, and a "View on Maps" button
- **RSVP form** — guest details, accept/decline, party size, per-event attendance, fun mini-poll, mood chips, and a note/advice memory book
- **Organizer dashboard** — a passcode-gated panel to view all RSVPs with live stats and CSV export
- **Persistent storage** — RSVP responses are saved and survive page reloads
- **Accessible** — keyboard-operable controls, `prefers-reduced-motion` support, and a non-canvas fallback for the scratch-card reveal
- **Zero dependencies** — a single self-contained HTML file, no build step, no framework

## 🚀 Getting Started

This is a static site — there's nothing to install or build.

### Run locally

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
# then just open it
open index.html        # macOS
start index.html        # Windows
xdg-open index.html     # Linux
```

Or serve it with any static server:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

### Deploy

Works out of the box on any static host:

- **Vercel**: `vercel deploy`
- **Netlify**: drag-and-drop the folder onto [app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages**: Settings → Pages → deploy from `main` branch, root folder

## 🎨 Customize It

All content lives in `index.html` — no build step required.

| What to change | Where |
|---|---|
| Couple names, family details | `#invitation` section |
| Wedding date | `#date-reveal` heart cards + the `startCountdown()` target date in the script |
| Event names, dates, venues | `events` array near the top of the `<script>` block |
| Gallery photos | `photos` array in the script — replace the placeholder URLs with your own image links |
| Colors / fonts | CSS custom properties at the top of `<style>` (`--wine`, `--terracotta`, `--gold`, etc.) and the Google Fonts `<link>` |
| Background music | Set a `src` on the `<audio id="bg-audio">` element |
| Organizer passcode | `PASSCODE` constant in the script |

## 🗂 Project Structure

```
.
├── index.html      # entire site: markup, styles, and behavior
└── README.md
```

## 🛠 Built With

- Plain HTML5, CSS3, and vanilla JavaScript
- [Google Fonts](https://fonts.google.com) — Cormorant Garamond & Mrs Saint Delafield
- Browser Canvas API — scratch-card interaction
- A simple key-value storage API for persisting RSVPs (swap in your own backend/DB if self-hosting elsewhere)

## ⚠️ Notes

- The organizer passcode gate is a **demo-only** convenience, not real authentication — don't rely on it to protect sensitive guest data in production.
- Gallery images are placeholders — replace them with the couple's real photos before sharing.
- Background music is unset by default; add a licensed/owned audio file's URL to enable it.

## 📄 License

MIT — see [LICENSE](LICENSE). Free to use and adapt for your own wedding!

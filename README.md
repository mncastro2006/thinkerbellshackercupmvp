# ThinkerBells

A tool that helps parents teach their neurodivergent child math by turning
lesson PDFs into short, visual, story-based mini-lessons.

**For setup instructions, see [RUNNING.md](./RUNNING.md).**

## How it works (prototype)

1. **Parent uploads** `MATH3_Mod1.pdf` (addition) or `MATH3_Mod2.pdf` (division)
   from `backend/sample-modules/` (or rename your own PDF to match).
2. The app **looks like AI is generating stories** (short delay + UI copy), but
   loads **predetermined** stories, questions, answers, and feedback from
   [`backend/src/content/modules.config.js`](backend/src/content/modules.config.js)
   — edit that file to change wording yourself.
3. The parent gets a **join code** (Kahoot-style) for the child's device.
4. The **parent controls pace** (Next / Back + text-to-voice) and reads the
   **full story on one page**. The **student only sees PNG visuals** and can
   only tap Kahoot-style answer blocks.
5. After the session, the parent gets a **feedback report** tailored to the
   module (addition vs division) based on quiz results.

**Custom art:** overwrite PNGs in `frontend/src/assets/story/` keeping the same
filenames (`girl.png`, `apple.png`, `market.png`, …).

## Architecture

```
┌─────────────┐        REST/JSON        ┌──────────────┐        SQL        ┌───────┐
│  Frontend    │ ─────────────────────▶ │   Backend     │ ─────────────────▶│ MySQL │
│  React+Vite  │ ◀───────────────────── │  Express API  │ ◀──────────────── │       │
└─────────────┘                          └──────┬───────┘                    └───────┘
                                                 │
                                                 ▼
                                     ┌───────────────────────┐
                                     │ Predetermined packs     │
                                     │ (modules.config.js)     │
                                     └───────────────────────┘
```

- **backend/** — Node.js + Express REST API, MySQL via Sequelize ORM. Handles
  auth, prototype module packs, join-code sessions with parent pacing cursor,
  quiz answers, and feedback report generation.
- **frontend/** — React (Vite) single-page app for parent and student flows.
- **docker-compose.yml** — MySQL, backend, frontend, and Adminer.

## Key REST endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a parent account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/modules/upload` | Upload a supported PDF → load predetermined stories |
| GET | `/api/modules` | List a parent's modules |
| POST | `/api/sessions` | Generate a join code for a module |
| POST | `/api/sessions/join` | Student joins with a code |
| GET | `/api/sessions/:id/state` | Student polls parent cursor |
| POST | `/api/sessions/:id/advance` | Parent Next |
| POST | `/api/sessions/:id/back` | Parent Back |
| POST | `/api/quiz/answer` | Student submits one answer tap |
| GET | `/api/reports/session/:id` | Full parent feedback report |
| GET | `/api/reports/session/:id/summary` | Student-facing results summary |
| GET | `/api/reports/history` | Parent's history of completed modules |

## Tech stack

- **Frontend**: React 18, React Router, Vite, Axios — plain CSS, Web Speech API for parent text-to-speech.
- **Backend**: Node.js, Express, Sequelize, MySQL 8, JWT auth, Multer (uploads).
- **Infra**: Docker, Docker Compose, nginx, Adminer.

## MVP notes

- Story visuals use **named PNG placeholders** in `frontend/src/assets/story/` (swap files to customize).
- Content is **not LLM-generated** in this prototype — edit `backend/src/content/modules.config.js`.
- Parent owns pacing and TTS; student only taps answer choices.

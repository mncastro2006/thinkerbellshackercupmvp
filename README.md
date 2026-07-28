# ThinkerBells 🔔

A tool that helps parents teach their neurodivergent child math by turning
any lesson PDF into short, visual, story-based mini-lessons.

**➡️ For setup instructions, see [RUNNING.md](./RUNNING.md).**

## How it works

1. **Parent uploads a PDF lesson** (e.g. a worksheet on 2-digit addition).
2. The backend extracts the text and uses AI (with an offline fallback) to
   turn it into **3 short stories**, each with **5 multiple-choice
   questions**. Story complexity mirrors the source module — the goal is to
   make the *context* simpler and more visual (buying fruit at a market,
   counting coins, sharing candy), not to change the difficulty.
3. The parent gets a **join code**, similar to a Kahoot PIN, to share with
   the child's device.
4. The **student enters the code** to connect and plays through the 3
   stories. Each question shows emoji-based visuals (e.g. 🍎🍎🍎🍎🍎 for "5
   apples") and Kahoot-style colored answer blocks. Built-in
   accessibility helpers include **text-to-speech** and an **easy-read
   (dyslexia-friendly) font toggle**.
5. After finishing, the student sees an **evaluation screen** with their
   score and performance level.
6. The parent's dashboard shows a full **feedback report**: strengths,
   specific weak skills (e.g. *"needs improvement in addition of 2-digit
   numbers"*), and concrete recommendations for what to practice next and
   how.

## Architecture

```
┌─────────────┐        REST/JSON        ┌──────────────┐        SQL        ┌───────┐
│  Frontend    │ ─────────────────────▶ │   Backend     │ ─────────────────▶│ MySQL │
│  React+Vite  │ ◀───────────────────── │  Express API  │ ◀──────────────── │       │
└─────────────┘                          └──────┬───────┘                    └───────┘
                                                 │
                                                 ▼
                                     ┌───────────────────────┐
                                     │ AI story generation     │
                                     │ (OpenAI, or offline      │
                                     │  template fallback)      │
                                     └───────────────────────┘
```

- **backend/** — Node.js + Express REST API, MySQL via Sequelize ORM. Handles
  auth, PDF parsing, AI story/question generation, join-code session
  management, quiz submission/scoring, and feedback report generation.
- **frontend/** — React (Vite) single-page app implementing the parent and
  student flows shown in the product wireframes.
- **docker-compose.yml** — runs MySQL, the backend, the frontend, and
  Adminer together with a single `docker-compose up --build`.

## Key REST endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a parent account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/modules/upload` | Upload a PDF, generate 3 stories × 5 questions |
| GET | `/api/modules` | List a parent's modules |
| POST | `/api/sessions` | Generate a join code for a module |
| POST | `/api/sessions/join` | Student joins with a code |
| POST | `/api/quiz/submit` | Submit answers for one story |
| GET | `/api/reports/session/:id` | Full parent feedback report |
| GET | `/api/reports/session/:id/summary` | Student-facing results summary |
| GET | `/api/reports/history` | Parent's history of completed modules |

## Tech stack

- **Frontend**: React 18, React Router, Vite, Axios — plain CSS (no UI
  framework lock-in), Web Speech API for text-to-speech.
- **Backend**: Node.js, Express, Sequelize, MySQL 8, JWT auth, Multer
  (uploads), `pdf-parse`, OpenAI SDK (optional).
- **Infra**: Docker, Docker Compose, nginx (serves the built frontend),
  Adminer (DB inspection).

## MVP notes

- Story visuals use a small **static emoji asset pool** (see
  `frontend/src/assets/emojiMap.js` and the matching `ASSET_POOL` in
  `backend/src/services/ai.service.js`) rather than generated images, per
  the MVP scope.
- If no `OPENAI_API_KEY` is configured, story/question generation uses a
  deterministic offline generator so the entire product works out of the
  box with no external dependencies or costs.

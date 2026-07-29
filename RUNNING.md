# Running Vizma with Docker Compose

This repo is a monorepo containing everything needed to run the app locally
with a single command — no local Node.js or MySQL installation required.

```
vizma/
├── docker-compose.yml   # orchestrates mysql + backend + frontend + adminer
├── .env                 # default local dev config (already included)
├── backend/              # Express REST API (Node.js + Sequelize + MySQL)
└── frontend/             # React (Vite) single-page app
```

## 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2 (bundled
  with recent Docker Desktop / Docker Engine installs).
- Nothing else. You do **not** need Node.js or MySQL installed on your machine.

## 2. Clone and configure

```bash
git clone <your-fork-url> vizma
cd vizma
```

Default `.env` files are already committed for local development
(`./.env`, `./backend/.env`) so the app works immediately with the offline
fallback generator. To get **real AI-generated stories and feedback reports**,
copy the `.env.example` files and add your API key(s):

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Then set `OPENAI_API_KEY` and/or `GEMINI_API_KEY` in `backend/.env` (see
`AI_PROVIDER_ORDER` to control which provider is tried first). Without a key
configured, or if every configured provider fails, requests automatically
fall back to a deterministic offline generator so the app still works end
to end with zero external dependencies.

### Sample lesson PDFs

Upload one of the sample PDFs in `backend/sample-modules/` (or any lesson
PDF of your own):

- `MATH3_Mod1.pdf` — addition of 1- and 2-digit numbers
- `MATH3_Mod2.pdf` — division of 1- and 2-digit numbers

The backend extracts the PDF text and sends it to the configured generative
AI provider to produce 3 stories with 5 questions each. If AI generation is
unavailable and the filename matches one of the two sample PDFs above, the
app falls back to a hand-authored demo pack in
`backend/src/content/modules.config.js` so the guided demo still works
without any AI key.

## 3. Run everything

From the repository root:

```bash
docker-compose up --build
```

This single command will:

1. Start a **MySQL 8** container and wait for it to become healthy.
2. Build and start the **Express backend** (runs on port `4000`), which
   connects to MySQL, auto-creates all tables on boot, and exposes the REST
   API under `/api`.
3. Build and start the **React frontend** (built with Vite, served via
   nginx on port `5173`).
4. Start **Adminer** (a lightweight DB admin UI) on port `8080`, useful for
   inspecting the database while developing.

First build can take a few minutes while Docker downloads base images and
installs dependencies. Subsequent runs are much faster thanks to layer
caching.

## 4. Open the app

| Service            | URL                              |
|---------------------|-----------------------------------|
| Frontend (web app)  | http://localhost:5173            |
| Backend REST API    | http://localhost:4000/api        |
| Backend healthcheck | http://localhost:4000/api/health |
| Adminer (DB UI)     | http://localhost:8080            |

Adminer login: System = `MySQL`, Server = `mysql`, Username/Password/Database
= whatever you set in `.env` (defaults: `thinkerbells` / `thinkerbells` /
`thinkerbells`).

## 5. Try the flow

1. Open http://localhost:5173, click **Get started → Parent**, and create an
   account.
2. Upload a PDF lesson under **Upload new lesson**. The backend extracts the
   text and generates 3 short stories with 5 questions each.
3. You'll land on a **join code** screen (like a Kahoot PIN).
4. On another browser tab/device, go to http://localhost:5173, choose
   **Student**, and enter the code.
5. Play through the 3 stories. Each finished story auto-saves to the backend.
6. After the last story, the student sees an evaluation screen, and the
   parent's dashboard/profile shows a full AI-curated feedback report
   (strengths, weaknesses, and recommended next steps) based on the child's
   quiz results.

## 6. Stopping / resetting

```bash
# stop containers (keeps data)
docker-compose down

# stop and wipe the database volume too
docker-compose down -v
```

## 7. Rebuilding after code changes

```bash
docker-compose up --build
```

Docker Compose will only rebuild the images whose source changed.

## Troubleshooting

- **Backend keeps restarting / can't connect to MySQL**: the backend retries
  the DB connection for ~45 seconds on boot. If it still fails, run
  `docker-compose logs mysql` to check MySQL actually started, and confirm
  the `DB_*` values in `backend/.env` match the `MYSQL_*` values in the root
  `.env`.
- **Port already in use**: change the left-hand side of the `ports:` mapping
  in `docker-compose.yml` for the conflicting service (e.g. `"5174:80"`).
- **PDF upload fails**: only `.pdf` files are accepted, up to 15 MB.

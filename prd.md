# ThinkerBells — Product Requirements Document

**Status:** Living document — describes the current (implemented) product. All items from the previous roadmap (§13) have been implemented as of this update.
**Last updated:** 2026-07-28

---

## 1. Product Summary

ThinkerBells is a **parent-led, at-home learning tool** that helps parents of neurodivergent children teach and reinforce math competencies, using material the parent already has (a lesson PDF, worksheet, or a stated learning competency). The parent uploads or specifies the material once; the system uses AI (with a deterministic offline fallback) to generate **3 short stories, each with 5 multiple-choice questions**, that translate the same math skill into simpler, more relatable, more visual contexts (buying fruit at a market, counting coins, sharing candy, etc.) without changing the underlying difficulty.

The session is a **joint parent-child activity**, not an independent student exercise. Parent and child use two connected screens/devices in the same room, linked with a short join code (similar to a Kahoot PIN):

- The **parent's screen** shows the story (readable aloud or via text-to-speech) plus a **teaching guide** for the underlying concept, and is where the parent facilitates the session and intervenes when the child struggles.
- The **student's screen** shows the lesson's visuals and functions as the **answer sheet** — a simple, Kahoot-style surface for selecting answers — not a self-contained, unsupervised lesson.

After the session, both sides get results: the student sees a simple evaluation screen, and the parent gets a detailed feedback report (strengths, weaknesses by skill, and concrete recommendations) to guide what to focus on in the next session.

## 2. Problem Statement

Neurodivergent children often need one-on-one, adapted instruction to build math competency, but private tutoring and therapy are expensive and inaccessible to many families — and schools/teachers, managing many students at once, cannot always identify or address what an individual child specifically needs in time. The parent is typically the first person to notice their child's specific learning needs, but most parents lack the time, training, or tools to (a) translate existing lesson material into a more accessible, story-driven, visual format, and (b) know how to actually explain a given math concept in a way that clicks for their child.

ThinkerBells addresses both gaps as a **cost-efficient supplementary/at-home intervention**: it removes the content-authoring burden (the parent supplies existing material or the target competency, and the app produces an accessible retelling automatically) and it removes some of the pedagogical guesswork (a teaching guide accompanies each story so the parent knows how to explain the concept in the moment). The app is explicitly **not** a replacement for the parent's role as teacher — it is a bridge across the learning-material gap and the tutoring gap, keeping the parent as the facilitator and the one who intervenes when the child gets something wrong.

## 3. Goals

- Let a parent turn existing lesson material or a stated learning competency into an accessible, story-based practice session in under a minute.
- Keep the math skill and difficulty faithful to the source material — only the presentation/context is simplified.
- Keep the parent actively in the facilitator/teacher role throughout the session — the app supports and equips parent-led intervention, it does not replace it.
- Equip the parent, in the moment, with a plain-language guide on how to teach the specific concept in the lesson (not just what the lesson is).
- Give the child a low-friction, low-anxiety way to connect to a session (code entry, no account required) and a simple, visual "answer sheet" experience.
- Surface actionable, specific feedback to the parent after each session — which skills need more focus next time, and how — not just a raw score.
- Support core accessibility needs out of the box (text-to-speech, dyslexia-friendly font).
- Provide a genuinely cost-efficient alternative/supplement to paid tutoring or therapy for families who can't easily access it.
- Work fully offline/self-hosted with zero external dependencies required (AI generation degrades gracefully).

## 4. Non-Goals (current MVP)

- Replacing professional therapy, diagnosis, or individualized education plans — ThinkerBells is a supplementary at-home tool, not a clinical or diagnostic product.
- Unsupervised, parent-absent student use — the student screen is designed as a shared-session "answer sheet," not a standalone app the child uses alone.
- Generating real illustrated/AI-generated artwork per story (MVP uses a static emoji/asset pool).
- Multi-child or multi-parent account management, classrooms, or multi-tenant admin.
- Curriculum authoring tools beyond "upload a PDF" / describe a competency.
- Real-time networked multiplayer sync between parent and student screens — the two screens are expected to be co-located (same room/session) and connected via a join code, not a low-latency live socket session across arbitrary distance.
- Support for subjects other than mathematics.

## 5. Users / Personas

| Persona | Description | Primary needs |
|---|---|---|
| **Parent** | Adult caregiver of a neurodivergent child, has an account, uploads material, and **actively facilitates the session** — reads or plays the story aloud, follows an in-app teaching guide to explain the concept, and steps in when the child answers incorrectly. | Fast upload, simple code sharing, an in-context guide on *how* to teach the concept, clear post-session feedback, history of past sessions. |
| **Student** | Neurodivergent child, uses the "connected" device, no account, always alongside the parent. The student's screen is primarily an **answer sheet** — it shows lesson visuals and lets the child select answers — rather than a self-guided lesson. | Simple code entry, low cognitive load UI, visual support, immediate encouraging feedback. |

> **Design implication:** the parent, not the student, is the primary consumer of the story text and the teaching guide. The student's screen should stay focused on visuals and answer selection.

## 6. Core User Flows

### 6.1 Parent: onboarding and account
1. Landing page → role select (Student / Parent).
2. Parent registers (`name`, `email`, `password`) or logs in.
3. Session persisted via JWT stored client-side; parent lands on their dashboard.

### 6.2 Parent: upload material → generate lesson module
1. Parent opens **Upload Material**, selects a PDF (max 15 MB).
2. Backend extracts text from the PDF, detects the underlying topic (e.g. "addition of 2-digit numbers"), and generates **3 stories × 5 questions** via AI (or the offline fallback generator if no AI key is configured or the AI call fails).
3. The module is saved with status `processing` → `ready` (or `failed` if generation errors out).
4. Module appears on the parent dashboard once ready.

### 6.3 Parent: start a session
1. From the dashboard, parent selects a ready module and generates a **join code** (6 characters by default, ambiguous characters like `0`/`O`/`1`/`I` excluded, similar to a Kahoot PIN).
2. Code is shown full-screen so it can be shared with the student's device. Code expires after a configurable TTL (default 60 minutes) if unused.

### 6.4 Parent + student: the facilitated session
This is a **joint activity**: the parent reads/narrates and teaches; the student watches visuals and answers.

1. On the student device (no login required), the student (or parent, on their behalf) enters the join code.
2. On successful join, the session becomes `active`. The module's stories/questions are sent to the student device — **without** correct answers or the parent-only teaching guide embedded in the payload.
3. Each story begins with a short **storybuilding** sequence: 2-4 narrative "beats" revealed one at a time (with an optional read-aloud button) before any questions appear, so the child gets narrative setup and context first rather than being dropped straight into Q&A.
4. The pair then works through the story's 5 questions in sequence. Each question renders on the student's screen as a **composable scene** — a themed background (market, home, park, classroom, or garden) with the story's cast of characters and the question's objects layered on top — with the 4 answer options placed as clickable "spots" inside the corners of that same scene (rather than as generic buttons below it), each marked with a small decorative icon (basket/flag/balloon/leaf).
5. Accessibility helpers available throughout: **text-to-speech** (Web Speech API) and an **easy-read / dyslexia-friendly font toggle**.
6. If the child answers incorrectly, the parent is expected to intervene directly (re-explain, prompt, guide) — the app does not auto-correct or block on wrong answers, it simply records what was answered.
7. Each story's answers are submitted as a batch to the backend and scored immediately.
8. Once all 3 stories have a submitted attempt, the session is marked `completed` and the student sees a simple **Evaluation** screen with their score.

Meanwhile, on the parent's screen, `GeneratedCode.jsx` doubles as the **live session view**: once the student connects, it polls `GET /sessions/:id/live` and mirrors whichever story the child is currently on (or has just moved past), showing the same composable scene, the story's beats, and — visible only here — the **teaching guide** for that story.

### 6.5 The parent teaching guide
Each generated story is accompanied by a short, plain-language **teaching guide** that tells the parent *how* to explain the underlying concept — not just what the story says. This guide is generated alongside the story and questions (by the same AI call, or the offline template generator's per-operation guide text), stored on `Story.parentGuide`, and shown only on the parent's live session view (`ParentGuide` component) — it is stripped out of every payload sent to the student device (see `joinSession` in `session.controller.js`).

Example: for a module on rounding numbers, where the generated story frames rounding as reading measurements off a ruler, the guide underneath the story reads:
> *"Guide: Rounding means choosing the closest 'friendly' number. Look at the digit right after the place you're rounding to - if it's 5 or more, round UP to the next ten; if it's less than 5, round DOWN and keep the current ten. Try showing your child the ruler markings from the story between the two nearby tens so they can see with their own eyes which one the measurement is closer to."*

Implementation notes:
- One guide per story, generated by `buildParentGuide()` in `ai.service.js` (one template per operation: addition, subtraction, multiplication, division, rounding), referencing the story's actual objects/context where possible.
- When the AI path is used, the model is prompted to produce its own `parentGuide` per story; `backfillCompositionFields()` fills in a template-based guide if the AI response omits one.
- Verified end-to-end (see §13) that `parentGuide` and every question's `correctAnswer` are absent from the student-facing payload, while both are present in the parent's live-session payload.

### 6.6 Parent: feedback report
1. Once the session is `completed`, the parent opens the module's report from the dashboard/profile.
2. The report is generated once (from the aggregated answer/skill data) and cached on the session, showing:
   - Overall score and performance level (needs improvement / developing / average / proficient / excellent).
   - Strengths (skills with ≥75% accuracy).
   - Weaknesses (skills with <60% accuracy), phrased concretely (e.g. *"needs improvement in addition of 2-digit numbers"*).
   - Recommendations for what to practice next and how.
3. Parent's **Profile** page lists history of past completed modules/sessions with their reports.

## 7. Functional Requirements

### 7.1 Authentication
- Parents register and log in with email + password (bcrypt-hashed). Roles: `parent`, `student` (student accounts are not required for the student flow — students never authenticate, they only use join codes).
- JWT-based auth, 7-day expiry, sent as `Authorization: Bearer <token>`.
- `GET /api/auth/me` returns the current authenticated user for session hydration on page load.

### 7.2 Module (lesson) generation
- Accepts a single PDF file per upload (`multipart/form-data`, field `file`), max 15 MB, PDF only.
- Extracts raw text from the PDF.
- Detects topic/operation (addition, subtraction, multiplication, division, or **rounding**) and digit/place-value complexity from the source text.
- Generates exactly **3 stories**, each with exactly **5 questions**, each question with exactly **4 multiple-choice options**, using a theme appropriate to the detected operation (market / money / sharing / garden / measuring — rounding modules default to the "measuring" theme, matching the ruler-based worked example from product discovery) and a pool of reusable visual asset keys split into **characters** (people) and **objects**, kept separate so sentences never read as nonsensical ("Lea bought 5 girls").
- Question phrasing is drawn from several templates per operation (see §7.8) rather than a single rigid pattern, and each story is generated with its own composition fields: `beats` (§7.8), `scene` (§7.9), and `parentGuide` (§7.7).
- Falls back to a deterministic offline generator whenever no AI key is configured or the AI call fails/returns malformed data — the upload flow must never hard-fail due to AI issues. Verified live against a real (rate-limited) `OPENAI_API_KEY`: the fallback engaged correctly and produced fully-composed stories.
- If the AI path is used and its response is missing any of `beats`/`scene`/`parentGuide`/`answerScene`, `backfillCompositionFields()` fills them in from the same templates the offline generator uses, so every story is guaranteed to have the full composition regardless of generation path.
- Only the parent who owns a module can list/see it, whether via the dashboard listing (`GET /modules`) or by id (`GET /modules/:id`) — both are scoped to `parentId`.

### 7.3 Sessions and join codes
- A session links exactly one module to one join code.
- Codes are short, unique among active sessions, and exclude visually ambiguous characters.
- Codes expire after a configurable TTL.
- Joining a session is a public (unauthenticated) action, keyed only by the code; correct answers are never sent to the student device.
- A session's status transitions: `waiting` → `active` (on student join) → `completed` (once every story in the module has a graded attempt for that session) — or `expired` if the code TTL elapses unused.

### 7.4 Quiz submission and grading
- Answers for a story are submitted as a batch (one attempt per story per session).
- Grading is exact-match string comparison against the question's correct answer.
- Submitting the final story's answers triggers module-completion detection and flips the session to `completed`.
- Progress for a session (which stories have been attempted) can be queried without authentication (for the student device to know its own progress).

### 7.5 Reporting
- A report is generated once per completed session and cached; repeat requests return the cached report instead of recomputing.
- Report generation aggregates every answer across every attempt in the session, grouped by the question's skill tag, to compute per-skill accuracy.
- Two views of the same report exist: a detailed parent view (skill breakdown, strengths/weaknesses, recommendations) and a simplified student-facing summary (score, overall performance level, short summary text).
- Parents can list their full history of completed sessions with their reports.

### 7.6 Accessibility
- Text-to-speech for question/story text (browser-native Web Speech API).
- Toggleable dyslexia-friendly / easy-read font.
- Large, high-contrast, touch-friendly answer blocks in the student UI (now rendered as in-scene answer spots by default, see §7.9, falling back to the original blocks for older content).
- (See also §11 UX reference and §12 Known Limitations.)

### 7.7 Parent teaching guide
- Each story is accompanied by a short, plain-language teaching guide (`Story.parentGuide`) explaining how to teach the underlying concept, generated alongside the story/question content.
- The guide is scoped to the concept detected for that module/story (addition, subtraction, multiplication, division, or rounding to the nearest whole number/ten/hundred), not generic advice, and references the story's own objects/context where possible.
- `GET /sessions/:id/live` (parent-only) is the only endpoint that returns `parentGuide`; `POST /sessions/join` (the student-facing endpoint) strips it out before responding.
- The parent-facing **live session view** is implemented in `GeneratedCode.jsx`: once the session is `active`, it polls the live endpoint every 4 seconds and renders the current story's scene, beats, and guide, with read-only text (no text-to-speech control on this screen yet — the parent is expected to read it directly).

### 7.8 Storybuilding beats
- Each story carries `beats`: an ordered list of 2-4 short narrative sentences (`BEATS_BY_THEME` templates, one variant picked per beat) that set up the story world before any question is asked, replacing the old single-paragraph `content` intro.
- On the student device, `StoryBeats` reveals beats one at a time (tap "Continue" to advance, tap "Start the questions" on the last one) with an optional read-aloud button, so the storybuilding moment is distinct from the Q&A moment rather than a wall of text shown all at once.
- `content` (the original single-paragraph field) is retained as a fallback for older/malformed AI responses that don't include `beats`.

### 7.9 Composable story scenes and integrated answers
- Each story carries a `scene`: a `background` key (`market`, `home`, `park`, `classroom`, or `garden`) and 1-2 `characters` (people, e.g. `girl`, `teacher`) — reused across the story's intro and all 5 of its questions, while the specific `objects` shown vary per question (`Question.visualAssets`).
- The `StoryScene` component renders these as stacked layers (background gradient + backdrop emoji, then character/object emoji) so the layering is structurally ready to swap any layer for a real PNG/SVG or AI-generated image without changing how callers use the component — MVP still renders each layer as an emoji, per the product's MVP static-asset scope.
- Each question carries `answerScene`: one entry per choice with a `marker` (basket/flag/balloon/leaf — decorative only, not a counted object) and a `position` (one of the 4 corners of the frame). The student taps directly on these in-scene "answer spots" instead of a separate row of quiz buttons, satisfying the "options integrated into the story frame" requirement from product discovery.
- A CSS-only fallback (`AnswerBlock`, the original Kahoot-style buttons) still renders if a story's `answerScene` is empty, so older generated modules continue to work.

## 8. Data Model (as implemented)

| Entity | Key fields | Relationships |
|---|---|---|
| **User** | id, name, email (unique), password (hashed), role (`parent`\|`student`) | has many Module, has many Session |
| **Module** | id, title, sourceFileName, extractedText, topic, status (`processing`\|`ready`\|`failed`) | belongs to User (parentId); has many Story; has many Session |
| **Story** | id, orderIndex, title, content, visualAssets (JSON), theme (`market`\|`money`\|`sharing`\|`measuring`\|`garden`), `beats` (JSON array of narrative sentences), `scene` (JSON: `{background, characters}`), `parentGuide` (text, parent-only teaching guide, stripped from student payloads) | belongs to Module; has many Question; has many Attempt |
| **Question** | id, orderIndex, text, choices (JSON, 4 options), correctAnswer, skillTag, visualAssets (JSON), `answerScene` (JSON array of `{label, marker, position}`, one per choice) | belongs to Story; has many Answer |
| **Session** | id, code (unique), studentName, status (`waiting`\|`active`\|`completed`\|`expired`), expiresAt | belongs to User (parentId) and Module; has many Attempt; has one Report |
| **Attempt** | id, score, totalQuestions, completedAt | belongs to Session and Story; has many Answer |
| **Answer** | id, givenAnswer, isCorrect | belongs to Attempt and Question |
| **Report** | id, overallScore, performanceLevel, strengths (JSON), weaknesses (JSON), recommendations (JSON), summary | belongs to Session |

Schema is managed via Sequelize `sync({ alter: true })` on boot (no formal migration files at this stage).

## 9. API Surface (as implemented)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a parent account |
| POST | `/api/auth/login` | Public | Log in, returns JWT |
| GET | `/api/auth/me` | Parent | Current user |
| POST | `/api/modules/upload` | Parent | Upload PDF, generate 3 stories × 5 questions |
| GET | `/api/modules` | Parent | List own modules |
| GET | `/api/modules/:id` | Parent | Get one module with nested stories/questions |
| POST | `/api/sessions` | Parent | Generate a join code for a ready module |
| GET | `/api/sessions` | Parent | List own sessions |
| GET | `/api/sessions/:id` | Parent | Get one session with module + attempts |
| GET | `/api/sessions/:id/live` | Parent | Live-session facilitator view: current story (with beats/scene/teaching guide) the child is on |
| POST | `/api/sessions/join` | Public | Student joins via code + name (response excludes `parentGuide` and `correctAnswer`) |
| POST | `/api/quiz/submit` | Public | Submit answers for one story |
| GET | `/api/quiz/session/:sessionId/progress` | Public | Attempts so far for a session |
| GET | `/api/reports/session/:sessionId` | Parent | Full feedback report |
| GET | `/api/reports/session/:sessionId/summary` | Public | Student-facing results summary |
| GET | `/api/reports/history` | Parent | History of completed modules/reports |
| GET | `/api/health` | Public | Health check |

## 10. Architecture & Tech Stack

```
Frontend (React + Vite, served via nginx)
        │  REST/JSON over HTTPS/HTTP
        ▼
Backend (Node.js + Express)
        │  Sequelize ORM
        ▼
MySQL 8
        │
        ▼
AI story generation (OpenAI, gpt-4o-mini by default)
   → deterministic offline template generator as fallback
```

- **Frontend:** React 18, React Router 6, Vite, Axios, Web Speech API. Parent flow uses JWT (localStorage) + React Context for auth; student flow is unauthenticated and uses sessionStorage for the current session/module.
- **Backend:** Express 4, Sequelize 6 (MySQL dialect via `mysql2`), JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), file upload via `multer`, PDF text extraction via `pdf-parse`, AI generation via the `openai` SDK.
- **Infra:** Docker + Docker Compose. Services: `mysql` (8.0, with healthcheck), `backend` (Express API on port 4000), `frontend` (Vite build served by nginx, port 5173), `adminer` (DB inspection UI, port 8080). Single `docker-compose up --build` from the repo root brings up the entire stack. Setup instructions live in `RUNNING.md`.

## 11. UX Reference

The implemented UI follows the wireframes/vision provided during discovery, covering:
- Landing screen with icon/branding treatment and a calm, neurodiversity-aware color palette.
- Separate Login screens for desktop and mobile layouts.
- Role selection (Student / Parent) on both layouts.
- Student: **Enter code** screen; Parent: **Upload material** screen and a generated **join code** display screen that becomes a **live session view** once the student connects.
- Student play screen: storybuilding beats revealed one at a time, followed by a composable scene (background + characters + objects) per question with answer options placed as spots inside the scene frame, plus text-to-speech and easy-read font toggles.
- Parent's live session view: the same composable scene and beats as the student sees, plus a teaching guide box not shown to the student.
- Parent-facing **evaluation/report** screen showing module title, score, performance level, and a written description.
- Parent **profile/history** page listing past modules as cards.

These wireframes were the source of truth for layout intent; the "options integrated into the story frame" and "background/people/objects" composition requirements from the wireframe review are now implemented (§7.9). Actual artwork is still MVP-scope emoji/CSS-gradient placeholders rather than custom PNG/SVG or AI-generated art — the `StoryScene` component's layered structure is designed so any layer can be swapped for real artwork later without changing how the rest of the app calls it.

## 12. Known Limitations (current MVP)

- `JWT_SECRET` has a hardcoded development fallback (`dev_secret`) if not set in the environment — must be overridden with a strong secret before any non-local deployment.
- CORS is currently open (no origin restriction) — acceptable for local/dev use, should be locked down before production deployment.
- No automated tests currently exist in either the frontend or backend package.
- No formal DB migration files; schema changes rely on `sequelize.sync({ alter: true })` at boot.
- Story visuals are still emoji/CSS-gradient placeholders rather than custom or AI-generated artwork — the composable `StoryScene` structure (§7.9) is in place, but the art itself is still MVP-scope.
- No live/real-time sync between parent and student screens beyond the join-code handshake and polling (both the student's story progress and the parent's live session view poll/advance via regular request-response, not push/websocket); there's no push notification when a student finishes.
- The parent's live session view shows read-only text and does not currently offer its own text-to-speech control (the parent is expected to read the story/guide directly); the student side's TTS remains unaffected.
- `getModule`/`listModules` for a parent's own dashboard now filter by `parentId`, closing a prior gap where `GET /modules/:id` could be fetched by id alone.

## 13. Implemented Roadmap (formerly "planned")

The following were tracked as roadmap items in a previous revision of this PRD and have since been implemented:

1. **Parent-facing live session view + teaching guide** — `GET /sessions/:id/live` + `GeneratedCode.jsx` (§6.4, §6.5, §7.7).
2. **Pre-assessment storybuilding** — `Story.beats` + `StoryBeats` component (§7.8).
3. **Less literal story patterns** — multiple phrasing templates per operation in `ai.service.js`, plus a themed vocabulary/character pool that varies per story (§7.2).
4. **Answer options integrated into the story frame** — `Question.answerScene` + `StoryScene`'s in-frame answer spots (§7.9).
5. **Composable story frames (background/people/objects)** — `Story.scene` + `StoryScene` component's layered rendering (§7.9).

Verification performed for this implementation pass (see also §12 for what remains a known limitation):
- Backend: all modified/created files pass `node --check`; a Node script exercised the offline story generator across addition/subtraction/multiplication/division/rounding topics and asserted every story has `beats`, a `scene` with a `background`, a `parentGuide`, and every question has exactly 4 choices with a valid `correctAnswer` and a 4-entry `answerScene` with unique corner positions.
- Frontend: `npm run build` (Vite) succeeds with no errors after all changes.
- Full-stack: ran `docker compose up --build` and exercised the real HTTP API end-to-end (register → module creation with the new fields → session creation → parent live view while waiting → student join → parent live view while active → quiz submission across all 3 stories → parent report → student summary). Confirmed `parentGuide` and `correctAnswer` are present in the parent's `/sessions/:id/live` response and absent from the student's `/sessions/join` response. Confirmed the live view's `currentStoryIndex` advances by 1 after each submitted story and the session reaches `completed` status via both the live and non-live session endpoints. Also confirmed live, in the running container, that a real (rate-limited) `OPENAI_API_KEY` call fails over to the offline generator without the request failing.
- Not independently re-verified: the AI-backed (`OPENAI_API_KEY` present and successful) generation path's adherence to the new prompt schema, since the configured key was rate-limited during this session — the offline fallback path was exercised instead, and `backfillCompositionFields()` provides a safety net if the AI response is ever missing the new fields.

## 14. Success Metrics (suggested)

- Time from PDF upload to a ready, playable module.
- % of uploaded modules that succeed via AI generation vs. falling back to the offline generator.
- Session completion rate (joined → completed).
- Report usefulness as perceived by parents (qualitative, until instrumented).
- Accessibility feature usage (text-to-speech / easy-read font toggle engagement).
- Parent engagement with the live session view and teaching guide during active sessions (once instrumented).

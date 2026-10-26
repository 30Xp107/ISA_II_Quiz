# Fieldnote Live Quiz

A privacy-first live quiz application built from `mern_quiz_game_requirements.md`. The participant and host experiences use invented demo records only. The existing sample workbook is intentionally not read, copied, or seeded into the application.

## Run locally

Requirements: Node.js 20+ and npm.

```sh
npm install
npm install --prefix client
npm run dev
```

Open `http://localhost:5173`. Without a local `.env`, development sign-in defaults to `admin@example.test` / `local-development-password`. To exercise durable local storage, copy `.env.example` to `.env` and set `MONGODB_URI`. Never use these development credentials in production. MongoDB is optional only in development, where sessions use a process-local adapter. Production refuses to operate without the required configuration.

Run `npm run build` for the frontend production build and `npm test` for the scoring and API tests. `GET /api/health` reports the current persistence mode.

## Current implementation

- Authenticated host creates a lobby, shares a session URL and QR code, starts timed questions, pauses/resumes the timer, closes a question, advances stages, and views stage/final rankings. The host console lists the current answer choices and reveals the correct choice and explanation as soon as a question closes. A Projector show section previews the audience screen, and `/?projector=<CODE>` opens that screen in a dedicated tab with the join QR, timer, choices, and leaderboards. After the final results, the host can replay the same room: participants stay joined and all scores reset. Admin session state is restored from storage after a browser reload.
- The host console and projector screen play a synthesized background-music loop from the lobby until the final results, using the Web Audio API (no audio files or third-party media). The music note button toggles it independently of short sound effects, and a BroadcastChannel handshake keeps the host tab silent while a standalone projector tab is open. Participant devices play only the short sound cues.
- Admin can edit prompts, answer choices, correct answers, explanations, add/remove/reorder questions, and save validated stage banks. Changes apply to new sessions; each session keeps its original question snapshot.
- Participants join with a unique session nickname and one of the curated avatars. The browser reconnects to session state using the session code and participant ID held in session storage.
- The API validates submissions, enforces one answer per participant per question, closes expired timers, and calculates points. Multiple-choice scoring is 700 base points plus up to 300 speed points. Stage 5 awards up to 1,000 points with equal partial credit for twelve synthetic row findings. Rankings break ties by score, correct findings, then faster response time.
- Stages 1–4 each have ten seed questions. Stage 5 has a twelve-row synthetic challenge with a three-minute timer and classifications for invalid dates, missing values, malformed formats, names needing review, whitespace, possible matches, and clean rows. The question examples and challenge answer key live in `api/questions.js` and `api/scoring.js`.
- The client polls session state every 1.6 seconds. This works with serverless request/response hosting but is not a persistent socket connection. Mongo-backed session documents use optimistic revisions to prevent conflicting writes. Internal participant answer-token IDs are not exposed to other participants.

## Important prototype limits

The application now has MongoDB-backed durable sessions and question-bank configuration, protected host controls, password-hash authentication, request validation, Helmet headers, pause/resume, and a question editor. The in-memory adapter exists only for local tests/development and must not be used in production. Before a real event, configure and test MongoDB Atlas and the deployment provider, restrict database network access and credentials, and smoke-test CORS, QR links, admin login, reconnects, and parallel participants on the deployed URL. Question version history/restore, configurable scoring and per-question timers, participant removal, response distribution reporting, Stage 5 shortcut/formula simulation, and end-to-end deployment tests remain outstanding. The request limiter is process-local; use a shared store or provider WAF/rate-limit policy before public deployment. A successful local build is not deployment certification.

## Deployment notes

The frontend is a Vite static build in `client/`; `api/index.js` is an Express handler that Vercel can invoke as a Node function. Create a MongoDB Atlas database and least-privilege user, then configure Vercel environment variables: `MONGODB_URI`, `JWT_SECRET` (at least 32 random characters), `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `CLIENT_URL` (exact deployed frontend origin). Generate the password hash locally with `npm run admin:hash-password`; enter its output as a deployment secret. Never put a plaintext production password in Vercel configuration or source. Do not set `ADMIN_PASSWORD` in production. Verify the build output (`client/dist`) and routes in a preview deployment before promoting to production.

Vercel serverless functions should not be treated as a guarantee of long-lived Socket.IO connections. The app uses polling and stores authoritative session state in MongoDB, not in a function's memory. The included rate limit is process-local; use a shared rate-limit store or edge/WAF policy for robust global login throttling across serverless instances. For low-latency push updates, use a managed realtime provider; do not claim persistent sockets unless the selected hosting plan supports them.

## Privacy and security

Use only invented demo data. Do not place source-workbook records, real beneficiary data, credentials, tokens, or secrets in source, seed files, screenshots, exports, or logs. Production startup requires a strong `JWT_SECRET`, `MONGODB_URI`, an admin email and password hash, and an explicit `CLIENT_URL`. Host API endpoints require a signed admin token; participants only receive their own result after the round reveal.
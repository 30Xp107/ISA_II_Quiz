# Deployment guide — Fieldnote Live Quiz on Vercel

This project deploys **frontend and backend together as one Vercel project**:

- `api/index.js` — Express API running as a Vercel Node function
- `client/` — Vite/React static build
- MongoDB Atlas — durable session and question-bank storage
- Updates use 1.6-second polling, not WebSockets, so serverless hosting is supported

`vercel.json` is already configured. Do **not** split the frontend and backend into two projects: the client calls the relative `/api` path.

---

## 0. Pre-flight checks (local)

Requirements: Node.js 20+ and npm.

```sh
npm ci
npm --prefix client ci
npm test
npm run build
```

`npm test` should report all tests passing and `npm run build` should write `client/dist`.

Optional local run:

```sh
copy .env.example .env    # Windows
npm run dev
```

Open http://localhost:5173.

> Never commit `.env`, `SAMPLE DATA.xlsx`, real records, or production credentials. `.gitignore` and `.vercelignore` already exclude them.

---

## 1. Create the production database (MongoDB Atlas)

1. Sign in at https://cloud.mongodb.com and create a project.
2. Create a free **M0** cluster (a paid tier is recommended for a large live event).
3. **Database Access** → add a database user with a strong password.
   - Give it `readWrite` on the quiz database only (least privilege).
4. **Network Access** → add an IP access rule.
   - Vercel functions use dynamic IPs on the Hobby plan, so `0.0.0.0/0` is the usual choice. Use a strong password and consider a paid private networking option for stricter security.
5. **Connect → Drivers** → copy the `mongodb+srv://...` connection string.
6. Add a database name before the query string, for example:

```text
mongodb+srv://quiz_user:PASSWORD@cluster0.xxxxx.mongodb.net/fieldnote?retryWrites=true&w=majority
```

Keep this value secret.

---

## 2. Generate the administrator password hash

Production sign-in uses a bcrypt hash, never a plaintext password.

From the project root, in an **interactive terminal**:

```sh
npm run admin:hash-password
```

Type a password of at least 14 characters when prompted. Copy the resulting hash (it starts with `$2a$12$` or `$2b$12$`) and keep it for the next step.

Do **not** set `ADMIN_PASSWORD` in Vercel.

Generate a strong JWT secret (at least 32 characters):

```sh
# Git Bash / macOS / Linux
openssl rand -base64 48

# PowerShell 7
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

---

## 3. Push the project to GitHub

This folder already has its own local Git repository. Check it:

```sh
git status
git log --oneline -1
```

If you are starting from a fresh copy instead, initialize it:

```sh
git init
git add .
git commit -m "Fieldnote Live Quiz"
```

Add a GitHub remote and push:

```sh
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin main
```

Before pushing, confirm the workbook and secrets are excluded:

```sh
git status --ignored --short | findstr /i "xlsx .env"
```

Neither `SAMPLE DATA.xlsx` nor `.env` should be staged or pushed.

> Deploy from this project folder, not from `C:\Users\L1nk99`. The parent folder is a separate, unrelated Git repository.

---

## 4. Import the project into Vercel

1. Sign in at https://vercel.com and choose **Add New → Project**.
2. Import the GitHub repository.
3. **Root Directory**: leave it as the repository root. Do **not** select `client`.
4. **Framework Preset**: `Other` is safest. `vercel.json` defines the builds and routes.
5. Leave Build Command / Output Directory overrides empty — they are handled by `vercel.json`.
6. Add the environment variables before the first production deployment (next step), or add them now and redeploy afterwards.

The included configuration:

- builds `api/index.js` as a Node function
- builds `client/package.json` with `@vercel/static-build` into `client/dist`
- routes `/api/*` to the Express function
- serves the React app for every other path

---

## 5. Configure environment variables

Vercel → Project → **Settings → Environment Variables** → add these for **Production** (and **Preview** if you use preview deployments):

| Name | Value | Notes |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | Required; include the database name |
| `JWT_SECRET` | 48+ random characters | At least 32 characters |
| `ADMIN_EMAIL` | e.g. `host@your-domain.com` | Login email |
| `ADMIN_PASSWORD_HASH` | `$2a$12$...` | Output of step 2 |
| `CLIENT_URL` | `https://your-project.vercel.app` | Exact origin, no trailing slash |
| `PORT` | not needed on Vercel | Ignore |

Rules:

- **Do not** set `ADMIN_PASSWORD` in production.
- If you want preview URLs to be explicitly allow-listed, add them comma-separated:
  `https://your-project.vercel.app,https://your-project-git-main.vercel.app`
- Changing environment variables requires a **new deployment** before they take effect.
- If you attach a custom domain later, update `CLIENT_URL` to that origin (or add it to the list).

The API refuses to start in production without `MONGODB_URI`, a 32+ character `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `CLIENT_URL`.

---

## 6. Deploy and verify

Trigger the deployment (Vercel does this automatically when the repo is imported or when you push to `main`).

Then verify:

1. Open `https://your-project.vercel.app/api/health`.
2. Expected response:

```json
{ "status": "ok", "persistence": "mongodb" }
```

If it says `memory-development-only`, `MONGODB_URI` is missing. If it is `unavailable`, MongoDB cannot be reached.

---

## 7. Smoke test before the real event

Run this on the deployed URL, with a phone and the projector computer.

### Admin and session
- [ ] Sign in with `ADMIN_EMAIL` and the password used in step 2.
- [ ] Create a session; a code, join link, and QR code appear.
- [ ] Copy the join link and open it on a phone.
- [ ] Reload the admin page; the session is restored.

### Participant
- [ ] Join with a nickname and avatar.
- [ ] Duplicate nickname (case-insensitive) is rejected.
- [ ] Start the quiz; the question and timer appear on the phone.
- [ ] Submit an answer; it is locked in.
- [ ] Refresh the phone mid-session; it reconnects to the same player.

### Host controls
- [ ] The current question and all choices are visible on the host console.
- [ ] Pause and resume; countdown behaves correctly.
- [ ] End the question early; the correct choice and explanation appear.
- [ ] Advance through all five stages.
- [ ] The stage top-five and final top-five rankings display.
- [ ] Export CSV only contains quiz fields.
- [ ] **Play again** returns the room to the lobby with the same players and scores reset.

### Projector and media
- [ ] Open **Projector show → Open in new tab** (`/?projector=<CODE>`).
- [ ] The QR is visible in the lobby and hidden after the start.
- [ ] Large question, choices, timer, response count, and leaderboard render correctly.
- [ ] Background music starts; the music button mutes/unmutes it.
- [ ] Only one tab plays music when both the host console and projector tab are open on the same computer.

### Stage 5
- [ ] Twelve synthetic rows appear on participant devices.
- [ ] Findings can be selected for every row.
- [ ] Submitting before the timer expires records the challenge.
- [ ] Review notes and partial credit appear after the reveal.

### Operational
- [ ] Check Vercel → Deployments → Functions logs for errors.
- [ ] Confirm documents exist in the Atlas `quizsessions` collection.
- [ ] Test with at least two participants answering at the same time.
- [ ] Test one late answer (after the timer) and confirm it is rejected.
- [ ] Test a fifth participant or fewer-than-five case for leaderboards.

---

## 8. Updating the deployment

```sh
git add .
git commit -m "Describe the change"
git push
```

Vercel redeploys automatically. Database data is unaffected.

To roll back, use Vercel → Deployments → select a previous deployment → **Promote to Production**.

---

## 9. CLI deployment (alternative to GitHub)

```sh
npm i -g vercel
vercel login
vercel            # preview deployment
vercel --prod     # production deployment
```

Add environment variables with `vercel env add <NAME>` (choose Production/Preview) or in the dashboard. `.vercelignore` prevents local dependencies, builds, secrets, and the workbook from being uploaded.

---

## 10. Known serverless limits

These are design trade-offs, not deployment failures:

- **Polling**: clients refresh every 1.6 seconds. Updates can lag by up to ~1.6s and each participant generates regular function invocations. Watch Vercel usage for large rooms.
- **No WebSocket/Socket.IO**: do not add long-lived sockets; use a managed realtime provider if sub-second updates are required.
- **Rate limiting is per function instance**: the built-in limiter is not a global edge limit. Add a shared store (for example Upstash Redis) or a Vercel WAF rate-limit rule for production abuse protection.
- **MongoDB connections**: each warm function instance opens up to 10 connections (`maxPoolSize: 10`). Size the Atlas tier for the number of concurrent instances, or lower the pool size.
- **Cold starts**: the first request after idle may be slower.
- **Auto-reveal**: when a timer expires, the next poll flips the session to `reveal` and saves it. Concurrent polls tolerate the race and return a valid snapshot.
- **Production storage**: the in-memory adapter is development/test only. Production requires MongoDB.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `/api/health` is `unavailable` or 503 | Atlas unreachable | Check `MONGODB_URI`, database user password, network access rule |
| `/api/health` shows `memory-development-only` | `MONGODB_URI` missing | Add it in Vercel and redeploy |
| Admin login always returns 401 | Wrong email/hash | Recheck `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`; generate a new hash if needed |
| Host actions return 401 after a while | Admin token expired (8 hours) | Sign in again |
| `/api/*` returns 404 | Root Directory set to `client` | Set Root Directory to the repository root and redeploy |
| Build fails on `dist` or missing `vite` | Install/build mismatch | Confirm `vercel.json` is at the repo root and the Root Directory is not `client` |
| Browser shows CORS errors | `CLIENT_URL` does not match the origin | Set the exact `https://...` origin, comma-separate multiple origins, redeploy |
| `Session changed during this request` (409) | Two host actions or deadline writes collided | Retry the action; expected occasionally under concurrency |
| Player state seems stale | 1.6s polling | Wait one interval; verify `/api/health` |
| Function logs show Mongo timeout | Cold start or network rule | Retry once; check Atlas status and network access |

---

## 12. Privacy reminder

This application is intended for **synthetic demo data only**.

Before deploying:

- Do not commit or upload `SAMPLE DATA.xlsx` or any real beneficiary data.
- Do not put credentials, tokens, or production exports in screenshots, logs, or the repository.
- Keep `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, and deployment secrets only in Vercel's environment settings.
- Use nicknames and generated session identifiers only.

# MERN Quiz Game Website --- Project Requirements

## 1. Project Overview

Build a responsive, Kahoot-style quiz game using the MERN stack. The
application will be used for live training sessions projected on a
screen, with participants joining from their own phones, tablets, or
computers through a shareable link or QR code.

The quiz should feel energetic and game-like, with animated transitions,
sound effects, timers, live progress, leaderboards, and an administrator
dashboard. The questions should teach computer basics, WGP-related data
quality, Excel skills, and responsible data privacy practices.

**Privacy requirement:** Do not use real beneficiary records or the
original sample workbook's real data in the deployed quiz. Use only
invented, clearly synthetic names, identifiers, dates, and card numbers.
Do not include actual personal data in source code, seed files,
screenshots, logs, or demo content.

## 2. Technology Stack

-   **Frontend:** React with Vite
-   **Backend:** Node.js and Express
-   **Database:** MongoDB with Mongoose
-   **Real-time gameplay:** Socket.IO or an equivalent WebSocket-based
    approach
-   **Styling and animation:** Responsive CSS/Tailwind or Bootstrap,
    plus Framer Motion or a similar animation library
-   **Charts and reports:** A suitable React charting library
-   **QR code:** Generate a QR code that opens the current game
    session's participant join page
-   **Deployment:** Vercel-compatible frontend and backend, with MongoDB
    Atlas or another compatible hosted MongoDB service

Organize the repository so the frontend and backend can be deployed to
Vercel. Use Vercel-compatible serverless API routing for the backend and
document any limitations of long-lived WebSocket connections on the
chosen hosting plan. If persistent real-time sockets are not supported
by the selected deployment configuration, use a compatible managed
real-time service or a documented polling/serverless alternative rather
than claiming unsupported functionality.

## 3. Participant Experience

1.  Participants scan the displayed QR code or open the session link.
2.  They enter a nickname.
3.  They select an avatar icon or emoji.
4.  The lobby shows participants who have joined, without exposing
    private personal information.
5.  The host starts the quiz and advances through the stages.
6.  Participants answer timed questions and receive feedback, points,
    and progress updates.
7.  Stage leaderboards show the top five participants.
8.  After Stage 5, the system calculates and displays the final overall
    top five based on the cumulative score across all five stages.

Requirements: - Mobile-first, responsive interface for phones, tablets,
laptops, and projector displays. - Nickname validation and
duplicate-nickname handling within a session. - A curated set of
accessible emoji/avatar choices. - Clear connection status and a safe
reconnect experience. - Animated countdown, answer selection,
correct/incorrect feedback, score changes, stage transitions, and
leaderboard reveals. - Sound effects for countdowns, answer submission,
correct/incorrect answers, stage completion, and winners. - Include a
mute/unmute control; sounds must not be required to understand the
quiz. - Do not reveal the correct answer to participants before the
question closes. - Prevent multiple submissions for the same question
and ignore answers received after the timer expires. - Avoid relying on
color alone to communicate correct/incorrect answers.

## 4. Quiz Structure: Five Stages

### Stage 1 --- Parts of a Computer

Create multiple-choice questions about basic computer hardware and
components, such as: - CPU and its purpose - RAM versus storage -
Motherboard - Monitor, keyboard, and mouse - Printer and scanner -
Storage devices - Input, output, and processing devices - Basic
troubleshooting and safe computer handling

Use a maximum of **20 questions** in this stage. Questions should have
clear wording, plausible answer choices, a correct answer, and a
configurable timer.

### Stage 2 --- Data Quality and Common Record Errors

Use synthetic examples to teach participants how to identify data-entry
problems, including: - Incorrect or inconsistent birthday/date formats -
Incomplete or malformed HHID - Missing, malformed, or inconsistent WGP
ID - Incorrect-length or malformed EBT card number - Missing or
malformed PK number - Names containing numbers or inappropriate special
characters - Missing required fields - Leading/trailing spaces and
inconsistent capitalization - Invalid values and inconsistent formats

Use a maximum of **20 multiple-choice questions**. Do not use real IDs,
real card numbers, real beneficiaries, or real records.

### Stage 3 --- Validation, Duplicates, and Matching

Use a maximum of **20 multiple-choice questions** on: - Exact duplicates
versus possible matches - Duplicate household/person records - Name
variations and spelling differences - Crossmatching records using
appropriate fields - Why a single matching field may be insufficient -
Missing values and inconsistent identifiers - Validation checks and
exception handling - How to flag records for review without making
unsupported assumptions

Use only fabricated records and synthetic identifiers. Explain that a
possible match should be reviewed rather than automatically treated as a
confirmed duplicate.

### Stage 4 --- Data Privacy and Responsible Handling

Use a maximum of **20 multiple-choice questions** on: - Data
minimization and purpose limitation - Appropriate access controls -
Secure sharing and storage - Avoiding personal data in screenshots,
public links, and presentations - Handling files and exports safely -
Reporting suspected data exposure - Verifying recipients before sending
files - Avoiding passwords, tokens, or sensitive data in source code and
logs - Safe use of dummy data for demonstrations - Responsible handling
of beneficiary information

Use practical scenarios with invented examples. The quiz should
reinforce privacy-aware work practices and must not reproduce
confidential source records.

### Stage 5 --- Excel-Style Interactive Data Challenge

Build an interactive, spreadsheet-like challenge in the browser. This
stage should feel like a simplified Excel worksheet, not a standard
multiple-choice-only stage.

Use a **synthetic dataset** with invented names and obviously fake
identifiers. The dataset should resemble the types of columns used in
data validation without copying any real sample data. Possible columns:

-   Record No.
-   Synthetic HHID
-   Synthetic WGP ID
-   Synthetic EBT Card Number
-   Synthetic PK Number
-   First Name
-   Middle Name
-   Last Name
-   Birthday
-   Province
-   Municipality
-   Validation Result
-   Remarks

Provide tasks that ask participants to identify issues such as: - Wrong
birthday format or impossible dates - Incomplete HHID, WGP ID, EBT card
number, or PK number - Names containing numbers or unexpected special
characters - Duplicate records - Missing required fields -
Leading/trailing spaces - Inconsistent capitalization or date
formatting - Records that need manual review instead of automatic
rejection

The stage should support spreadsheet-like interactions where feasible: -
Select a cell or row. - Navigate using keyboard shortcuts. - Mark a row
or field as having an issue. - Choose or enter a validation remark. -
Submit the completed challenge before the timer expires. - Show a
results review after submission, including correct findings and
explanations.

Include a safe, limited set of Excel-inspired shortcuts and functions,
with an on-screen help panel. Examples to teach or simulate: - `Ctrl+C`,
`Ctrl+V`, `Ctrl+X`, `Ctrl+Z`, `Ctrl+Y` - `Ctrl+F` for find - `Ctrl+A`
for select all within the challenge area - Arrow keys and `Tab` for
navigation - `SUM`, `COUNT`, `COUNTA`, `IF`, `COUNTIF`, `XLOOKUP` or
`VLOOKUP`, and basic text/date validation concepts

Do not intercept browser or operating-system shortcuts in ways that
disrupt normal navigation. Clearly label which shortcuts and formulas
are actually implemented in the quiz simulator and which are
instructional examples. Formula evaluation should be limited to a safe,
predefined set of functions; do not use `eval()` to execute user-entered
formulas.

## 5. Question, Timing, and Scoring Rules

-   Stages 1--4 each support up to **20 questions**.
-   Stage 5 is the interactive spreadsheet challenge and should have a
    configurable time limit.
-   The administrator can configure the time limit per question,
    preferably in seconds, and configure stage-level duration where
    appropriate.
-   The interface should display a visible countdown timer and progress
    indicator.
-   The host controls when a stage/question begins and ends, unless an
    explicitly configured automatic mode is enabled.
-   Answers submitted after time expires must not be counted.
-   Correct answers earn points. The scoring model should be
    configurable and documented.
-   If speed bonuses are used, show how they are calculated and keep
    scoring consistent.
-   Stage scores must be saved separately from the cumulative total.
-   Prevent duplicate scoring from repeated submissions or reconnect
    events.
-   Define a deterministic tie-break rule, such as total correct answers
    and then completion time, and show the rule to the administrator.
-   For Stage 5, score the number and severity of correctly identified
    issues, with partial credit where appropriate.

## 6. Leaderboards and Final Results

-   At the end of **each stage**, display the **top five participants
    for that stage**, ranked by that stage's score.
-   If fewer than five participants have a valid score, show only those
    who qualify.
-   At the end of Stage 5, consolidate scores from all five stages.
-   Display the **final overall top five**, ranked by cumulative score
    across Stages 1--5.
-   Show stage-by-stage score breakdowns and total score on the final
    results screen.
-   Keep participant-facing results limited to nicknames and selected
    avatars; do not display private account or personal information.
-   Allow the administrator to export results as CSV or Excel-compatible
    data, containing only quiz-related fields.

## 7. Administrator Dashboard

Create a protected admin interface with the following features:

### Live session controls

-   Create a quiz session and generate its join link and QR code.
-   Open or close the lobby.
-   View participant count and participant join status.
-   Start, pause, resume, and end a quiz.
-   Advance to the next question or stage.
-   Display the current question, timer, response count, and answer
    distribution.
-   Show live progress without exposing answers prematurely.
-   Reconnect or remove a participant when necessary.

### Quiz editor

-   Create, edit, duplicate, reorder, enable, or disable questions.
-   Edit question text, answer choices, correct answer, explanation,
    stage, and difficulty.
-   Configure question time limits.
-   Configure stage settings and Stage 5 challenge duration.
-   Preview questions before publishing.
-   Validate that each multiple-choice question has a correct answer and
    valid choices.
-   Provide a way to restore a previous saved version or confirm before
    destructive changes.

### Reporting

-   Show current and completed sessions.
-   View participant progress, per-stage scores, cumulative scores,
    response times, and final rankings.
-   Export results in CSV or Excel-compatible format.
-   Clearly distinguish live, paused, completed, and abandoned sessions.
-   Avoid storing unnecessary personal information. Use nicknames and
    generated session identifiers for the quiz.

### Admin security

-   Require authenticated administrator access.
-   Protect admin API endpoints on the server, not only in the frontend.
-   Store secrets in environment variables.
-   Apply input validation, rate limiting, secure session/token
    handling, and appropriate CORS rules.
-   Do not hard-code administrator passwords or API keys.
-   Never expose MongoDB credentials or server secrets to the frontend.

## 8. Projector and QR-Code Display

Create a host/projector view with: - Large, readable typography and high
contrast. - Current stage and question number. - A prominent countdown
timer. - Large answer options with clear visual distinctions. - Join URL
and QR code while the lobby is open. - Participant count and lobby
status. - Stage top-five leaderboard and final overall top-five
leaderboard. - Animated transitions that remain readable and do not
distract from the question. - A host-controlled option to hide the QR
code after the session begins.

The QR code must point to the actual deployed participant join URL for
the current session. Do not use a hard-coded localhost URL in
production.

## 9. Suggested Data Models

Use Mongoose schemas with appropriate validation and indexes. Final
schemas may differ, but should cover:

-   **AdminUser:** authentication identity, role, created/updated
    timestamps.
-   **Quiz:** title, description, stage configuration, publication
    status, settings.
-   **Question:** stage, type, prompt, options, answer key, explanation,
    time limit, points, order, enabled status.
-   **QuizSession:** quiz reference, unique join code, status, host
    state, current stage/question, timestamps.
-   **Participant:** session reference, nickname, avatar,
    connection/participation status, join time.
-   **AnswerSubmission:** session, participant, question, answer
    payload, correctness, points, response time, submission timestamp.
-   **StageResult:** session, participant, stage, score, correct count,
    completion time.
-   **FinalResult:** session, participant, per-stage breakdown,
    cumulative score, rank.

Add indexes for session codes, participant/session uniqueness, and
answer-submission uniqueness where appropriate. Store only the minimum
information required for gameplay and reporting.

## 10. API and Real-Time Events

Design and document REST endpoints for: - Admin authentication - Quiz
and question CRUD - Session creation and management - Participant
joining - Session status and current question retrieval - Answer
submission - Stage and final results - CSV export

If using real-time events, document event names and payloads for: -
Participant joined/left - Lobby updates - Quiz started/paused/resumed -
Question started/ended - Answer count updates - Score/leaderboard
updates - Stage changed - Quiz completed

Validate every payload on the server. The server is the authority for
timers, correct answers, scoring, and rankings. Do not trust
client-submitted scores or correctness claims.

## 11. Vercel Deployment Requirements

The project must be prepared for deployment with Vercel-compatible
frontend and backend configurations.

Include: - A clear repository structure, for example `/client` and
`/api` or `/server`. - Vercel configuration files appropriate to the
chosen architecture. - A `.env.example` file with placeholder values
only. - MongoDB Atlas setup instructions. - Environment variables such
as: - `MONGODB_URI` - `JWT_SECRET` or equivalent authentication secret -
`CLIENT_URL` - `VITE_API_BASE_URL` (only if required by the chosen
frontend setup) - Any real-time provider credentials, if a managed
service is selected - Build and start/development scripts. - CORS and
production URL configuration. - Instructions for testing the deployed
app from a phone and from the projector computer. - Notes on serverless
execution limits and real-time transport compatibility. - No secrets or
real records committed to Git.

Do not promise that persistent Socket.IO connections will work on every
Vercel serverless configuration. Select and document a practical
real-time architecture that is compatible with the actual hosting setup.

## 12. Accessibility, Reliability, and Testing

-   Support common modern browsers on desktop and mobile.
-   Make all essential controls keyboard accessible.
-   Provide visible focus states and sufficient contrast.
-   Include sound controls and reduced-motion considerations.
-   Handle network interruptions and participant reconnection.
-   Keep the host's session state consistent when participants
    reconnect.
-   Validate timers and scoring on the server.
-   Test simultaneous answers, late answers, duplicate submissions,
    ties, empty sessions, and fewer than five participants.
-   Test Stage 5 keyboard navigation and formula/shortcut behavior.
-   Include automated tests for scoring, validation, authorization, and
    stage progression.
-   Include a manual deployment test checklist.

## 13. Synthetic Demo Data

Create a seed dataset with entirely invented examples. Use clearly
synthetic values, for example: - Names such as `Alex Demo`,
`Jamie Sample`, or `Taylor Test` - IDs such as `HH-DEMO-0001`,
`WGP-TEST-0001`, `EBT-DEMO-000001`, and `PK-SAMPLE-0001` - Obviously
fake dates and addresses that do not identify real beneficiaries

Include intentional errors in some rows so the quiz can test validation.
Keep the correct-answer key separate from the participant-visible data.
Never use real names, household identifiers, WGP IDs, EBT card numbers,
PK numbers, birthdays, addresses, or copied rows from the source
workbook.

## 14. Deliverables

Provide a complete, runnable project with: 1. Frontend source code. 2.
Backend/API source code. 3. MongoDB/Mongoose schemas. 4. Synthetic seed
questions and Stage 5 data. 5. Admin dashboard and quiz editor. 6.
Participant nickname/avatar lobby. 7. Projector/host view with QR code.
8. Five-stage quiz flow and scoring engine. 9. Per-stage top-five and
final overall top-five leaderboards. 10. Excel-style Stage 5 challenge
with documented shortcuts and supported functions. 11. `.env.example`
with placeholders. 12. Vercel deployment configuration and step-by-step
deployment guide. 13. README with local setup, scripts, architecture,
API documentation, and troubleshooting. 14. Automated tests and a manual
test checklist.

## 15. Acceptance Checklist

-   [ ] A participant can join by link or QR code.
-   [ ] A participant can choose a nickname and emoji/avatar.
-   [ ] The host can start and control a session from the projector
    view.
-   [ ] Stages 1--4 support multiple-choice questions with no more than
    20 questions per stage.
-   [ ] Stage 1 covers computer parts and basic computer knowledge.
-   [ ] Stages 2--4 cover synthetic data quality, identifiers,
    duplicates, matching, and data privacy.
-   [ ] Stage 5 provides an interactive spreadsheet-style data-quality
    challenge.
-   [ ] Timers, animations, and sound effects work, with a mute option.
-   [ ] The admin can edit questions and configure time limits.
-   [ ] Each stage displays its own top five.
-   [ ] Final rankings consolidate scores from all five stages.
-   [ ] The server validates answers and calculates scores.
-   [ ] All quiz examples use synthetic data only.
-   [ ] The application is responsive and projector-friendly.
-   [ ] The frontend and backend deployment approach is documented for
    Vercel.
-   [ ] Secrets are stored in environment variables and are not
    committed.
-   [ ] Tests cover scoring, timeouts, duplicate submissions, stage
    progression, and final rankings.

## 16. Implementation Priority

Build in the following order:

1.  Establish the repository, environment configuration, MongoDB
    connection, and deployment architecture.
2.  Implement authentication and admin quiz/session management.
3.  Build participant join flow, nickname/avatar selection, and lobby.
4.  Implement the server-authoritative timer, multiple-choice gameplay,
    scoring, and stage progression.
5.  Add real-time updates and the projector/host screen.
6.  Add stage leaderboards and cumulative final rankings.
7.  Build the Stage 5 spreadsheet simulator, validation tasks, and
    supported shortcuts/functions.
8.  Add sound effects, animations, responsive layouts, accessibility,
    and error handling.
9.  Seed the application with synthetic questions and records.
10. Run automated/manual tests and document Vercel deployment.

**Important:** The source Excel workbook is the intended reference for
the types of data-quality issues to teach, but the quiz must not copy
its actual records. If the workbook is not attached to the development
environment, proceed with the synthetic schema and examples above rather
than assuming its exact columns or contents.

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { randomBytes } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { makeChallengeRows, questionBank, stageTitles } from './questions.js'
import { scoreChallenge, scoreMultipleChoice } from './scoring.js'
import { createSession, createAdminUser, databaseReady, findAdminUserByEmail, getQuizStages, getSession, listSessions, persistenceMode, saveQuizStages, saveSession, SessionConflictError, UserConflictError, verifyAdminPassword } from './store.js'

const app = express()
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false)
app.use(helmet())
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174').split(',').map((origin) => origin.trim())
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)), credentials: false }))
app.use(express.json({ limit: '32kb' }))
app.use('/api', rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }))
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false })
const developmentJwtSecret = 'fieldnote-local-development-secret-not-for-production'
const jwtSecret = () => process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : developmentJwtSecret)

const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const joinSchema = z.object({
  nickname: z.string().trim().min(2).max(18),
  avatar: z.enum(['person-1', 'person-2', 'person-3', 'person-4', 'person-5', 'person-6', 'person-7', 'person-8']),
})

function assertProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be configured in production.')
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.')
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be configured in production.')
  if (!process.env.CLIENT_URL) throw new Error('CLIENT_URL must be configured in production.')
}

function requireAdmin(req, res, next) {
  try {
    assertProductionConfig()
    const token = req.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
    if (!token || !jwtSecret()) return res.status(401).json({ error: 'Administrator sign-in required.' })
    const claims = jwt.verify(token, jwtSecret(), { issuer: 'fieldnote-quiz' })
    if (claims.role !== 'admin' || typeof claims.sub !== 'string') return res.status(401).json({ error: 'Administrator sign-in required.' })
    req.admin = claims
    return next()
  } catch {
    return res.status(401).json({ error: 'Administrator sign-in required.' })
  }
}

function isAdminRequest(req) {
  try {
    const token = req.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]
    if (!token || !jwtSecret()) return false
    const claims = jwt.verify(token, jwtSecret(), { issuer: 'fieldnote-quiz' })
    return claims.role === 'admin' && typeof claims.sub === 'string'
  } catch {
    return false
  }
}

function publicSession(session, participantId, isAdmin = false) {
  const now = Date.now()
  const question = session.questions[session.questionIndex]
  const ended = session.status === 'question' && now >= session.deadline
  if (ended) session.status = 'reveal'
  const scoresVisible = isAdmin || ['reveal', 'complete'].includes(session.status)
  return {
    code: session.code,
    status: session.status,
    stage: session.stage,
    stageTitle: stageTitles[session.stage - 1],
    questionIndex: session.questionIndex,
    questionCount: session.stage === 5 ? 1 : session.questions.length,
    durationSeconds: session.stage === 5 ? 180 : 20,
    question: ['question', 'paused', 'reveal'].includes(session.status)
      ? {
          prompt: question?.prompt,
          options: question?.options,
          answer: session.status === 'reveal' ? question?.answer : undefined,
          explanation: session.status === 'reveal' ? question?.explanation : undefined,
          deadline: session.deadline,
        }
      : null,
    participants: [...session.participants.values()].map(({ id, nickname, avatar, scores, correctByStage, responseTimeByStage }) => ({
      ...(isAdmin || id === participantId ? { id } : {}),
      nickname,
      avatar,
      ...(scoresVisible ? {
        scores,
        correctByStage,
        responseTimeByStage,
        total: scores.reduce((sum, value) => sum + value, 0),
        correctTotal: correctByStage.reduce((sum, value) => sum + value, 0),
        responseTimeTotal: responseTimeByStage.reduce((sum, value) => sum + value, 0),
      } : {}),
    })),
    responseCount: session.answers.size,
    ownResult: ['reveal', 'complete'].includes(session.status) && participantId
      ? session.answers.get(participantId) || null
      : undefined,
    challengeRows: session.stage === 5 && session.status !== 'lobby' ? session.challengeRows.map(({ id, hhid, wgp, name, birthday, issue, note }) => session.status === 'reveal' ? ({ id, hhid, wgp, name, birthday, issue, note }) : ({ id, hhid, wgp, name, birthday })) : undefined,
  }
}

app.get('/api/health', route(async (_req, res) => {
  try {
    const ready = await databaseReady()
    return res.json({ status: ready ? 'ok' : 'degraded', persistence: persistenceMode() })
  } catch {
    return res.status(503).json({ status: 'unavailable', persistence: persistenceMode() })
  }
}))

app.post('/api/admin/login', loginLimiter, route(async (req, res) => {
  assertProductionConfig()
  const parsed = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email and password.' })
  const configuredEmail = (process.env.ADMIN_EMAIL || (process.env.NODE_ENV === 'production' ? '' : 'admin@example.test')).toLowerCase()
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || ''
  const emailMatches = parsed.data.email.toLowerCase() === configuredEmail
  const passwordMatches = passwordHash
    ? await bcrypt.compare(parsed.data.password, passwordHash)
    : process.env.NODE_ENV !== 'production' && parsed.data.password === (process.env.ADMIN_PASSWORD || 'local-development-password')
  if (!emailMatches || !passwordMatches) return res.status(401).json({ error: 'Email or password is incorrect.' })
  const token = jwt.sign({ sub: configuredEmail, role: 'admin' }, jwtSecret(), { expiresIn: '8h', issuer: 'fieldnote-quiz' })
  return res.json({ token, expiresIn: 28800 })
}))

app.post('/api/admin/register', route(async (req, res) => {
  const parsed = z.object({
    validId: z.string().trim().min(1).max(20),
    email: z.string().email().max(254),
    password: z.string().min(14).max(200),
  }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid ID, a valid email, and a secure password (min 14 characters).' })
  const validRegistrationId = '067079'
  if (parsed.data.validId !== validRegistrationId) return res.status(400).json({ error: 'Invalid registration ID. Please check and try again.' })
  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  try {
    const user = await createAdminUser({
      email: parsed.data.email,
      passwordHash,
      validId: parsed.data.validId,
    })
    return res.status(201).json({ registered: true, email: user.email })
  } catch (error) {
    if (error instanceof UserConflictError) return res.status(409).json({ error: error.message })
    throw error
  }
}))

app.get('/api/admin/sessions', requireAdmin, route(async (_req, res) => {
  const sessions = await listSessions()
  return res.json(sessions.map((session) => publicSession(session, undefined, true)))
}))

const editableQuestion = z.object({
  prompt: z.string().trim().min(5).max(400),
  options: z.array(z.string().trim().min(1).max(180)).min(2).max(4),
  answer: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(1).max(500),
}).refine((question) => question.answer < question.options.length, { message: 'Correct answer must refer to an available choice.' })
const editableStages = z.array(z.array(editableQuestion).min(1).max(20)).length(4)

app.get('/api/admin/questions', requireAdmin, route(async (_req, res) => {
  return res.json({ stages: await getQuizStages(questionBank), stageTitles })
}))

app.put('/api/admin/questions', requireAdmin, route(async (req, res) => {
  const parsed = editableStages.safeParse(req.body.stages)
  if (!parsed.success) return res.status(400).json({ error: 'Each of the four stages must contain 1–20 valid questions.' })
  await saveQuizStages(parsed.data)
  return res.json({ saved: true, stages: parsed.data })
}))

app.post('/api/sessions', requireAdmin, route(async (_req, res) => {
  const code = randomBytes(6).toString('hex').toUpperCase()
  const quizStages = await getQuizStages(questionBank)
  const session = { code, status: 'lobby', stage: 1, questionIndex: 0, questions: quizStages[0], quizStages, participants: new Map(), answers: new Map(), deadline: null, challengeRows: makeChallengeRows() }
  await createSession(session)
  return res.status(201).json(publicSession(session))
}))

app.get('/api/sessions/:code', route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  const previousStatus = session.status
  const payload = publicSession(session, req.get('x-participant-id'), isAdminRequest(req))
  if (session.status !== previousStatus) {
    try {
      await saveSession(session)
    } catch (error) {
      // Concurrent polls can all notice the deadline at once. One wins the
      // optimistic write; the others still return a usable snapshot.
      if (!(error instanceof SessionConflictError)) throw error
    }
  }
  return res.json(payload)
}))

app.post('/api/sessions/:code/join', route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  if (session.status !== 'lobby') return res.status(409).json({ error: 'This lobby is closed.' })
  const result = joinSchema.safeParse(req.body)
  if (!result.success) return res.status(400).json({ error: 'Enter a nickname (2–18 characters) and choose an avatar.' })
  if ([...session.participants.values()].some((participant) => participant.nickname.toLowerCase() === result.data.nickname.toLowerCase())) return res.status(409).json({ error: 'That nickname is already in use in this session.' })
  const id = randomBytes(12).toString('hex')
  session.participants.set(id, { id, ...result.data, scores: [0, 0, 0, 0, 0], correctByStage: [0, 0, 0, 0, 0], responseTimeByStage: [0, 0, 0, 0, 0] })
  await saveSession(session)
  return res.status(201).json({ participantId: id, session: publicSession(session) })
}))

app.post('/api/sessions/:code/start', requireAdmin, route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  if (session.status !== 'lobby') return res.status(409).json({ error: 'Session cannot start from its current state.' })
  session.questionIndex = 0
  session.stage = 1
  const duration = session.stage === 5 ? 180 : 20
  session.deadline = Date.now() + duration * 1000
  session.answers = new Map()
  session.status = 'question'
  await saveSession(session)
  return res.json(publicSession(session))
}))

app.post('/api/sessions/:code/answer', route(async (req, res) => {
  const code = req.params.code.toUpperCase()
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const session = await getSession(code)
    if (!session) return res.status(404).json({ error: 'Session not found.' })
    const schema = session.stage === 5
      ? z.object({ participantId: z.string().min(1), findings: z.record(z.enum(['date', 'missing', 'format', 'name', 'spaces', 'review', 'none'])) })
      : z.object({ participantId: z.string().min(1), answer: z.number().int().min(0).max(3) })
    const result = schema.safeParse(req.body)
    if (!result.success) return res.status(400).json({ error: 'Invalid answer.' })
    if (session.status !== 'question' || Date.now() >= session.deadline) { session.status = session.status === 'question' ? 'reveal' : session.status; await saveSession(session); return res.status(409).json({ error: 'The answer window has closed.' }) }
    const participant = session.participants.get(result.data.participantId)
    if (!participant) return res.status(404).json({ error: 'Participant not found.' })
    if (session.answers.has(participant.id)) return res.status(409).json({ error: 'An answer has already been recorded.' })
    const remainingMs = Math.max(0, session.deadline - Date.now())
    const durationMs = session.stage === 5 ? 180000 : 20000
    let correct
    let correctCount
    let points
    if (session.stage === 5) {
      const challenge = scoreChallenge(result.data.findings)
      correctCount = challenge.correct
      correct = challenge.correct === session.challengeRows.length
      points = challenge.points
    } else {
      const question = session.questions[session.questionIndex]
      correct = result.data.answer === question.answer
      correctCount = Number(correct)
      points = scoreMultipleChoice(correct, remainingMs, durationMs)
    }
    participant.scores[session.stage - 1] += points
    participant.correctByStage[session.stage - 1] += correctCount
    participant.responseTimeByStage[session.stage - 1] += durationMs - remainingMs
    session.answers.set(participant.id, { correct, correctCount, totalChecks: session.stage === 5 ? session.challengeRows.length : 1, points })
    try {
      await saveSession(session)
      return res.status(201).json({ recorded: true })
    } catch (error) {
      if (!(error instanceof SessionConflictError) || attempt === 3) throw error
    }
  }
  return res.status(409).json({ error: 'Could not record the answer. Please retry.' })
}))

app.post('/api/sessions/:code/advance', requireAdmin, route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  if (session.status !== 'reveal') return res.status(409).json({ error: 'Show the results before advancing.' })
  if (session.stage === 5) { session.status = 'complete'; await saveSession(session); return res.json(publicSession(session)) }
  if (session.questionIndex + 1 < session.questions.length) session.questionIndex += 1
  else { session.stage += 1; session.questionIndex = 0; session.questions = session.stage === 5 ? [] : session.quizStages[session.stage - 1] }
  session.deadline = Date.now() + (session.stage === 5 ? 180 : 20) * 1000
  session.answers = new Map()
  session.status = 'question'
  await saveSession(session)
  return res.json(publicSession(session))
}))

app.post('/api/sessions/:code/end-question', requireAdmin, route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  if (session.status !== 'question') return res.status(409).json({ error: 'There is no active question.' })
  session.status = 'reveal'
  await saveSession(session)
  return res.json(publicSession(session))
}))

app.post('/api/sessions/:code/pause', requireAdmin, route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  if (session.status !== 'question') return res.status(409).json({ error: 'There is no active question to pause.' })
  session.remainingMs = Math.max(0, session.deadline - Date.now())
  session.status = 'paused'
  await saveSession(session)
  return res.json(publicSession(session))
}))

app.post('/api/sessions/:code/resume', requireAdmin, route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  if (session.status !== 'paused') return res.status(409).json({ error: 'There is no paused question to resume.' })
  session.deadline = Date.now() + Math.max(0, session.remainingMs || 0)
  delete session.remainingMs
  session.status = 'question'
  await saveSession(session)
  return res.json(publicSession(session))
}))

app.post('/api/sessions/:code/restart', requireAdmin, route(async (req, res) => {
  const session = await getSession(req.params.code.toUpperCase())
  if (!session) return res.status(404).json({ error: 'Session not found.' })
  if (session.status === 'lobby') return res.status(409).json({ error: 'This room is already in the lobby.' })
  session.status = 'lobby'
  session.stage = 1
  session.questionIndex = 0
  session.questions = session.quizStages[0]
  session.deadline = null
  delete session.remainingMs
  session.answers = new Map()
  for (const participant of session.participants.values()) {
    participant.scores = [0, 0, 0, 0, 0]
    participant.correctByStage = [0, 0, 0, 0, 0]
    participant.responseTimeByStage = [0, 0, 0, 0, 0]
  }
  await saveSession(session)
  return res.json(publicSession(session, undefined, true))
}))

app.use((error, _req, res, _next) => {
  if (error instanceof SessionConflictError) return res.status(409).json({ error: error.message })
  console.error(error)
  return res.status(500).json({ error: 'Unexpected server error.' })
})

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3000)
  const start = async () => {
    assertProductionConfig()
    if (process.env.NODE_ENV === 'production') await databaseReady()
    const server = app.listen(port, () => console.log(`Quiz API listening on http://localhost:${port}`))
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the other quiz server (Ctrl+C) before starting another copy.`)
        process.exit(1)
      }
      throw error
    })
  }
  start().catch((error) => {
    console.error(`API startup failed: ${error.message}`)
    process.exit(1)
  })
}

export default app
import mongoose from 'mongoose'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'

const sessionSchema = new mongoose.Schema({
  _id: { type: String },
  state: { type: mongoose.Schema.Types.Mixed, required: true },
}, { versionKey: '__v', optimisticConcurrency: true, timestamps: true })
const quizConfigSchema = new mongoose.Schema({
  _id: { type: String },
  stages: { type: mongoose.Schema.Types.Mixed, required: true },
}, { versionKey: '__v', timestamps: true })

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  validId: { type: String, required: true },
}, { versionKey: '__v', timestamps: true })

const SessionModel = mongoose.models.QuizSession || mongoose.model('QuizSession', sessionSchema)
const QuizConfigModel = mongoose.models.QuizConfig || mongoose.model('QuizConfig', quizConfigSchema)
const AdminUserModel = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema)
const memorySessions = new Map()
let memoryQuizStages
let memoryAdminUsers = new Map()
let connectionPromise

export class SessionConflictError extends Error {
  constructor() {
    super('Session changed during this request. Refresh and retry.')
    this.name = 'SessionConflictError'
  }
}

export class UserConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UserConflictError'
  }
}

export function persistenceMode() {
  return process.env.MONGODB_URI ? 'mongodb' : 'memory-development-only'
}

async function connect() {
  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required in production.')
    return
  }
  if (mongoose.connection.readyState === 1) return
  connectionPromise ||= mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  }).catch((error) => {
    connectionPromise = undefined
    throw error
  })
  await connectionPromise
}

function encode(session) {
  const { code, _version, ...state } = session
  return {
    status: state.status,
    stage: state.stage,
    questionIndex: state.questionIndex,
    questions: state.questions,
    quizStages: state.quizStages,
    participants: [...state.participants.values()],
    answers: [...state.answers.entries()].map(([participantId, result]) => ({ participantId, ...result })),
    deadline: state.deadline,
    remainingMs: state.remainingMs,
    challengeRows: state.challengeRows,
  }
}

function decode(code, state, version = 0) {
  return {
    code,
    ...state,
    participants: new Map((state.participants || []).map((participant) => [participant.id, participant])),
    answers: new Map((state.answers || []).map(({ participantId, ...result }) => [participantId, result])),
    _version: version,
  }
}

export async function getSession(code) {
  await connect()
  if (!process.env.MONGODB_URI) {
    const stored = memorySessions.get(code)
    return stored ? decode(code, structuredClone(stored.state), stored.version) : null
  }
  const document = await SessionModel.findById(code).lean()
  return document ? decode(code, document.state, document.__v) : null
}

export async function createSession(session) {
  await connect()
  const state = encode(session)
  if (!process.env.MONGODB_URI) {
    if (memorySessions.has(session.code)) throw new SessionConflictError()
    memorySessions.set(session.code, { state: structuredClone(state), version: 0 })
    session._version = 0
    return
  }
  try {
    const document = await SessionModel.create({ _id: session.code, state })
    session._version = document.__v
  } catch (error) {
    if (error?.code === 11000) throw new SessionConflictError()
    throw error
  }
}

export async function saveSession(session) {
  await connect()
  const state = encode(session)
  if (!process.env.MONGODB_URI) {
    const stored = memorySessions.get(session.code)
    if (!stored || stored.version !== session._version) throw new SessionConflictError()
    memorySessions.set(session.code, { state: structuredClone(state), version: stored.version + 1 })
    session._version += 1
    return
  }
  const result = await SessionModel.updateOne(
    { _id: session.code, __v: session._version },
    { $set: { state }, $inc: { __v: 1 } },
  )
  if (result.matchedCount !== 1) throw new SessionConflictError()
  session._version += 1
}

export async function databaseReady() {
  await connect()
  return process.env.MONGODB_URI ? mongoose.connection.readyState === 1 : process.env.NODE_ENV !== 'production'
}

export async function listSessions(limit = 20) {
  await connect()
  if (!process.env.MONGODB_URI) {
    return [...memorySessions.entries()]
      .map(([code, stored]) => decode(code, structuredClone(stored.state), stored.version))
      .sort((a, b) => b.code.localeCompare(a.code))
      .slice(0, limit)
  }
  const documents = await SessionModel.find({}, { state: 1 }).sort({ updatedAt: -1 }).limit(limit).lean()
  return documents.map((document) => decode(document._id, document.state, document.__v))
}

export async function getQuizStages(defaultStages) {
  await connect()
  if (!process.env.MONGODB_URI) return structuredClone(memoryQuizStages || defaultStages)
  const config = await QuizConfigModel.findById('default').lean()
  return config?.stages || defaultStages
}

export async function saveQuizStages(stages) {
  await connect()
  if (!process.env.MONGODB_URI) {
    memoryQuizStages = structuredClone(stages)
    return
  }
  await QuizConfigModel.updateOne(
    { _id: 'default' },
    { $set: { stages } },
    { upsert: true, setDefaultsOnInsert: true },
  )
}

export async function findAdminUserByEmail(email) {
  await connect()
  if (!process.env.MONGODB_URI) {
    return [...memoryAdminUsers.values()].find((user) => user.email === email) || null
  }
  return AdminUserModel.findOne({ email }).lean()
}

export async function createAdminUser(user) {
  await connect()
  const email = user.email.toLowerCase().trim()
  const existing = await findAdminUserByEmail(email)
  if (existing) throw new UserConflictError('An account with this email is already registered.')
  const userDocument = {
    email,
    passwordHash: user.passwordHash,
    validId: user.validId,
  }
  if (!process.env.MONGODB_URI) {
    const id = randomBytes(16).toString('hex')
    memoryAdminUsers.set(id, { ...userDocument, _id: id })
    return { ...userDocument, _id: id }
  }
  const document = await AdminUserModel.create(userDocument)
  return document.toObject ? document.toObject() : document
}

export async function verifyAdminPassword(plainPassword, storedHash) {
  return bcrypt.compare(plainPassword, storedHash)
}

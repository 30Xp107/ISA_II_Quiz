import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import app from './index.js'
import { expectedFindings } from './scoring.js'

process.env.ADMIN_EMAIL = 'admin@example.test'
process.env.ADMIN_PASSWORD = 'test-admin-password'
process.env.JWT_SECRET = 'test-jwt-secret-with-more-than-thirty-two-characters'

async function adminHeaders(base) {
  const response = await fetch(`${base}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  })
  assert.equal(response.status, 200)
  const { token } = await response.json()
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

test('host session controls require an administrator token', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const denied = await fetch(`${base}/sessions`, { method: 'POST' })
  assert.equal(denied.status, 401)
  const headers = await adminHeaders(base)
  const allowed = await fetch(`${base}/sessions`, { method: 'POST', headers })
  assert.equal(allowed.status, 201)
})

test('participant tokens stay private and hosts can recover and pause sessions', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const headers = await adminHeaders(base)
  const created = await fetch(`${base}/sessions`, { method: 'POST', headers }).then((response) => response.json())
  const code = created.code
  const joined = await fetch(`${base}/sessions/${code}/join`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname: 'Private ID Player', avatar: 'person-2' }),
  }).then((response) => response.json())

  const publicState = await fetch(`${base}/sessions/${code}`).then((response) => response.json())
  assert.equal('id' in publicState.participants[0], false)
  const ownState = await fetch(`${base}/sessions/${code}`, { headers: { 'X-Participant-ID': joined.participantId } }).then((response) => response.json())
  assert.equal(ownState.participants[0].id, joined.participantId)
  assert.equal(ownState.participants[0].scores, undefined)
  const hostState = await fetch(`${base}/sessions/${code}`, { headers }).then((response) => response.json())
  assert.equal(hostState.participants[0].id, joined.participantId)

  await fetch(`${base}/sessions/${code}/start`, { method: 'POST', headers })
  await fetch(`${base}/sessions/${code}/pause`, { method: 'POST', headers })
  const paused = await fetch(`${base}/sessions/${code}`).then((response) => response.json())
  assert.equal(paused.status, 'paused')
  assert.ok(paused.question.deadline > Date.now())
  assert.equal(paused.question.prompt.length > 0, true)
  const recovered = await fetch(`${base}/admin/sessions`, { headers }).then((response) => response.json())
  assert.ok(recovered.some((item) => item.code === code))
  await fetch(`${base}/sessions/${code}/resume`, { method: 'POST', headers })
  const resumed = await fetch(`${base}/sessions/${code}`).then((response) => response.json())
  assert.equal(resumed.status, 'question')
})

test('simultaneous participant answers are both recorded without double scoring', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const headers = await adminHeaders(base)
  const created = await fetch(`${base}/sessions`, { method: 'POST', headers }).then((response) => response.json())
  const join = (nickname) => fetch(`${base}/sessions/${created.code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, avatar: 'person-1' }),
  }).then((response) => response.json())
  const [first, second] = await Promise.all([join('First Player'), join('Second Player')])
  await fetch(`${base}/sessions/${created.code}/start`, { method: 'POST', headers })
  const submit = (participantId) => fetch(`${base}/sessions/${created.code}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId, answer: 0 }),
  })
  const responses = await Promise.all([submit(first.participantId), submit(second.participantId)])
  assert.deepEqual(responses.map((response) => response.status), [201, 201])
  const state = await fetch(`${base}/sessions/${created.code}`, { headers }).then((response) => response.json())
  assert.equal(state.responseCount, 2)
  const submittedScores = state.participants.map((person) => person.scores[0])
  assert.equal(submittedScores.length, 2)
  // Answer choices are scrambled per session, so index 0 may or may not be correct.
  assert.ok(submittedScores.every((score) => score === 0 || (score >= 700 && score <= 1000)))
  const correctCounts = state.participants.map((person) => person.correctByStage[0])
  assert.ok(correctCounts.every((count) => count === 0 || count === 1))
})

test('quiz editor requires admin access, validates edits, and keeps session snapshots stable', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const headers = await adminHeaders(base)
  const denied = await fetch(`${base}/admin/questions`)
  assert.equal(denied.status, 401)
  const loaded = await fetch(`${base}/admin/questions`, { headers }).then((response) => response.json())
  assert.equal(loaded.stages.length, 4)
  assert.equal(loaded.stages[0].length, 10)

  const createdResponse = await fetch(`${base}/sessions`, { method: 'POST', headers })
  const created = await createdResponse.json()
  await fetch(`${base}/sessions/${created.code}/start`, { method: 'POST', headers })
  const originalState = await fetch(`${base}/sessions/${created.code}`).then((response) => response.json())
  const originalPrompt = originalState.question.prompt
  const editedStages = structuredClone(loaded.stages)
  editedStages[0][0].prompt = 'Updated synthetic test question?'
  const saved = await fetch(`${base}/admin/questions`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ stages: editedStages }),
  })
  assert.equal(saved.status, 200)
  const activeSession = await fetch(`${base}/sessions/${created.code}`).then((response) => response.json())
  assert.equal(activeSession.question.prompt, originalPrompt)
  const nextSession = await fetch(`${base}/sessions`, { method: 'POST', headers }).then((response) => response.json())
  await fetch(`${base}/sessions/${nextSession.code}/start`, { method: 'POST', headers })
  const nextState = await fetch(`${base}/sessions/${nextSession.code}`).then((response) => response.json())
  assert.equal(nextState.question.prompt, 'Updated synthetic test question?')

  const invalidStages = structuredClone(editedStages)
  invalidStages[0][0].answer = 4
  const invalid = await fetch(`${base}/admin/questions`, {
    method: 'PUT', headers, body: JSON.stringify({ stages: invalidStages }),
  })
  assert.equal(invalid.status, 400)
})

test('session join rejects duplicate nicknames and repeated answers', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const headers = await adminHeaders(base)
  const created = await fetch(`${base}/sessions`, { method: 'POST', headers }).then((response) => response.json())
  const join = (nickname) => fetch(`${base}/sessions/${created.code}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nickname, avatar: 'person-1' }) })
  const first = await join('Demo Player')
  assert.equal(first.status, 201)
  assert.equal((await join('demo player')).status, 409)
  const participantId = (await first.json()).participantId
  await fetch(`${base}/sessions/${created.code}/start`, { method: 'POST', headers })
  const submit = () => fetch(`${base}/sessions/${created.code}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participantId, answer: 0 }) })
  const submitted = await submit()
  assert.equal(submitted.status, 201)
  assert.deepEqual(await submitted.json(), { recorded: true })
  const activeState = await fetch(`${base}/sessions/${created.code}`, { headers: { 'X-Participant-ID': participantId } }).then((response) => response.json())
  assert.equal(activeState.ownResult, undefined)
  assert.equal(activeState.question.options.length, 4)
  assert.equal('answer' in activeState.question, false)
  assert.equal((await submit()).status, 409)
  await fetch(`${base}/sessions/${created.code}/end-question`, { method: 'POST', headers })
  const revealState = await fetch(`${base}/sessions/${created.code}`, { headers: { 'X-Participant-ID': participantId } }).then((response) => response.json())
  assert.equal(typeof revealState.ownResult.correct, 'boolean')
  assert.equal(revealState.ownResult.points >= 0, true)
  assert.ok(
    Number.isInteger(revealState.question.answer) &&
      revealState.question.answer >= 0 &&
      revealState.question.answer < revealState.question.options.length,
  )
  assert.equal(revealState.question.explanation.length > 0, true)
})

test('health endpoint reports prototype persistence honestly', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const result = await fetch(`http://127.0.0.1:${server.address().port}/api/health`).then((response) => response.json())
  assert.equal(result.status, 'ok')
  assert.equal(result.persistence, 'memory-development-only')
})

test('advance starts the next question and moves to the next stage after the final question', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const headers = await adminHeaders(base)
  const created = await fetch(`${base}/sessions`, { method: 'POST', headers }).then((response) => response.json())
  const request = (path) => fetch(`${base}/sessions/${created.code}/${path}`, { method: 'POST', headers }).then((response) => response.json())

  await request('start')
  const firstQuestion = await fetch(`${base}/sessions/${created.code}`).then((response) => response.json())
  assert.equal(firstQuestion.questionCount, 10)
  await request('end-question')
  const secondQuestion = await request('advance')
  assert.equal(secondQuestion.status, 'question')
  assert.equal(secondQuestion.questionIndex, 1)
  assert.match(secondQuestion.question.prompt, /EBT/i)

  let nextStage = secondQuestion
  while (nextStage.stage === 1) {
    await request('end-question')
    nextStage = await request('advance')
  }
  assert.equal(nextStage.status, 'question')
  assert.equal(nextStage.stage, 2)
  assert.equal(nextStage.questionIndex, 0)
  assert.match(nextStage.question.prompt, /date field/i)
})

test('Stage 5 has twelve synthetic rows, hides answers until reveal, and accepts detailed findings', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const headers = await adminHeaders(base)
  const post = async (path, body = {}) => {
    const hostAction = ['/sessions', '/start', '/advance', '/end-question'].some((suffix) => path.endsWith(suffix))
    const response = await fetch(`${base}${path}`, { method: 'POST', headers: hostAction ? headers : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return { status: response.status, data: await response.json() }
  }
  const created = await post('/sessions')
  const code = created.data.code
  const joined = await post(`/sessions/${code}/join`, { nickname: 'Challenge Player', avatar: 'person-1' })
  const participantId = joined.data.participantId
  await post(`/sessions/${code}/start`)

  let state = created.data
  while (state.stage < 5) {
    await post(`/sessions/${code}/end-question`)
    state = (await post(`/sessions/${code}/advance`)).data
  }

  assert.equal(state.stage, 5)
  assert.equal(state.durationSeconds, 180)
  assert.equal(state.challengeRows.length, 12)
  assert.equal('issue' in state.challengeRows[0], false)
  const submitted = await post(`/sessions/${code}/answer`, { participantId, findings: expectedFindings })
  assert.equal(submitted.status, 201)
  assert.deepEqual(submitted.data, { recorded: true })
  const activeState = await fetch(`${base}/sessions/${code}`, { headers: { 'X-Participant-ID': participantId } }).then((response) => response.json())
  assert.equal(activeState.ownResult, undefined)
  await post(`/sessions/${code}/end-question`)
  const review = await fetch(`${base}/sessions/${code}`, { headers: { 'X-Participant-ID': participantId } }).then((response) => response.json())
  assert.deepEqual(review.ownResult, { correct: true, correctCount: 12, totalChecks: 12, points: 1000 })
  assert.equal(review.challengeRows.length, 12)
  assert.equal(review.challengeRows[0].issue, 'none')
  assert.match(review.challengeRows[0].note, /no issue is evident/i)
})

test('host can play a completed room again with the same participants and reset scores', async (context) => {
  const server = app.listen(0)
  await once(server, 'listening')
  context.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}/api`
  const headers = await adminHeaders(base)
  const created = await fetch(`${base}/sessions`, { method: 'POST', headers }).then((response) => response.json())
  const code = created.code
  const joined = await fetch(`${base}/sessions/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname: 'Replay Player', avatar: 'person-3' }),
  }).then((response) => response.json())
  await fetch(`${base}/sessions/${code}/start`, { method: 'POST', headers })
  await fetch(`${base}/sessions/${code}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId: joined.participantId, answer: 0 }),
  })

  let state = await fetch(`${base}/sessions/${code}`, { headers }).then((response) => response.json())
  while (state.status !== 'complete') {
    if (state.status === 'question') await fetch(`${base}/sessions/${code}/end-question`, { method: 'POST', headers })
    state = await fetch(`${base}/sessions/${code}/advance`, { method: 'POST', headers }).then((response) => response.json())
  }
  assert.equal(state.stage, 5)
  assert.ok(state.participants[0].total > 0)

  const denied = await fetch(`${base}/sessions/${code}/restart`, { method: 'POST' })
  assert.equal(denied.status, 401)

  const restarted = await fetch(`${base}/sessions/${code}/restart`, { method: 'POST', headers }).then((response) => response.json())
  assert.equal(restarted.status, 'lobby')
  assert.equal(restarted.stage, 1)
  assert.equal(restarted.responseCount, 0)
  assert.equal(restarted.participants.length, 1)
  assert.equal(restarted.participants[0].id, joined.participantId)
  assert.deepEqual(restarted.participants[0].scores, [0, 0, 0, 0, 0])
  assert.deepEqual(restarted.participants[0].correctByStage, [0, 0, 0, 0, 0])

  const startedAgain = await fetch(`${base}/sessions/${code}/start`, { method: 'POST', headers }).then((response) => response.json())
  assert.equal(startedAgain.status, 'question')
  assert.equal(startedAgain.stage, 1)
})
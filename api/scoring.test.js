import test from 'node:test'
import assert from 'node:assert/strict'
import { expectedFindings, scoreChallenge, scoreMultipleChoice } from './scoring.js'

test('multiple-choice scoring awards no points for incorrect answers', () => {
  assert.equal(scoreMultipleChoice(false, 10000, 20000), 0)
})

test('multiple-choice scoring is bounded and rewards faster correct answers', () => {
  assert.equal(scoreMultipleChoice(true, 20000, 20000), 1000)
  assert.equal(scoreMultipleChoice(true, 0, 20000), 700)
  assert.equal(scoreMultipleChoice(true, 40000, 20000), 1000)
})

test('challenge scoring gives partial credit and treats review as distinct from rejection', () => {
  const result = scoreChallenge(expectedFindings)
  assert.deepEqual(result, { correct: 12, points: 1000 })
  assert.deepEqual(scoreChallenge({ 'R-003': 'date' }), { correct: 1, points: 83 })
  assert.deepEqual(scoreChallenge({ 'R-011': 'missing' }), { correct: 0, points: 0 })
})
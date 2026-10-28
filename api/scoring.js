export const expectedFindings = {
  'R-001': 'none',
  'R-002': 'spaces',
  'R-003': 'date',
  'R-004': 'format',
  'R-005': 'name',
  'R-006': 'format',
  'R-007': 'format',
  'R-008': 'review',
  'R-009': 'none',
  'R-010': 'date',
  'R-011': 'review',
  'R-012': 'date',
}

export function scoreMultipleChoice(correct, millisecondsRemaining, durationMilliseconds) {
  if (!correct) return 0
  return 700 + Math.round(300 * Math.max(0, Math.min(1, millisecondsRemaining / durationMilliseconds)))
}

export function scoreChallenge(findings) {
  let correct = 0
  for (const [recordId, expected] of Object.entries(expectedFindings)) {
    if (findings[recordId] === expected) correct += 1
  }
  return { correct, points: Math.round(1000 * correct / Object.keys(expectedFindings).length) }
}
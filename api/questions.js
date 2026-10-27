export const questionBank = [
  [
    { prompt: 'How many household IDs (HHID) are listed in the demo records?', options: ['12', '11', '10', '13'], answer: 0, explanation: 'All 12 demo records include a household ID.' },
    { prompt: 'How many WGP IDs are listed in the demo records?', options: ['11', '12', '10', '13'], answer: 0, explanation: 'Eleven records list a WGP ID; one record (R-004) is missing it.' },
    { prompt: 'How many EBT card numbers are listed in the demo records?', options: ['12', '11', '10', '13'], answer: 0, explanation: 'All 12 demo records include an EBT card number.' },
    { prompt: 'How many PK numbers are listed in the demo records?', options: ['11', '12', '10', '13'], answer: 0, explanation: 'Eleven records list a PK number; one record (R-007) is missing it.' },
    { prompt: 'How many demo records are missing a WGP ID?', options: ['1', '2', '3', '4'], answer: 0, explanation: 'Only R-004 has a blank WGP ID, so one record is missing it.' },
    { prompt: 'How many demo records are missing a PK number?', options: ['1', '2', '3', '4'], answer: 0, explanation: 'Only R-007 has a blank PK number, so one record is missing it.' },
    { prompt: 'How many records have all four identifiers (HHID, WGP ID, EBT card, PK number)?', options: ['10', '11', '12', '9'], answer: 0, explanation: 'R-004 and R-007 each miss one identifier, leaving 10 records with all four.' },
    { prompt: 'How many HHIDs begin with the HH-DEMO prefix?', options: ['12', '11', '10', '13'], answer: 0, explanation: 'All 12 household IDs use the synthetic HH-DEMO prefix.' },
    { prompt: 'How many WGP IDs begin with the WGP-TEST prefix?', options: ['11', '12', '10', '13'], answer: 0, explanation: 'All 11 present WGP IDs use the synthetic WGP-TEST prefix.' },
    { prompt: 'How many EBT cards begin with the EBT-DEMO prefix?', options: ['12', '11', '10', '13'], answer: 0, explanation: 'All 12 EBT cards use the synthetic EBT-DEMO prefix.' },
  ],
  [
    { prompt: 'A date field contains “31/02/2024”. What is the main issue?', options: ['It is a valid leap-day date', 'The date does not exist', 'It needs a longer ID', 'It contains extra spaces'], answer: 1, explanation: 'February never has 31 days, so this value needs correction or review.' },
    { prompt: 'A required household ID field is blank. What should happen?', options: ['Invent an ID', 'Copy a nearby ID', 'Flag it for completion', 'Delete the entire file'], answer: 2, explanation: 'Do not guess identifiers. Flag the missing value for an authorized correction.' },
    { prompt: 'Which value looks like a synthetic demo identifier?', options: ['HH-DEMO-0008', 'A real client number', 'A copied workbook row', 'A personal phone number'], answer: 0, explanation: 'Clearly labeled fabricated identifiers are appropriate for demonstrations.' },
    { prompt: 'A valid ID has a trailing space. What is the safest cleanup?', options: ['Trim the extra space and record the validation rule', 'Delete the record', 'Add random characters', 'Change the person’s name'], answer: 0, explanation: 'Whitespace can be normalized with a documented rule while preserving an audit trail.' },
    { prompt: 'One birthday is YYYY-MM-DD and another is DD/MM/YYYY. What issue should be flagged?', options: ['Different formats', 'Duplicate names', 'A missing ID', 'Wrong capitalization'], answer: 0, explanation: 'Mixed date formats can cause parsing errors and should be standardized carefully.' },
    { prompt: 'A name field contains “Riley8”. What should a validator do?', options: ['Assume the 8 is correct', 'Flag the value for review', 'Replace it with a guessed name', 'Delete all matching records'], answer: 1, explanation: 'Unexpected characters merit review; do not invent the correct name.' },
    { prompt: 'An identifier is shorter than its documented format. What is the right action?', options: ['Pad it with guessed digits', 'Flag it against the format rule', 'Copy another person’s identifier', 'Mark it valid'], answer: 1, explanation: 'Use documented format checks and route invalid values for authorized correction.' },
    { prompt: 'A required value is recorded as “N/A” even though that is not an allowed value. This is:', options: ['A validation exception to review', 'Always a valid date', 'A confirmed duplicate', 'A secure password'], answer: 0, explanation: 'Allowed values should be explicit; unexpected placeholders need review.' },
    { prompt: 'Why preserve the original value when correcting formatting?', options: ['To support traceability and review', 'To make the file secret', 'To create more duplicates', 'To avoid validation'], answer: 0, explanation: 'A documented correction history helps explain what changed and why.' },
    { prompt: 'Two columns use different capitalization for the same place name. This is best described as:', options: ['An inconsistency to normalize using an approved list', 'Proof of fraud', 'A confirmed duplicate person', 'A reason to delete the file'], answer: 0, explanation: 'Standardize values against an approved reference rather than making unsupported assumptions.' },
  ],
  [
    { prompt: 'Two records have similar names but different dates of birth. What is the safest next step?', options: ['Merge them immediately', 'Delete one record', 'Flag for manual review', 'Change both names'], answer: 2, explanation: 'A possible match is not a confirmed duplicate. Use approved matching rules and review.' },
    { prompt: 'Why can one matching field be insufficient?', options: ['Names are always unique', 'Fields can be missing or shared', 'IDs never change', 'It makes files larger'], answer: 1, explanation: 'A single field may be incomplete, mistyped, or shared by different people.' },
    { prompt: 'What is an exact duplicate?', options: ['Two rows identical in all compared fields', 'Two similar first names', 'A missing identifier', 'Two people in one location'], answer: 0, explanation: 'Exact duplicates match across the fields used for comparison; possible matches still need review.' },
    { prompt: 'Two rows share an identifier but have different names. What should you do first?', options: ['Merge them immediately', 'Flag the conflict for investigation', 'Delete the newer row', 'Overwrite both names'], answer: 1, explanation: 'Conflicting fields need investigation; a shared ID alone does not prove the rows represent one person.' },
    { prompt: 'Which pair of fields is generally stronger for matching than first name alone?', options: ['First name and favorite color', 'Several approved identifiers and dates, subject to policy', 'First name repeated twice', 'Screen size and file name'], answer: 1, explanation: 'Multiple appropriate fields can improve matching, but access and policy rules still apply.' },
    { prompt: 'A matching value is blank in one record. What does that mean?', options: ['The records cannot ever match', 'There is less evidence; review using approved rules', 'Fill it from the nearest row', 'The records are exact duplicates'], answer: 1, explanation: 'A missing field limits evidence and should not be silently guessed.' },
    { prompt: 'Two records differ only by a likely spelling variation. What is a responsible response?', options: ['Automatically merge', 'Flag as a possible match for review', 'Discard one', 'Change both to a common spelling'], answer: 1, explanation: 'Spelling similarity suggests a possible match, not certainty.' },
    { prompt: 'What should a duplicate-detection process do with uncertain matches?', options: ['Hide them', 'Send them to a review queue with evidence', 'Auto-delete one', 'Change the identifier'], answer: 1, explanation: 'A review queue preserves evidence for a qualified person to assess.' },
    { prompt: 'Why record which fields produced a match candidate?', options: ['So reviewers can understand the evidence', 'To publish private data', 'To make every candidate certain', 'To skip access controls'], answer: 0, explanation: 'Showing match evidence helps reviewers evaluate a candidate transparently.' },
    { prompt: 'An exact duplicate check finds identical rows. What should happen next?', options: ['Follow the approved duplicate-handling procedure', 'Assume a person intentionally copied data', 'Post the rows for public review', 'Change a random field'], answer: 0, explanation: 'Even exact duplicates should be handled according to documented procedures.' },
    { prompt: 'Which statement about a possible match is correct?', options: ['It is always a confirmed duplicate', 'It is a candidate that may require manual review', 'It should always be deleted', 'It proves an identifier is invalid'], answer: 1, explanation: 'Possible matches require appropriate review before any merge or correction.' },
  ],
  [
    { prompt: 'You need to share a report with a colleague. What should you do first?', options: ['Post it in a public link', 'Verify the recipient and share only needed data', 'Send it to the whole team', 'Add passwords in the filename'], answer: 1, explanation: 'Confirm the recipient, use an approved secure channel, and minimize the data shared.' },
    { prompt: 'A screenshot for a presentation contains personal data. What is the best choice?', options: ['Use it if the room is private', 'Replace it with synthetic data', 'Blur only the names', 'Share it without comment'], answer: 1, explanation: 'Use fabricated examples in demos; removing only names may leave identifying details.' },
    { prompt: 'You suspect a file was sent to the wrong recipient. What should you do?', options: ['Ignore it', 'Delete your sent email only', 'Report it promptly through the approved process', 'Post the file publicly'], answer: 2, explanation: 'Prompt reporting lets the responsible team assess and contain a possible exposure.' },
    { prompt: 'A colleague asks for a full data export but only needs aggregate totals. What should you share?', options: ['The full export', 'Only the minimum aggregated information needed', 'A screenshot of every row', 'Your login credentials'], answer: 1, explanation: 'Data minimization means sharing only what is needed for the stated purpose.' },
    { prompt: 'Where should application secrets be stored?', options: ['Committed source files', 'Approved environment/secret storage', 'A public issue tracker', 'A spreadsheet shared with everyone'], answer: 1, explanation: 'Keep secrets in controlled secret storage, not in source code or public records.' },
    { prompt: 'Before sending a sensitive file, verify:', options: ['Recipient identity and approved channel', 'Only the email subject', 'That the file name is short', 'That everyone is copied'], answer: 0, explanation: 'Verify who will receive it and use the approved secure transfer method.' },
    { prompt: 'A public link is convenient for sharing restricted data. What is the safest choice?', options: ['Use it if the link is hard to guess', 'Use an approved access-controlled channel instead', 'Post the password beside the link', 'Remove the file owner name only'], answer: 1, explanation: 'A hard-to-guess public link is not a substitute for access controls.' },
    { prompt: 'What belongs in an application log?', options: ['Passwords and tokens', 'Only necessary diagnostic information, without sensitive data', 'Full personal records for convenience', 'Database credentials'], answer: 1, explanation: 'Logs should support diagnosis while minimizing personal and secret data.' },
    { prompt: 'You need to demonstrate a validation workflow. Which data should you use?', options: ['A copied real record', 'Clearly fabricated examples', 'A real screenshot with names blurred', 'A production export'], answer: 1, explanation: 'Synthetic examples avoid exposing real information in demonstrations.' },
    { prompt: 'A file is no longer needed for its approved purpose. What should happen?', options: ['Keep extra copies indefinitely', 'Follow the retention and secure disposal policy', 'Upload it to a personal drive', 'Rename it and retain it forever'], answer: 1, explanation: 'Retain and dispose of data according to applicable policy and retention rules.' },
    { prompt: 'A coworker requests access outside their role. What should you do?', options: ['Send it to be helpful', 'Follow access approval procedures', 'Share your account', 'Put it in a public folder'], answer: 1, explanation: 'Access should be authorized based on role and purpose.' },
  ],
]

export const stageTitles = ['HHID, PK & EBT Counts', 'Data quality', 'Matching & validation', 'Privacy in practice', 'Spreadsheet challenge']

/**
 * Returns a copy of a multiple-choice question with its answer choices
 * shuffled (scrambled) and the correct-answer index remapped to match the
 * new order. All participants in a session see the same shuffled order
 * because this is applied once when the session snapshot is created.
 */
export function shuffleQuestion(question) {
  const indices = [...Array(question.options.length).keys()]
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const options = indices.map((index) => question.options[index])
  const answer = indices.indexOf(question.answer)
  return { ...question, options, answer }
}

export function makeChallengeRows() {
  return [
    { id: 'R-001', hhid: 'HH-DEMO-1042', wgp: 'WGP-TEST-4201', name: 'Avery Demo', birthday: '1988-06-14', ebt: 'EBT-DEMO-104201', pk: 'PK-SAMPLE-1042', municipality: 'Maple Bay', issue: 'none', note: 'Values follow the demo formats; no issue is evident from the displayed checks.' },
    { id: 'R-002', hhid: 'HH-DEMO-1043 ', wgp: 'WGP-TEST-4202', name: 'Jordan Sample', birthday: '1991-11-03', ebt: 'EBT-DEMO-104202', pk: 'PK-SAMPLE-1043', municipality: 'Maple Bay', issue: 'spaces', note: 'Household ID contains a trailing space.' },
    { id: 'R-003', hhid: 'HH-DEMO-1044', wgp: 'WGP-TEST-4203', name: 'Casey Sample', birthday: '31/02/2024', ebt: 'EBT-DEMO-104203', pk: 'PK-SAMPLE-1044', municipality: 'Cedar Point', issue: 'date', note: 'Birthday is an impossible calendar date.' },
    { id: 'R-004', hhid: 'HH-DEMO-1045', wgp: '', name: 'Quinn Example', birthday: '1993-02-17', ebt: 'EBT-DEMO-104205', pk: 'PK-SAMPLE-1045', municipality: 'Cedar Point', issue: 'missing', note: 'Required WGP ID is missing; do not invent a replacement.' },
    { id: 'R-005', hhid: 'HH-DEMO-1046', wgp: 'WGP-TEST-4206', name: 'Riley8 Demo', birthday: '1985-03-28', ebt: 'EBT-DEMO-104206', pk: 'PK-SAMPLE-1046', municipality: 'Pine Crossing', issue: 'name', note: 'Name contains a digit and should be reviewed, not automatically rewritten.' },
    { id: 'R-006', hhid: 'HH-DEMO-1047', wgp: 'WGP-TEST-4207', name: 'Skyler Example', birthday: '2002-09-09', ebt: 'EBT-DEMO-104207', pk: 'PK-SAMPLE-1047', municipality: 'Pine Crossing', issue: 'format', note: 'EBT demo identifier does not meet the expected length pattern.' },
    { id: 'R-007', hhid: 'HH-DEMO-1048', wgp: 'WGP-TEST-4208', name: 'Emery Sample', birthday: '1990-12-01', ebt: 'EBT-DEMO-104208', pk: '', municipality: 'Maple Bay', issue: 'missing', note: 'Required PK number is blank.' },
    { id: 'R-008', hhid: 'HH-DEMO-1049', wgp: 'WGP-TEST-4209', name: 'ALEX DEMO', birthday: '1988-06-14', ebt: 'EBT-DEMO-104209', pk: 'PK-SAMPLE-1049', municipality: 'maple bay', issue: 'review', note: 'Several fields resemble R-001. Review this possible match; do not auto-merge.' },
    { id: 'R-009', hhid: 'HH-DEMO-1050', wgp: 'WGP-TEST-4210', name: 'Parker Example', birthday: '2000-02-29', ebt: 'EBT-DEMO-104210', pk: 'PK-SAMPLE-1050', municipality: 'Cedar Point', issue: 'none', note: 'Leap day is valid in the year 2000.' },
    { id: 'R-010', hhid: 'HH-DEMO-1051', wgp: 'WGP-TEST-4211', name: 'Reese Demo', birthday: '04/31/1994', ebt: 'EBT-DEMO-104211', pk: 'PK-SAMPLE-1051', municipality: 'Pine Crossing', issue: 'date', note: 'April has 30 days; this date does not exist.' },
    { id: 'R-011', hhid: 'HH-DEMO-1052', wgp: 'WGP-TEST-4212', name: 'Finley Sample', birthday: '1997-08-19', ebt: 'EBT-DEMO-104212', pk: 'PK-SAMPLE-1052', municipality: 'Cedar Point', issue: 'review', note: 'WGP ID repeats R-006 while other fields differ. Investigate; do not assume a duplicate.' },
    { id: 'R-012', hhid: 'HH-DEMO-1053', wgp: 'WGP-TEST-4213', name: 'Dakota Example', birthday: '1999-13-05', ebt: 'EBT-DEMO-104213', pk: 'PK-SAMPLE-1053', municipality: 'Maple Bay', issue: 'date', note: 'Month 13 is invalid; verify the original source through the approved process.' },
  ]
}
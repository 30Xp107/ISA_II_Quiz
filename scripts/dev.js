import { spawn } from 'node:child_process'

async function responds(url, check) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(900) })
    return response.ok && await check(response)
  } catch {
    return false
  }
}

const [apiReady, clientReady] = await Promise.all([
  responds('http://localhost:3000/api/health', async (response) => (await response.json()).status === 'ok'),
  responds('http://localhost:5173/', async () => true),
])

if (apiReady && clientReady) {
  console.log('Quiz is already running at http://localhost:5173')
  console.log('Open that URL instead of starting another copy.')
  process.exit(0)
}

if (apiReady || clientReady) {
  console.error('A development port is already occupied by a partial or different server.')
  console.error(`API on :3000: ${apiReady ? 'ready' : 'not responding'}`)
  console.error(`Frontend on :5173: ${clientReady ? 'ready' : 'not responding'}`)
  console.error('Stop the existing process before starting the quiz again.')
  process.exit(1)
}

const child = spawn('npm', ['run', 'dev:pair'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

child.on('error', (error) => {
  console.error(`Could not start the development servers: ${error.message}`)
  process.exitCode = 1
})

child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0)
})
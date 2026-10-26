import bcrypt from 'bcryptjs'
import readline from 'node:readline'

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('Run this script in an interactive terminal so the password can be entered without echo.')
  process.exit(1)
}

const input = readline.createInterface({ input: process.stdin, output: process.stdout })
readline.emitKeypressEvents(process.stdin, input)
process.stdin.setRawMode(true)
process.stdout.write('Production admin password (hidden): ')

let password = ''
process.stdin.on('keypress', async (character, key = {}) => {
  if (key.ctrl && key.name === 'c') {
    process.stdout.write('\nCancelled.\n')
    process.stdin.setRawMode(false)
    input.close()
    process.exit(130)
  }
  if (key.name === 'return') {
    process.stdin.setRawMode(false)
    input.close()
    process.stdout.write('\n')
    if (password.length < 14) {
      console.error('Use a password with at least 14 characters.')
      process.exit(1)
    }
    console.log(await bcrypt.hash(password, 12))
    process.exit(0)
  }
  if (key.name === 'backspace') {
    password = password.slice(0, -1)
    return
  }
  if (!key.ctrl && !key.meta && character) password += character
})

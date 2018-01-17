const chalk = require('chalk')

const winston = require('winston')

class ConsoleTransport extends winston.Transport {
  log (level, message) {
    switch (level) {
      case 'debug':
        return console.log(chalk` 🐛  {gray ${message}}`)
      case 'info':
        return console.info(chalk` 🛈  {blue ${message}}`)
      case 'ok':
        return console.warn(chalk` ✓  {green ${message}}`)
      case 'warn':
        return console.warn(chalk` ⚠  {orange ${message}}`)
      case 'error':
        return console.error(chalk` 💣  {red ${message}}`)
      default:
        return console.log(chalk` ?  ${level}: ${message}`)
    }
  }
}

const logger = new winston.Logger({
  levels: {
    debug: 4,
    info: 3,
    ok: 2,
    warn: 1,
    error: 0
  },
  transports: [
    new ConsoleTransport()
  ]
})

module.exports = logger

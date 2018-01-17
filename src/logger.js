const chalk = require('chalk')

const winston = require('winston')

class ConsoleTransport extends winston.Transport {
  log (level, message) {
    switch (level) {
      case 'debug':
        return console.log(chalk` 🐛  {gray ${message}}`)
      case 'info':
        return console.info(chalk` 🛈  {green ${message}}`)
      case 'warn':
        return console.warn(chalk` ⚠  {orange ${message}}`)
      case 'error':
        return console.error(chalk` 💣  {red ${message}}`)
      default:
        return console.log(chalk`   {blue ${level}: ${message}`)
    }
  }
}

const logger = new winston.Logger({
  transports: [
    new ConsoleTransport()
  ]
})

module.exports = logger

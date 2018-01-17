class TestLogger {
  constructor () {
    this.messages = []
  }
  debug (message) {
    this.messages.push(['debug', message])
  }
  info (message) {
    this.messages.push(['info', message])
  }
  warn (message) {
    this.messages.push(['warn', message])
  }
  error (message) {
    this.messages.push(['error', message])
  }
}

module.exports = new TestLogger()

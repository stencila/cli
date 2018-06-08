const test = require('tape')

/**
 * Test an async function
 *
 * A convenience function that provides better
 * handling of errors when testing async functions
 *
 * @param  {String} name Name of test
 * @param  {Function} func Async test function
 */
function testAsync (name, func) {
  test(name, async assert => {
    try {
      await func(assert)
    } catch (error) {
      assert.fail(error.stack)
      assert.end()
    }
  })
}

/**
 * Test logger for capturing and checking messages
 */
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
  ok (message) {
    this.messages.push(['ok', message])
  }
  warn (message) {
    this.messages.push(['warn', message])
  }
  error (message) {
    this.messages.push(['error', message])
  }
}

module.exports = { testAsync, TestLogger }

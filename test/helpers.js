const test = require('tape')

const CLI = require('../src/cli')

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
      assert.fail(error.message)
      console.error(error)
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

// Given how caporal works it is necessary to have
// a single logger, that is reused across tests
const logger = new TestLogger()
const cli = CLI(logger)

/**
 * Primary test function for testing argument parsing etc
 */
async function testCLI (args) {
  // Clear logger messages before running
  logger.messages = []
  await cli.parse(['process', 'stencila'].concat(args))
  return logger
}

module.exports = { testAsync, testCLI }

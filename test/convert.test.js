const test = require('tape')

const convert = require('../src/convert')
const logger = require('./test-logger')

test('convert', (assert) => {
  Promise.resolve().then(() => {
    return convert({from: 'foo', to: 'bar'}, {}, logger).then(() => {
      assert.deepEqual(logger.messages, [
        [ 'debug', 'convert("foo", "bar"): started' ],
        [ 'error', 'No converters can import from foo' ]
      ])
    })
  }).then(() => {
    assert.end()
  }).catch((err) => {
    assert.fail(err)
    assert.end()
  })
})

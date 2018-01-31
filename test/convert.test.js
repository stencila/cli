const test = require('tape')
const path = require('path')

const convert = require('../src/convert')
const TestLogger = require('./TestLogger')

test('convert', (assert) => {
  Promise.resolve().then(() => {
    const logger = new TestLogger()
    return convert({from: 'foo', to: 'bar'}, {}, logger).then(() => {
      assert.deepEqual(logger.messages, [
        [ 'debug', 'Converting "foo" to "bar"' ],
        [ 'error', 'Error converting "foo" to "bar": No converters can import from foo' ]
      ])
    })
  }).then(() => {
    const from = path.join(__dirname, 'fixtures', 'hello-world.md')
    const to = path.join(__dirname, 'outputs', 'hello-world.html')
    const logger = new TestLogger()
    return convert({from, to}, {}, logger).then(() => {
      assert.deepEqual(logger.messages, [
        [ 'debug', `Converting "${from}" to "${to}"` ],
        [ 'ok', `Success converting "${from}" to "${to}"` ]
      ])
    })
  }).then(() => {
    assert.end()
  }).catch((err) => {
    assert.fail(err)
    assert.end()
  })
})

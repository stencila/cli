const path = require('path')

const convert = require('../src/convert')
const {testAsync, TestLogger} = require('./helpers')

testAsync('convert', async assert => {
  let logger

  logger = new TestLogger()
  await convert({from: 'foo', to: 'bar'}, {}, logger)

  assert.deepEqual(logger.messages, [
    [ 'debug', 'Converting "foo" to "bar"' ],
    [ 'error', 'Error converting "foo" to "bar": No converter for path "foo"' ]
  ])

  const from = path.join(__dirname, 'fixtures', 'hello-world.md')
  const to = path.join(__dirname, 'outputs', 'hello-world.jats.xml')
  logger = new TestLogger()
  await convert({from, to}, {}, logger)

  assert.deepEqual(logger.messages, [
    [ 'debug', `Converting "${from}" to "${to}"` ],
    [ 'ok', `Success converting "${from}" to "${to}"` ]
  ])

  assert.end()
})

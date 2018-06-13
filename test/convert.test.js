const path = require('path')

const {testAsync, testCLI} = require('./helpers')

testAsync('convert', async assert => {
  let logger

  logger = await testCLI(['convert', 'foo', 'bar'])
  assert.deepEqual(logger.messages, [
    [ 'debug', 'Converting "foo" to "bar"' ],
    [ 'error', 'Error converting "foo" to "bar": No converter for path "foo"' ]
  ])

  const from = path.join(__dirname, 'fixtures', 'hello-world.md')
  const to = path.join(__dirname, 'outputs', 'hello-world.jats.xml')
  logger = await testCLI(['convert', from, to])
  assert.deepEqual(logger.messages, [
    [ 'debug', `Converting "${from}" to "${to}"` ],
    [ 'ok', `Success converting "${from}" to "${to}"` ]
  ])

  assert.end()
})

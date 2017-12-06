const test = require('tape')

const convert = require('../src/convert')

test('convert', (assert) => {
  assert.equal(convert(), true)
  assert.end()
})

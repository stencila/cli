var path = require('path')
var tape = require('tape')

var check = require('../lib/check')

tape('check should check for main document', function (assert) {
  assert.plan(2)

  check(path.join(__dirname, 'fixtures', 'diamonds'), function (err) {
    assert.ifError(err)
  })

  check(path.join(__dirname, 'fixtures', 'empty'), function (err) {
    assert.equal(err.message, 'No main document in bundle')
  })
})
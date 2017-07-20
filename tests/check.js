var path = require('path')
var tape = require('tape')

var check = require('../lib/check')
var log = require('./log')

tape('check should check for main document', function (assert) {
  assert.plan(3)

  check(path.join(__dirname, 'fixtures', 'diamonds'), log, function (err) {
    assert.ifError(err)
  })

  check(path.join(__dirname, 'fixtures', 'main-missing'), log, function (err) {
    assert.ifError(err)
    assert.ok(log.last.warning.match(/^No main document in bundle/))
  })
})

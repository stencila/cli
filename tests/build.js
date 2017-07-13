var path = require('path')
var tape = require('tape')

var build = require('../lib/build')

tape('should build a thing', function (assert) {
  assert.plan(1)
  var name = 'foo'
  var location = path.join(__dirname, 'fixtures/diamonds')
  build(location, name, function (err, route) {
    assert.ifError(err, 'no err')
  })
})

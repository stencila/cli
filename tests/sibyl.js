var tape = require('tape')
var path = require('path')
var spok = require('spok')
var uuid = require('uuid')
var fs = require('fs')

var Sibyl = require('../lib/sibyl')

tape('should fetch from disk', function (assert) {
  assert.plan(2)
  var dir = path.join('/tmp', uuid().slice(0, 6))
  var sibyl = Sibyl({ directory: dir })
  var address = 'file://' + path.join(__dirname, 'fetch-file/hello')
  sibyl.fetch(address, function (err, res) {
    assert.ifError(err, 'no error fetching')
    var files = fs.readdirSync(dir)
    spok(assert, files, [ 'main.md' ])
  })
})

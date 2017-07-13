var tape = require('tape')
var path = require('path')
var spok = require('spok')
var uuid = require('uuid')
var fs = require('fs')

var Sibyl = require('../lib/sibyl')

tape('fetch should error for unknown protocol', function (assert) {
  assert.plan(2)
  var sibyl = Sibyl()
  sibyl.fetch('bad format', function (err, res) {
    assert.equal(err.message, 'No location provided')
  })
  sibyl.fetch('unprotocol://location', function (err, res) {
    assert.equal(err.message, 'Unknown protocol: unprotocol')
  })
})

tape('should fetch from disk directory', function (assert) {
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

tape('should fetch from disk tar archive', function (assert) {
  assert.plan(2)
  var dir = path.join('/tmp', uuid().slice(0, 6))
  var sibyl = Sibyl({ directory: dir })
  var address = 'file://' + path.join(__dirname, 'fetch-file/hello.tar.gz')
  sibyl.fetch(address, function (err, res) {
    assert.ifError(err, 'no error fetching')
    var files = fs.readdirSync(dir)
    spok(assert, files, [ 'main.md' ])
  })
})

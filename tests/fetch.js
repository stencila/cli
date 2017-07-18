var fs = require('fs')
var path = require('path')
var spok = require('spok')
var tape = require('tape')
var tmp = require('tmp')

var fetch = require('../lib/fetch')

tape('fetch should error for unknown protocol', function (assert) {
  fetch('unprotocol', 'location', 'version', 'directory', function (err) {
    assert.equal(err.message, 'Unknown protocol: unprotocol')
    assert.end()
  })
})

tape('fetch should do nothing for null protocol (current directory)', function (assert) {
  fetch(null, null, null, null, function (err) {
    assert.ifError(err, 'no error')
    assert.end()
  })
})

tape('fetch should fetch from filesystem directory', function (assert) {
  tmp.dir(function (err, directory) {
    if (err) throw err
    fetch('file', path.join(__dirname, 'fixtures', 'diamonds'), null, directory, function (err, res) {
      assert.ifError(err, 'no error')
      var files = fs.readdirSync(directory)
      spok(assert, files, [ 'README.md', 'data.csv' ])
      assert.end()
    })
  })
})

tape('should fetch from filesystem tar archive', function (assert) {
  tmp.dir(function (err, directory) {
    if (err) throw err
    fetch('file', path.join(__dirname, 'fixtures', 'diamonds.tar.gz'), null, directory, function (err, res) {
      assert.ifError(err, 'no error fetching')
      var files = fs.readdirSync(directory)
      spok(assert, files, [ 'README.md', 'data.csv' ])
      assert.end()
    })
  })
})

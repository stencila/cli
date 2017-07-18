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

tape('should fetch from filesystem tar.gz archive', function (assert) {
  tmp.dir(function (err, directory) {
    if (err) throw err
    fetch('file', path.join(__dirname, 'fixtures', 'diamonds.tar.gz'), null, directory, function (err, res) {
      assert.ifError(err, 'no error')
      var files = fs.readdirSync(directory)
      spok(assert, files, [ 'README.md', 'data.csv' ])
      assert.end()
    })
  })
})

tape('should fetch from filesystem zip archive', function (assert) {
  tmp.dir(function (err, directory) {
    if (err) throw err
    fetch('file', path.join(__dirname, 'fixtures', 'hello.zip'), null, directory, function (err, res) {
      assert.ifError(err, 'no error')
      var files = fs.readdirSync(directory)
      assert.equal(files.length, 1, 'there is one file')
      spok(assert, files, [ 'main.md' ])
      assert.end()
    })
  })
})

tape('should fetch from a Github repo', function (assert) {
  tmp.dir(function (err, directory) {
    if (err) throw err
    fetch('github', 'stencila/examples/diamonds', 'master', directory, function (err, res) {
      assert.ifError(err, 'no error')
      var files = fs.readdirSync(directory)
      spok(assert, files, [ 'LICENSE', 'README.md' ])
      assert.end()
    })
  })
})

tape('should fetch from a Dropbox shared folder', function (assert) {
  tmp.dir(function (err, directory) {
    if (err) throw err
    fetch('dropbox', 'el77xzcpr9uqxb1/AABJIkDNXo_-sKnrUtQvCxC4a', null, directory, function (err, res) {
      assert.ifError(err, 'no error')
      var files = fs.readdirSync(directory)
      assert.ok(files.length > 0, 'there are some files')
      spok(assert, files, [ 'main.md', 'my-data.csv' ])
      assert.end()
    })
  })
})

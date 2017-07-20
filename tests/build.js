var path = require('path')
var tape = require('tape')
var tmp = require('tmp')

var fetch = require('../lib/fetch')
var compile = require('../lib/compile')
var build = require('../lib/build')
var log = require('./log')

// Creates a temp dir, fetches the test fixture, compiles
// a Dockerfile and builds a container for it
function buildImage (fixture, name, cb) {
  tmp.dir(function (err, directory) {
    if (err) return cb(err)
    fetch('file', fixture, null, directory, log, function (err, res) {
      if (err) return cb(err)
      compile(directory, null, log, function (err) {
        if (err) return cb(err)
        build(directory, name, log, cb)
      })
    })
  })
}

tape('build should build something', function (assert) {
  buildImage(path.join(__dirname, 'fixtures', 'diamonds'), 'aardvark:alice', function (err) {
    assert.ifError(err, 'no err')
    assert.end()
  })
})

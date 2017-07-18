var path = require('path')
var tape = require('tape')
var tmp = require('tmp')

var fetch = require('../lib/fetch')
var compile = require('../lib/compile')
var build = require('../lib/build')

// Creates a temp dir, fetches the test fixture, compiles
// a Dockerfile and builds a container for it
function buildImage (fixture, name, cb) {
  tmp.dir(function (err, directory) {
    if (err) return cb(err)
    fetch('file', fixture, null, directory, function (err, res) {
      if (err) return cb(err)
      compile(directory, function (err) {
        if (err) return cb(err)
        build(directory, name, cb)
      })
    })
  })
}

tape('build should build something', function (assert) {
  buildImage(path.join(__dirname, 'fixtures', 'diamonds'), 'aardvark:alice', function (err, stream) {
    assert.ifError(err, 'no err')
    stream.pipe(process.stdout)
    assert.end()
  })
})

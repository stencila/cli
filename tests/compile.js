var fs = require('fs')
var path = require('path')
var tape = require('tape')
var tmp = require('tmp')

var fetch = require('../lib/fetch')
var compile = require('../lib/compile')
var log = require('./log')

// Creates a temp dir, fetches the test fixture and compiles
// a Dockerfile
function compileDockerfile (source, cb) {
  tmp.dir(function (err, directory) {
    if (err) return cb(err)
    fetch('file', source, null, directory, log, function (err, res) {
      if (err) return cb(err)
      compile(directory, null, log, function (err) {
        if (err) return cb(err)
        fs.readFile(path.join(directory, 'Dockerfile'), 'utf8', cb)
      })
    })
  })
}

tape('compile should produce default Dockerfile for bundles with no requirements', function (assert) {
  compileDockerfile(path.join(__dirname, 'fixtures', 'hello'), function (err, dockerfile) {
    assert.ifError(err, 'no error')
    assert.equal(dockerfile, 'FROM stencila/iota\nCOPY . .\n')
    assert.end()
  })
})

tape('compile should not override existing Dockerfile', function (assert) {
  compileDockerfile(path.join(__dirname, 'fixtures', 'dockerfile'), function (err, dockerfile) {
    assert.ifError(err, 'no error')
    assert.equal(dockerfile, '# A custom Dockerfile provided by the user\n\nFROM stencila/iota\n')
    assert.end()
  })
})

var fs = require('fs')
var path = require('path')
var tape = require('tape')
var tmp = require('tmp')

var fetch = require('../lib/fetch')
var compile = require('../lib/compile')

// Creates a temp dir, fetches the test fixture and compiles
// a Dockerfile
function compileDockerfile (source, cb) {
  tmp.dir(function (err, directory) {
    if (err) return cb(err)
    fetch('file', source, null, directory, function (err, res) {
      if (err) return cb(err)
      compile(directory, function (err) {
        if (err) return cb(err)
        fs.readFile(path.join(directory, 'Dockerfile'), 'utf8', cb)
      })
    })
  })
}

tape('compile should produce default Dockerfile for bundles with no requirements', function (assert) {
  compileDockerfile(path.join(__dirname, 'fixtures', 'hello'), function (err, dockerfile) {
    assert.ifError(err, 'no error')
    assert.equal(dockerfile, compile.defaults['Dockerfile'])
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

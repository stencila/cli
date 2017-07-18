var fs = require('fs')
var path = require('path')
var tape = require('tape')
var tmp = require('tmp')

var fetch = require('../lib/fetch')
var compile = require('../lib/compile')

tape('compile should produce default Dockerfile for empty bundles', function (assert) {
  tmp.dir(function (err, directory) {
    if (err) throw err
    fetch('file', path.join(__dirname, 'fixtures', 'empty'), null, directory, function (err, res) {
      assert.ifError(err, 'no error')
      compile(directory, function (err) {
        assert.ifError(err, 'no error')
        fs.readFile(path.join(directory, 'Dockerfile'), 'utf8', function (err, data) {
          assert.ifError(err, 'no error')
          assert.equal(data, 'FROM stencila/alpha\nCOPY . .')
          assert.end()
        })
      })
    })
  })
})

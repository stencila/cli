var explain = require('explain-error')
var assert = require('assert')
var path = require('path')
var fs = require('fs')

var SIBYL_FROM = 'stencila/alpha'

var TEMPLATE = `
FROM ${SIBYL_FROM}
COPY . .
`.trim()

var fromStencila = /^FROM stencila\/.*$/

module.exports = compile

function compile (directory, cb) {
  assert.equal(typeof directory, 'string', 'sibyl/compile: directory should be type string')
  assert.equal(typeof cb, 'function', 'sibyl/compile: cb should be type function')

  var dockerfile = path.join(directory, 'Dockerfile')
  fs.stat(dockerfile, function (_, stat) {
    if (stat) {
      validateDockerfile(dockerfile, function (err) {
        if (err) return cb(err)
        cb()
      })
    } else {
      fs.writeFile(dockerfile, TEMPLATE, function (err) {
        if (err) return cb(explain(err, 'Error writing template files to disk'))
        // TODO: detect and install the right file
        cb()
      })
    }
  })
}

function validateDockerfile (dockerfile, cb) {
  fs.readFile(dockerfile, { encoding: 'utf8' }, function (err, file) {
    if (err) return cb(explain(err, 'Error reading out Dockerfile at ' + dockerfile))
    var ok = fromStencila.test(file)
    if (!ok) return cb(new Error('Dockerfile at ' + dockerfile + ' is not based on a Stencila image'))
    cb()
  })
}

var debug = require('debug')('sibyl/compile')
var explain = require('explain-error')
var async = require('async-collection')
var assert = require('assert')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')

var SIBYL_FROM = 'stencila/iota'

var TEMPLATE = `
  FROM ${SIBYL_FROM}
  COPY . .
`.replace('^  ', '')

var DOCKER_IGNORE_TEMPLATE = `
  Dockerfile
`.replace('^  ', '')

var fromStencila = /^FROM stencila\/.*$/

module.exports = compile

function compile (root, cb) {
  assert.equal(typeof root, 'string: sibyl/compile: root should be type string')
  assert.equal(typeof cb, 'function: sibyl/compile: cb should be type function')

  var dirname = path.join(root, '.sibyl')
  debug('Creating directory', dirname)
  mkdirp(dirname, function (err) {
    if (err) return cb(explain(err, 'sibyl/compile: Error creating directory ' + dirname))

    var dockerfile = path.join(dirname, 'Dockerfile')
    var ignoreFile = path.join(dirname, '.dockerignore')
    fs.stat(dockerfile, function (_, stat) {
      if (stat) {
        validateDockerfile(dockerfile, function (err) {
          if (err) return cb(err)
          cb(null, dirname)
        })
      } else {
        async.parallel([
          fs.writeFile.bind(fs, dockerfile, TEMPLATE),
          fs.writeFile.bind(fs, ignoreFile, DOCKER_IGNORE_TEMPLATE)
        ], function (err) {
          if (err) return cb(explain(err, 'Error writing template files to disk'))
          // TODO: detect and install the right file
        })
      }
    })
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

var hashStream = require('fixed-size-chunk-hashing')
var debug = require('debug')('sibyl/lib/build')
var Docker = require('dockerode')
var assert = require('assert')
var pump = require('pump')
var fs = require('fs')

module.exports = build

function build (location, name, cb) {
  assert.equal(typeof location, 'string', 'build: location should be type string')
  assert.equal(typeof name, 'string', 'build: name should be type string')
  assert.equal(typeof cb, 'function', 'build: cb should be type function')

  var didErr = false
  var source = fs.createReadStream(location)
  var sink = hashStream(Infinity, function (err, hashes) {
    if (err && !didErr) {
      didErr = true
      return cb(err)
    }
    var imageName = name + ':' + hashes.concat('')
    debug('Building ' + imageName)

    var docker = new Docker()
    docker.buildImage(location, { t: imageName }, cb)
  })

  pump(source, sink, function (err) {
    if (err && !didErr) {
      didErr = true
      return cb(err)
    }
  })
}

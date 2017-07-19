// var hashStream = require('fixed-size-chunk-hashing')
// var debug = require('debug')('sibyl/lib/build')
var Docker = require('dockerode')
var assert = require('assert')
// var pump = require('pump')
var fs = require('fs')
var path = require('path')

module.exports = build

function build (directory, name, cb) {
  assert.equal(typeof directory, 'string', 'build: directory should be type string')
  assert.equal(typeof name, 'string', 'build: name should be type string')
  assert.equal(typeof cb, 'function', 'build: cb should be type function')

  var files = fs.readdirSync(directory).filter(function (file) {
    return fs.statSync(path.join(directory, file)).isFile()
  })

  var docker = new Docker()
  docker.buildImage({
    context: directory,
    src: files
  }, { t: name }, function (err, stream) {
    if (err) return cb(err)
    stream.pipe(process.stdout)
    docker.modem.followProgress(stream, cb)
  })

  // TODO: check with yoshua about what this does
  /*
  var didErr = false
  var source = fs.createReadStream(directory)
  var sink = hashStream(Infinity, function (err, hashes) {
    if (err && !didErr) {
      didErr = true
      return cb(err)
    }
    var imageName = name + ':' + hashes.concat('')
    debug('Building ' + imageName)

    var docker = new Docker()
    docker.buildImage(directory, { t: imageName }, cb)
  })

  pump(source, sink, function (err) {
    if (err && !didErr) {
      didErr = true
      return cb(err)
    }
  })
  */
}

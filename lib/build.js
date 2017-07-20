// var hashStream = require('fixed-size-chunk-hashing')
// var debug = require('debug')('sibyl/lib/build')
var Docker = require('dockerode')
var assert = require('assert')
// var pump = require('pump')
var fs = require('fs')
var path = require('path')

module.exports = build

function build (directory, name, log, cb) {
  assert.equal(typeof directory, 'string', 'build: directory should be type string')
  assert.equal(typeof name, 'string', 'build: name should be type string')
  assert.equal(typeof cb, 'function', 'build: cb should be type function')

  var image = 'sibyl-' + name

  var files = fs.readdirSync(directory).filter(function (file) {
    return fs.statSync(path.join(directory, file)).isFile()
  })

  var docker = new Docker()
  docker.buildImage({
    context: directory,
    src: files
  }, { t: image }, function (err, stream) {
    if (err) return cb(err)

    docker.modem.followProgress(stream, onFinished, onProgress)
    function onFinished (err, output) {
      cb(err, image)
    }
    function onProgress (event) {
      var display = ''
      if (event.stream) {
        // e.g. 'Step 1/2 : FROM stencila/iota\n'
        display = event.stream
      } else if (event.status) {
        // e.g  'Downloading', 'Extracting', 'Verifying Checksum'
        display = `${event.status} ${event.id || ''} ${event.progress || ''}`
      }
      log({
        stage: 'build',
        image: image,
        display: display,
        event: event
      })
    }
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

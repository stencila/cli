var assert = require('assert')
var Docker = require('dockerode')
var randomPort = require('random-port')

module.exports = run

function run (image, output, cb) {
  assert.equal(typeof image, 'string', 'run: image should be type string')
  assert.equal(typeof cb, 'function', 'run: cb should be type function')

  var docker = new Docker()
  docker.getImage(image).inspect(function (err) {
    if (err) {
      if (err.reason === 'no such image') {
        pullImage(docker, image, output, function (err) {
          if (err) return cb(err)
          runContainer(docker, image, output, cb)
        })
      } else cb(err)
    } else {
      runContainer(docker, image, output, cb)
    }
  })
}

function pullImage (docker, image, output, cb) {
  docker.pull(image, function (err, stream) {
    if (err) return cb(err)
    stream.pipe(output)
    docker.modem.followProgress(stream, cb)
  })
}

function runContainer (docker, image, output, cb) {
  randomPort(function (port) {
    docker.createContainer({
      'Image': image,
      'ExposedPorts': {
        '2000/tcp': {}
      },
      'PortBindings': {
        '2000/tcp': [{
          'HostPort': `${port}`
        }]
      }
    }, function (err, container) {
      if (err) return cb(err)
      container.start(function (err, data) {
        if (err) return cb(err)
        cb(null, `http://localhost:${port}`, data, container)
      })
    })
  })
}

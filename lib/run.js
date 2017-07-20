var assert = require('assert')
var Docker = require('dockerode')
var randomPort = require('random-port')

module.exports = run

function run (image, log, cb) {
  assert.equal(typeof image, 'string', 'run: image should be type string')
  assert.equal(typeof cb, 'function', 'run: cb should be type function')

  log({
    stage: 'run'
  })

  var docker = new Docker()
  docker.getImage(image).inspect(function (err) {
    if (err) {
      if (err.reason === 'no such image') {
        pullImage(docker, image, log, function (err) {
          if (err) return cb(err)
          runContainer(docker, image, log, cb)
        })
      } else cb(err)
    } else {
      runContainer(docker, image, log, cb)
    }
  })
}

function pullImage (docker, image, log, cb) {
  docker.pull(image, function (err, stream) {
    if (err) return cb(err)

    docker.modem.followProgress(stream, onFinished, onProgress)
    function onFinished (err, output) {
      cb(err)
    }
    function onProgress (event) {
      var display = ''
      if (event.status) {
        // e.g  'Downloading', 'Extracting', 'Verifying Checksum'
        display = `${event.status} ${event.id || ''} ${event.progress || ''}`
      }
      log({
        stage: 'run',
        display: display,
        event: event
      })
    }
  })
}

function runContainer (docker, image, log, cb) {
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
        var url = `http://localhost:${port}`
        log({
          stage: 'run',
          display: `Running at ${url}`
        })
        cb(null, url, data, container)
      })
    })
  })
}

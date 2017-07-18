var assert = require('assert')
var Docker = require('dockerode')
var randomPort = require('random-port')

module.exports = run

function run (image, cb) {
  assert.equal(typeof image, 'string', 'run: image should be type string')
  assert.equal(typeof cb, 'function', 'run: cb should be type function')

  randomPort(function (port) {
    var docker = new Docker()
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

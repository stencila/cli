var assert = require('assert')
var Docker = require('dockerode')

module.exports = run

function run (image, cb) {
  assert.equal(typeof image, 'string', 'run: image should be type string')
  assert.equal(typeof cb, 'function', 'run: cb should be type function')

  var docker = new Docker()
  docker.createContainer({
    Image: image
  }, function (err, container) {
    if (err) return cb(err)
    container.start({
      'PortBindings': {
        '2000/tcp': [{
          'HostIP': '0.0.0.0',
          'HostPort': '2323'
        }]
      }
    }, function (err, data) {
      if (err) return cb(err)
      cb(null, {
        url: 'http://localhost:2323',
        container: container
      })
    })
  })
}

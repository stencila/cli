var initialize = require('./lib/initialize')
var fetch = require('./lib/fetch')
var check = require('./lib/check')
var compile = require('./lib/compile')
var build = require('./lib/build')
var run = require('./lib/run')
var open = require('./lib/open')
var finalize = require('./lib/finalize')

module.exports = sibyl

function sibyl (stage, address, output, cb) {
  initialize(address, function (err, protocol, location, version, directory, name) {
    if (err) stop(err)
    fetch(protocol, location, version, directory, output, function (err) {
      if (err || stage === 'fetch') return stop(err, directory)
      check(directory, output, function (err) {
        if (err || stage === 'check') return stop(err, directory)
        compile(directory, null, output, function (err) {
          if (err || stage === 'compile') return stop(err, directory)
          build(directory, name, output, function (err, image) {
            if (err || stage === 'build') return stop(err, image)
            run(name, output, function (err, url) {
              if (err || stage === 'run') return stop(err, url)
              open(url, output, function (err) {
                stop(err, image, url)
              })
            })
          })
        })
      })
    })
    function stop (err, ...args) {
      if (err) return cb(err)
      finalize(protocol, location, version, directory, name, function (err) {
        cb(err, ...args)
      })
    }
  })
}

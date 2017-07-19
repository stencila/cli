var initialize = require('./lib/initialize')
var fetch = require('./lib/fetch')
var check = require('./lib/check')
var compile = require('./lib/compile')
var build = require('./lib/build')
var run = require('./lib/run')
var open = require('./lib/open')
var finalize = require('./lib/finalize')

module.exports = sibyl

function sibyl (stage, address, cb) {
  initialize(address, function (err, protocol, location, version, directory, name) {
    if (err) stop(err)
    fetch(protocol, location, version, directory, function (err) {
      if (err || stage === 'fetch') return stop(err)
      check(directory, function (err) {
        if (err || stage === 'check') return stop(err)
        compile(directory, null, function (err) {
          if (err || stage === 'compile') return stop(err)
          build(directory, name, function (err) {
            if (err || stage === 'build') return stop(err)
            run(name, function (err, url) {
              if (err || stage === 'run') return stop(err)
              open(url, stop)
            })
          })
        })
      })
    })
    function stop (err) {
      if (err) cb(err)
      else finalize(protocol, location, version, directory, name, cb)
    }
  })
}

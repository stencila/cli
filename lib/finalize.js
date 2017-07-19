var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')

module.exports = finalize

function finalize (protocol, location, version, directory, name, cb) {
  var configDir = path.join(directory, '.sibyl')
  mkdirp(configDir, (err) => {
    if (err) cb(err)
    else {
      var configFile = path.join(configDir, 'config.json')
      var data = JSON.stringify({
        protocol, location, version, directory, name
      }, null, '  ')
      fs.writeFile(configFile, data, cb)
    }
  })
}

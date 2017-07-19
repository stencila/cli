// var fs = require('fs')
var crypto = require('crypto')
// var mkdirp = require('mkdirp')
var path = require('path')
var slug = require('slug')

module.exports = initialize

function initialize (address, cb) {
  var protocol = null
  var location = null
  var version = null

  if (address) {
    var match1 = address.match(/^([^@]+)?(@(.*))?/)
    if (match1[1]) {
      var match2 = match1[1].match(/^([\w]+):\/\/(.+)/)
      protocol = match2[1] || null
      location = match2[2] || null
    }
    version = match1[3] || null
  }

  var name = slug(protocol + '-' + location.replace(/[:/]/g, '-'))
  // Add SHA to reduce chance of collision caused by slugging
  var sha256 = crypto.createHash('sha256')
  sha256.update(location)
  name += '-' + sha256.digest('hex').substring(0, 6)

  var directory = path.join(process.cwd(), name)

  return cb(null, protocol, location, version, directory, name)

  /*
  this.directory = process.cwd()

  var configDir = path.join(this.directory, '.sibyl')
  fs.access(configDir, fs.constants.R_OK, (err) => {
    if (err) {
      if (location) {
        var directory = path.join(process.cwd(), this.name)
        fs.access(directory, fs.constants.R_OK, (err) => {
          if (err) {
            mkdirp(directory, (err) => {
              if (err) cb(err)
              else {
                this.directory = directory
                cb(null, protocol, location, version)
              }
            })
          } else {
            this.directory = directory
            //readConfig()
          }
        })
      } else {
        // Use the current directory as the bundle
        cb(null, null, null, null, process.cwd())
      }
    } else {
      //readConfig()
    }
  })
  */
}

/*
function readConfig () {
    var configFile = path.join(this.directory, '.sibyl', 'config.json')
    fs.readFile(configFile, 'utf8', (err, data) => {
      if (!err) {
        this.config = JSON.parse(data)
        if (location) {
          // Check that user is not trying to change the address
          if (this.config.protocol !== protocol || this.config.location !== location) {
            return cb(new Error(`Can not change address of a bundle. Current: "${this.config.protocol}://${this.config.location}". Requested: "${protocol}://${location}".`))
          }
        } else {
          // If no protocol and location supplied use the current value in the config
          protocol = this.config.protocol
          location = this.config.location
        }
      }
      cb(null, protocol, location, version)
    })
}
*/

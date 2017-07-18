var Emitter = require('events').EventEmitter
var assert = require('assert')
var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var sha256 = require('sha256')
var slug = require('slug')

var fetch = require('./lib/fetch')
/* eslint-disable */
var check = require('./lib/check')
var compile = require('./lib/compile')
var build = require('./lib/build')
var run = require('./lib/run')
var open = require('./lib/open')
/* eslint-enable */

module.exports = Sibyl

function Sibyl (opts) {
  if (!(this instanceof Sibyl)) return new Sibyl(opts)
  Emitter.call(this)
  opts = opts || {}
  assert.equal(typeof opts, 'object', 'sibyl: opts should be type object')
  this.directory = opts.directory || path.join(process.cwd(), 'bundles')
}
Sibyl.prototype = Object.create(Emitter.prototype)

Sibyl.prototype.fetch = function (address, cb) {
  this.emit('fetch')

  assert.equal(typeof cb, 'function', 'sibyl.fetch: cb should be type function')

  this._initialize(address, (err, protocol, location, version) => {
    if (err) cb(err)
    else {
      fetch(protocol, location, version, this.directory, (err) => {
        if (err) cb(err)
        else {
          this.config = {
            protocol: protocol,
            location: location,
            version: version
          }
          this._finalize(cb)
        }
      })
    }
  })
}

Sibyl.prototype.open = function (address, cb) {
  this.emit('open')

  assert.equal(typeof cb, 'function', 'sibyl.open: cb should be type function')

  this._initialize(address, (err, protocol, location, version) => {
    if (err) return cb(err)
    var directory = this.directory
    var name = this.name
    fetch(protocol, location, version, directory, (err) => {
      if (err) return cb(err)
      compile(directory, function (err) {
        if (err) return cb(err)
        build(directory, name, function (err) {
          if (err) return cb(err)
          run(name, function (err, data) {
            if (err) return cb(err)
            open(`http://localhost:${data.port}`)
          })
        })
      })
      this.config = {
        protocol: protocol,
        location: location,
        version: version
      }
      this._finalize(cb)
    })
  })
}

Sibyl.prototype._initialize = function (address, cb) {
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

  this.directory = process.cwd()
  this.name = slug(protocol + '-' + location.replace(/[:/]/g, '-')) + '-' + sha256(location).substring(0, 6)

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
            readConfig()
          }
        })
      } else {
        // Use the current directory as the bundle
        cb(null, null, null, version)
      }
    } else {
      readConfig()
    }
  })

  var readConfig = () => {
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
}

Sibyl.prototype._finalize = function (cb) {
  var configDir = path.join(this.directory, '.sibyl')
  mkdirp(configDir, (err) => {
    if (err) cb(err)
    else {
      var configFile = path.join(configDir, 'config.json')
      var data = JSON.stringify(this.config || {}, null, '  ')
      fs.writeFile(configFile, data, cb)
    }
  })
}

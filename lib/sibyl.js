var Emitter = require('events').EventEmitter
var gunzip = require('gunzip-maybe')
var copy = require('copy-dir')
var assert = require('assert')
var tar = require('tar-fs')
var path = require('path')
var pump = require('pump')
var fs = require('fs')

module.exports = Sibyl

function Sibyl (opts) {
  if (!(this instanceof Sibyl)) return new Sibyl(opts)
  Emitter.call(this)

  opts = opts || {}
  assert.equal(typeof opts, 'object', 'sibyl: opts should be type object')

  this.bundleDir = opts.directory || path.join(process.cwd(), 'bundles')
}
Sibyl.prototype = Object.create(Emitter.prototype)

Sibyl.prototype.fetch = function (address, cb) {
  this.emit('fetch')

  assert.equal(typeof address, 'string', 'sibyl.fetch: address should be type string')
  assert.equal(typeof cb, 'function', 'sibyl.fetch: cb should be type function')

  var match = address.match(/^([\w]+):\/\/(.*)/)
  var protocol = match ? match[1] : null
  var location = match ? match[2] : null

  if (!location) cb(new Error('No location provided'))
  else if (protocol === 'file') this._fetchFile(location, cb)
  else cb(new Error('Unknown protocol: ' + protocol))
}

Sibyl.prototype._fetchFile = function (address, cb) {
  var source, sink
  if (/\.gzip|gz|tar\.gz|tgz|tar$/.test(address)) {
    source = fs.createReadStream(address)
    sink = tar.extract(this.bundleDir)
    pump(source, gunzip(), sink, cb)
  } else {
    copy(address, this.bundleDir, cb)
  }
}

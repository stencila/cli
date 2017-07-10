var Emitter = require('events').EventEmitter
var spawn = require('child_process').spawn
var gunzip = require('gunzip-maybe')
var request = require('request')
var copy = require('copy-dir')
var assert = require('assert')
var split = require('split2')
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
  this.directory = opts.directory || path.join(process.cwd(), 'bundles')
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
  else if (protocol === 'github') this._fetchGithub(location, cb)
  else if (protocol === 'dropbox') this._fetchDropbox(location, cb)
  else if (protocol === 'dat') this._fetchDat(location, cb)
  else cb(new Error('Unknown protocol: ' + protocol))
}

Sibyl.prototype._fetchFile = function (address, cb) {
  var source, sink
  if (/\.gzip|gz|tar\.gz|tgz|tar$/.test(address)) {
    source = fs.createReadStream(address)
    sink = tar.extract(this.directory)
    pump(source, gunzip(), sink, cb)
  } else {
    copy(address, this.directory, cb)
  }
}

Sibyl.prototype._fetchGithub = function (address, cb) {
  var gh = parseGithubAddress(address)
  var uri = `https://github.com/${gh.user}/${gh.repo}/tarball/master`
  var source = request.get(uri)
  var sink = fs.createWriteStream(this.directory)
  pump(source, gunzip(), sink, cb)
}

Sibyl.prototype._fetchDropbox = function (address, cb) {
  var uri = `https://dropbox.com/sh/${address}?dl=1`
  var source = request.get(uri)
  var sink = tar.extract(this.directory)
  pump(source, gunzip(), sink, cb)
}

Sibyl.prototype._fetchDat = function (address, cb) {
  var child = spawn('dat', [ address, '.', '--exit' ])
  var sink = fs.createWriteStream(this.directory)
  pump(child.stdout, indent, sink, cb)
}

function indent () {
  return split(function (chunk) {
    return '\n  ' + chunk
  })
}

function parseGithubAddress (address) {
  var regex = /^([^/]+?)\/([^/]+)(\/(.+))/
  var match = regex.exec(address)
  if (!match) return new Error('No match found')

  return {
    user: match[1],
    repo: match[2],
    dir: match[3]
  }
}

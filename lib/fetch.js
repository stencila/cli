var copy = require('copy-dir')
var fs = require('fs')
var gunzip = require('gunzip-maybe')
var pump = require('pump')
var request = require('request')
var spawn = require('child_process').spawn
var tar = require('tar-fs')

module.exports = fetch

function fetch (protocol, location, version, directory, cb) {
  switch (protocol) {
    case null:
      fetchNull(location, version, directory, cb)
      break
    case 'file':
      fetchFile(location, version, directory, cb)
      break
    case 'github':
      fetchGithub(location, version, directory, cb)
      break
    case 'dropbox':
      fetchDropbox(location, version, directory, cb)
      break
    case 'dat':
      fetchDat(location, version, directory, cb)
      break
    default:
      cb(new Error('Unknown protocol: ' + protocol))
  }
}

function fetchNull (location, version, directory, cb) {
  if (version !== null) return cb(new Error('It is invalid to specify a version for a bundle fetched from current directory'))
  cb()
}

function fetchFile (location, version, directory, cb) {
  if (version !== null) return cb(new Error('It is invalid to specify a version with the file:// protocol'))

  var source, sink
  if (/\.gzip|gz|tar\.gz|tgz|tar$/.test(location)) {
    source = fs.createReadStream(location)
    sink = tar.extract(directory)
    pump(source, gunzip(), sink, cb)
  } else {
    copy(location, directory, cb)
  }
}

function fetchGithub (location, version, directory, cb) {
  var match = location.match(/^([^/]+)\/([^/]+)(\/(.+))?/)
  if (!match) return cb(new Error('Location does not appear to be valid for the github:// protocol'))

  var ref = version === null ? 'master' : version
  var uri = `https://github.com/${match[1]}/${match[2]}/tarball/${ref}`
  var source = request.get(uri)
  var sink = fs.createWriteStream(directory)
  pump(source, gunzip(), sink, cb)
}

function fetchDropbox (location, version, directory, cb) {
  if (version !== null) return cb(new Error('It is invalid to specify a version with the dropbox:// protocol'))

  var uri = `https://dropbox.com/sh/${location}?dl=1`
  var source = request.get(uri)
  var sink = tar.extract(directory)
  pump(source, gunzip(), sink, cb)
}

function fetchDat (location, version, directory, cb) {
  var child = spawn('dat', [ location, '.', '--exit' ])
  var sink = fs.createWriteStream(directory)
  pump(child.stdout, sink, cb)
}

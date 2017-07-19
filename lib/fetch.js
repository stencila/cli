var copy = require('copy-dir')
var fs = require('fs')
var gunzip = require('gunzip-maybe')
var progressStream = require('progress-stream')
var pump = require('pump')
var request = require('request')
var spawn = require('child_process').spawn
var stripDirs = require('strip-dirs')
var tar = require('tar-fs')
var unzip = require('unzip-stream')

module.exports = fetch

function fetch (protocol, location, version, directory, output, cb) {
  switch (protocol) {
    case null:
      fetchNull(location, version, directory, cb)
      break
    case 'file':
      fetchFile(location, version, directory, cb)
      break
    case 'github':
      fetchGithub(location, version, directory, output, cb)
      break
    case 'dropbox':
      fetchDropbox(location, version, directory, output, cb)
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
  } else if (/\.zip$/.test(location)) {
    source = fs.createReadStream(location)
    sink = unzip.Extract({ path: directory })
    pump(source, sink, function () {
      setTimeout(cb, 10)
    })
  } else {
    copy(location, directory, cb)
  }
}

function fetchGithub (location, version, directory, output, cb) {
  var match = location.match(/^([^/]+)\/([^/]+)(\/(.+))?/)
  if (!match) return cb(new Error('Location does not appear to be valid for the github:// protocol'))

  var ref = version === null ? 'master' : version
  var uri = `https://github.com/${match[1]}/${match[2]}/tarball/${ref}`
  var source = request.get(uri)
  var prog = progress(`Fetching from ${uri}`, output)
  var sink = tar.extract(directory, {
    map: function (header) {
      header.name = stripDirs(header.name, 1)
      return header
    }
  })
  pump(source, prog, gunzip(), sink, cb)
}

function fetchDropbox (location, version, directory, output, cb) {
  if (version !== null) return cb(new Error('It is invalid to specify a version with the dropbox:// protocol'))

  var uri = `https://dropbox.com/sh/${location}?dl=1`
  var source = request.get(uri)
  var prog = progress(`Fetching from ${uri}`, output)
  var sink = unzip.Extract({ path: directory })
  pump(source, prog, sink, function () {
    setTimeout(cb, 10)
  })
}

function fetchDat (location, version, directory, cb) {
  var child = spawn('dat', [ location, '.', '--exit' ])
  var sink = fs.createWriteStream(directory)
  pump(child.stdout, sink, cb)
}

function progress (message, output) {
  output.write(message + '\n')
  var stream = progressStream({
    time: 100
  })
  stream.on('progress', function (progress) {
    output.write(progress.transferred + '\n')
  })
  return stream
}

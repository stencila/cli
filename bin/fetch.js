var minimist = require('minimist')

var usage = `
  Usage:
    $ sibyl fetch <address> [options]

  Options:
    -h, --help   Print usage

  Examples:
    sibyl fetch file://path/archive.tar.gz         # Fetch from the filesystem
    sibyl fetch github://user/repo/parent/folder   # Fetch from github
`

module.exports = fetch

function fetch (argv) {
  argv = minimist(argv, {
    alias: { help: 'h' }
  })

  var address = argv._[0]
  if (argv.help) {
    console.log(usage)
  } else if (address === undefined) {
    console.log('Please provide a valid address.')
    console.log(usage)
  } else {
    var Sibyl = require('../')
    var sibyl = Sibyl()
    sibyl.fetch(address)
  }
}

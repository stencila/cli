var minimist = require('minimist')

var usage = `
  Open a bundle in the browser.

  Usage:
    $ sibyl open <address> [options]

  Options:
    -h, --help   Print usage

  Examples:
    sibyl open file://path/archive.tar.gz         # Fetch from the filesystem
    sibyl open github://user/repo/parent/folder   # Fetch from github
`

module.exports = open

function open (argv) {
  argv = minimist(argv, {
    alias: { help: 'h' }
  })

  var address = argv._[0]
  if (argv.help) {
    console.log(usage)
  } else {
    var Sibyl = require('..')
    var sibyl = Sibyl()
    sibyl.open(address, function (err) {
      if (err) console.log(err.message)
    })
  }
}

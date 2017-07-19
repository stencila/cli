var minimist = require('minimist')

var usage = `
  Open a bundle in the browser.

  Usage:
    $ sibyl open <address> [options]

  Options:
    -h, --help          Print usage
    -k, --kubernetes    Set environment to kubernets

  Examples:
    sibyl open file://path/archive.tar.gz         # Fetch from the filesystem
    sibyl open github://user/repo/parent/folder   # Fetch from github
`

module.exports = open

function open (argv) {
  argv = minimist(argv, {
    alias: {
      help: 'h',
      kubernetes: 'k'
    },
    boolean: [
      'kubernetes'
    ]
  })

  var address = argv._[0]
  if (argv.help) {
    console.log(usage)
  } else {
    var Sibyl = require('..')
    var sibyl = Sibyl()
    sibyl.open(address, argv, function (err) {
      if (err) console.log(err.message)
    })
  }
}

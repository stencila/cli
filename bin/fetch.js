var minimist = require('minimist')

var usage = `
  Usage:
    $ sibyl fetch <value> [options]

  Options:
    -h, --help   Print usage
`

module.exports = fetch

function fetch (argv) {
  argv = minimist(argv, {
    alias: { help: 'h' }
  })

  var value = argv._[0]
  if (value === undefined) {
    console.log('Please provide a valid value.')
    console.log(usage)
  } else if (argv.help) {
    console.log(usage)
  }
}

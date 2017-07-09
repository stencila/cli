var minimist = require('minimist')

var usage = `
  Usage:
    $ sibyl launch <value> [options]

  Options:
    -h, --help   Print usage
`

module.exports = launch

function launch (argv) {
  argv = minimist(argv, {
    alias: { help: 'h' }
  })

  var value = argv._[0]
  if (argv.help) {
    console.log(usage)
  } else if (value === undefined) {
    console.log('Please provide a valid value.')
    console.log(usage)
  }
}

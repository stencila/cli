var minimist = require('minimist')

var usage = `
  Usage:
    $ sibyl check <value> [options]

  Options:
    -h, --help   Print usage
`

module.exports = check

function check (argv) {
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

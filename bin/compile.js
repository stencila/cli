var minimist = require('minimist')

var usage = `
  Usage:
    $ sibyl compile <value> [options]

  Options:
    -h, --help   Print usage
`

module.exports = compile

function compile (argv) {
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

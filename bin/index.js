#!/usr/bin/env node

var minimist = require('minimist')

var commands = [ 'fetch', 'check', 'compile', 'build', 'run', 'open' ]

var argv = minimist(process.argv.slice(2), {
  string: commands,
  alias: {
    help: 'h',
    version: 'v'
  }
})

var usage = `
  Usage:
    $ sibyl <command> [address] [options]

  Commands:
    fetch      Fetch a bundle
    check      Check a bundle's content
    compile    Compile a bundle
    build      Build a bundle image
    run        Run a bundle container
    open       Open a bundle in browser

  Options:
    -h, --help              Print usage
    -v, --version           Print version

  Examples:
    sibyl fetch file://path/archive.tar.gz  # Fetch from the filesystem
    sibyl open github://user/repo           # Open from github
`

;(function main (argv) {
  var command = argv._[0]
  var address = argv._[1]
  if (argv.help && !command) {
    console.log(usage)
  } else if (argv.version) {
    console.log(require('../package.json').version)
  } else if (commands.indexOf(command) === -1) {
    console.log('Please provide a valid command from the list below.')
    console.log(usage)
  } else {
    var sibyl = require('../')
    sibyl(command, address, function (err) {
      if (err) console.log(err)
    })
  }
})(argv)

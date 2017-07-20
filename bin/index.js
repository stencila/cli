#!/usr/bin/env node

var chalk = require('chalk')
var minimist = require('minimist')
var moment = require('moment')
var readline = require('readline')

var commands = [ 'fetch', 'check', 'compile', 'build', 'run', 'open' ]

var argv = minimist(process.argv.slice(2), {
  string: commands,
  alias: {
    help: 'h',
    version: 'v',
    silent: 's',
    quiet: 'q',
    loud: 'l'
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

    -s, --silent            Silent mode (show nothing)
    -q, --quiet             Quiet mode (show warnings and errors only)
    -l, --loud              Loud mode (show detailed log)

  Examples:
    sibyl fetch file://path/archive.tar.gz  # Fetch from the filesystem
    sibyl open github://user/repo           # Open from github
`

function warning (entry) {
  var line = chalk`  ⚠  {yellow Warning: ${entry.warning}}`
  console.error(line)
}

function error (err) {
  var line = chalk`  💣  {red Error: ${err.message}}`
  console.error(line)
}

function silent (entry) {
}

function quiet (entry) {
  if (entry.warning) warning(entry)
}

var stageLast
function normal (entry, overwite = true) {
  if (entry.warning) return warning(entry)

  var line = chalk`{grey ${moment().format('HH:mm:ss')}}  `
  var stage = entry.stage
  switch (stage) {
    case 'fetch':
      line += chalk`📥  {blue Fetching}`
      break
    case 'check':
      line += chalk`🔎  {blue Checking}`
      break
    case 'compile':
      line += chalk`📝  {blue Compiling}`
      break
    case 'build':
      line += chalk`🔨  {blue Building}`
      break
    case 'run':
      line += chalk`🚀  {blue Running}`
      break
    case 'open':
      line += chalk`👓  {blue Opening}`
      break
    case 'done':
      line += chalk`✨  {blue Done!}`
      break
    default:
      line = chalk.cyan(JSON.stringify(entry))
  }
  if (entry.display) {
    line += chalk`  {dim.green ${entry.display} }`
  }
  if (overwite && stage === stageLast) {
    readline.moveCursor(process.stdout, 0, -1)
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
  }
  process.stdout.write(line.replace('\n', '') + '\n')
  stageLast = stage
}

function loud (entry) {
  normal(entry, false)
  console.log(chalk.dim.grey(JSON.stringify(entry, null, '  ')))
}

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

    var log
    if (argv.silent) log = silent
    else if (argv.quiet) log = quiet
    else if (argv.loud) log = loud
    else log = normal

    sibyl(command, address, log, function (err, ...args) {
      if (err) {
        if (!argv.silent) error(err)
        process.exit(1)
      } else {
        log({ stage: 'done' })
      }
    })
  }
})(argv)

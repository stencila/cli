#!/usr/bin/env node

const cli = require('caporal')

const packag = require('../package.json')
const convert = require('../src/convert')

cli
  .bin('stencila')
  .version(packag.version)

  .command('convert', 'Convert files or folders to other formats')
    .argument('[from]', 'File/folder to convert from', null, '.')
    .argument('[to]', 'File/folder to convert to', null)
    .action(convert)

cli.parse(process.argv)

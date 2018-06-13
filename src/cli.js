const cli = require('caporal')

const packag = require('../package.json')
const convert = require('./convert')
const defaultLogger = require('./logger')
const setup = require('./setup')

module.exports = function (logger = defaultLogger) {
  cli
    .bin('stencila')
    .version(packag.version)
    .logger(logger)

  convert(cli)
  setup(cli)

  return cli
}

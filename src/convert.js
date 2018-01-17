const convert_ = require('stencila-convert').convert

function convert (args, options, logger) {
  let {from, to} = args
  logger.debug(`convert("${from}", "${to}"): started`)
  return convert_(from, to).then(() => {
    logger.debug(`convert("${from}", "${to}"): finished`)
  }).catch((err) => {
    logger.error(err.message)
  })
}

module.exports = convert

const convert_ = require('stencila-convert').convert

function convert (args, options, logger) {
  let {from, to} = args
  logger.debug(`Converting "${from}" to "${to}"`)
  return convert_(from, to).then(() => {
    logger.ok(`Success converting "${from}" to "${to}"`)
  }).catch((err) => {
    logger.error(`Error converting "${from}" to "${to}": ${err.message}`)
  })
}

module.exports = convert

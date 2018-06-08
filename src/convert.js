const convert_ = require('stencila-convert').convert

async function convert (args, options, logger) {
  let {from, to} = args
  logger.debug(`Converting "${from}" to "${to}"`)
  try {
    await convert_(from, to)
    logger.ok(`Success converting "${from}" to "${to}"`)
  } catch (err) {
    logger.error(`Error converting "${from}" to "${to}": ${err.message}`)
  }
}

module.exports = convert

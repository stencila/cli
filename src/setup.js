const setupConvert = require('stencila-convert').setup

async function setup (args, options, logger) {
  logger.debug(`Setting up`)
  try {
    await setupConvert()
    logger.ok(`Setup suceeded`)
  } catch (err) {
    logger.error(`Error with setup": ${err.message}`)
  }
}

module.exports = setup

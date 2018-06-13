const convert = require('stencila-convert')

module.exports = cli => {
  cli
    .command('setup', 'Setup required software dependencies')

    .action(async function setup (args, options, logger) {
      logger.debug(`Setting up`)
      try {
        await convert.setup()
        logger.ok(`Setup suceeded`)
      } catch (err) {
        logger.error(`Error with setup": ${err.message}`)
      }
    })
}

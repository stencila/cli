const {convert} = require('stencila-convert')

module.exports = cli => {
  cli
    .command('convert', 'Convert files or folders to other formats')

    .argument('[input]', 'Input file or folder to convert from (or "-" for standard input)', null, '-')
    .argument('[output]', 'Input file or folder to convert to (or "-" for standard output)', null, '-')
    .option('--from', 'Format to convert from (overrides file name extensions)')
    .option('--to', 'Format to convert to (overrides file name extensions)')

    .action(async (args, options, logger) => {
      const {input, output} = args
      const {from, to} = options
      logger.debug(`Converting "${input}" to "${output}"`)
      try {
        await convert(input, output, null, null, from, to)
        logger.ok(`Success converting "${input}" to "${output}"`)
      } catch (err) {
        logger.error(`Error converting "${input}" to "${output}": ${err.message}`)
      }
    })
}

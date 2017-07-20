module.exports = log

function log (entry) {
  log.last = entry
}
log.last = null

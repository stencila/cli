var assert = require('assert')
var opn = require('opn')

module.exports = open

function open (url, log, cb) {
  assert.equal(typeof url, 'string', 'open: url should be type string')

  log({
    stage: 'open'
  })

  opn(url + '/~')
  cb()
}

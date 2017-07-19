var assert = require('assert')
var opn = require('opn')

module.exports = open

function open (url, output, cb) {
  assert.equal(typeof url, 'string', 'open: url should be type string')

  opn(url + '/~')
  cb()
}

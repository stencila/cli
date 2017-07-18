var assert = require('assert')
var opn = require('opn')

module.exports = open

function open (url) {
  assert.equal(typeof url, 'string', 'open: url should be type string')

  console.log(url)
  opn(url)
}

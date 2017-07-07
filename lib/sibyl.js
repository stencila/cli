var Emitter = require('events').EventEmitter

module.exports = Sibyl

function Sibyl () {
  if (!(this instanceof Sibyl)) return new Sibyl()
  Emitter.call(this)
}
Sibyl.prototype = Object.create(Emitter.prototype)

Sibyl.prototype.fetch = function (address, cb) {
}

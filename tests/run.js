var tape = require('tape')

var run = require('../lib/run')

tape.skip('run should run a container', function (assert) {
  assert.plan(6)
  run('stencila/alpha', function (err, res) {
    assert.ifError(err, 'no err')
    res.container.inspect(function (err, data) {
      assert.ifError(err, 'no err')
      assert.equal(data.Config.Image, 'stencila/alpha')
      assert.equal(data.State.Status, 'running')
      res.container.stop(function (err, data) {
        assert.ifError(err, 'no err')
        res.container.remove(function (err, data) {
          assert.ifError(err, 'no err')
        })
      })
    })
  })
})

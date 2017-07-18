var tape = require('tape')

var run = require('../lib/run')

tape('run should run a container', function (assert) {
  assert.plan(7)
  run('stencila/alpha', function (err, url, data, container) {
    assert.ifError(err, 'no err')
    assert.ok(url.match(/^http:\/\/localhost:\d+/))
    container.inspect(function (err, data) {
      assert.ifError(err, 'no err')
      assert.equal(data.Config.Image, 'stencila/alpha')
      assert.equal(data.State.Status, 'running')
      container.stop(function (err, data) {
        assert.ifError(err, 'no err')
        container.remove(function (err, data) {
          assert.ifError(err, 'no err')
        })
      })
    })
  })
})

var fs = require('fs')

module.exports = check

function check (directory, log, cb) {
  log({
    stage: 'check'
  })

  var regexes = [
    /^main*./,
    /^index*./,
    /^README*./i
  ]

  fs.readdir(directory, function (err, files) {
    if (err) return cb(err)

    var count
    regexes.forEach(function (regex) {
      count = files.reduce(function (count, file) {
        return count + regex.test(file)
      }, 0)
    })
    if (count === 0) log({warning: 'No main document in bundle'})

    cb()
  })
}

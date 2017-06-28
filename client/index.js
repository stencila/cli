const css = require('sheetify')
const choo = require('choo')

css('tachyons')

const app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-expose')())
  app.use(require('choo-log')())
}

app.use(function (state) { state.events = {} })
app.use(require('./sse'))
app.use(require('./form'))
app.use(require('./embed'))

app.route('/', require('./view-main'))
app.route('/*', require('./view-main'))
app.mount('body')

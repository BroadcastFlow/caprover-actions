
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./caprover-action.cjs.production.min.js')
} else {
  module.exports = require('./caprover-action.cjs.development.js')
}

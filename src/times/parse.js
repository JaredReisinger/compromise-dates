const normalize = require('../normalize')
const parseTime = require('../04-parse/01-tokenize/03-time')

const parse = function (m, context) {
  m = normalize(m)
  let res = parseTime(m, context)
  return res
}
module.exports = parse

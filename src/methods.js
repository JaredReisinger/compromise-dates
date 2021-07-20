const getDates = require('./getDates')
const spacetime = require('spacetime')
const abbrevs = require('./data/_abbrevs')
const addDuration = require('./metadata/duration')
const addUnit = require('./metadata/unit')

module.exports = {
  /** easy getter for the start/end dates */
  get: function (options) {
    let arr = []
    this.forEach((doc) => {
      let dates = getDates(doc, this.context)
      dates.forEach((date) => {
        date.unit = addUnit(date)
      })
      arr = arr.concat(dates)
    })
    if (typeof options === 'number') {
      return arr[options]
    }
    return arr
  },
  /** overload the original json with date information */
  json: function (options) {
    let n = null
    if (typeof options === 'number') {
      n = options
      options = null
    }
    options = options || { terms: false }
    let res = []
    this.forEach((doc) => {
      let json = doc.json(options)[0]
      let date = getDates(doc, this.context)[0] //FIX: return all the dates!
      json = Object.assign(json, date)
      // add more data
      json.duration = addDuration(json)
      json.unit = addUnit(json)
      res.push(json)
    })
    if (n !== null) {
      return res[n]
    }
    return res
  },

  /** render all dates according to a specific format */
  format: function (fmt) {
    this.forEach((doc) => {
      let dates = getDates(doc, this.context)
      dates.forEach((obj) => {
        if (obj.start) {
          let start = spacetime(obj.start, this.context.timezone)
          let str = start.format(fmt)
          if (obj.end) {
            let end = spacetime(obj.end, this.context.timezone)
            if (start.isSame(end, 'day') === false) {
              str += ' to ' + end.format(fmt)
            }
          }
          doc.replaceWith(str, { keepTags: true, keepCase: false })
        }
      })
    })
    return this
  },
  /** replace 'Fri' with 'Friday', etc*/
  toLongForm: function () {
    abbrevs.forEach((a) => {
      this.replace(a.short, a.long, true)
    })
    return this
  },
  /** replace 'Friday' with 'Fri', etc*/
  toShortForm: function () {
    abbrevs.forEach((a) => {
      this.replace(a.long, a.short, true)
    })
    return this
  },
}

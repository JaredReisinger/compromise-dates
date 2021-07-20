const spacetime = require('spacetime')
const maxDate = 8640000000000000
const max_loops = 500

const shouldPick = function (s, byDay) {
  if (byDay && byDay[s.dayName()] !== true) {
    return false
  }
  return true
}

const hasTime = {
  millisecond: true,
  hour: true,
  time: true,
}

// list possible dates of a repeating date
const generateDates = function (result, context) {
  let list = []
  let max_count = context.max_repeat || 12
  let s = spacetime(result.start || context.today, context.timezone)

  if (result.repeat.time) {
    s = s.time(result.repeat.time)
  } else if (hasTime[result.unit] === true) {
    result.repeat.time = s.time()
  } else {
    s = s.startOf('day')
    let time = s.time()
    if (time === '12:00am' && context.dayStart) {
      s = s.time(context.dayStart)
    }
  }
  // should we stop at the end date?
  let end = spacetime(result.end, context.timezone)
  let toAdd = Object.keys(result.repeat.interval)
  if (toAdd[0] && s.isSame(end, toAdd[0]) === true) {
    // ignore the end date!
    end = spacetime(maxDate, context.timezone)
  }
  // should we only include these days?
  let byDay = null
  if (result.repeat.filter) {
    byDay = result.repeat.filter.weekDays
  }
  // start going!
  for (let i = 0; i < max_loops; i += 1) {
    if (list.length >= max_count || s.epoch >= end.epoch) {
      break
    }
    if (shouldPick(s, byDay, end)) {
      list.push(s.iso())
    }
    toAdd.forEach((unit) => {
      s = s.add(result.repeat.interval[unit], unit)
    })
  }
  // add end-times to list
  result.repeat.generated = list.map((start) => {
    let eod = spacetime(start, context.timezone)
    if (context.dayEnd) {
      eod = eod.time(context.dayEnd)
    } else {
      eod = eod.endOf('day')
    }
    return {
      start: start,
      end: eod.iso(),
    }
  })
  // if we got an interval, but not a start/end
  if (!result.start && result.repeat.generated && result.repeat.generated.length > 1) {
    let arr = result.repeat.generated
    result.start = arr[0].start
    result.end = arr[0].end
  }
  return result
}
module.exports = generateDates

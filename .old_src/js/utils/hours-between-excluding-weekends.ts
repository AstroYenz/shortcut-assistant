import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import minMax from 'dayjs/plugin/minMax'
import weekday from 'dayjs/plugin/weekday'


dayjs.extend(weekday)
dayjs.extend(isSameOrBefore)
dayjs.extend(minMax)

export function hoursBetweenExcludingWeekends(startStr: string, endStr: string, hours: number = 0.0): number {
  const start = dayjs(startStr)
  const end = dayjs(endStr)

  const current = start

  // Base case: if current is after end, return the accumulated hours
  if (current.isAfter(end)) {
    return hours
  }

  // Initialize nextDayStart at the beginning of each recursive call
  const nextDayStart = current.add(1, 'day').startOf('day')

  if (current.weekday() !== 0 && current.weekday() !== 6) { // Excludes Saturday (6) and Sunday (0)
    const dailyEnd = dayjs.min(end, nextDayStart)
    const dailyHours = dailyEnd.diff(current, 'hour', true)
    hours += dailyHours
  }

  // Recursive call with the start of the next day and the updated hours
  return hoursBetweenExcludingWeekends(nextDayStart.format(), endStr, hours)
}

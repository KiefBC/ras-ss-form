const TIMEZONE = 'America/Vancouver'

/// Today's date in Pacific time, as YYYY-MM-DD (matches the database's today_pacific()).
export const todayPacific = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date())

/// Client-side mirror of within_edit_window(), for UX only. The database enforces it.
export function submitWindowOpen() {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, hour: 'numeric', hourCycle: 'h23' }).format(new Date()),
  )
  return hour >= 5 && hour < 17
}

/// Today in Pacific time for display, e.g. "Monday, October 5, 2026".
export const formatTodayPacific = () =>
  new Date().toLocaleDateString('en-CA', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

/// A timestamp's time of day in Pacific time, e.g. "7:12 a.m.".
export const formatPacificTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-CA', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' })

/// A work date (YYYY-MM-DD) for display, e.g. "Sun, Oct 4, 2026".
/// Formatted in UTC on purpose: a bare date parses as UTC midnight, which in Pacific time is the day before.
export const formatWorkDate = (date: string) =>
  new Date(date).toLocaleDateString('en-CA', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

/// The date `days` days before a work date, both YYYY-MM-DD.
/// Done in UTC, like formatWorkDate, so a daylight-saving change can't shift it.
export function daysBefore(date: string, days: number) {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

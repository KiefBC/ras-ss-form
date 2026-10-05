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

export const formatPacificTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-CA', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' })

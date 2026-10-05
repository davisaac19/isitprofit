/**
 * Fechas y rangos, sin dependencias externas.
 * Las fechas de las actividades se guardan como 'YYYY-MM-DD' en hora local.
 */

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MONTHS_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

/** Fecha de hoy en formato ISO corto, en hora local. */
export function todayISO(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Convierte 'YYYY-MM-DD' a Date local sin líos de zona horaria. */
export function parseISODateToLocal(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (Number.isNaN(date.getTime())) return null
  return date
}

function daysBetween(fromISO: string, toISO: string): number | null {
  const from = parseISODateToLocal(fromISO)
  const to = parseISODateToLocal(toISO)
  if (!from || !to) return null
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}

/**
 * Etiqueta humana para el historial: "Hoy", "Ayer" o "15 sep".
 */
export function formatRelativeDate(iso: string, reference: Date = new Date()): string {
  const referenceISO = todayISO(reference)
  const diff = daysBetween(iso, referenceISO)

  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'

  const date = parseISODateToLocal(iso)
  if (!date) return iso
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`
}

/** Etiqueta larga: "15 de septiembre de 2025". */
export function formatLongDate(iso: string): string {
  const date = parseISODateToLocal(iso)
  if (!date) return iso
  return `${date.getDate()} de ${MONTHS_LONG[date.getMonth()]} de ${date.getFullYear()}`
}

/** true si la fecha ISO cae dentro del mes/año indicados. */
export function isInMonth(iso: string, year: number, month: number): boolean {
  const date = parseISODateToLocal(iso)
  if (!date) return false
  return date.getFullYear() === year && date.getMonth() === month
}

/** "Septiembre 2025" */
export function monthLabel(year: number, month: number): string {
  const name = MONTHS_LONG[month] ?? ''
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}

/** Rango `{ year, month }` del mes en curso. */
export function currentMonthRange(reference: Date = new Date()): { year: number; month: number } {
  return { year: reference.getFullYear(), month: reference.getMonth() }
}

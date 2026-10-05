/**
 * Utilidades para trabajar con montos en centavos.
 *
 * Regla del proyecto: el dinero NUNCA vive como float dentro del dominio,
 * solo como entero de centavos. El parseo desde texto ocurre en la frontera
 * de la UI y aquí se mantiene todo entero.
 */

const CENTS_PER_UNIT = 100

function toCents(amount: number): number {
  return Math.round(amount * CENTS_PER_UNIT)
}

/**
 * Convierte texto escrito por una persona a centavos.
 * Acepta "1,234.50", "500", "$ 25.50", "25,50" (coma decimal).
 * Devuelve `undefined` cuando no se escribió nada.
 * Devuelve `NaN` cuando se escribió algo que no es un monto entendible.
 */
export function parseMoneyToCents(input: string): number | undefined {
  const text = input.trim()
  if (!text) return undefined

  // Quitamos todo lo que no sea dígito, separador o signo.
  let cleaned = text.replace(/[^\d.,-]/g, '')
  if (!cleaned) return Number.NaN

  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')

  if (hasComma && hasDot) {
    // El último separador es el decimal.
    const decimalSep = cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.') ? ',' : '.'
    const thousandsSep = decimalSep === ',' ? '.' : ','
    cleaned = cleaned.split(thousandsSep).join('')
    if (decimalSep === ',') cleaned = cleaned.replace(',', '.')
  } else if (hasComma) {
    const parts = cleaned.split(',')
    // Varias comas => son separadores de miles.
    if (parts.length > 2) {
      cleaned = parts.join('')
    } else {
      const [, decimals = ''] = parts
      cleaned = decimals.length === 3 && parts[0].length <= 3 ? parts.join('') : `${parts[0]}.${decimals}`
    }
  } else if (hasDot) {
    const parts = cleaned.split('.')
    if (parts.length > 2) cleaned = parts.join('')
  }

  if (!/^-?\d*\.?\d*$/.test(cleaned) || cleaned === '' || cleaned === '.' || cleaned === '-') {
    return Number.NaN
  }

  const amount = Number(cleaned)
  if (!Number.isFinite(amount)) return Number.NaN

  return toCents(amount)
}

/**
 * Igual que `parseMoneyToCents` pero nunca devuelve texto inválido:
 * lo ilegible se trata como si no se hubiera escrito nada.
 * Se usa para cálculos en vivo, donde no queremos mostrar números raros.
 */
export function moneyToCentsOrUndefined(input: string): number | undefined {
  const cents = parseMoneyToCents(input)
  if (cents === undefined) return undefined
  if (!Number.isFinite(cents)) return undefined
  return cents
}

/** Formatea centavos como texto editable: 50000 -> "500.00" */
export function centsToInput(cents: number | undefined): string {
  if (cents === undefined || cents === null || !Number.isFinite(cents)) return ''
  return (cents / CENTS_PER_UNIT).toFixed(2)
}

/**
 * Formatea centavos como dinero para mostrar: 50000 -> "$500".
 * Omite los decimales cuando son cero para que los números se lean rápido.
 */
export function formatMoney(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0
  const negative = safe < 0
  const abs = Math.abs(safe)
  const units = Math.floor(abs / CENTS_PER_UNIT)
  const decimals = abs % CENTS_PER_UNIT

  const whole = units.toLocaleString('es-MX')
  const body = decimals === 0 ? whole : `${whole}.${String(decimals).padStart(2, '0')}`

  return `${negative ? '-' : ''}$${body}`
}

/** Igual que `formatMoney` pero siempre con signo (+/-) para ganancias. */
export function formatSignedMoney(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0
  if (safe === 0) return '$0'
  return `${safe > 0 ? '+' : '-'}${formatMoney(Math.abs(safe))}`
}

/**
 * Versión corta para espacios angostos: 123456789 -> "$1.2 M".
 * Se usa solo en resúmenes; el detalle siempre muestra el monto completo.
 */
export function formatMoneyCompact(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0
  const negative = safe < 0
  const units = Math.abs(safe) / CENTS_PER_UNIT
  const sign = negative ? '-' : ''

  if (units < 10_000) return `${sign}${formatMoney(Math.abs(safe))}`

  const format = (value: number, suffix: string): string => {
    const rounded = Math.round(value * 10) / 10
    const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
    return `${sign}$${text} ${suffix}`
  }

  if (units < 1_000_000) return format(units / 1_000, 'mil')
  return format(units / 1_000_000, 'M')
}

/** Igual que `formatMoneyCompact` pero con signo para ganancias. */
export function formatSignedMoneyCompact(cents: number): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0
  if (safe === 0) return '$0'
  return `${safe > 0 ? '+' : '-'}${formatMoneyCompact(Math.abs(safe))}`
}

/** Formatea centavos para mostrarlos en una entrada de texto editable. */
export function centsToEditValue(cents: number): string {
  return centsToInput(cents)
}

/** Redondea un porcentaje a un decimal, evitando "-0.0". */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  const rounded = Math.round(value * 10) / 10
  const normalized = rounded === 0 ? 0 : rounded
  return `${normalized.toFixed(1)}%`
}

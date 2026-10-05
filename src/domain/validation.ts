/**
 * Validaciones delgadas y mensajes en lenguaje de persona, no de contador.
 * Cada función devuelve `undefined` si todo está bien, o el mensaje de error.
 */

export type FieldError = string | undefined

/** Límite sano para cualquier monto: mil millones de pesos. */
const MAX_CENTS = 1_000_000_000_00

function checkLargeAmount(value: number): FieldError {
  if (value > MAX_CENTS) return 'Ese monto es demasiado grande'
  return undefined
}

/** El nombre es lo único realmente obligatorio en el paso 1. */
export function validateName(name: string): FieldError {
  const text = name.trim()
  if (!text) return 'Escribe qué vendiste'
  if (text.length > 60) return 'Usa un nombre más corto (máximo 60 letras)'
  return undefined
}

/**
 * El gasto es obligatorio en el paso 2, pero puede ser 0 si el usuario
 * realmente no gastó nada (por ejemplo, ya tenía todo).
 * Recibe `undefined` si el campo está vacío y `NaN` si es ilegible.
 */
export function validateSpent(value: number | undefined): FieldError {
  if (value === undefined) return 'Escribe cuánto gastaste'
  if (!Number.isFinite(value)) return 'Ese número no se entiende'
  if (value < 0) return 'El gasto no puede ser negativo'
  return checkLargeAmount(value)
}

/** Insumos previos: opcional, pero si viene debe ser un monto sano. */
export function validatePreviousInputs(value: number | undefined): FieldError {
  if (value === undefined) return undefined
  if (!Number.isFinite(value)) return 'Ese número no se entiende'
  if (value < 0) return 'El valor no puede ser negativo'
  return checkLargeAmount(value)
}

/** Las ventas pueden ser 0 (no vendiste nada todavía) pero no negativas. */
export function validateRevenue(value: number | undefined): FieldError {
  if (value === undefined) return 'Escribe cuánto vendiste'
  if (!Number.isFinite(value)) return 'Ese número no se entiende'
  if (value < 0) return 'Las ventas no pueden ser negativas'
  return checkLargeAmount(value)
}

/** Cantidad: entero positivo. Opcional. */
export function validateQuantity(value: number | undefined): FieldError {
  if (value === undefined) return undefined
  if (!Number.isFinite(value)) return 'Ese número no se entiende'
  if (value <= 0) return 'La cantidad debe ser mayor a 0'
  if (!Number.isInteger(value)) return 'Usa piezas completas, sin decimales'
  if (value > 1_000_000) return 'Esa cantidad es demasiado grande'
  return undefined
}

/** Tiempo en minutos: si se escribe, debe tener sentido. Opcional. */
export function validateTimeMinutes(value: number | undefined): FieldError {
  if (value === undefined) return undefined
  if (!Number.isFinite(value)) return 'Ese tiempo no se entiende'
  if (value <= 0) return 'El tiempo debe ser mayor a 0'
  if (value > 60 * 24 * 30) return 'Ese tiempo es demasiado grande'
  return undefined
}

import type { Activity, ActivityDraft, ActivityResult, Outcome } from '../types/activity'

/**
 * Funciones puras de cálculo del negocio.
 *
 * No conocen Vue, ni el DOM, ni localStorage: reciben datos y devuelven datos.
 * Todo el dinero de entrada/salida está en centavos enteros.
 */

/** Cantidades que no son válidas (NaN, Infinity, negativos) se tratan como 0. */
function safeCents(value: number | undefined): number {
  if (value === undefined || value === null) return 0
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

function safePositiveNumber(value: number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined
  if (!Number.isFinite(value) || value <= 0) return undefined
  return value
}

function safePositiveInt(value: number | undefined): number | undefined {
  const safe = safePositiveNumber(value)
  if (safe === undefined) return undefined
  return Math.floor(safe)
}

/** Costo total = lo que gasté + lo que valían los insumos que ya tenía. */
export function totalCostCents(spentCents: number, previousInputsCostCents: number): number {
  return safeCents(spentCents) + safeCents(previousInputsCostCents)
}

/** Ganancia = ventas - costo total. Puede ser negativa (pérdida) o 0 (empate). */
export function profitCents(revenueCents: number, costCents: number): number {
  return Math.round(safeCents(revenueCents) - safeCents(costCents))
}

/** Clasifica el resultado en lenguaje humano. */
export function outcomeOf(profit: number): Outcome {
  if (profit > 0) return 'ganancia'
  if (profit < 0) return 'perdida'
  return 'empate'
}

/** Margen sobre las ventas. `null` cuando no hubo ventas (evita dividir por cero). */
export function marginPercent(profit: number, revenueCents: number): number | null {
  const revenue = safeCents(revenueCents)
  if (revenue === 0) return null
  // Acotado para que un caso raro no muestre "99999%".
  const value = (profit / revenue) * 100
  return Math.max(-999.9, Math.min(999.9, value))
}

/** Ganancia por hora. `null` si no se registró tiempo. */
export function profitPerHour(profitCents: number, timeMinutes: number | undefined): number | null {
  const minutes = safePositiveNumber(timeMinutes)
  if (minutes === undefined) return null
  return Math.round((profitCents / minutes) * 60)
}

/**
 * Punto de recuperación: cuántas piezas hay que vender para cubrir el costo.
 *
 * Solo tiene sentido cuando conocemos el precio por pieza y hay algo que
 * recuperar. Nunca inventamos datos: si no se puede calcular, devuelve `null`.
 */
export function breakEvenUnits(costCents: number, unitPriceCents: number | undefined): number | null {
  const cost = safeCents(costCents)
  const price = safePositiveNumber(unitPriceCents)
  if (price === undefined) return null
  if (cost === 0) return 0
  return Math.ceil(cost / price)
}

/** Precio promedio real por pieza. `null` si falta cantidad o ventas. */
export function averageUnitPrice(
  revenueCents: number,
  quantity: number | undefined,
): number | null {
  const units = safePositiveInt(quantity)
  const revenue = safeCents(revenueCents)
  if (units === undefined || units === 0 || revenue === 0) return null
  return Math.round(revenue / units)
}

/**
 * Calcula todo lo que la app necesita mostrar sobre una actividad.
 * Es el único punto donde se combinan los cálculos anteriores.
 */
export function calculateActivity(activity: Activity | ActivityDraft): ActivityResult {
  const spent = safeCents(activity.spentCents)
  const previous = safeCents(activity.previousInputsCostCents)
  const cost = totalCostCents(spent, previous)
  const revenue = safeCents(activity.revenueCents)
  const quantity = safePositiveInt(activity.quantity)
  const unitPrice = safePositiveNumber(activity.unitPriceCents)
  const average = averageUnitPrice(revenue, quantity)

  // Para el punto de recuperación usamos el precio promedio real (lo que de
  // verdad cobró); si no hay cantidad, el precio unitario que escribió.
  const effectiveUnitPrice = average ?? unitPrice ?? undefined

  const profit = profitCents(revenue, cost)

  return {
    totalCostCents: cost,
    spentCents: spent,
    previousInputsCostCents: previous,
    revenueCents: revenue,
    profitCents: profit,
    marginPercent: marginPercent(profit, revenue),
    profitPerHourCents: profitPerHour(profit, activity.timeMinutes),
    breakEvenUnits: breakEvenUnits(cost, effectiveUnitPrice),
    averageUnitPriceCents: average,
    outcome: outcomeOf(profit),
  }
}

/** Ganancia por pieza vendida. `null` si falta la cantidad. */
export function profitPerUnit(
  profitCents: number,
  quantity: number | undefined,
): number | null {
  const units = safePositiveInt(quantity)
  if (units === undefined || units === 0) return null
  return Math.round(profitCents / units)
}

import type { ActivityDraft } from '../types/activity'
import { moneyToCentsOrUndefined, parseMoneyToCents } from '../domain/money'
import { validateName, validatePreviousInputs, validateQuantity, validateRevenue, validateSpent, validateTimeMinutes } from '../domain/validation'
import type { FieldError } from '../domain/validation'
import type { ActivityDraftForm } from './useActivityDraft'

/** Convierte texto a entero. `undefined` si está vacío, `NaN` si no es legible. */
function parseInteger(input: string): number | undefined {
  const text = input.trim()
  if (!text) return undefined
  const value = Number(text.replace(',', '.'))
  if (!Number.isFinite(value)) return Number.NaN
  return Math.floor(value)
}

/**
 * Minutos totales del paso 4.
 * `undefined` si el usuario no escribió nada, `NaN` si escribió algo ilegible.
 */
export function parseTimeMinutes(hours: string, minutes: string): number | undefined {
  if (!hours.trim() && !minutes.trim()) return undefined
  const h = Number(hours.trim().replace(',', '.') || '0')
  const m = Number(minutes.trim().replace(',', '.') || '0')
  if (!Number.isFinite(h) || !Number.isFinite(m)) return Number.NaN
  const total = Math.round(h * 60 + m)
  return total > 0 ? total : Number.NaN
}

export type ParsedDraft = {
  draft: ActivityDraft
  errors: Record<string, FieldError>
}

/**
 * Convierte el formulario (textos) en el modelo `ActivityDraft` (centavos).
 * Es la frontera entre la UI y el dominio: aquí se valida y se normaliza.
 */
export function parseActivityForm(form: ActivityDraftForm): ParsedDraft {
  // `parseMoneyToCents` devuelve NaN cuando el texto no es un monto legible,
  // para poder avisar en vez de guardar un 0 silencioso.
  const spentCents = parseMoneyToCents(form.spent)
  const previousInputsCents = form.usedPreviousInputs ? parseMoneyToCents(form.previousInputs) : 0
  const revenueCents = parseMoneyToCents(form.revenue)
  const quantity = parseInteger(form.quantity)
  const timeMinutes = parseTimeMinutes(form.hours, form.minutes)

  // En el borrador nunca entra basura: lo ilegible cuenta como 0 o se omite.
  const spentForDraft = moneyToCentsOrUndefined(form.spent) ?? 0
  const previousForDraft = moneyToCentsOrUndefined(form.previousInputs) ?? 0
  const revenueForDraft = moneyToCentsOrUndefined(form.revenue) ?? 0
  const unitPriceForDraft = moneyToCentsOrUndefined(form.unitPrice)

  const errors: Record<string, FieldError> = {
    name: validateName(form.name),
    spent: validateSpent(spentCents),
    previousInputs: form.usedPreviousInputs
      ? validatePreviousInputs(previousInputsCents)
      : undefined,
    revenue: validateRevenue(revenueCents),
    quantity: validateQuantity(quantity),
    timeMinutes: validateTimeMinutes(timeMinutes),
  }

  const draft: ActivityDraft = {
    name: form.name.trim(),
    spentCents: spentForDraft,
    previousInputsCostCents: previousForDraft,
    revenueCents: revenueForDraft,
  }

  // La cantidad y el precio unitario solo tienen sentido si ambos son válidos.
  if (quantity !== undefined && !errors.quantity) draft.quantity = quantity
  if (unitPriceForDraft !== undefined && quantity !== undefined && !errors.quantity) {
    draft.unitPriceCents = unitPriceForDraft
  }
  if (timeMinutes !== undefined && !errors.timeMinutes) draft.timeMinutes = timeMinutes

  return { draft, errors }
}

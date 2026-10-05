import type { Activity } from '../../types/activity'
import type { ActivityStorage } from './types'

const STORAGE_KEY = 'si-gane:activities:v1'

/**
 * Convierte lo que venga guardado (o escrito a mano en la consola) en una
 * Activity válida. Datos corruptos se descartan en lugar de romper la app.
 */
function sanitize(raw: unknown): Activity | null {
  if (typeof raw !== 'object' || raw === null) return null
  const value = raw as Record<string, unknown>

  const id = typeof value.id === 'string' && value.id ? value.id : null
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  const date = typeof value.date === 'string' ? value.date : ''

  if (!id || !name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const cents = (input: unknown): number => {
    if (typeof input !== 'number' || !Number.isFinite(input)) return 0
    return Math.max(0, Math.round(input))
  }

  const optionalPositiveInt = (input: unknown): number | undefined => {
    if (typeof input !== 'number' || !Number.isFinite(input) || input <= 0) return undefined
    return Math.floor(input)
  }

  const activity: Activity = {
    id,
    name,
    date,
    spentCents: cents(value.spentCents),
    previousInputsCostCents: cents(value.previousInputsCostCents),
    revenueCents: cents(value.revenueCents),
  }

  const quantity = optionalPositiveInt(value.quantity)
  if (quantity !== undefined) activity.quantity = quantity

  const unitPriceCents = optionalPositiveInt(value.unitPriceCents)
  if (unitPriceCents !== undefined) activity.unitPriceCents = unitPriceCents

  const timeMinutes = optionalPositiveInt(value.timeMinutes)
  if (timeMinutes !== undefined) activity.timeMinutes = timeMinutes

  return activity
}

/** Implementación local (MVP): guarda todo en el navegador. */
export function createLocalStorageActivityStorage(): ActivityStorage {
  /** Lectura sin depender de `this`, para poder usarla internamente. */
  function readAll(): Activity[] {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []
      return parsed.map(sanitize).filter((item): item is Activity => item !== null)
    } catch {
      return []
    }
  }

  function writeAll(activities: Activity[]): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities))
  }

  return {
    async list(): Promise<Activity[]> {
      return readAll()
    },

    async save(activity: Activity): Promise<void> {
      const clean = sanitize(activity)
      if (!clean) return
      const all = readAll()
      const index = all.findIndex((item) => item.id === clean.id)
      if (index >= 0) all[index] = clean
      else all.push(clean)
      writeAll(all)
    },

    async remove(id: string): Promise<void> {
      writeAll(readAll().filter((item) => item.id !== id))
    },
  }
}

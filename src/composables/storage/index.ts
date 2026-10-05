import type { ActivityStorage } from './types'
import { createLocalStorageActivityStorage } from './localStorageActivityStorage'

/**
 * Punto único de configuración de la persistencia.
 *
 * Hoy: localStorage.
 * Mañana: `useActivityStorage(() => createSupabaseActivityStorage(client))`
 * y ningún componente cambia.
 */
let provider: ActivityStorage = createLocalStorageActivityStorage()

export function useActivityStorage(): ActivityStorage {
  return provider
}

/** Permite inyectar otra implementación (tests, Supabase, etc.). */
export function setActivityStorage(storage: ActivityStorage): void {
  provider = storage
}

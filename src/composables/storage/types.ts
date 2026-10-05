import type { Activity } from '../../types/activity'

/**
 * Frontera de persistencia.
 *
 * La app NUNCA toca `localStorage` directamente: pide actividades a este
 * contrato. Cuando toque migrar a Supabase basta con escribir otra
 * implementación de `ActivityStorage` y registrarla en `src/main.ts`.
 */
export interface ActivityStorage {
  /** Devuelve todas las actividades guardadas. Nunca lanza: si algo falla, devuelve []. */
  list(): Promise<Activity[]>
  /** Inserta o reemplaza una actividad. */
  save(activity: Activity): Promise<void>
  /** Borra una actividad por id. */
  remove(id: string): Promise<void>
}

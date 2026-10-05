import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Activity, ActivityDraft } from '../types/activity'
import { useActivityStorage } from '../composables/storage'
import { todayISO } from '../domain/dates'

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Estado de actividades.
 *
 * Pinia se justifica aquí porque Home, Historial y Detalle comparten la misma
 * lista y la misma carga inicial; el resto del estado vive en los componentes.
 */
export const useActivitiesStore = defineStore('activities', () => {
  const items = ref<Activity[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  /** Más recientes primero (por fecha, y dentro del día por id). */
  const sorted = computed(() =>
    [...items.value].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return a.id < b.id ? 1 : -1
    }),
  )

  async function load(force = false): Promise<void> {
    if (loaded.value && !force) return
    loading.value = true
    try {
      items.value = await useActivityStorage().list()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  /** Guarda una actividad nueva y la devuelve. */
  async function add(draft: ActivityDraft): Promise<Activity> {
    const activity: Activity = {
      id: createId(),
      name: draft.name.trim(),
      date: todayISO(),
      spentCents: draft.spentCents ?? 0,
      previousInputsCostCents: draft.previousInputsCostCents ?? 0,
      revenueCents: draft.revenueCents ?? 0,
    }

    if (draft.quantity !== undefined) activity.quantity = draft.quantity
    if (draft.unitPriceCents !== undefined && draft.quantity !== undefined) {
      activity.unitPriceCents = draft.unitPriceCents
    }
    if (draft.timeMinutes !== undefined) activity.timeMinutes = draft.timeMinutes

    await useActivityStorage().save(activity)
    items.value = [...items.value, activity]
    return activity
  }

  async function remove(id: string): Promise<void> {
    await useActivityStorage().remove(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  function byId(id: string): Activity | undefined {
    return items.value.find((item) => item.id === id)
  }

  /**
   * Crea (o actualiza) una actividad a partir de datos calculados.
   * Se usa para registrar y, si hiciera falta, para editar.
   */
  async function upsert(activity: Activity): Promise<void> {
    await useActivityStorage().save(activity)
    const index = items.value.findIndex((item) => item.id === activity.id)
    if (index >= 0) items.value[index] = activity
    else items.value = [...items.value, activity]
  }

  return { items, sorted, loaded, loading, load, add, remove, byId, upsert }
})

import { storeToRefs } from 'pinia'
import { useActivitiesStore } from '../stores/activities'
import type { Activity, ActivityDraft } from '../types/activity'

/**
 * Fachada para que las vistas no importen Pinia directamente.
 * Mantiene los componentes hablando de "actividades", no de stores.
 */
export function useActivities() {
  const store = useActivitiesStore()
  const { items, sorted, loaded, loading } = storeToRefs(store)

  return {
    activities: items,
    sortedActivities: sorted,
    loaded,
    loading,
    load: (force = false) => store.load(force),
    add: (draft: ActivityDraft): Promise<Activity> => store.add(draft),
    remove: (id: string) => store.remove(id),
    byId: (id: string) => store.byId(id),
  }
}

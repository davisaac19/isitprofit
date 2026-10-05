import { computed } from 'vue'
import { useActivities } from './useActivities'
import { calculateActivity } from '../domain/calculations'
import { currentMonthRange, isInMonth, monthLabel } from '../domain/dates'

/**
 * Resumen del mes en curso: es lo único que responde "¿cómo voy?".
 * Se calcula a partir de las actividades, no se guarda en ningún lado.
 */
export function useMonthSummary(reference: Date = new Date()) {
  const { activities } = useActivities()
  const { year, month } = currentMonthRange(reference)

  const monthActivities = computed(() =>
    activities.value.filter((activity) => isInMonth(activity.date, year, month)),
  )

  const summary = computed(() => {
    let profitCents = 0
    let revenueCents = 0
    let costCents = 0

    for (const activity of monthActivities.value) {
      const result = calculateActivity(activity)
      profitCents += result.profitCents
      revenueCents += result.revenueCents
      costCents += result.totalCostCents
    }

    return {
      profitCents,
      revenueCents,
      costCents,
      count: monthActivities.value.length,
    }
  })

  return {
    monthActivities,
    summary,
    label: monthLabel(year, month),
  }
}

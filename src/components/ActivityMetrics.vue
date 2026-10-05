<script setup lang="ts">
import { computed } from 'vue'
import type { Activity, ActivityResult } from '../types/activity'
import MetricRow from './MetricRow.vue'
import { formatMoney, formatPercent, formatSignedMoney } from '../domain/money'

const props = defineProps<{ activity: Activity; result: ActivityResult }>()

const hasTime = computed(
  () => props.activity.timeMinutes !== undefined && props.result.profitPerHourCents !== null,
)

const hasQuantity = computed(
  () => props.activity.quantity !== undefined && props.activity.quantity > 0,
)

const hasBreakEven = computed(
  () => hasQuantity.value && props.result.breakEvenUnits !== null && props.result.breakEvenUnits > 0,
)

const avgPrice = computed(() =>
  props.result.averageUnitPriceCents !== null ? formatMoney(props.result.averageUnitPriceCents) : '',
)

const timeLabel = computed(() => {
  const minutes = props.activity.timeMinutes ?? 0
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
})

/** Explicación en palabras, no en jerga contable. */
const breakEvenMessage = computed(() => {
  if (!hasBreakEven.value) return ''
  const units = props.result.breakEvenUnits ?? 0
  if (props.result.outcome === 'perdida') {
    return `Con vender ${units} piezas recuperabas lo que invertiste.`
  }
  return `Recuperaste lo que invertiste después de vender ${units} piezas.`
})
</script>

<template>
  <div class="divide-y divide-slate-100 rounded-3xl bg-white px-4 ring-1 ring-slate-200">
    <MetricRow label="Vendiste" :value="formatMoney(result.revenueCents)" />

    <MetricRow
      label="Gastaste"
      :value="formatMoney(result.spentCents)"
      :hint="result.previousInputsCostCents > 0 ? 'en compras nuevas' : ''"
    />

    <MetricRow
      v-if="result.previousInputsCostCents > 0"
      label="Insumos que ya tenías"
      :value="formatMoney(result.previousInputsCostCents)"
      tone="muted"
    />

    <MetricRow
      v-if="result.previousInputsCostCents > 0"
      label="Costo real del lote"
      :value="formatMoney(result.totalCostCents)"
    />

    <MetricRow
      v-if="result.outcome === 'perdida'"
      label="Pérdida"
      :value="formatMoney(Math.abs(result.profitCents))"
      tone="negative"
    />
    <MetricRow
      v-else-if="result.outcome === 'ganancia'"
      label="Ganancia"
      :value="formatMoney(result.profitCents)"
      tone="positive"
    />
    <MetricRow v-else label="Ganancia" value="$0" tone="muted" />

    <MetricRow
      v-if="result.marginPercent !== null"
      label="Margen"
      :value="formatPercent(result.marginPercent)"
    />

    <MetricRow
      v-if="hasQuantity"
      label="Cantidad"
      :value="`${activity.quantity} piezas`"
    />

    <MetricRow v-if="avgPrice" label="Precio promedio" :value="avgPrice" />

    <MetricRow v-if="hasTime" label="Tiempo" :value="timeLabel" />

    <MetricRow
      v-if="hasTime"
      label="Ganancia por hora"
      :value="`${formatSignedMoney(result.profitPerHourCents ?? 0)}/h`"
      :tone="result.profitPerHourCents !== null && result.profitPerHourCents < 0 ? 'negative' : 'default'"
    />

    <MetricRow
      v-if="hasBreakEven"
      label="Punto de recuperación"
      :value="`${result.breakEvenUnits} piezas`"
    />
  </div>

  <p v-if="hasBreakEven" class="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
    {{ breakEvenMessage }}
  </p>
</template>

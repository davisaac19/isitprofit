<script setup lang="ts">
import { computed } from 'vue'
import type { Activity } from '../types/activity'
import { calculateActivity } from '../domain/calculations'
import { formatMoney, formatSignedMoney } from '../domain/money'
import { formatRelativeDate } from '../domain/dates'

const props = defineProps<{ activity: Activity; onDelete?: (activity: Activity) => void }>()

const result = computed(() => calculateActivity(props.activity))

const tone = computed(() => {
  if (result.value.outcome === 'ganancia') return 'text-brand-700'
  if (result.value.outcome === 'perdida') return 'text-loss-600'
  return 'text-even-600'
})
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-slate-200 transition focus-within:ring-brand-300 hover:ring-brand-300"
  >
    <RouterLink :to="`/actividad/${activity.id}`" class="flex min-w-0 flex-1 items-center justify-between gap-3">
      <span class="min-w-0">
        <span class="block truncate font-semibold text-slate-900">{{ activity.name }}</span>
        <span class="mt-0.5 block truncate text-sm text-slate-500">
          {{ formatRelativeDate(activity.date) }} · {{ formatMoney(result.revenueCents) }} vendidos
        </span>
      </span>

      <span class="num shrink-0 text-lg font-bold sm:text-xl" :class="tone">
        {{ formatSignedMoney(result.profitCents) }}
      </span>
    </RouterLink>

    <button
      v-if="onDelete"
      type="button"
      class="shrink-0 rounded-full px-2.5 py-1.5 text-sm text-slate-400 transition hover:bg-loss-50 hover:text-loss-600"
      :aria-label="`Eliminar ${activity.name}`"
      @click="onDelete(activity)"
    >
      ✕
    </button>
  </div>
</template>

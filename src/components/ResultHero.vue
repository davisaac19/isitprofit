<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityResult } from '../types/activity'
import { formatSignedMoney } from '../domain/money'

const props = defineProps<{ result: ActivityResult }>()

const tone = computed(() => {
  if (props.result.outcome === 'ganancia') {
    return {
      shell: 'bg-brand-50 ring-brand-200',
      amount: 'text-brand-700',
      headline: 'text-brand-800',
    }
  }
  if (props.result.outcome === 'perdida') {
    return {
      shell: 'bg-loss-50 ring-loss-100',
      amount: 'text-loss-600',
      headline: 'text-loss-700',
    }
  }
  return {
    shell: 'bg-even-50 ring-even-100',
    amount: 'text-even-600',
    headline: 'text-even-600',
  }
})

const headline = computed(() => {
  if (props.result.outcome === 'ganancia') return 'Sí ganaste'
  if (props.result.outcome === 'perdida') return 'No ganaste'
  return 'Quedaste tablas'
})

const emoji = computed(() => {
  if (props.result.outcome === 'ganancia') return '🎉'
  if (props.result.outcome === 'perdida') return '😕'
  return '🤝'
})
</script>

<template>
  <section class="rounded-3xl p-6 text-center ring-1" :class="tone.shell">
    <p class="num text-4xl font-extrabold tracking-tight sm:text-5xl" :class="tone.amount">
      {{ formatSignedMoney(result.profitCents) }}
    </p>
    <p class="mt-2 text-lg font-bold" :class="tone.headline">
      <span aria-hidden="true">{{ emoji }}</span> {{ headline }}
    </p>
  </section>
</template>

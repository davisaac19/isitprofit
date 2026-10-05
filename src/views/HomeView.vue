<script setup lang="ts">
import { computed } from 'vue'
import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import ActivityCard from '../components/ActivityCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { useActivities } from '../composables/useActivities'
import { useMonthSummary } from '../composables/useMonthSummary'
import { formatMoney, formatSignedMoney } from '../domain/money'

const { sortedActivities, loaded } = useActivities()
const { summary, label } = useMonthSummary()

const latest = computed(() => sortedActivities.value.slice(0, 5))

const profitTone = computed(() => {
  if (summary.value.profitCents > 0) return 'text-brand-700'
  if (summary.value.profitCents < 0) return 'text-loss-600'
  return 'text-slate-900'
})

const monthMessage = computed(() => {
  if (summary.value.count === 0) return 'Todavía no registras nada este mes'
  if (summary.value.profitCents > 0) return 'Vas ganando este mes'
  if (summary.value.profitCents < 0) return 'Vas perdiendo este mes'
  return 'Vas en tablas este mes'
})
</script>

<template>
  <PageShell>
    <!-- Encabezado de marca -->
    <header class="mb-5 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2.4">
            <path d="M4 16l5-5 4 3 7-7" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16 7h4v4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">¿Sí Gané?</h1>
          <p class="text-xs text-slate-500">{{ label }}</p>
        </div>
      </div>

      <RouterLink
        to="/historial"
        class="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60"
      >
        Historial
      </RouterLink>
    </header>

    <!-- Resumen del mes: la respuesta rápida a "¿cómo voy?" -->
    <section class="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
      <p class="text-sm text-slate-500">{{ monthMessage }}</p>
      <p class="num mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl" :class="profitTone">
        {{ formatSignedMoney(summary.profitCents) }}
      </p>
      <p class="mt-1 text-xs uppercase tracking-wide text-slate-400">Ganancia del mes</p>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <div class="rounded-2xl bg-slate-50 px-4 py-3">
          <p class="text-xs text-slate-500">Vendiste</p>
          <p class="num mt-0.5 text-xl font-bold text-slate-900">
            {{ formatMoney(summary.revenueCents) }}
          </p>
        </div>
        <div class="rounded-2xl bg-slate-50 px-4 py-3">
          <p class="text-xs text-slate-500">Gastaste</p>
          <p class="num mt-0.5 text-xl font-bold text-slate-900">
            {{ formatMoney(summary.costCents) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Acción principal, siempre evidente -->
    <RouterLink to="/registrar" class="mt-5 block">
      <AppButton size="lg" block>
        <span class="text-xl leading-none">+</span> Registrar actividad
      </AppButton>
    </RouterLink>

    <!-- Últimas actividades -->
    <section class="mt-7">
      <div class="mb-2 flex items-baseline justify-between">
        <h2 class="font-bold text-slate-900">Últimas actividades</h2>
        <RouterLink
          v-if="sortedActivities.length > latest.length"
          to="/historial"
          class="text-sm font-semibold text-brand-700"
        >
          Ver todas
        </RouterLink>
      </div>

      <div v-if="latest.length" class="space-y-2">
        <ActivityCard v-for="activity in latest" :key="activity.id" :activity="activity" />
      </div>

      <EmptyState
        v-else-if="loaded"
        emoji="🧮"
        title="Aquí verás lo que de verdad ganaste"
        message="Registra tu primera venta y te decimos si ganaste, perdiste o quedaste tablas."
      />
    </section>
  </PageShell>
</template>

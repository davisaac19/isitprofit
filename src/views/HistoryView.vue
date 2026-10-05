<script setup lang="ts">
import { computed, ref } from 'vue'
import PageShell from '../components/PageShell.vue'
import AppHeader from '../components/AppHeader.vue'
import AppButton from '../components/AppButton.vue'
import ActivityCard from '../components/ActivityCard.vue'
import EmptyState from '../components/EmptyState.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useActivities } from '../composables/useActivities'
import { calculateActivity } from '../domain/calculations'
import { formatMoney, formatMoneyCompact, formatSignedMoney, formatSignedMoneyCompact } from '../domain/money'
import { formatRelativeDate } from '../domain/dates'
import type { Activity } from '../types/activity'

const { sortedActivities, loaded, loading, remove } = useActivities()

const pendingDelete = ref<Activity | null>(null)

/** Agrupamos por la etiqueta humana de fecha ("Hoy", "Ayer", "15 sep"). */
const groups = computed(() => {
  const map = new Map<string, Activity[]>()
  for (const activity of sortedActivities.value) {
    const label = formatRelativeDate(activity.date)
    const list = map.get(label)
    if (list) list.push(activity)
    else map.set(label, [activity])
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }))
})

const totals = computed(() => {
  let profit = 0
  let revenue = 0
  for (const activity of sortedActivities.value) {
    const result = calculateActivity(activity)
    profit += result.profitCents
    revenue += result.revenueCents
  }
  return { profit, revenue, count: sortedActivities.value.length }
})

async function confirmDelete(): Promise<void> {
  const target = pendingDelete.value
  if (!target) return
  await remove(target.id)
  pendingDelete.value = null
}
</script>

<template>
  <PageShell>
    <AppHeader title="Historial">
      <RouterLink
        to="/registrar"
        class="ml-auto rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
      >
        + Registrar
      </RouterLink>
    </AppHeader>

    <template v-if="totals.count > 0">
      <!-- Totales de todo lo registrado -->
      <section class="mb-5 rounded-3xl bg-white p-4 ring-1 ring-slate-200">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="min-w-0">
            <p class="text-xs text-slate-500">Actividades</p>
            <p class="num mt-0.5 font-bold text-slate-900">{{ totals.count }}</p>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-slate-500">Vendiste</p>
            <p class="num mt-0.5 truncate font-bold text-slate-900" :title="formatMoney(totals.revenue)">
              {{ formatMoneyCompact(totals.revenue) }}
            </p>
          </div>
          <div class="min-w-0">
            <p class="text-xs text-slate-500">Ganancia</p>
            <p
              class="num mt-0.5 truncate font-bold"
              :title="formatSignedMoney(totals.profit)"
              :class="
                totals.profit > 0
                  ? 'text-brand-700'
                  : totals.profit < 0
                    ? 'text-loss-600'
                    : 'text-slate-900'
              "
            >
              {{ formatSignedMoneyCompact(totals.profit) }}
            </p>
          </div>
        </div>
      </section>

      <div class="space-y-5">
        <section v-for="group in groups" :key="group.label">
          <h2 class="mb-2 px-1 text-sm font-semibold text-slate-500">{{ group.label }}</h2>
          <div class="space-y-2">
            <ActivityCard
              v-for="activity in group.items"
              :key="activity.id"
              :activity="activity"
              :on-delete="(item) => (pendingDelete = item)"
            />
          </div>
        </section>
      </div>
    </template>

    <div v-else-if="loading" class="py-16 text-center text-slate-400">Cargando…</div>

    <EmptyState
      v-else-if="loaded"
      emoji="📒"
      title="Todavía no hay nada anotado"
      message="Cuando registres tu primera actividad aparecerá aquí, con lo que ganaste."
    >
      <RouterLink to="/registrar">
        <AppButton block>Registrar actividad</AppButton>
      </RouterLink>
    </EmptyState>

    <ConfirmDialog
      :open="pendingDelete !== null"
      title="¿Borrar esta actividad?"
      :message="pendingDelete ? `Se borrará “${pendingDelete.name}” de tu historial.` : ''"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </PageShell>
</template>

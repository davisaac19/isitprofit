<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageShell from '../components/PageShell.vue'
import AppHeader from '../components/AppHeader.vue'
import AppButton from '../components/AppButton.vue'
import ResultHero from '../components/ResultHero.vue'
import ActivityMetrics from '../components/ActivityMetrics.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useActivities } from '../composables/useActivities'
import { calculateActivity } from '../domain/calculations'
import { formatLongDate } from '../domain/dates'

const props = defineProps<{ id: string }>()
const router = useRouter()
const { byId, remove, loading } = useActivities()

const confirmOpen = ref(false)

const activity = computed(() => byId(props.id))
const result = computed(() => (activity.value ? calculateActivity(activity.value) : null))

async function confirmDelete(): Promise<void> {
  confirmOpen.value = false
  await remove(props.id)
  await router.replace('/historial')
}
</script>

<template>
  <PageShell>
    <AppHeader />

    <template v-if="activity && result">
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">{{ activity.name }}</h1>
      <p class="mb-4 mt-0.5 text-sm text-slate-500">{{ formatLongDate(activity.date) }}</p>

      <ResultHero :result="result" />

      <div class="mt-5">
        <ActivityMetrics :activity="activity" :result="result" />
      </div>

      <div class="mt-6 space-y-3">
        <AppButton
          variant="secondary"
          block
          @click="router.replace(`/resultado/${activity.id}`)"
        >
          Ver resultado
        </AppButton>
        <AppButton
          variant="secondary"
          block
          @click="router.push({ path: '/registrar', query: { editar: activity.id } })"
        >
          Editar actividad
        </AppButton>
        <AppButton variant="ghost" block @click="confirmOpen = true">Borrar actividad</AppButton>
      </div>
    </template>

    <div v-else-if="loading" class="py-16 text-center text-slate-400">Cargando…</div>

    <div v-else class="rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200">
      <p class="font-semibold text-slate-900">No encontramos esa actividad</p>
      <div class="mt-4">
        <AppButton block @click="router.push('/historial')">Ir al historial</AppButton>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="¿Borrar esta actividad?"
      :message="activity ? `Se borrará “${activity.name}” de tu historial.` : ''"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </PageShell>
</template>

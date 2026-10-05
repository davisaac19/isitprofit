<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import ResultHero from '../components/ResultHero.vue'
import ActivityMetrics from '../components/ActivityMetrics.vue'
import { useActivities } from '../composables/useActivities'
import { calculateActivity } from '../domain/calculations'

const props = defineProps<{ id: string }>()
const router = useRouter()
const { byId, loading } = useActivities()

const activity = computed(() => byId(props.id))
const result = computed(() => (activity.value ? calculateActivity(activity.value) : null))

const message = computed(() => {
  if (!result.value) return ''
  if (result.value.outcome === 'ganancia') {
    return 'De verdad ganaste dinero con esto.'
  }
  if (result.value.outcome === 'perdida') {
    return 'Vendiste, pero no alcanzó a cubrir lo que gastaste.'
  }
  return 'Cubriste exactamente lo que gastaste.'
})

function registerAnother(): void {
  void router.push('/registrar')
}
</script>

<template>
  <PageShell>
    <template v-if="activity && result">
      <h1 class="mb-4 text-center text-2xl font-extrabold tracking-tight text-slate-900">
        {{ activity.name }}
      </h1>

      <ResultHero :result="result" />
      <p class="mt-3 text-center text-slate-600">{{ message }}</p>

      <div class="mt-5">
        <ActivityMetrics :activity="activity" :result="result" />
      </div>

      <div class="mt-6 space-y-3">
        <AppButton size="lg" block @click="registerAnother">Registrar otra actividad</AppButton>
        <div class="flex gap-3">
          <AppButton variant="secondary" block @click="router.push('/historial')">Historial</AppButton>
          <AppButton variant="secondary" block @click="router.push('/')">Inicio</AppButton>
        </div>
      </div>
    </template>

    <div v-else-if="loading" class="py-16 text-center text-slate-400">Cargando…</div>

    <div v-else class="rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200">
      <p class="font-semibold text-slate-900">No encontramos esa actividad</p>
      <p class="mt-1 text-sm text-slate-500">Puede que se haya borrado.</p>
      <div class="mt-4">
        <AppButton block @click="router.push('/')">Volver al inicio</AppButton>
      </div>
    </div>
  </PageShell>
</template>

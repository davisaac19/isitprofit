<script setup lang="ts">
import { onMounted } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { useActivities } from './composables/useActivities'

const { load } = useActivities()

// Una sola carga inicial; las vistas leen de aquí en adelante.
onMounted(() => {
  void load()
})
</script>

<template>
  <RouterView />
  <Analytics />
</template>

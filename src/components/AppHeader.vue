<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from './AppButton.vue'

withDefaults(defineProps<{ title?: string; backTo?: string }>(), { title: '', backTo: '' })

const router = useRouter()

function goBack(): void {
  if (window.history.length > 1) router.back()
  else void router.push('/')
}
</script>

<template>
  <header class="mb-4 flex items-center gap-3">
    <AppButton
      variant="ghost"
      class="-ml-2 h-11 w-11 shrink-0 rounded-full !px-0"
      aria-label="Volver"
      @click="goBack"
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </AppButton>
    <h1 v-if="title" class="text-xl font-bold tracking-tight text-slate-900">{{ title }}</h1>
    <slot />
  </header>
</template>

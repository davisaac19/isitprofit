<script setup lang="ts">
withDefaults(defineProps<{ title: string; message: string; emoji?: string }>(), { emoji: '📝' })
</script>

<template>
  <div class="rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-slate-200">
    <div class="text-4xl" aria-hidden="true">{{ emoji }}</div>
    <p class="mt-3 font-semibold text-slate-900">{{ title }}</p>
    <p class="mx-auto mt-1 max-w-xs text-sm text-slate-500">{{ message }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>

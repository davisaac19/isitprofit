<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string
    tone?: 'default' | 'positive' | 'negative' | 'muted'
    hint?: string
  }>(),
  { tone: 'default', hint: '' },
)

const tones: Record<string, string> = {
  default: 'text-slate-900',
  positive: 'text-brand-700',
  negative: 'text-loss-600',
  muted: 'text-slate-500',
}
</script>

<template>
  <div class="flex items-start justify-between gap-4 py-2.5">
    <span class="text-slate-500">{{ label }}</span>
    <span class="text-right">
      <span class="num block text-lg font-semibold" :class="tones[tone]">{{ value }}</span>
      <span v-if="hint" class="block text-xs text-slate-400">{{ hint }}</span>
    </span>
  </div>
</template>

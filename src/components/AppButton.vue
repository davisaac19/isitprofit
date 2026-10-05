<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'md' | 'lg'
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    block: false,
  },
)

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] focus:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:active:scale-100'

  const sizes: Record<string, string> = {
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }

  const variants: Record<string, string> = {
    primary: 'bg-brand-600 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-700 focus-visible:ring-brand-200',
    secondary:
      'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-slate-200',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-200/60 focus-visible:ring-slate-200',
    danger: 'bg-loss-600 text-white hover:bg-loss-700 focus-visible:ring-loss-100',
  }

  return [base, sizes[props.size], variants[props.variant], props.block ? 'w-full' : ''].join(' ')
})
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading">
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>

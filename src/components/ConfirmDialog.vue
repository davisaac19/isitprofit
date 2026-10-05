<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import AppButton from './AppButton.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  { message: '', confirmLabel: 'Sí, borrar', cancelLabel: 'Mejor no' },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('cancel')
}

watch(
  () => props.open,
  (open) => {
    if (open) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      @click.self="emit('cancel')"
    >
      <div class="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">
        <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
        <p v-if="message" class="mt-1.5 text-slate-600">{{ message }}</p>

        <div class="mt-5 flex gap-3">
          <AppButton variant="secondary" block @click="emit('cancel')">{{ cancelLabel }}</AppButton>
          <AppButton variant="danger" block @click="emit('confirm')">{{ confirmLabel }}</AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

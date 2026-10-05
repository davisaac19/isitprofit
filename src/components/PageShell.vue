<script setup lang="ts">
/**
 * Contenedor de página: en móvil usa todo el ancho, en desktop lo limita
 * a una columna cómoda de ~28rem centrada.
 */
withDefaults(defineProps<{ size?: 'app' | 'wide' }>(), { size: 'app' })
</script>

<template>
  <div class="min-h-dvh bg-slate-100">
    <div
      class="mx-auto w-full px-4 pb-10 pt-4"
      :class="size === 'wide' ? 'max-w-3xl' : 'max-w-md'"
    >
      <slot />
    </div>
  </div>
</template>

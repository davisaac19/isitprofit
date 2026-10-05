<script setup lang="ts">
/**
 * Entrada numérica.
 *
 * Comparte exactamente las mismas clases de tamaño que `MoneyInput`, para que
 * dos campos que van lado a lado (Cantidad / Precio c/u, Horas / Minutos) y
 * los campos principales midan todos igual.
 */
withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    placeholder?: string
    suffix?: string
    autofocus?: boolean
    testid?: string
  }>(),
  {
    label: '',
    hint: '',
    error: '',
    placeholder: '0',
    suffix: '',
    autofocus: false,
    testid: undefined,
  },
)

const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">{{ label }}</span>

    <span
      class="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-brand-500"
      :class="error ? 'ring-loss-500 focus-within:ring-loss-500' : ''"
    >
      <input
        v-model="model"
        inputmode="numeric"
        autocomplete="off"
        :data-testid="testid"
        :placeholder="placeholder"
        :autofocus="autofocus"
        class="num w-full bg-transparent text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-300"
      />
      <span v-if="suffix" class="shrink-0 text-base font-medium text-slate-400">{{ suffix }}</span>
    </span>

    <span v-if="hint && !error" class="mt-1.5 block text-sm text-slate-500">{{ hint }}</span>
    <span v-if="error" class="mt-1.5 block text-sm font-medium text-loss-600">{{ error }}</span>
  </label>
</template>

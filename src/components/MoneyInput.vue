<script setup lang="ts">
import { parseMoneyToCents, centsToInput } from '../domain/money'

/**
 * Entrada de dinero.
 *
 * Tamaño único para todos los campos de la app: si algún día se agrega otro
 * campo, solo hay que reutilizar este componente y medirá igual que el resto.
 * `NumberInput` replica exactamente las mismas clases.
 */
withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    placeholder?: string
    autofocus?: boolean
    testid?: string
  }>(),
  {
    label: '',
    hint: '',
    error: '',
    placeholder: '0',
    autofocus: false,
    testid: undefined,
  },
)

const model = defineModel<string>({ required: true })

/** Al salir del campo normalizamos el texto: "500" -> "500.00". */
function normalize(): void {
  const trimmed = model.value.trim()
  if (!trimmed) {
    model.value = ''
    return
  }
  const cents = parseMoneyToCents(trimmed)
  model.value = cents === undefined || !Number.isFinite(cents) ? '' : centsToInput(cents)
}
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">{{ label }}</span>

    <span
      class="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-brand-500"
      :class="error ? 'ring-loss-500 focus-within:ring-loss-500' : ''"
    >
      <span class="num text-xl font-semibold text-slate-400">$</span>
      <input
        v-model="model"
        inputmode="decimal"
        autocomplete="off"
        :data-testid="testid"
        :placeholder="placeholder"
        :autofocus="autofocus"
        class="num w-full bg-transparent text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-300"
        @blur="normalize"
      />
    </span>

    <span v-if="hint && !error" class="mt-1.5 block text-sm text-slate-500">{{ hint }}</span>
    <span v-if="error" class="mt-1.5 block text-sm font-medium text-loss-600">{{ error }}</span>
  </label>
</template>

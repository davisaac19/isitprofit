<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    placeholder?: string
    autofocus?: boolean
    prefix?: string
    testid?: string
  }>(),
  {
    label: '',
    hint: '',
    error: '',
    placeholder: '',
    autofocus: false,
    prefix: '',
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
      <span v-if="prefix" class="text-lg font-semibold text-slate-400">{{ prefix }}</span>
      <input
        v-model="model"
        :placeholder="placeholder"
        :autofocus="autofocus"
        :data-testid="testid"
        class="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-300"
        v-bind="$attrs"
      />
    </span>

    <span v-if="hint && !error" class="mt-1.5 block text-sm text-slate-500">{{ hint }}</span>
    <span v-if="error" class="mt-1.5 block text-sm font-medium text-loss-600">{{ error }}</span>
  </label>
</template>

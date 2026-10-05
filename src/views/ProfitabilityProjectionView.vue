<script setup lang="ts">
import { computed, reactive } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import MoneyInput from '../components/MoneyInput.vue'
import NumberInput from '../components/NumberInput.vue'
import PageShell from '../components/PageShell.vue'
import { projectProfitability } from '../domain/calculations'
import { formatMoney, parseMoneyToCents } from '../domain/money'
import { validateRevenue, validateSpent } from '../domain/validation'

const form = reactive({
  cost: '',
  unitPrice: '',
  targetProfit: '',
  unitsPerWeek: '',
})

const parsed = computed(() => {
  const costCents = parseMoneyToCents(form.cost)
  const unitPriceCents = parseMoneyToCents(form.unitPrice)
  const targetProfitCents = parseMoneyToCents(form.targetProfit)
  const paceText = form.unitsPerWeek.trim()
  const unitsPerWeek = paceText ? Number(paceText) : undefined

  const costError = validateSpent(costCents)
  const unitPriceBaseError = validateRevenue(unitPriceCents)
  const unitPriceError =
    unitPriceBaseError ?? (unitPriceCents === 0 ? 'El precio debe ser mayor a $0' : undefined)
  const targetBaseError = validateRevenue(targetProfitCents)
  const targetError =
    targetBaseError ?? (targetProfitCents === 0 ? 'La meta debe ser mayor a $0' : undefined)
  const paceError =
    unitsPerWeek === undefined
      ? undefined
      : !Number.isSafeInteger(unitsPerWeek) || unitsPerWeek <= 0
        ? 'Escribe una cantidad entera mayor a 0'
        : unitsPerWeek > 1_000_000
          ? 'Esa cantidad es demasiado grande'
          : undefined

  return {
    costCents,
    unitPriceCents,
    targetProfitCents,
    unitsPerWeek,
    costError,
    unitPriceError,
    targetError,
    paceError,
  }
})

const projection = computed(() => {
  const values = parsed.value
  if (
    values.costError ||
    values.unitPriceError ||
    values.targetError ||
    values.paceError ||
    values.costCents === undefined ||
    values.unitPriceCents === undefined ||
    values.targetProfitCents === undefined
  ) {
    return null
  }
  return projectProfitability(
    values.costCents,
    values.unitPriceCents,
    values.targetProfitCents,
    values.unitsPerWeek,
  )
})

function formatWeeks(weeks: number | null): string | null {
  if (weeks === null) return null
  if (weeks === 0) return '0 semanas'
  const rounded = Math.ceil(weeks * 10) / 10
  return `${rounded} ${rounded === 1 ? 'semana' : 'semanas'}`
}
</script>

<template>
  <PageShell>
    <AppHeader title="Proyectar ventas" />

    <section class="rounded-3xl bg-white p-5 ring-1 ring-slate-200">
      <h2 class="text-lg font-bold text-slate-900">¿Cuánto quieres ganar?</h2>
      <p class="mt-1 text-sm text-slate-500">
        Calculamos cuántas piezas vender para recuperar tu inversión y alcanzar tu meta.
      </p>

      <div class="mt-5 space-y-4">
        <MoneyInput
          v-model="form.cost"
          label="Inversión total del lote"
          hint="Incluye lo que gastaste y los insumos que ya tenías."
          testid="projection-cost"
          :error="parsed.costError"
        />
        <MoneyInput
          v-model="form.unitPrice"
          label="¿A cuánto vendes cada pieza?"
          testid="projection-price"
          :error="parsed.unitPriceError"
        />
        <MoneyInput
          v-model="form.targetProfit"
          label="Meta de ganancia"
          testid="projection-target"
          :error="parsed.targetError"
        />
        <NumberInput
          v-model="form.unitsPerWeek"
          label="¿Cuántas piezas vendes por semana?"
          hint="Opcional; sirve para estimar el tiempo."
          suffix="pzs/sem"
          testid="projection-pace"
          :error="parsed.paceError"
        />
      </div>
    </section>

    <section
      v-if="projection"
      class="mt-5 rounded-3xl bg-white p-5 ring-1 ring-slate-200"
      aria-live="polite"
      data-testid="projection-results"
    >
      <h2 class="font-bold text-slate-900">Tu proyección</h2>
      <p class="mt-1 text-sm text-slate-500">
        Asumiendo que esta inversión cubre todo el lote y no hay costos extra por pieza.
      </p>

      <dl class="mt-4 space-y-3">
        <div class="flex items-start justify-between gap-3">
          <dt class="text-sm text-slate-600">Recuperas la inversión al vender</dt>
          <dd class="text-right font-bold text-slate-900">
            {{ projection.breakEvenUnits }} {{ projection.breakEvenUnits === 1 ? 'pieza' : 'piezas' }}
            <span v-if="projection.breakEvenWeeks !== null" class="block text-xs font-normal text-slate-500">
              aprox. {{ formatWeeks(projection.breakEvenWeeks) }}
            </span>
          </dd>
        </div>
        <div class="flex items-start justify-between gap-3">
          <dt class="text-sm text-slate-600">Empiezas a ganar desde</dt>
          <dd class="text-right font-bold text-brand-700">
            {{ projection.profitableUnits }} {{ projection.profitableUnits === 1 ? 'pieza' : 'piezas' }}
            <span v-if="projection.profitableWeeks !== null" class="block text-xs font-normal text-slate-500">
              aprox. {{ formatWeeks(projection.profitableWeeks) }}
            </span>
          </dd>
        </div>
        <div class="flex items-start justify-between gap-3 border-t border-slate-100 pt-3">
          <dt class="text-sm font-semibold text-slate-800">
            Para ganar {{ formatMoney(parsed.targetProfitCents ?? 0) }}
          </dt>
          <dd class="text-right font-bold text-brand-700">
            {{ projection.targetUnits }} {{ projection.targetUnits === 1 ? 'pieza' : 'piezas' }}
            <span v-if="projection.targetWeeks !== null" class="block text-xs font-normal text-slate-500">
              aprox. {{ formatWeeks(projection.targetWeeks) }}
            </span>
          </dd>
        </div>
      </dl>
    </section>

    <p v-else class="mt-4 px-2 text-center text-sm text-slate-500">
      Completa la inversión, el precio y tu meta para ver la proyección.
    </p>
  </PageShell>
</template>

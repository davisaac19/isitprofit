<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageShell from '../components/PageShell.vue'
import AppHeader from '../components/AppHeader.vue'
import AppButton from '../components/AppButton.vue'
import TextField from '../components/TextField.vue'
import MoneyInput from '../components/MoneyInput.vue'
import NumberInput from '../components/NumberInput.vue'
import { useActivityDraft } from '../composables/useActivityDraft'
import { parseActivityForm } from '../composables/useActivityForm'
import { useActivities } from '../composables/useActivities'
import { calculateActivity } from '../domain/calculations'
import { formatSignedMoney, parseMoneyToCents } from '../domain/money'

const route = useRoute()
const router = useRouter()
const { form, clear } = useActivityDraft()
const { add } = useActivities()

const TOTAL_STEPS = 4
const saving = ref(false)
const showErrors = ref(false)

const parsed = computed(() => parseActivityForm(form))
const errors = computed(() => parsed.value.errors)

/** Vista previa en vivo: la gracias de poner la venta antes del resultado. */
const preview = computed(() => calculateActivity(parsed.value.draft))

const stepTitles = ['¿Qué vendiste?', '¿Cuánto gastaste?', '¿Cuánto vendiste?', '¿Cuánto tiempo te tomó?']
const stepSubtitles = [
  'Escribe el nombre como tú lo llamas. No tiene que ser perfecto.',
  'Cuánto dinero salió de tu bolsillo para preparar esto.',
  'Cuánto dinero entró por la venta.',
  'Opcional. Sirve para saber cuánto ganas por hora.',
]

const progress = computed(() => `${(step.value / TOTAL_STEPS) * 100}%`)

/**
 * El paso vive en la URL (`?paso=2`), no en estado duplicado.
 * Así el botón "atrás" del teléfono funciona y no hay desincronización
 * cuando se vuelve a entrar al formulario.
 */
const step = computed<number>(() => {
  const raw = Number(route.query.paso)
  if (!Number.isInteger(raw) || raw < 1 || raw > TOTAL_STEPS) return 1
  return raw
})

function goToStep(next: number): void {
  showErrors.value = false
  const query = next <= 1 ? {} : { paso: String(next) }
  if (next === step.value) return
  void router.replace({ query })
}

/** Solo el paso actual puede bloquear el avance. */
const stepError = computed(() => {
  if (!showErrors.value) return undefined
  if (step.value === 1) return errors.value.name
  if (step.value === 2) return errors.value.spent ?? errors.value.previousInputs
  if (step.value === 3) return errors.value.revenue ?? errors.value.quantity
  return errors.value.timeMinutes
})

function next(): void {
  showErrors.value = true
  if (stepError.value) return
  if (step.value < TOTAL_STEPS) goToStep(step.value + 1)
  else void save()
}

function back(): void {
  showErrors.value = false
  if (step.value > 1) goToStep(step.value - 1)
  else void router.push('/')
}

async function save(): Promise<void> {
  showErrors.value = true
  const { draft, errors: validation } = parsed.value
  if (Object.values(validation).some(Boolean)) return

  saving.value = true
  try {
    const activity = await add(draft)
    clear()
    await router.replace(`/resultado/${activity.id}`)
  } finally {
    saving.value = false
  }
}

/**
 * Precio por unidad: si el usuario anotó cantidad pero no un precio propio,
 * lo deducimos del total. Es determinista (no depende del blur) y respeta el
 * precio en cuanto la persona escribe uno distinto del calculado.
 */
const lastAutoPrice = ref('')

function computeAutoPrice(quantity: string, revenueCents: number | undefined): string {
  const units = Number(quantity.trim().replace(',', '.'))
  if (!Number.isFinite(units) || units <= 0 || !revenueCents) return ''
  const unit = revenueCents / 100 / units
  return Number.isFinite(unit) ? unit.toFixed(2) : ''
}

watch(
  () => [form.quantity, form.revenue, form.unitPrice] as const,
  ([quantity, revenue, unitPrice], previous) => {
    const previousAuto = previous?.[0] === undefined ? '' : computeAutoPrice(previous[0], parseMoneyToCents(previous[1]))
    const previousWasAuto = unitPrice === '' || unitPrice === previousAuto || unitPrice === lastAutoPrice.value

    if (!previousWasAuto) return

    const auto = computeAutoPrice(quantity, parseMoneyToCents(revenue))
    lastAutoPrice.value = auto
    if (auto !== unitPrice) form.unitPrice = auto
  },
  { immediate: true },
)

const isLastStep = computed(() => step.value === TOTAL_STEPS)
const canContinueText = computed(() => (isLastStep.value ? 'Ver mi resultado' : 'Continuar'))
</script>

<template>
  <PageShell>
    <AppHeader />

    <!-- Progreso -->
    <div class="mb-5">
      <div class="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>Paso {{ step }} de {{ TOTAL_STEPS }}</span>
        <button class="rounded-lg px-2 py-1 hover:bg-slate-200/60" @click="back">
          {{ step > 1 ? 'Atrás' : 'Cancelar' }}
        </button>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div class="h-full rounded-full bg-brand-600 transition-all" :style="{ width: progress }" />
      </div>
    </div>

    <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">{{ stepTitles[step - 1] }}</h1>
    <p class="mt-1 text-slate-500">{{ stepSubtitles[step - 1] }}</p>

    <div class="mt-6 space-y-4">
      <!-- Paso 1: nombre -->
      <TextField
        v-if="step === 1"
        v-model="form.name"
        label="¿Qué vendiste?"
        placeholder="Escribe el nombre de lo que vendiste"
        testid="input-name"
        autofocus
        maxlength="60"
        :error="showErrors ? errors.name : ''"
        @keyup.enter="next"
      />

      <!-- Paso 2: gasto -->
      <template v-else-if="step === 2">
        <MoneyInput
          v-model="form.spent"
          label="Total gastado"
          testid="input-spent"
          hint="Materiales o cosas que compraste para esto."
          autofocus
          :error="showErrors ? errors.spent : ''"
        />

        <div class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <label class="flex items-start gap-3">
            <input
              v-model="form.usedPreviousInputs"
              type="checkbox"
              class="mt-0.5 h-5 w-5 shrink-0 rounded-md accent-brand-600"
            />
            <span>
              <span class="block font-medium text-slate-800">¿Usaste cosas que ya tenías?</span>
              <span class="block text-sm text-slate-500">
                Por ejemplo, materiales que compraste antes y usaste en este lote.
              </span>
            </span>
          </label>

          <div v-if="form.usedPreviousInputs" class="mt-4">
            <MoneyInput
              v-model="form.previousInputs"
              label="¿Cuánto crees que valían esos insumos?"
              testid="input-previous"
              hint="Es un aproximado, no tiene que ser exacto."
              :error="showErrors ? errors.previousInputs : ''"
            />
          </div>
        </div>
      </template>

      <!-- Paso 3: venta -->
      <template v-else-if="step === 3">
        <MoneyInput
          v-model="form.revenue"
          label="Total vendido"
          testid="input-revenue"
          hint="El total que te pagaron."
          autofocus
          :error="showErrors ? errors.revenue : ''"
        />

        <details class="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <summary class="cursor-pointer font-medium text-slate-800">
            ¿Quieres anotar cantidad y precio? <span class="text-slate-400">(opcional)</span>
          </summary>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <NumberInput
              v-model="form.quantity"
              label="Cantidad"
              suffix="pzs"
              testid="input-quantity"
              :error="showErrors ? errors.quantity : ''"
            />
            <MoneyInput
              v-model="form.unitPrice"
              label="Precio c/u"
              testid="input-unit-price"
            />
          </div>
          <p v-if="form.quantity.trim() && form.unitPrice.trim()" class="mt-2 text-xs text-slate-500">
            Lo calculamos del total. Puedes cambiarlo si quieres.
          </p>
        </details>
      </template>

      <!-- Paso 4: tiempo -->
      <template v-else>
        <div class="grid grid-cols-2 gap-3">
          <NumberInput
            v-model="form.hours"
            label="Horas"
            suffix="h"
            testid="input-hours"
            autofocus
          />
          <NumberInput
            v-model="form.minutes"
            label="Minutos"
            suffix="min"
            testid="input-minutes"
          />
        </div>
        <p class="text-sm text-slate-500">
          Esto nos permite calcular cuánto ganas por hora. Si no lo sabes, déjalo vacío.
        </p>
        <p v-if="showErrors && errors.timeMinutes" class="text-sm font-medium text-loss-600">
          {{ errors.timeMinutes }}
        </p>
      </template>
    </div>

    <!-- Vista previa en vivo mientras se registra -->
    <div
      v-if="step >= 3 && preview.revenueCents > 0"
      class="mt-6 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white"
    >
      <span class="text-sm text-slate-300">Hasta ahora</span>
      <span class="num text-xl font-bold">{{ formatSignedMoney(preview.profitCents) }}</span>
    </div>

    <div class="mt-6 flex gap-3">
      <AppButton variant="secondary" :disabled="saving" @click="back">
        {{ step > 1 ? 'Atrás' : 'Cancelar' }}
      </AppButton>
      <AppButton block size="lg" :loading="saving" @click="next">{{ canContinueText }}</AppButton>
    </div>

    <p class="mt-4 text-center text-xs text-slate-400">
      Solo necesitamos el nombre, el gasto y la venta. Lo demás es opcional.
    </p>
  </PageShell>
</template>

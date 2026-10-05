import { reactive, watch } from 'vue'

/**
 * Borrador del formulario de "Registrar actividad".
 *
 * Guarda los textos tal como los escribe la persona (aún sin parsear) para que
 * el wizard sobreviva a un refresh. Al terminar, `clear()` limpia el borrador.
 */
export type ActivityDraftForm = {
  name: string
  spent: string
  usedPreviousInputs: boolean
  previousInputs: string
  revenue: string
  quantity: string
  unitPrice: string
  hours: string
  minutes: string
}

const STORAGE_KEY = 'si-gane:draft:v1'

function emptyForm(): ActivityDraftForm {
  return {
    name: '',
    spent: '',
    usedPreviousInputs: false,
    previousInputs: '',
    revenue: '',
    quantity: '',
    unitPrice: '',
    hours: '',
    minutes: '',
  }
}

function loadForm(storageKey: string): { form: ActivityDraftForm; hasStoredDraft: boolean } {
  const base = emptyForm()
  try {
    const stored = window.sessionStorage.getItem(storageKey)
    if (!stored) return { form: base, hasStoredDraft: false }
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return { form: base, hasStoredDraft: false }
    return { form: { ...base, ...(parsed as Partial<ActivityDraftForm>) }, hasStoredDraft: true }
  } catch {
    return { form: base, hasStoredDraft: false }
  }
}

export function useActivityDraft(storageKey = STORAGE_KEY) {
  const { form: initialForm, hasStoredDraft } = loadForm(storageKey)
  const form = reactive<ActivityDraftForm>(initialForm)

  watch(
    form,
    (value) => {
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(value))
      } catch {
        /* sin espacio o modo privado: el borrador simplemente no persiste */
      }
    },
    // `sync` para que `clear()` no sea sobrescrito por un flush pendiente
    // cuando el componente se desmonta al guardar.
    { deep: true, flush: 'sync' },
  )

  function clear(): void {
    Object.assign(form, emptyForm())
    try {
      window.sessionStorage.removeItem(storageKey)
    } catch {
      /* ignorado a propósito */
    }
  }

  return { form, clear, hasStoredDraft }
}

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

function loadForm(): ActivityDraftForm {
  const base = emptyForm()
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return base
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return base
    return { ...base, ...(parsed as Partial<ActivityDraftForm>) }
  } catch {
    return base
  }
}

export function useActivityDraft() {
  const form = reactive<ActivityDraftForm>(loadForm())

  watch(
    form,
    (value) => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
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
      window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignorado a propósito */
    }
  }

  return { form, clear }
}

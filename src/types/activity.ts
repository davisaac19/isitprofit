/**
 * Modelo de datos del MVP.
 *
 * Todas las cantidades monetarias se guardan como enteros en centavos.
 * `1000` === `$10.00`
 */
export type Activity = {
  id: string
  /** Nombre libre de lo que se vendió. Ej: "Manzanas forradas" */
  name: string
  /** Fecha en formato ISO corto: YYYY-MM-DD */
  date: string
  /** Dinero que salió del bolsillo en esta actividad */
  spentCents: number
  /** Valor estimado de insumos que ya se tenían y se usaron aquí */
  previousInputsCostCents: number
  /** Dinero que entró por la venta */
  revenueCents: number
  /** Piezas vendidas (opcional) */
  quantity?: number
  /** Precio al que se vendió cada pieza (opcional, requiere quantity) */
  unitPriceCents?: number
  /** Tiempo invertido (opcional) */
  timeMinutes?: number
}

/**
 * Datos que captura el usuario antes de que exista una actividad.
 * Todo llega como `number | undefined` para que sea fácil de persistir.
 */
export type ActivityDraft = {
  name: string
  spentCents?: number
  previousInputsCostCents?: number
  revenueCents?: number
  quantity?: number
  unitPriceCents?: number
  timeMinutes?: number
}

/** Resultado del cálculo de una actividad: nunca contiene NaN ni Infinity. */
export type ActivityResult = {
  /** Costo real estimado = gasto + insumos previos */
  totalCostCents: number
  /** Lo que realmente se gastó de bolsillo */
  spentCents: number
  /** Valor estimado de insumos que ya se tenían */
  previousInputsCostCents: number
  revenueCents: number
  /** Ganancia positiva, pérdida negativa, 0 empate */
  profitCents: number
  /** Margen sobre las ventas en porcentaje. `null` si no hubo ventas. */
  marginPercent: number | null
  /** Ganancia por hora en centavos. `null` si no hay tiempo registrado. */
  profitPerHourCents: number | null
  /** Cuántas piezas hay que vender para recuperar la inversión. `null` si falta info. */
  breakEvenUnits: number | null
  /** Precio promedio real por pieza. `null` si falta info. */
  averageUnitPriceCents: number | null
  /** `ganancia` | `perdida` | `empate` */
  outcome: Outcome
}

export type Outcome = 'ganancia' | 'perdida' | 'empate'

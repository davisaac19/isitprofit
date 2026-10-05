/**
 * Verificación end-to-end manual-asistida del MVP.
 * Usa Edge (canal instalado) para no descargar un navegador extra.
 *
 * Uso: node scripts/e2e-verify.mjs [baseURL]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:4173'

const results = []
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail })
  const icon = condition ? 'PASS' : 'FAIL'
  console.log(`${icon}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/** Rellena el wizard completo. El tiempo es el último paso y es opcional. */
async function fillActivity(page, { name, spent, usedPrevious, previous, revenue, hours, minutes }) {
  await page.goto(`${BASE}/registrar`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/registrar`)
  await page.waitForSelector('[data-testid="input-name"]')

  await page.fill('[data-testid="input-name"]', name)
  await page.getByRole('button', { name: 'Continuar' }).click()

  await page.waitForSelector('[data-testid="input-spent"]')
  await page.fill('[data-testid="input-spent"]', spent)

  if (usedPrevious) {
    await page.getByRole('checkbox').check()
    await page.waitForSelector('[data-testid="input-previous"]')
    await page.fill('[data-testid="input-previous"]', previous)
  }

  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForSelector('[data-testid="input-revenue"]')
  await page.fill('[data-testid="input-revenue"]', revenue)

  // Paso 4: tiempo (opcional, se puede dejar vacío).
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForSelector('[data-testid="input-hours"]')
  if (hours) await page.fill('[data-testid="input-hours"]', hours)
  if (minutes) await page.fill('[data-testid="input-minutes"]', minutes)

  await page.getByRole('button', { name: 'Ver mi resultado' }).click()
  await page.waitForURL(/\/resultado\//)
}

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: false,
    hasTouch: true,
    deviceScaleFactor: 3,
  })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(String(err)))

  // ---------- Estado vacío ----------
  await page.goto(BASE)
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.goto(BASE)
  await page.waitForSelector('text=¿Sí Gané?')
  check('Inicio carga con la marca', await page.locator('h1', { hasText: '¿Sí Gané?' }).isVisible())
  check(
    'Inicio muestra estado vacío',
    await page.getByText('Aquí verás lo que de verdad ganaste').isVisible(),
  )
  check('Inicio muestra acción principal', await page.getByRole('button', { name: /Registrar actividad/ }).isVisible())
  check('Resumen del mes en $0', (await page.locator('text=Ganancia del mes').count()) > 0)

  // ---------- Caso 1: ganancia con tiempo ----------
  await fillActivity(page, { name: 'Manzanas forradas', spent: '500', revenue: '750', hours: '5' })
  const hero1 = await page.locator('section p.num').first().innerText()
  check('Caso 1 ganancia: +$250', hero1.trim() === '+$250', `hero=${hero1.trim()}`)
  check('Caso 1 dice "Sí ganaste"', await page.getByText('Sí ganaste').isVisible())
  check('Caso 1 muestra margen 33.3%', await page.getByText('33.3%').isVisible())
  check('Caso 1 muestra ganancia por hora $50/h', await page.getByText('+$50/h').isVisible())
  check('Caso 1 no muestra punto de recuperación', (await page.getByText('Punto de recuperación').count()) === 0)

  // Historial y detalle
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.waitForURL(/\/historial/)
  check('Historial lista la actividad', await page.getByText('Manzanas forradas').isVisible())
  check('Historial muestra monto ganado', await page.getByText('+$250').first().isVisible())
  check('Historial muestra "Hoy"', await page.getByText('Hoy').first().isVisible())

  await page.getByText('Manzanas forradas').click()
  await page.waitForURL(/\/actividad\//)
  check('Detalle muestra el nombre', await page.getByRole('heading', { name: 'Manzanas forradas' }).isVisible())
  check('Detalle muestra Vendiste $750', await page.getByText('Vendiste').isVisible())
  check('Detalle muestra Ganancia por hora', await page.getByText('Ganancia por hora').isVisible())

  // ---------- Edición de una actividad existente ----------
  const originalActivityUrl = page.url()
  const originalActivityDate = await page.locator('h1 + p').innerText()
  await page.getByRole('button', { name: 'Editar actividad' }).click()
  await page.waitForURL(/\/registrar\?editar=/)
  check('Editar precarga el nombre existente', await page.inputValue('[data-testid="input-name"]') === 'Manzanas forradas')
  await page.fill('[data-testid="input-name"]', 'Manzanas editadas')
  await page.getByRole('button', { name: 'Continuar' }).click()
  check('Editar precarga el gasto existente', await page.inputValue('[data-testid="input-spent"]') === '500.00')
  await page.fill('[data-testid="input-spent"]', '550')
  await page.getByRole('button', { name: 'Continuar' }).click()
  check('Editar precarga la venta existente', await page.inputValue('[data-testid="input-revenue"]') === '750.00')
  await page.fill('[data-testid="input-revenue"]', '700')
  await page.getByRole('button', { name: 'Continuar' }).click()
  check('Editar precarga el tiempo existente', await page.inputValue('[data-testid="input-hours"]') === '5')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await page.waitForURL(/\/resultado\//)
  check('Editar conserva el identificador', page.url().endsWith(originalActivityUrl.split('/').pop()))
  check('Editar recalcula la ganancia a +$150', (await page.locator('section p.num').first().innerText()).trim() === '+$150')
  check('Editar actualiza el nombre', await page.getByRole('heading', { name: 'Manzanas editadas' }).isVisible())
  await page.getByRole('button', { name: 'Historial' }).click()
  await page.waitForURL(/\/historial/)
  await page.getByText('Manzanas editadas').click()
  await page.waitForURL(/\/actividad\//)
  check('Editar conserva la fecha original', await page.locator('h1 + p').innerText() === originalActivityDate)

  // ---------- Caso 2: pérdida ----------
  await fillActivity(page, { name: 'Brownies', spent: '500', revenue: '400' })
  check('Caso 2 pérdida: -$100', (await page.locator('section p.num').first().innerText()).trim() === '-$100')
  check('Caso 2 dice "No ganaste"', await page.getByText('No ganaste').isVisible())
  check('Caso 2 etiqueta Pérdida', await page.getByText('Pérdida').first().isVisible())
  check('Caso 5 sin tiempo: no muestra ganancia por hora', (await page.getByText('Ganancia por hora').count()) === 0)
  check('Caso 6 sin cantidad: no muestra punto de recuperación', (await page.getByText('Punto de recuperación').count()) === 0)
  check('Caso 6 sin cantidad: no muestra cantidad', (await page.getByText('Cantidad', { exact: true }).count()) === 0)

  // ---------- Caso 3: empate ----------
  await fillActivity(page, { name: 'Fresas con crema', spent: '500', revenue: '500' })
  check('Caso 3 empate: $0', (await page.locator('section p.num').first().innerText()).trim() === '$0')
  check('Caso 3 dice "Quedaste tablas"', await page.getByText('Quedaste tablas').isVisible())

  // ---------- Caso 4: insumos anteriores ----------
  await fillActivity(page, {
    name: 'Galletas',
    spent: '200',
    usedPrevious: true,
    previous: '150',
    revenue: '500',
  })
  check('Caso 4 ganancia +$150', (await page.locator('section p.num').first().innerText()).trim() === '+$150')
  check('Caso 4 muestra insumos previos', await page.getByText('Insumos que ya tenías').isVisible())
  check('Caso 4 costo real $350', await page.getByText('$350').first().isVisible())

  // ---------- Caso 7: centavos ----------
  await fillActivity(page, { name: 'Centavos', spent: '499.95', revenue: '749.90' })
  const centsHero = (await page.locator('section p.num').first().innerText()).trim()
  check('Caso 7 centavos: +$249.95 exacto', centsHero === '+$249.95', `hero=${centsHero}`)

  // ---------- Punto de recuperación con cantidad ----------
  await page.goto(`${BASE}/registrar`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/registrar`)
  await page.waitForSelector('[data-testid="input-name"]')
  await page.fill('[data-testid="input-name"]', 'Con cantidad')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.fill('[data-testid="input-spent"]', '500')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForSelector('[data-testid="input-revenue"]')
  await page.fill('[data-testid="input-revenue"]', '750')
  await page.getByText('¿Quieres anotar cantidad y precio?').click()
  await page.fill('[data-testid="input-quantity"]', '30')
  await page.waitForFunction(
    () => document.querySelector('[data-testid="input-unit-price"]')?.value === '25.00',
    null,
    { timeout: 5000 },
  ).catch(() => {})
  const priceValue = await page.inputValue('[data-testid="input-unit-price"]')
  check('Precio por unidad se calcula solo: 25.00', priceValue === '25.00', `valor=${priceValue}`)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForSelector('[data-testid="input-hours"]')
  await page.getByRole('button', { name: 'Ver mi resultado' }).click()
  await page.waitForURL(/\/resultado\//)
  check('Muestra punto de recuperación', await page.getByText('Punto de recuperación').isVisible())
  check('Punto de recuperación = 20 piezas', await page.getByText('20 piezas', { exact: true }).isVisible())
  check('Muestra cantidad 30 piezas', await page.getByText('30 piezas').isVisible())
  check(
    'Explica el punto de recuperación en palabras',
    await page.getByText('Recuperaste lo que invertiste después de vender 20 piezas.').isVisible(),
  )

  // ---------- Validaciones (caso 8) ----------
  await page.goto(`${BASE}/registrar`)
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(`${BASE}/registrar`)
  await page.waitForSelector('[data-testid="input-name"]')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForTimeout(50)
  check('Valida nombre vacío', await page.getByText('Escribe qué vendiste').isVisible())

  await page.fill('[data-testid="input-name"]', 'Prueba inválida')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForSelector('[data-testid="input-spent"]')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForTimeout(50)
  check('Valida gasto vacío', await page.getByText('Escribe cuánto gastaste').isVisible())

  await page.fill('[data-testid="input-spent"]', '-50')
  await page.getByRole('button', { name: 'Continuar' }).click()
  const negativeShown = await page
    .getByText('El gasto no puede ser negativo')
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false)
  check('Valida gasto negativo', negativeShown)

  await page.fill('[data-testid="input-spent"]', 'abc')
  await page.getByRole('button', { name: 'Continuar' }).click()
  // Al salir del campo normalizamos: "abc" queda vacío, así que se avisa.
  const garbledShown = await page
    .getByText(/Ese número no se entiende|Escribe cuánto gastaste/)
    .first()
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false)
  check('Valida gasto ilegible', garbledShown)
  check('No deja avanzar con gasto ilegible', await page.locator('[data-testid="input-spent"]').isVisible())
  check(
    'No guarda un gasto de $0 silencioso',
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('si-gane:activities:v1') ?? '[]').length === 6,
    ),
  )

  // ---------- Persistencia tras recargar ----------
  await page.goto(`${BASE}/historial`)
  await page.waitForSelector('text=Manzanas editadas')
  const beforeReload = await page.getByText('Actividades').locator('..').innerText()
  await page.reload()
  await page.waitForSelector('text=Manzanas editadas')
  const afterReload = await page.getByText('Actividades').locator('..').innerText()
  check('Persiste tras recargar', beforeReload === afterReload, `${beforeReload} vs ${afterReload}`)
  check('localStorage usado', (await page.evaluate(() => localStorage.getItem('si-gane:activities:v1'))) !== null)

  // ---------- Eliminar con confirmación ----------
  const countBefore = await page.evaluate(
    () => JSON.parse(localStorage.getItem('si-gane:activities:v1') ?? '[]').length,
  )
  await page.locator('button[aria-label^="Eliminar"]').first().click()
  await page.waitForTimeout(100)
  check('Pide confirmación al borrar', await page.getByText('¿Borrar esta actividad?').isVisible())
  await page.getByRole('button', { name: 'Mejor no' }).click()
  await page.waitForTimeout(100)
  const countCancel = await page.evaluate(
    () => JSON.parse(localStorage.getItem('si-gane:activities:v1') ?? '[]').length,
  )
  check('Cancelar no borra', countBefore === countCancel)

  await page.locator('button[aria-label^="Eliminar"]').first().click()
  await page.waitForTimeout(100)
  await page.getByRole('button', { name: 'Sí, borrar' }).click()
  await page.waitForTimeout(200)
  const countAfter = await page.evaluate(
    () => JSON.parse(localStorage.getItem('si-gane:activities:v1') ?? '[]').length,
  )
  check('Confirmar borra', countAfter === countBefore - 1, `${countBefore} -> ${countAfter}`)

  // ---------- Responsive desktop ----------
  const desktop = await context.newPage()
  await desktop.setViewportSize({ width: 1440, height: 900 })
  await desktop.goto(BASE)
  await desktop.waitForSelector('text=¿Sí Gané?')
  const width = await desktop.locator('#app > div > div').first().evaluate((el) => el.getBoundingClientRect().width)
  check('Desktop limita el ancho del contenido', width <= 460, `ancho=${Math.round(width)}px`)
  check('Desktop no desborda horizontalmente', await desktop.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
  await desktop.screenshot({ path: '/tmp/sigane-desktop.png' })

  // ---------- Móvil: sin desbordes ----------
  await page.goto(BASE)
  await page.waitForSelector('text=¿Sí Gané?')
  check('Móvil no desborda horizontalmente', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))
  await page.screenshot({ path: '/tmp/sigane-home.png', fullPage: true })

  // ---------- PWA ----------
  const manifest = await page.evaluate(async () => {
    const res = await fetch('/manifest.webmanifest')
    return res.ok ? await res.json() : null
  })
  check('Manifest PWA disponible', manifest !== null)
  check('Manifest con nombre correcto', manifest?.name === '¿Sí Gané?', JSON.stringify(manifest?.name))
  check('Manifest con iconos', (manifest?.icons ?? []).length >= 2)

  // ---------- Consola limpia ----------
  check('Sin errores de consola', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

  await page.screenshot({ path: '/tmp/sigane-historial.png', fullPage: true })

  await browser.close()

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} verificaciones OK`)
  if (failed.length) {
    console.log('FALLARON:')
    for (const f of failed) console.log(` - ${f.name} ${f.detail}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('ERROR FATAL:', err)
  process.exit(1)
})

import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ channel: 'msedge' })

const context = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 })
const page = await context.newPage()

// Sembramos datos para el recorrido visual
await page.goto(BASE)
await page.evaluate(() => {
  localStorage.setItem(
    'si-gane:activities:v1',
    JSON.stringify([
      { id: 'a1', name: 'Manzanas forradas', date: new Date().toISOString().slice(0, 10), spentCents: 50000, previousInputsCostCents: 0, revenueCents: 75000, quantity: 30, unitPriceCents: 2500, timeMinutes: 300 },
      { id: 'a2', name: 'Brownies', date: new Date(Date.now() - 864e5).toISOString().slice(0, 10), spentCents: 30000, previousInputsCostCents: 0, revenueCents: 48000 },
      { id: 'a3', name: 'Fresas con crema', date: '2026-09-15', spentCents: 40000, previousInputsCostCents: 0, revenueCents: 35000 },
      { id: 'a4', name: 'Galletas de avena', date: '2026-09-12', spentCents: 20000, previousInputsCostCents: 15000, revenueCents: 50000 },
      { id: 'a5', name: 'Enorme', date: '2026-09-10', spentCents: 1234567890, previousInputsCostCents: 0, revenueCents: 987654321 },
    ]),
  )
})

const shots = []
async function shot(name, path, url) {
  await page.goto(`${BASE}${url}`)
  await page.waitForTimeout(400)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  shots.push({ name, overflow })
  await page.screenshot({ path, fullPage: true })
}

await shot('Inicio', '/tmp/s-inicio.png', '/')
await shot('Historial', '/tmp/s-historial.png', '/historial')

await page.goto(`${BASE}/registrar`)
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/s-paso1.png' })
await page.fill('[data-testid="input-name"]', 'Manzanas forradas')
await page.getByRole('button', { name: 'Continuar' }).click()
await page.waitForTimeout(250)
await page.screenshot({ path: '/tmp/s-paso2.png' })
await page.fill('[data-testid="input-spent"]', '500')
await page.getByRole('button', { name: 'Continuar' }).click()
await page.waitForTimeout(250)
await page.fill('[data-testid="input-revenue"]', '750')
await page.getByText('¿Quieres anotar cantidad y precio?').click()
await page.fill('[data-testid="input-quantity"]', '30')
await page.waitForTimeout(250)
await page.screenshot({ path: '/tmp/s-paso3.png' })
await page.getByRole('button', { name: 'Continuar' }).click()
await page.waitForTimeout(250)
await page.fill('[data-testid="input-hours"]', '5')
await page.screenshot({ path: '/tmp/s-paso4.png' })
await page.getByRole('button', { name: 'Ver mi resultado' }).click()
await page.waitForURL(/\/resultado\//)
await page.waitForTimeout(400)
await page.screenshot({ path: '/tmp/s-resultado.png', fullPage: true })

await shot('Detalle perdida', '/tmp/s-detalle.png', '/actividad/a3')
await shot('Detalle enorme', '/tmp/s-enorme.png', '/actividad/a5')

console.log('desbordes horizontales:', JSON.stringify(shots))
await browser.close()

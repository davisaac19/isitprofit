/**
 * Mide la altura real de los campos pareados del wizard.
 * Uso: node scripts/measure-fields.mjs [baseURL]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 360, height: 780 } })

const box = async (testid) =>
  page.locator(`[data-testid="${testid}"]`).evaluate((el) => {
    const shell = el.parentElement
    const r = shell.getBoundingClientRect()
    return { h: Math.round(r.height * 10) / 10, w: Math.round(r.width * 10) / 10 }
  })

await page.goto(`${BASE}/registrar`)
await page.waitForSelector('[data-testid="input-name"]')
await page.fill('[data-testid="input-name"]', 'Medir')
await page.getByRole('button', { name: 'Continuar' }).click()
await page.fill('[data-testid="input-spent"]', '500')
console.log('campo gasto (card):', JSON.stringify(await box('input-spent')))
await page.getByRole('button', { name: 'Continuar' }).click()
await page.waitForSelector('[data-testid="input-revenue"]')
await page.fill('[data-testid="input-revenue"]', '750')
console.log('campo venta (card):', JSON.stringify(await box('input-revenue')))
await page.getByText('¿Quieres anotar cantidad y precio?').click()
const qty = await box('input-quantity')
const price = await box('input-unit-price')
console.log('cantidad:', JSON.stringify(qty), ' precio c/u:', JSON.stringify(price))
console.log('  -> alturas iguales:', qty.h === price.h, '| anchos iguales:', qty.w === price.w)

await page.getByRole('button', { name: 'Continuar' }).click()
await page.waitForSelector('[data-testid="input-hours"]')
const hours = await box('input-hours')
const minutes = await box('input-minutes')
console.log('horas:', JSON.stringify(hours), ' minutos:', JSON.stringify(minutes))
console.log('  -> alturas iguales:', hours.h === minutes.h, '| anchos iguales:', hours.w === minutes.w)

await page.screenshot({ path: '/tmp/m-paso3.png' })
await page.screenshot({ path: '/tmp/m-paso4.png' })

await browser.close()

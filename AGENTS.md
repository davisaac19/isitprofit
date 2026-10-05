# Guía para agentes

## Resumen

¿Sí Gané? es una aplicación web mobile-first y PWA para registrar ventas y
calcular si una actividad produjo ganancia, pérdida o empate. Funciona offline
y guarda las actividades localmente; no tiene backend, cuentas ni sincronización.

## Stack y comandos

- Vue 3 con Composition API y TypeScript.
- Vue Router para las pantallas y Pinia para la lista compartida de actividades.
- Vite, Tailwind CSS y `vite-plugin-pwa`.
- `pnpm dev`: servidor local.
- `pnpm typecheck`: comprobación TypeScript/Vue.
- `pnpm build`: typecheck y build de producción, incluida la PWA.
- `pnpm verify`: verificación E2E Playwright contra `pnpm preview` en
  `http://localhost:4173`; usa el canal instalado de Microsoft Edge.
- `pnpm screenshots`: capturas E2E en `/tmp`.

## Estructura

- `src/views/`: inicio, registro, resultado, historial y detalle.
- `src/components/`: controles y componentes visuales reutilizables.
- `src/composables/`: formularios, resúmenes y fachada de actividades.
- `src/composables/storage/`: contrato y proveedor de persistencia
  (`localStorage` hoy).
- `src/domain/`: cálculos, dinero, fechas y validación; funciones puras, sin Vue
  ni acceso al navegador.
- `src/stores/`: store Pinia de actividades.
- `src/router/`: rutas y títulos.
- `src/types/`: modelo de actividad y tipos relacionados.
- `scripts/e2e-verify.mjs`: recorrido E2E principal.

## Convenciones importantes

- El dinero se representa dentro del dominio como enteros en centavos. Convierte
  y valida el texto en la frontera del formulario; no uses `float` para cálculos
  monetarios.
- Las vistas acceden a los datos mediante `useActivities`; no lean ni escriban
  `localStorage` directamente. La capa `ActivityStorage` es la frontera de
  persistencia.
- Mantén la lógica de negocio pura en `src/domain/`.
- El wizard de registro usa `?paso=1..4` para mantener el paso en la URL. El modo
  edición usa `?editar=<id>` y debe conservar el ID y la fecha de la actividad.
- Los datos opcionales (cantidad, precio unitario y tiempo) deben seguir siendo
  opcionales y eliminarse al guardar si se quitaron del formulario.
- Actualiza `README.md` cuando cambien las rutas o el flujo de usuario y amplía
  `scripts/e2e-verify.mjs` para los recorridos funcionales relevantes.

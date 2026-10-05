# ¿Sí Gané?

Web app mobile-first que responde una sola pregunta:

> **¿Realmente gané dinero con lo que vendí?**

Registras lo que gastaste y lo que vendiste; la app te dice si ganaste, perdiste o
quedaste tablas, y cuánto ganas por hora.

---

## Comandos

```bash
pnpm install        # instalar dependencias (o npm install)
pnpm dev            # servidor de desarrollo
pnpm build          # chequeo de tipos + build de producción (incluye PWA)
pnpm preview        # sirve dist/ en http://localhost:4173
pnpm typecheck      # solo vue-tsc

# Verificación end-to-end (necesita `pnpm preview` corriendo)
pnpm verify         # 50 comprobaciones del flujo completo en un navegador real
pnpm screenshots    # capturas de todas las pantallas en /tmp
```

> `pnpm verify` usa Playwright con el canal `msedge` (Microsoft Edge ya instalado),
> así que no descarga ningún navegador. Requiere `pnpm preview` en otra terminal.

---

## Estructura

```text
src/
├── components/     Componentes de UI reutilizables (sin lógica de negocio)
├── views/          Una vista por pantalla: Inicio, Registrar, Resultado, Historial, Detalle
├── composables/    Estado de UI y acceso a datos
│   └── storage/    Frontera de persistencia (hoy localStorage, mañana Supabase)
├── domain/         Lógica de negocio pura, sin Vue
│   ├── calculations.ts   costo, ganancia, margen, ganancia/hora, punto de equilibrio
│   ├── money.ts          parseo y formato de centavos
│   ├── dates.ts          fechas y etiquetas ("Hoy", "Ayer", "15 sep")
│   └── validation.ts     validaciones con mensajes en lenguaje humano
├── stores/         Pinia (solo la lista de actividades)
├── types/          Modelo Activity y ActivityDraft
├── router/         Rutas
└── assets/         CSS y tema de Tailwind
```

### Regla de oro

La lógica de negocio vive en `domain/` y son **funciones puras**: reciben datos y
devuelven datos. No conocen Vue, ni el DOM, ni `localStorage`. Se pueden probar y
razonar sin montar un componente.

---

## Dinero: siempre enteros en centavos

Nunca hay `float` para dinero dentro del dominio.

```text
$500.00 -> 50000
$25.50  -> 2550
```

El texto que escribe la persona se convierte a centavos en la frontera de la UI
(`domain/money.ts`) y a partir de ahí todo es aritmética entera. Evita los errores
clásicos de precisión (`0.1 + 0.2`).

---

## Modelo

```ts
type Activity = {
  id: string
  name: string
  date: string                       // YYYY-MM-DD
  spentCents: number                 // lo que salió del bolsillo
  previousInputsCostCents: number    // insumos que ya tenías y usaste aquí
  revenueCents: number
  quantity?: number
  unitPriceCents?: number
  timeMinutes?: number
}
```

`previousInputsCostCents` es lo que permite calcular el **costo real del lote** sin
obligar a nadie a llevar inventario:

```text
Compré $200 nuevos + usé $150 que ya tenía = costo del lote $350
```

---

## Persistencia

Toda la app pide actividades a un contrato (`composables/storage/types.ts`):

```ts
interface ActivityStorage {
  list(): Promise<Activity[]>
  save(activity: Activity): Promise<void>
  remove(id: string): Promise<void>
}
```

Hoy la implementación es `localStorage`. Para migrar a Supabase, basta con escribir
otra implementación y registrarla en `composables/storage/index.ts`:

```ts
setActivityStorage(createSupabaseActivityStorage(client))
```

Ningún componente cambia. No se accede a `localStorage` desde las vistas.

---

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio: resumen del mes + últimas actividades |
| `/registrar` | Wizard de 4 pasos (`?paso=1..4`) |
| `/resultado/:id` | Resultado: la pantalla más importante |
| `/historial` | Historial agrupado por fecha, con borrado |
| `/actividad/:id` | Detalle completo |

El paso del wizard vive en la URL (`?paso=2`), así el botón "atrás" del teléfono
funciona y no hay estado duplicado que se desincronice.

---

## Qué NO incluye (a propósito)

Supabase, autenticación, backend, API, base de datos remota, pagos, analytics,
inventario completo, entidades de productos/proveedores/clientes, gráficos.
Todo funciona offline en el dispositivo.

---

## PWA

`vite-plugin-pwa` genera manifest y service worker con precache de los assets.
Nombre "¿Sí Gané?", tema verde, `display: standalone`, iconos 192/512 y uno
maskable. Se puede instalar en el teléfono y abrir sin conexión.

---

## Verificación

`pnpm verify` recorre el flujo completo en un navegador real (viewport móvil de
390×844) y comprueba los 8 casos pedidos:

1. Ganancia: `$500` costo, `$750` ventas → `+$250`, margen `33.3%`, `+$50/h` con 5 h.
2. Pérdida: `$500` costo, `$400` ventas → `-$100` y "No ganaste".
3. Empate: `$500` / `$500` → `$0` y "Quedaste tablas".
4. Insumos previos: `$200` + `$150` → costo real `$350`, ganancia `+$150`.
5. Sin tiempo: se muestra la ganancia pero **no** la ganancia por hora.
6. Sin cantidad: se muestra la ganancia pero **no** el punto de recuperación.
7. Centavos: `$499.95` / `$749.90` → `+$249.95` exacto.
8. Valores inválidos: nada de negativos, NaN ni `$0` silencioso; se avisa.

Además verifica persistencia tras recargar, borrado con confirmación, que no haya
desbordes horizontales en móvil ni desktop, el manifest PWA y que la consola quede
sin errores.

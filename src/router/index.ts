import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: '¿Sí Gané?' },
  },
  {
    path: '/registrar',
    name: 'register',
    component: () => import('../views/RegisterActivityView.vue'),
    meta: { title: 'Registrar actividad' },
  },
  {
    path: '/resultado/:id',
    name: 'result',
    component: () => import('../views/ResultView.vue'),
    props: true,
    meta: { title: 'Resultado' },
  },
  {
    path: '/historial',
    name: 'history',
    component: () => import('../views/HistoryView.vue'),
    meta: { title: 'Historial' },
  },
  {
    path: '/actividad/:id',
    name: 'detail',
    component: () => import('../views/DetailView.vue'),
    props: true,
    meta: { title: 'Detalle' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? '¿Sí Gané?'
  document.title = title === '¿Sí Gané?' ? title : `${title} · ¿Sí Gané?`
})

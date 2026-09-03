import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/registration',
    },
    {
      path: '/registration',
      name: 'registration',
      component: () => import('@/pages/index.vue'),
    },
    {
      path: '/merchant/login',
      name: 'merchant-login',
      component: () => import('@/pages/merchant/login.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/merchant/dashboard',
      name: 'merchant-dashboard',
      component: () => import('@/pages/merchant/dashboard.vue'),
      meta: { requiresAuth: true, requiresMerchant: true },
    },
  ],
})

// ── Route Guard ───────────────────────────────────────────────────────────────
router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')
  const user  = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user') ?? '') } catch { return null }
  })()

  if (to.meta.requiresAuth && !token) {
    return { name: 'merchant-login' }
  }

  if (to.meta.requiresMerchant && user?.role !== 'merchant') {
    return { name: 'merchant-login' }
  }

  if (to.meta.guestOnly && token && user?.role === 'merchant') {
    return { name: 'merchant-dashboard' }
  }
})

export default router
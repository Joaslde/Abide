import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/tabs/immersion'
  },
  {
    path: '/auth/login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/auth/register',
    component: () => import('@/views/auth/RegisterView.vue')
  },
  {
    path: '/onboarding',
    component: () => import('@/views/auth/onboarding/Step1Needs.vue')
  },
  {
    path: '/tabs',
    component: () => import('@/views/tabs/TabsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/tabs/immersion' },
      {
        path: 'immersion',
        component: () => import('@/views/tabs/ImmersionTab.vue')
      },
      {
        path: 'sanctuaire',
        component: () => import('@/views/tabs/SanctuaireTab.vue')
      },
      {
        path: 'ancre',
        component: () => import('@/views/tabs/AncreTab.vue')
      },
      {
        path: 'phare',
        component: () => import('@/views/tabs/PhareTab.vue')
      }
    ]
  },
  {
    path: '/bible',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/views/bible/BibleHomeView.vue')
      },
      {
        path: ':bookId',
        component: () => import('@/views/bible/BibleBookView.vue')
      },
      {
        path: ':bookId/:chapter',
        component: () => import('@/views/bible/BibleChapterView.vue')
      }
    ]
  },
  {
    path: '/audio',
    component: () => import('@/views/audio/AudioPlayerView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai/chat',
    component: () => import('@/views/ai/AIChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/prayer',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('@/views/prayer/PrayerJournalView.vue')
      },
      {
        path: ':id',
        component: () => import('@/views/prayer/PrayerDetailView.vue')
      }
    ]
  },
  {
    path: '/premium',
    component: () => import('@/views/premium/PaywallView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/auth/login'
  }

  if (to.meta.requiresAuth && authStore.isAuthenticated && !authStore.onboardingDone) {
    if (!to.path.startsWith('/onboarding')) {
      return '/onboarding'
    }
  }
})

export default router

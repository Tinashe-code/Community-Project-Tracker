import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppStore } from '@/store/index.js'

const routes = [
  { path: '/', component: () => import('@/views/LandingPage.vue') },
  { path: '/login', component: () => import('@/views/MemberLogin.vue') },
  { path: '/admin/login', component: () => import('@/views/AdminLogin.vue') },
  { path: '/admin/register', component: () => import('@/views/AdminRegister.vue') },

  // Member
  { path: '/dashboard', component: () => import('@/views/member/MemberDashboard.vue'), meta: { requiresMember: true } },

  // Community Admin
  { path: '/admin', component: () => import('@/views/admin/CommunityAdminHome.vue'), meta: { requiresCommunityAdmin: true } },
  { path: '/admin/project/new', component: () => import('@/views/admin/NewProject.vue'), meta: { requiresCommunityAdmin: true } },
  { path: '/admin/project/:id', component: () => import('@/views/admin/ProjectDetail.vue'), meta: { requiresCommunityAdmin: true } },

  // Site Admin
  { path: '/site-admin', component: () => import('@/views/siteadmin/SiteAdminHome.vue'), meta: { requiresSiteAdmin: true } },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to) => {
  const store = useAppStore()
  if (to.meta.requiresSiteAdmin && store.user?.role !== 'site_admin') return '/admin/login'
  if (to.meta.requiresCommunityAdmin && store.user?.role !== 'community_admin') return '/admin/login'
  if (to.meta.requiresMember && !store.member) return '/login'
})

export default router

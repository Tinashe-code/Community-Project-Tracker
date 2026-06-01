<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/" class="back-link">← Back to home</router-link>

      <div class="auth-brand">
        <span class="auth-icon">⚙️</span>
        <h1 class="auth-title">Admin Portal</h1>
      </div>

      <div class="role-tabs">
        <button :class="['role-tab', { active: role === 'community' }]" @click="role = 'community'; store.clearError()">
          🏘️ Community Admin
        </button>
        <button :class="['role-tab', { active: role === 'site' }]" @click="role = 'site'; store.clearError()">
          🔧 Site Admin
        </button>
      </div>

      <div v-if="store.error" class="alert alert-error">{{ store.error }}</div>

      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input v-model="form.username" class="form-input" :placeholder="role === 'site' ? 'siteadmin' : 'your_username'" required autocomplete="username" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="form.password" class="form-input" type="password" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <button class="btn btn-primary w-full" type="submit" :disabled="store.loading">
          {{ store.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-footer-links" v-if="role === 'community'">
        <p>No account yet? <router-link to="/admin/register" class="link">Register as community admin</router-link></p>
      </div>

      <div class="demo-box">
        <p class="demo-label">Demo credentials</p>
        <div v-if="role === 'community'">
          <code>admin_elec</code> / <code>elec123</code>
        </div>
        <div v-else>
          <code>siteadmin</code> / <code>site@admin123</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'

const store = useAppStore()
const router = useRouter()
const role = ref('community')
const form = reactive({ username: '', password: '' })

async function login() {
  store.clearError()
  let ok = false
  if (role.value === 'site') {
    ok = await store.loginSiteAdmin(form.username, form.password)
    if (ok) router.push('/site-admin')
  } else {
    ok = await store.loginCommunityAdmin(form.username, form.password)
    if (ok) router.push('/admin')
  }
}
</script>

<style scoped>
.auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem 1rem; background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(26,67,50,.08),transparent),var(--bg); }
.auth-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:2rem; width:100%; max-width:420px; box-shadow:var(--shadow-lg); }
.back-link { font-size:.8rem; color:var(--text-3); display:inline-block; margin-bottom:1.5rem; }
.back-link:hover { color:var(--text); }
.auth-brand { text-align:center; margin-bottom:1.5rem; }
.auth-icon { font-size:2.5rem; display:block; margin-bottom:.75rem; }
.auth-title { font-family:var(--font-display); font-size:1.75rem; }
.role-tabs { display:grid; grid-template-columns:1fr 1fr; gap:.375rem; background:var(--surface2); border-radius:var(--radius-sm); padding:.3rem; margin-bottom:1.5rem; border:1px solid var(--border); }
.role-tab { padding:.5rem; border:none; background:transparent; border-radius:6px; font-size:.82rem; font-weight:500; color:var(--text-2); transition:all var(--transition); }
.role-tab.active { background:var(--surface); color:var(--accent); box-shadow:var(--shadow-sm); }
.auth-form { display:flex; flex-direction:column; gap:1rem; }
.w-full { width:100%; justify-content:center; }
.auth-footer-links { text-align:center; margin-top:1rem; font-size:.82rem; color:var(--text-2); }
.link { color:var(--accent); font-weight:500; }
.demo-box { margin-top:1.25rem; background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:.75rem 1rem; font-size:.78rem; color:var(--text-2); }
.demo-label { font-weight:500; text-transform:uppercase; letter-spacing:.06em; font-size:.7rem; margin-bottom:.3rem; color:var(--text-3); }
code { background:var(--border); padding:.1rem .35rem; border-radius:4px; font-size:.82rem; }
</style>

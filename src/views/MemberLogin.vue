<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/" class="back-link">← Back</router-link>
      <div class="auth-brand">
        <span class="auth-icon">🏘️</span>
        <h1 class="auth-title">Member Portal</h1>
        <p class="auth-sub">Enter your Community ID, house number and phone to view your dashboard</p>
      </div>
      <div v-if="store.error" class="alert alert-error">{{ store.error }}</div>
      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label class="form-label">Community ID</label>
          <input v-model="form.communityId" class="form-input" placeholder="e.g. COM001" required autocomplete="off" />
          <span class="field-hint">Ask your community admin for this ID</span>
        </div>
        <div class="form-group">
          <label class="form-label">House Number</label>
          <input v-model="form.houseNumber" class="form-input" placeholder="e.g. 4684" required />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input v-model="form.phone" class="form-input" type="tel" placeholder="e.g. 773256451" required />
        </div>
        <button class="btn btn-primary w-full" type="submit" :disabled="store.loading">
          {{ store.loading ? 'Checking...' : 'View My Dashboard' }}
        </button>
      </form>
      <div class="auth-demo">
        <p class="demo-label">Demo accounts</p>
        <div class="demo-grid">
          <button class="demo-btn" v-for="d in demos" :key="d.house" @click="fillDemo(d)">
            <strong>{{ d.name }}</strong><span>House {{ d.house }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'
const store = useAppStore()
const router = useRouter()
const form = ref({ communityId: 'COM001', houseNumber: '', phone: '' })
const demos = [
  { name: 'Chikumbindi', house: '4684', phone: '773256451' },
  { name: 'Chinhamhora', house: '4753', phone: '785500468' },
  { name: 'Zvimba', house: '4759', phone: '772448537' },
  { name: 'Chaeruka', house: '4712', phone: '774494487' },
]
function fillDemo(d) { form.value.houseNumber = d.house; form.value.phone = d.phone; store.clearError() }
async function login() {
  store.clearError()
  const ok = await store.loginMember(form.value.communityId.trim().toUpperCase(), form.value.houseNumber.trim(), form.value.phone.trim())
  if (ok) router.push('/dashboard')
}
</script>
<style scoped>
.auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem 1rem; background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(45,106,79,.1),transparent),var(--bg); }
.auth-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:2rem; width:100%; max-width:420px; box-shadow:var(--shadow-lg); }
.back-link { font-size:.8rem; color:var(--text-3); display:inline-block; margin-bottom:1.5rem; }
.back-link:hover { color:var(--text); }
.auth-brand { text-align:center; margin-bottom:2rem; }
.auth-icon { font-size:2.5rem; display:block; margin-bottom:.75rem; }
.auth-title { font-family:var(--font-display); font-size:1.75rem; margin-bottom:.5rem; }
.auth-sub { font-size:.85rem; color:var(--text-2); line-height:1.5; }
.auth-form { display:flex; flex-direction:column; gap:1rem; margin-bottom:1.5rem; }
.field-hint { font-size:.75rem; color:var(--text-3); }
.w-full { width:100%; justify-content:center; }
.auth-demo { border-top:1px solid var(--border); padding-top:1rem; }
.demo-label { font-size:.72rem; text-transform:uppercase; letter-spacing:.07em; color:var(--text-3); margin-bottom:.625rem; }
.demo-grid { display:grid; grid-template-columns:1fr 1fr; gap:.5rem; }
.demo-btn { display:flex; flex-direction:column; align-items:flex-start; padding:.5rem .75rem; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface2); gap:.1rem; transition:all var(--transition); }
.demo-btn:hover { background:var(--accent-light); border-color:var(--accent); }
.demo-btn strong { font-size:.8rem; }
.demo-btn span { font-size:.72rem; color:var(--text-3); }
</style>

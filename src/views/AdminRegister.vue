<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/admin/login" class="back-link">← Back to login</router-link>
      <div class="auth-brand">
        <span class="auth-icon">🏘️</span>
        <h1 class="auth-title">Create Admin Account</h1>
        <p class="auth-sub">Register as a community admin to manage your community's projects</p>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">
        Account created! A site admin will approve your account shortly. You'll then be able to log in and set up your community.
      </div>

      <form v-if="!success" @submit.prevent="register" class="auth-form">
        <div class="form-group">
          <label class="form-label">Your Full Name *</label>
          <input v-model="form.name" class="form-input" placeholder="e.g. Tinashe Moyo" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input v-model="form.email" class="form-input" type="email" placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Username *</label>
          <input v-model="form.username" class="form-input" placeholder="e.g. ward5_admin" required
            @input="form.username = form.username.toLowerCase().replace(/\s/g, '_')" />
          <span class="field-hint">Lowercase, no spaces</span>
        </div>
        <div class="form-group">
          <label class="form-label">Password *</label>
          <input v-model="form.password" class="form-input" type="password" placeholder="Choose a strong password" required minlength="6" />
        </div>
        <div class="form-group">
          <label class="form-label">Community / Area Name *</label>
          <input v-model="form.communityName" class="form-input" placeholder="e.g. Ward 5 Development Committee" required />
          <span class="field-hint">You'll set up the full community profile after approval</span>
        </div>
        <button class="btn btn-primary w-full" type="submit" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Submit Registration' }}
        </button>
      </form>

      <div v-if="success" style="text-align:center;margin-top:1rem">
        <router-link to="/admin/login" class="btn btn-primary">Go to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import * as api from '@/api/db.js'

const loading = ref(false)
const error = ref('')
const success = ref(false)
const form = reactive({ name: '', email: '', username: '', password: '', communityName: '' })

async function register() {
  error.value = ''
  loading.value = true
  try {
    await api.registerCommunityAdmin({ ...form })
    success.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem 1rem; background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(45,106,79,.1),transparent),var(--bg); }
.auth-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:2rem; width:100%; max-width:440px; box-shadow:var(--shadow-lg); }
.back-link { font-size:.8rem; color:var(--text-3); display:inline-block; margin-bottom:1.5rem; }
.back-link:hover { color:var(--text); }
.auth-brand { text-align:center; margin-bottom:1.75rem; }
.auth-icon { font-size:2.5rem; display:block; margin-bottom:.75rem; }
.auth-title { font-family:var(--font-display); font-size:1.6rem; margin-bottom:.5rem; }
.auth-sub { font-size:.85rem; color:var(--text-2); line-height:1.5; }
.auth-form { display:flex; flex-direction:column; gap:1rem; }
.field-hint { font-size:.75rem; color:var(--text-3); }
.w-full { width:100%; justify-content:center; }
</style>

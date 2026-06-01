<template>
  <div>
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand">
          <span>🌿</span>
          <span>CommunityTrack Admin</span>
        </div>
        <div class="topnav-actions">
          <router-link to="/admin" class="btn btn-ghost btn-sm">← Back</router-link>
        </div>
      </div>
    </nav>

    <div class="container page-body">
      <div class="page-header">
        <h1 class="page-title">Create New Community</h1>
        <p class="page-subtitle">Set up a new community project. Members will use the Community ID to log in.</p>
      </div>

      <div class="form-card card">
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">
          Community created! ID: <strong>{{ createdId }}</strong> — share this with your members.
        </div>

        <form @submit.prevent="create" class="create-form">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Community ID *</label>
              <input v-model="form.id" class="form-input" placeholder="e.g. ROAD2026" required
                @input="form.id = form.id.toUpperCase().replace(/[^A-Z0-9]/g, '')" maxlength="15" />
              <span class="field-hint">Short unique code (letters & numbers only). Members will use this to log in.</span>
            </div>
            <div class="form-group">
              <label class="form-label">Goal Amount ($) *</label>
              <input v-model.number="form.goal" class="form-input" type="number" min="0" step="0.01" placeholder="2000.00" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Community / Project Name *</label>
            <input v-model="form.name" class="form-input" placeholder="e.g. Ward 5 Road Rehabilitation Project" required />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-input" rows="2"
              placeholder="Brief description of the project..."></textarea>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Cover Color</label>
              <div class="color-row">
                <input v-model="form.coverColor" type="color" class="form-input color-input" />
                <div class="color-preview" :style="{ background: form.coverColor }">
                  {{ form.icon }}
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Project Icon (emoji)</label>
              <input v-model="form.icon" class="form-input emoji-input" maxlength="4" placeholder="🏗️" />
            </div>
          </div>

          <!-- Preview -->
          <div class="preview-label">Preview</div>
          <div class="preview-card" :style="{ background: form.coverColor }">
            <span class="preview-icon">{{ form.icon || '🏘️' }}</span>
            <div>
              <div class="preview-id">{{ form.id || 'COMMUNITY ID' }}</div>
              <div class="preview-name">{{ form.name || 'Community Name' }}</div>
              <div class="preview-goal">Goal: ${{ Number(form.goal || 0).toFixed(2) }}</div>
            </div>
          </div>

          <div class="form-actions">
            <router-link to="/admin" class="btn btn-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Creating...' : 'Create Community' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '@/api/db.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref(false)
const createdId = ref('')

const form = reactive({
  id: '',
  name: '',
  description: '',
  goal: '',
  coverColor: '#2d6a4f',
  icon: '🏘️',
})

async function create() {
  error.value = ''
  if (!form.id || form.id.length < 3) { error.value = 'Community ID must be at least 3 characters'; return }
  loading.value = true
  try {
    const c = await api.createCommunity({ ...form, goal: Number(form.goal) })
    createdId.value = c.id
    success.value = true
    setTimeout(() => router.push(`/admin/community/${c.id}`), 1500)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-body { padding-top: 2rem; padding-bottom: 3rem; }
.form-card { max-width: 700px; }
.create-form { display: flex; flex-direction: column; gap: 1.25rem; }
.field-hint { font-size: 0.75rem; color: var(--text-3); }
.color-row { display: flex; align-items: center; gap: 0.75rem; }
.color-input { width: 52px; height: 40px; padding: 2px; cursor: pointer; flex-shrink: 0; }
.color-preview {
  width: 52px; height: 40px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem;
}
.emoji-input { font-size: 1.5rem; text-align: center; letter-spacing: 0.1em; }

.preview-label { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); }
.preview-card {
  border-radius: var(--radius); padding: 1.25rem 1.5rem;
  display: flex; align-items: center; gap: 1rem; color: white;
  position: relative; overflow: hidden;
}
.preview-icon { font-size: 2.5rem; }
.preview-id { font-size: 0.72rem; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.09em; }
.preview-name { font-family: var(--font-display); font-size: 1.25rem; margin: 0.125rem 0; }
.preview-goal { font-size: 0.82rem; opacity: 0.8; }

.form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 0.5rem; }
</style>

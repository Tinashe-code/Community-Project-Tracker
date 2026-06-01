<template>
  <div>
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand"><span>🌿</span><span>Musha</span></div>
        <div class="topnav-actions">
          <router-link to="/admin" class="btn btn-ghost btn-sm">← Back</router-link>
        </div>
      </div>
    </nav>

    <div class="container page-body">
      <div class="page-header">
        <h1 class="page-title">New Project</h1>
        <p class="page-subtitle">Create a project with one or more phases. Each phase has its own goal.</p>
      </div>

      <div class="form-layout">
        <!-- Left: project details -->
        <div class="form-card card">
          <h2 class="card-title">Project Details</h2>
          <div v-if="error" class="alert alert-error">{{ error }}</div>

          <div class="form-section">
            <div class="form-group">
              <label class="form-label">Project Name *</label>
              <input v-model="form.name" class="form-input" placeholder="e.g. Community Electrification" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-input" rows="2" placeholder="What is this project about?"></textarea>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Cover Colour</label>
                <div class="color-row">
                  <input v-model="form.coverColor" type="color" class="form-input color-input" />
                  <div class="color-preview" :style="{ background: form.coverColor }">{{ form.icon }}</div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Icon (emoji)</label>
                <input v-model="form.icon" class="form-input emoji-input" maxlength="4" placeholder="⚡" />
              </div>
            </div>
          </div>

          <!-- Phases builder -->
          <div class="phases-section">
            <div class="phases-header">
              <h3 class="phases-title">Project Phases</h3>
              <button type="button" class="btn btn-secondary btn-sm" @click="addPhase">+ Add Phase</button>
            </div>
            <p class="phases-hint">Define each phase of the project. At least one phase is required. The total project goal is the sum of all phase goals.</p>

            <div class="phase-builder" v-for="(ph, i) in form.phases" :key="i">
              <div class="pb-header">
                <div class="pb-num">Phase {{ i + 1 }}</div>
                <button type="button" class="pb-remove" @click="removePhase(i)" v-if="form.phases.length > 1" title="Remove phase">✕</button>
              </div>
              <div class="form-group">
                <label class="form-label">Phase Name *</label>
                <input v-model="ph.name" class="form-input" :placeholder="'e.g. Phase ' + (i+1) + ' — Poles'" required />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <input v-model="ph.description" class="form-input" placeholder="What happens in this phase?" />
              </div>
              <div class="form-group">
                <label class="form-label">Goal Amount ($) *</label>
                <input v-model.number="ph.goal" class="form-input" type="number" min="0" step="0.01" placeholder="0.00" required />
              </div>
            </div>

            <!-- Total -->
            <div class="total-goal-row">
              <span>Total Project Goal</span>
              <span class="total-goal-val">${{ totalGoal.toFixed(2) }}</span>
            </div>
          </div>

          <div class="form-actions">
            <router-link to="/admin" class="btn btn-secondary">Cancel</router-link>
            <button class="btn btn-primary" @click="create" :disabled="loading">
              {{ loading ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </div>

        <!-- Right: live preview -->
        <div class="preview-panel">
          <div class="preview-label">Live Preview</div>
          <div class="preview-card" :style="{ '--pc': form.coverColor }">
            <div class="pv-top">
              <span class="pv-icon">{{ form.icon || '🏗️' }}</span>
            </div>
            <div class="pv-body">
              <h3 class="pv-name">{{ form.name || 'Project Name' }}</h3>
              <p class="pv-desc">{{ form.description || 'Project description...' }}</p>
              <div class="pv-phases">
                <div v-for="(ph, i) in form.phases" :key="i" class="pv-phase">
                  <div class="pv-phase-header">
                    <span class="pv-phase-num">Phase {{ i + 1 }}</span>
                    <span class="pv-phase-goal">${{ Number(ph.goal || 0).toFixed(2) }}</span>
                  </div>
                  <div class="pv-phase-name">{{ ph.name || '(unnamed)' }}</div>
                  <div class="progress-bar-wrap" style="margin-top:.375rem;height:6px">
                    <div class="progress-bar-fill" style="width:0%"></div>
                  </div>
                </div>
              </div>
              <div class="pv-total">
                <span>Total Goal</span>
                <span>${{ totalGoal.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'
import * as api from '@/api/db.js'

const store = useAppStore()
const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  description: '',
  coverColor: '#b5911a',
  icon: '⚡',
  phases: [
    { name: '', description: '', goal: '' },
  ]
})

const totalGoal = computed(() => form.phases.reduce((s, ph) => s + Number(ph.goal || 0), 0))

function addPhase() {
  form.phases.push({ name: '', description: '', goal: '' })
}
function removePhase(i) {
  form.phases.splice(i, 1)
}

async function create() {
  error.value = ''
  if (!form.name.trim()) { error.value = 'Project name is required'; return }
  for (let i = 0; i < form.phases.length; i++) {
    if (!form.phases[i].name.trim()) { error.value = `Phase ${i + 1} name is required`; return }
    if (!form.phases[i].goal || Number(form.phases[i].goal) <= 0) { error.value = `Phase ${i + 1} must have a goal greater than 0`; return }
  }
  loading.value = true
  try {
    const project = await api.createProject({
      ...form,
      communityId: store.user.communityId,
      phases: form.phases.map((ph, i) => ({ ...ph, goal: Number(ph.goal), order: i + 1 }))
    })
    router.push(`/admin/project/${project.id}`)
  } catch (e) {
    error.value = e.message
  } finally { loading.value = false }
}
</script>

<style scoped>
.page-body { padding-top:1.5rem; padding-bottom:3rem; }
.form-layout { display:grid; grid-template-columns:1fr 320px; gap:1.5rem; align-items:start; }
.form-card { display:flex; flex-direction:column; gap:1.25rem; }
.form-section { display:flex; flex-direction:column; gap:1rem; }
.color-row { display:flex; align-items:center; gap:.75rem; }
.color-input { width:52px; height:40px; padding:2px; cursor:pointer; flex-shrink:0; }
.color-preview { width:52px; height:40px; border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center; font-size:1.25rem; }
.emoji-input { font-size:1.5rem; text-align:center; }

.phases-section { border-top:1px solid var(--border); padding-top:1.25rem; display:flex; flex-direction:column; gap:1rem; }
.phases-header { display:flex; align-items:center; justify-content:space-between; }
.phases-title { font-family:var(--font-display); font-size:1rem; }
.phases-hint { font-size:.8rem; color:var(--text-2); line-height:1.5; margin-top:-.5rem; }

.phase-builder { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:1rem 1.125rem; display:flex; flex-direction:column; gap:.75rem; position:relative; }
.pb-header { display:flex; align-items:center; justify-content:space-between; }
.pb-num { font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--accent); }
.pb-remove { background:none; border:none; color:var(--text-3); font-size:.875rem; padding:.2rem .4rem; border-radius:4px; transition:all var(--transition); }
.pb-remove:hover { background:var(--danger-light); color:var(--danger); }

.total-goal-row { display:flex; justify-content:space-between; align-items:center; background:var(--accent-light); border:1px solid rgba(45,106,79,.2); border-radius:var(--radius-sm); padding:.75rem 1rem; }
.total-goal-row span:first-child { font-size:.85rem; font-weight:500; color:var(--accent-dark); }
.total-goal-val { font-family:var(--font-display); font-size:1.25rem; color:var(--accent-dark); }

.form-actions { display:flex; gap:.75rem; justify-content:flex-end; padding-top:.5rem; border-top:1px solid var(--border); }

/* Preview */
.preview-panel { position:sticky; top:80px; }
.preview-label { font-size:.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.07em; color:var(--text-3); margin-bottom:.625rem; }
.preview-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow); }
.pv-top { background:linear-gradient(135deg,var(--pc,#b5911a),color-mix(in srgb,var(--pc,#b5911a) 65%,black)); padding:1.25rem 1.5rem; }
.pv-icon { font-size:2.5rem; }
.pv-body { padding:1.25rem; }
.pv-name { font-family:var(--font-display); font-size:1.1rem; margin-bottom:.375rem; }
.pv-desc { font-size:.8rem; color:var(--text-2); line-height:1.4; margin-bottom:1rem; }
.pv-phases { display:flex; flex-direction:column; gap:.75rem; margin-bottom:1rem; }
.pv-phase { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:.75rem; }
.pv-phase-header { display:flex; justify-content:space-between; margin-bottom:.2rem; }
.pv-phase-num { font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; color:var(--text-3); font-weight:600; }
.pv-phase-goal { font-size:.8rem; font-weight:600; color:var(--accent); }
.pv-phase-name { font-size:.82rem; font-weight:500; }
.pv-total { display:flex; justify-content:space-between; align-items:center; padding-top:.75rem; border-top:1px solid var(--border); font-size:.85rem; font-weight:600; color:var(--text-2); }
.pv-total span:last-child { font-family:var(--font-display); font-size:1.1rem; color:var(--accent); }

@media (max-width:900px) {
  .form-layout { grid-template-columns:1fr; }
  .preview-panel { position:static; }
}
</style>

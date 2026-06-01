<template>
  <div>
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand"><span>🌿</span><span>Musha</span></div>
        <div class="topnav-actions">
          <span class="admin-chip">{{ store.user.name }}</span>
          <button class="btn btn-ghost btn-sm" @click="logout">Sign Out</button>
        </div>
      </div>
    </nav>

    <div class="loading-overlay" v-if="loading"><div class="spinner"></div></div>

    <!-- No community yet — first time setup -->
    <div class="container page-body" v-else-if="!community">
      <div class="setup-card card">
        <div class="setup-icon">🏘️</div>
        <h2 class="setup-title">Set Up Your Community</h2>
        <p class="setup-desc">You're approved! Create your community profile to start managing projects.</p>
        <form @submit.prevent="createCommunity" class="setup-form">
          <div v-if="setupError" class="alert alert-error">{{ setupError }}</div>
          <div class="form-group">
            <label class="form-label">Community Name *</label>
            <input v-model="setupForm.name" class="form-input" placeholder="e.g. Ward 5 Development Committee" required />
          </div>
          <div class="form-group">
            <label class="form-label">Location / Area</label>
            <input v-model="setupForm.location" class="form-input" placeholder="e.g. Harare South" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="setupForm.description" class="form-input" rows="2" placeholder="Brief description of your community..."></textarea>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Cover Colour</label>
              <input v-model="setupForm.coverColor" type="color" class="form-input color-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Icon (emoji)</label>
              <input v-model="setupForm.icon" class="form-input" maxlength="4" placeholder="🏘️" style="font-size:1.5rem;text-align:center" />
            </div>
          </div>
          <button class="btn btn-primary" type="submit" :disabled="setupLoading">
            {{ setupLoading ? 'Creating...' : 'Create Community' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Main dashboard -->
    <div class="container page-body" v-else>
      <!-- Community banner -->
      <div class="community-banner" :style="{ '--bc': community.coverColor || '#1a472a' }">
        <span class="cb-icon">{{ community.icon || '🏘️' }}</span>
        <div class="cb-info">
          <div class="cb-id-label">Community ID — share with members</div>
          <div class="cb-id">{{ community.id }}</div>
          <h1 class="cb-name">{{ community.name }}</h1>
          <p class="cb-loc" v-if="community.location">📍 {{ community.location }}</p>
        </div>
        <div class="cb-actions">
          <router-link to="/admin/project/new" class="btn btn-white">+ New Project</router-link>
        </div>
      </div>

      <!-- Summary stats -->
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card"><div class="stat-label">Total Projects</div><div class="stat-value">{{ projects.length }}</div></div>
        <div class="stat-card"><div class="stat-label">Active Projects</div><div class="stat-value">{{ projects.filter(p=>p.status==='active').length }}</div></div>
        <div class="stat-card"><div class="stat-label">Total Raised</div><div class="stat-value amount-positive">${{ totalRaised.toFixed(2) }}</div></div>
        <div class="stat-card"><div class="stat-label">Total Members</div><div class="stat-value">{{ memberCount }}</div></div>
      </div>

      <!-- Projects list -->
      <div class="section-header">
        <span class="section-title">Projects</span>
        <router-link to="/admin/project/new" class="btn btn-primary btn-sm">+ New Project</router-link>
      </div>

      <div v-if="projects.length === 0" class="empty-state card">
        <div class="empty-icon">🏗️</div>
        <div class="empty-text">No projects yet. Create your first project!</div>
        <router-link to="/admin/project/new" class="btn btn-primary" style="margin-top:1rem">Create Project</router-link>
      </div>

      <div class="projects-grid">
        <router-link v-for="p in projects" :key="p.id" :to="`/admin/project/${p.id}`" class="project-card">
          <div class="pc-top" :style="{ background: p.coverColor || '#2d6a4f' }">
            <span class="pc-icon">{{ p.icon || '🏗️' }}</span>
            <span class="pc-status" :class="p.status">{{ p.status }}</span>
          </div>
          <div class="pc-body">
            <h3 class="pc-name">{{ p.name }}</h3>
            <p class="pc-desc">{{ p.description }}</p>
            <div class="pc-phase-count">{{ p.phaseCount }} phase{{ p.phaseCount !== 1 ? 's' : '' }}</div>
            <div class="pc-progress-row">
              <span>${{ p.totalPaid.toFixed(2) }} of ${{ p.totalGoal.toFixed(2) }}</span>
              <span>{{ p.progress }}%</span>
            </div>
            <div class="progress-bar-wrap" style="margin-top:.375rem">
              <div class="progress-bar-fill" :style="{ width: p.progress + '%' }"></div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'
import * as api from '@/api/db.js'

const store = useAppStore()
const router = useRouter()
const loading = ref(true)
const community = ref(null)
const projects = ref([])
const memberCount = ref(0)
const setupError = ref('')
const setupLoading = ref(false)

const setupForm = reactive({ name: '', location: '', description: '', coverColor: '#1a472a', icon: '🏘️' })

const totalRaised = computed(() => projects.value.reduce((s, p) => s + p.totalPaid, 0))

async function load() {
  loading.value = true
  try {
    if (store.user.communityId) {
      community.value = await api.getCommunity(store.user.communityId)
      const [projs, members] = await Promise.all([
        api.getProjects(store.user.communityId),
        api.getMembers(store.user.communityId)
      ])
      projects.value = projs
      memberCount.value = members.length
    }
  } catch (e) { /* no community yet */ }
  loading.value = false
}

async function createCommunity() {
  setupError.value = ''
  setupLoading.value = true
  try {
    const c = await api.createCommunity({ ...setupForm }, store.user.id)
    store.user.communityId = c.id
    store.user.community = c
    await load()
  } catch (e) {
    setupError.value = e.message
  } finally { setupLoading.value = false }
}

function logout() { store.logout(); router.push('/') }
onMounted(load)
</script>

<style scoped>
.page-body { padding-top:1.5rem; padding-bottom:3rem; }
.admin-chip { font-size:.8rem; color:var(--text-2); background:var(--surface2); padding:.3rem .75rem; border-radius:100px; border:1px solid var(--border); }

.setup-card { max-width:560px; margin:3rem auto; text-align:center; }
.setup-icon { font-size:3rem; margin-bottom:1rem; }
.setup-title { font-family:var(--font-display); font-size:1.75rem; margin-bottom:.5rem; }
.setup-desc { color:var(--text-2); margin-bottom:1.75rem; font-size:.9rem; }
.setup-form { text-align:left; display:flex; flex-direction:column; gap:1rem; }
.color-input { height:42px; padding:2px; cursor:pointer; }

.community-banner { background:linear-gradient(135deg,var(--bc,#1a472a),color-mix(in srgb,var(--bc,#1a472a) 65%,black)); color:white; border-radius:var(--radius-lg); padding:1.5rem 2rem; display:flex; align-items:center; gap:1.5rem; margin-bottom:1.5rem; flex-wrap:wrap; overflow:hidden; position:relative; }
.community-banner::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E"); }
.cb-icon { font-size:3rem; flex-shrink:0; }
.cb-info { flex:1; min-width:0; }
.cb-id-label { font-size:.65rem; text-transform:uppercase; letter-spacing:.1em; opacity:.65; }
.cb-id { font-size:1.1rem; font-weight:700; letter-spacing:.05em; margin:.1rem 0 .25rem; background:rgba(255,255,255,.15); display:inline-block; padding:.15rem .75rem; border-radius:100px; }
.cb-name { font-family:var(--font-display); font-size:1.4rem; }
.cb-loc { font-size:.8rem; opacity:.8; margin-top:.2rem; }
.cb-actions { margin-left:auto; }
.btn-white { background:white; color:var(--accent-dark); font-weight:600; }
.btn-white:hover { background:var(--accent-light); }

.projects-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.25rem; }
.project-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm); display:block; transition:transform var(--transition),box-shadow var(--transition); }
.project-card:hover { transform:translateY(-3px); box-shadow:var(--shadow); }
.pc-top { height:80px; display:flex; align-items:flex-start; justify-content:space-between; padding:.875rem 1rem; }
.pc-icon { font-size:2rem; }
.pc-status { font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.07em; padding:.2rem .6rem; border-radius:100px; background:rgba(255,255,255,.25); color:white; }
.pc-status.completed { background:rgba(82,183,136,.4); }
.pc-body { padding:1rem 1.25rem 1.25rem; }
.pc-name { font-family:var(--font-display); font-size:1.05rem; margin-bottom:.25rem; }
.pc-desc { font-size:.8rem; color:var(--text-2); line-height:1.4; margin-bottom:.625rem; }
.pc-phase-count { font-size:.75rem; color:var(--accent); font-weight:500; margin-bottom:.5rem; }
.pc-progress-row { display:flex; justify-content:space-between; font-size:.75rem; color:var(--text-3); }
</style>

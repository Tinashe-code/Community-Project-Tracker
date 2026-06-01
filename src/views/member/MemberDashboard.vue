<template>
  <div class="member-page">
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand"><span>🌿</span><span>Musha</span></div>
        <div class="topnav-actions">
          <span class="member-chip">🏠 {{ store.member.houseNumber }}</span>
          <button class="btn btn-ghost btn-sm" @click="logout">Sign Out</button>
        </div>
      </div>
    </nav>

    <div class="loading-overlay" v-if="loading"><div class="spinner"></div></div>

    <div class="container page-body" v-else>
      <!-- Community Banner -->
      <div class="community-banner" :style="{ '--bc': community.coverColor || '#1a472a' }">
        <span class="cb-icon">{{ community.icon || '🏘️' }}</span>
        <div class="cb-info">
          <div class="cb-id">{{ community.id }}</div>
          <h1 class="cb-name">{{ community.name }}</h1>
          <p class="cb-location" v-if="community.location">📍 {{ community.location }}</p>
        </div>
      </div>

      <!-- My summary across all projects -->
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-label">My Total Contributions</div>
          <div class="stat-value amount-positive">${{ myTotal.toFixed(2) }}</div>
          <div class="stat-sub">across all projects</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Projects</div>
          <div class="stat-value">{{ projects.filter(p=>p.status==='active').length }}</div>
          <div class="stat-sub">{{ projects.length }} total projects</div>
        </div>
      </div>

      <!-- Projects -->
      <div v-for="project in projects" :key="project.id" class="project-block">
        <div class="project-header" :style="{ '--pc': project.coverColor || '#2d6a4f' }">
          <span class="proj-icon">{{ project.icon || '🏗️' }}</span>
          <div class="proj-meta">
            <h2 class="proj-name">{{ project.name }}</h2>
            <p class="proj-desc">{{ project.description }}</p>
          </div>
          <div class="proj-badge" :class="project.status">{{ project.status }}</div>
        </div>

        <!-- Project overall progress -->
        <div class="proj-overall">
          <div class="proj-stats-row">
            <div class="proj-stat"><span class="ps-val">${{ project.totalPaid.toFixed(2) }}</span><span class="ps-lbl">Raised</span></div>
            <div class="proj-stat"><span class="ps-val">${{ project.totalGoal.toFixed(2) }}</span><span class="ps-lbl">Total Goal</span></div>
            <div class="proj-stat"><span class="ps-val">{{ project.progress }}%</span><span class="ps-lbl">Overall</span></div>
            <div class="proj-stat"><span class="ps-val">{{ project.phaseCount }}</span><span class="ps-lbl">Phases</span></div>
          </div>
          <div class="progress-bar-wrap" style="margin-top:.75rem">
            <div class="progress-bar-fill" :style="{ width: project.progress + '%' }"></div>
          </div>
        </div>

        <!-- Phases -->
        <div class="phases-list">
          <div v-for="phase in project.phases" :key="phase.id" class="phase-card" :class="phase.status">
            <div class="phase-top">
              <div class="phase-order">Phase {{ phase.order }}</div>
              <div class="phase-status-badge" :class="phase.status">{{ phase.status }}</div>
            </div>
            <h3 class="phase-name">{{ phase.name }}</h3>
            <p class="phase-desc" v-if="phase.description">{{ phase.description }}</p>

            <div class="phase-progress-row">
              <span class="phase-paid">${{ (phaseStats[phase.id]?.paid || 0).toFixed(2) }} raised</span>
              <span class="phase-goal">Goal: ${{ phase.goal.toFixed(2) }}</span>
            </div>
            <div class="progress-bar-wrap" style="margin:.375rem 0">
              <div class="progress-bar-fill" :style="{ width: (phaseStats[phase.id]?.progress || 0) + '%', background: phaseGradient(phase.status) }"></div>
            </div>
            <div class="phase-remaining">
              ${{ (phaseStats[phase.id]?.remaining || phase.goal).toFixed(2) }} remaining
            </div>
          </div>
        </div>

        <!-- My payments for this project -->
        <details class="my-payments-details">
          <summary>My payments for this project ({{ myProjectPayments(project.id).length }})</summary>
          <div v-if="myProjectPayments(project.id).length === 0" class="empty-state" style="padding:1.5rem">
            <div class="empty-text">No payments recorded for your house in this project yet</div>
          </div>
          <div v-else class="table-wrapper" style="margin-top:.75rem">
            <table>
              <thead><tr><th>Date</th><th>Phase</th><th>Description</th><th>Receipt</th><th>Amount</th></tr></thead>
              <tbody>
                <tr v-for="p in myProjectPayments(project.id)" :key="p.id">
                  <td>{{ fmtDate(p.date) }}</td>
                  <td>{{ phaseName(p.phaseId) }}</td>
                  <td>{{ p.description }}</td>
                  <td class="monospace">{{ p.receiptNumber }}</td>
                  <td class="amount-positive">${{ p.amount.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div v-if="projects.length === 0" class="empty-state card">
        <div class="empty-icon">🏗️</div>
        <div class="empty-text">No projects have been created yet for this community</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'
import * as api from '@/api/db.js'

const store = useAppStore()
const router = useRouter()
const loading = ref(true)
const projects = ref([])
const allMyPayments = ref([])
const phaseStats = ref({})

const community = computed(() => store.memberCommunity)

const myTotal = computed(() => allMyPayments.value.reduce((s, p) => s + p.amount, 0))

function myProjectPayments(projectId) {
  return allMyPayments.value.filter(p => p.projectId === projectId)
}
function phaseName(phaseId) {
  for (const p of projects.value) {
    const ph = p.phases?.find(x => x.id === phaseId)
    if (ph) return ph.name
  }
  return phaseId
}
function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function phaseGradient(status) {
  if (status === 'completed') return 'linear-gradient(90deg,#52b788,#2d6a4f)'
  if (status === 'pending') return 'linear-gradient(90deg,#adb5bd,#868e96)'
  return 'linear-gradient(90deg,var(--accent),#52b788)'
}

async function load() {
  loading.value = true
  const cid = community.value.id
  const houseNumber = store.member.houseNumber
  const projs = await api.getProjects(cid)
  projects.value = projs

  // build phaseStats
  const stats = {}
  for (const proj of projs) {
    for (const ph of proj.phases || []) {
      const payments = await api.getPayments({ phaseId: ph.id })
      const paid = payments.reduce((s, p) => s + p.amount, 0)
      stats[ph.id] = { paid, progress: ph.goal > 0 ? Math.min(100, Math.round(paid / ph.goal * 100)) : 0, remaining: Math.max(0, ph.goal - paid) }
    }
  }
  phaseStats.value = stats

  allMyPayments.value = await api.getPayments({ communityId: cid, houseNumber })
  loading.value = false
}

function logout() { store.logout(); router.push('/') }
onMounted(load)
</script>

<style scoped>
.member-page { min-height:100vh; }
.page-body { padding-top:1.5rem; padding-bottom:3rem; }
.member-chip { background:var(--accent-light); color:var(--accent-dark); font-size:.8rem; font-weight:500; padding:.3rem .75rem; border-radius:100px; }

.community-banner { background:linear-gradient(135deg,var(--bc,#1a472a),color-mix(in srgb,var(--bc,#1a472a) 65%,black)); color:white; border-radius:var(--radius-lg); padding:1.5rem 2rem; display:flex; align-items:center; gap:1.25rem; margin-bottom:1.5rem; overflow:hidden; position:relative; flex-wrap:wrap; }
.community-banner::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E"); }
.cb-icon { font-size:2.5rem; flex-shrink:0; }
.cb-id { font-size:.72rem; opacity:.7; text-transform:uppercase; letter-spacing:.09em; }
.cb-name { font-family:var(--font-display); font-size:1.5rem; margin:.2rem 0; }
.cb-location { font-size:.82rem; opacity:.8; }

.project-block { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); margin-bottom:1.5rem; overflow:hidden; box-shadow:var(--shadow-sm); }
.project-header { background:linear-gradient(135deg,var(--pc,#2d6a4f),color-mix(in srgb,var(--pc,#2d6a4f) 70%,black)); color:white; padding:1.25rem 1.5rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
.proj-icon { font-size:2rem; flex-shrink:0; }
.proj-meta { flex:1; min-width:0; }
.proj-name { font-family:var(--font-display); font-size:1.25rem; margin-bottom:.25rem; }
.proj-desc { font-size:.82rem; opacity:.85; }
.proj-badge { font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; padding:.25rem .75rem; border-radius:100px; background:rgba(255,255,255,.2); flex-shrink:0; }
.proj-badge.completed { background:rgba(82,183,136,.3); }
.proj-badge.paused { background:rgba(255,193,7,.2); }

.proj-overall { padding:1rem 1.5rem; border-bottom:1px solid var(--border); background:var(--surface2); }
.proj-stats-row { display:flex; gap:1.5rem; flex-wrap:wrap; }
.proj-stat { display:flex; flex-direction:column; }
.ps-val { font-family:var(--font-display); font-size:1.1rem; color:var(--text); }
.ps-lbl { font-size:.7rem; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3); }

.phases-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1rem; padding:1.25rem 1.5rem; }
.phase-card { background:var(--surface2); border:1px solid var(--border); border-radius:var(--radius); padding:1rem 1.25rem; }
.phase-card.active { border-color:var(--accent); background:rgba(45,106,79,.04); }
.phase-card.completed { border-color:#52b788; background:rgba(82,183,136,.05); }
.phase-card.pending { opacity:.75; }
.phase-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:.5rem; }
.phase-order { font-size:.72rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text-3); }
.phase-status-badge { font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.07em; padding:.15rem .5rem; border-radius:100px; }
.phase-status-badge.active { background:var(--accent-light); color:var(--accent-dark); }
.phase-status-badge.completed { background:#d8f3dc; color:#1b4332; }
.phase-status-badge.pending { background:var(--border); color:var(--text-3); }
.phase-name { font-size:.9rem; font-weight:600; margin-bottom:.25rem; }
.phase-desc { font-size:.78rem; color:var(--text-2); line-height:1.4; margin-bottom:.625rem; }
.phase-progress-row { display:flex; justify-content:space-between; font-size:.75rem; }
.phase-paid { color:var(--accent); font-weight:600; }
.phase-goal { color:var(--text-3); }
.phase-remaining { font-size:.75rem; color:var(--text-3); margin-top:.25rem; }

.my-payments-details { border-top:1px solid var(--border); }
.my-payments-details summary { padding:.875rem 1.5rem; cursor:pointer; font-size:.875rem; font-weight:500; color:var(--text-2); list-style:none; display:flex; align-items:center; gap:.5rem; }
.my-payments-details summary::before { content:'▶'; font-size:.65rem; transition:transform .2s; }
.my-payments-details[open] summary::before { transform:rotate(90deg); }
.my-payments-details[open] summary { color:var(--accent); }
.my-payments-details .table-wrapper { margin:0 1.5rem 1.25rem; }

@media (max-width:640px) {
  .community-banner { padding:1.25rem; }
  .cb-name { font-size:1.2rem; }
  .phases-list { grid-template-columns:1fr; }
  .proj-stats-row { gap:1rem; }
}
</style>

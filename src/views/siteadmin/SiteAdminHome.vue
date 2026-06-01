<template>
  <div>
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand"><span>🌿</span><span>Musha</span></div>
        <!-- <div class="topnav-brand"><span>🌿</span><span>CommunityTrack</span></div> -->
        <div class="topnav-actions">
          <span class="site-admin-chip">🔧 Site Admin</span>
          <button class="btn btn-ghost btn-sm" @click="logout">Sign Out</button>
        </div>
      </div>
    </nav>

    <div class="loading-overlay" v-if="loading"><div class="spinner"></div></div>

    <div class="container page-body" v-else>
      <div class="page-header">
        <div>
          <h1 class="page-title">Site Administration</h1>
          <p class="page-subtitle">Manage all communities and admin accounts across the platform</p>
        </div>
      </div>

      <!-- Summary stats -->
      <div class="stats-grid" style="margin-bottom:2rem">
        <div class="stat-card"><div class="stat-label">Total Communities</div><div class="stat-value">{{ communities.length }}</div></div>
        <div class="stat-card"><div class="stat-label">Community Admins</div><div class="stat-value">{{ admins.length }}</div></div>
        <div class="stat-card">
          <div class="stat-label">Pending Approval</div>
          <div class="stat-value" :class="pendingAdmins.length > 0 ? 'amount-negative' : ''">{{ pendingAdmins.length }}</div>
        </div>
        <div class="stat-card"><div class="stat-label">Total Projects</div><div class="stat-value">{{ totalProjects }}</div></div>
      </div>

      <!-- Pending approvals alert -->
      <div class="alert alert-info" v-if="pendingAdmins.length > 0">
        ⚠️ <strong>{{ pendingAdmins.length }} admin account{{ pendingAdmins.length > 1 ? 's' : '' }} pending approval.</strong> Review below.
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn" :class="{ active: tab === 'admins' }" @click="tab='admins'">
          Community Admins
          <span v-if="pendingAdmins.length" class="pending-badge">{{ pendingAdmins.length }}</span>
        </button>
        <button class="tab-btn" :class="{ active: tab === 'communities' }" @click="tab='communities'">All Communities</button>
      </div>

      <transition name="fade" mode="out-in">
        <!-- Admins Tab -->
        <div v-if="tab === 'admins'" key="admins">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Username</th><th>Email</th><th>Community</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                <tr v-for="a in admins" :key="a.id" :class="{ 'row-pending': !a.approved }">
                  <td>{{ a.name }}</td>
                  <td class="monospace">{{ a.username }}</td>
                  <td>{{ a.email }}</td>
                  <td>
                    <span v-if="a.communityName">{{ a.communityName }}</span>
                    <span v-else style="color:var(--text-3);font-style:italic">not set up yet</span>
                  </td>
                  <td>
                    <span class="badge" :class="a.approved ? 'badge-success' : 'badge-warning'">
                      {{ a.approved ? 'Approved' : 'Pending' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-btns">
                      <button v-if="!a.approved" class="btn btn-primary btn-sm" @click="approveAdmin(a)">✓ Approve</button>
                      <button class="btn btn-danger btn-sm" @click="deleteAdmin(a)">✕ Remove</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!admins.length" class="empty-state" style="padding:2rem">
              <div class="empty-text">No community admins registered yet</div>
            </div>
          </div>
        </div>

        <!-- Communities Tab -->
        <div v-else key="communities">
          <div class="communities-grid">
            <div v-for="c in communities" :key="c.id" class="site-community-card">
              <div class="scc-top" :style="{ background: c.coverColor || '#2d6a4f' }">
                <span class="scc-icon">{{ c.icon || '🏘️' }}</span>
                <span class="scc-id">{{ c.id }}</span>
              </div>
              <div class="scc-body">
                <h3 class="scc-name">{{ c.name }}</h3>
                <p class="scc-admin" v-if="c.adminName">👤 {{ c.adminName }}</p>
                <p class="scc-location" v-if="c.location">📍 {{ c.location }}</p>
                <div class="scc-meta">
                  <span>{{ c.projectCount }} project{{ c.projectCount !== 1 ? 's' : '' }}</span>
                  <span>Since {{ fmtDate(c.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!communities.length" class="empty-state card">
            <div class="empty-icon">🏘️</div>
            <div class="empty-text">No communities created yet</div>
          </div>
        </div>
      </transition>
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
const tab = ref('admins')
const admins = ref([])
const communities = ref([])

const pendingAdmins = computed(() => admins.value.filter(a => !a.approved))
const totalProjects = computed(() => communities.value.reduce((s, c) => s + (c.projectCount || 0), 0))

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function load() {
  loading.value = true
  const [a, c] = await Promise.all([api.getAllCommunityAdmins(), api.getAllCommunitiesSiteAdmin()])
  admins.value = a
  communities.value = c
  loading.value = false
}

async function approveAdmin(a) {
  await api.approveCommunityAdmin(a.id)
  await load()
}

async function deleteAdmin(a) {
  if (!confirm(`Remove admin account for "${a.name}"? This cannot be undone.`)) return
  await api.deleteCommunityAdmin(a.id)
  await load()
}

function logout() { store.logout(); router.push('/') }
onMounted(load)
</script>

<style scoped>
.page-body { padding-top:1.5rem; padding-bottom:3rem; }
.site-admin-chip { font-size:.8rem; font-weight:600; background:#fef3cd; color:#856404; padding:.3rem .75rem; border-radius:100px; border:1px solid #fde68a; }

.pending-badge { background:var(--warning); color:white; font-size:.65rem; font-weight:700; padding:.1rem .4rem; border-radius:100px; margin-left:.375rem; }

.row-pending { background:rgba(230,126,34,.04); }
.row-pending td:first-child { border-left:3px solid var(--warning); }

.action-btns { display:flex; gap:.375rem; }

.communities-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.25rem; }
.site-community-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm); }
.scc-top { height:72px; display:flex; align-items:center; justify-content:space-between; padding:.875rem 1rem; }
.scc-icon { font-size:2rem; }
.scc-id { font-size:.72rem; font-weight:700; letter-spacing:.09em; background:rgba(255,255,255,.2); color:white; padding:.2rem .625rem; border-radius:100px; }
.scc-body { padding:1rem 1.25rem; }
.scc-name { font-family:var(--font-display); font-size:1rem; margin-bottom:.375rem; }
.scc-admin { font-size:.8rem; color:var(--text-2); margin-bottom:.2rem; }
.scc-location { font-size:.8rem; color:var(--text-2); margin-bottom:.625rem; }
.scc-meta { display:flex; justify-content:space-between; font-size:.75rem; color:var(--text-3); }
</style>

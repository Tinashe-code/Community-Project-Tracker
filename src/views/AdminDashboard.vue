<template>
  <div>
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand">
          <span>🌿</span>
          <span>CommunityTrack Admin</span>
        </div>
        <div class="topnav-actions">
          <span class="admin-badge">{{ store.admin?.name }}</span>
          <button class="btn btn-ghost btn-sm" @click="logout">Sign Out</button>
        </div>
      </div>
    </nav>

    <div class="container page-body">
      <div class="page-header">
        <div>
          <h1 class="page-title">Communities</h1>
          <p class="page-subtitle">Manage all community projects from here</p>
        </div>
        <router-link to="/admin/new-community" class="btn btn-primary">
          + New Community
        </router-link>
      </div>

      <div class="loading-overlay" v-if="loading"><div class="spinner"></div></div>

      <div v-else-if="communities.length === 0" class="empty-state card">
        <div class="empty-icon">🏘️</div>
        <div class="empty-text">No communities yet. Create your first one!</div>
        <router-link to="/admin/new-community" class="btn btn-primary" style="margin-top:1rem">Create Community</router-link>
      </div>

      <div v-else class="communities-grid">
        <router-link
          v-for="c in communities" :key="c.id"
          :to="`/admin/community/${c.id}`"
          class="community-card"
        >
          <div class="cc-top" :style="{ background: c.coverColor || '#2d6a4f' }">
            <span class="cc-icon">{{ c.icon || '🏘️' }}</span>
            <span class="cc-status" :class="c.status">{{ c.status }}</span>
          </div>
          <div class="cc-body">
            <div class="cc-id">{{ c.id }}</div>
            <h3 class="cc-name">{{ c.name }}</h3>
            <p class="cc-desc">{{ c.description }}</p>
            <div class="cc-goal">Goal: ${{ c.goal?.toFixed(2) }}</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'
import * as api from '@/api/db.js'

const store = useAppStore()
const router = useRouter()
const loading = ref(true)
const communities = ref([])

async function load() {
  communities.value = await api.getCommunities()
  loading.value = false
}

function logout() { store.logoutAdmin(); router.push('/') }

onMounted(load)
</script>

<style scoped>
.page-body { padding-top: 2rem; padding-bottom: 3rem; }
.admin-badge {
  font-size: 0.8rem; color: var(--text-2);
  background: var(--surface2); padding: 0.3rem 0.75rem;
  border-radius: 100px; border: 1px solid var(--border);
}
.communities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.community-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: var(--shadow-sm); display: block;
  transition: transform var(--transition), box-shadow var(--transition);
}
.community-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.cc-top {
  height: 80px; display: flex; align-items: flex-start;
  justify-content: space-between; padding: 0.875rem 1rem;
}
.cc-icon { font-size: 2rem; }
.cc-status {
  font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em;
  padding: 0.2rem 0.6rem; border-radius: 100px;
  background: rgba(255,255,255,0.25); color: white;
}
.cc-body { padding: 1rem 1.25rem 1.25rem; }
.cc-id { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); margin-bottom: 0.25rem; }
.cc-name { font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 0.375rem; }
.cc-desc { font-size: 0.825rem; color: var(--text-2); line-height: 1.4; margin-bottom: 0.75rem; }
.cc-goal { font-size: 0.8rem; color: var(--accent); font-weight: 600; }
</style>

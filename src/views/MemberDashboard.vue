<template>
  <div class="member-page">
    <!-- Top Nav -->
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand">
          <span>🌿</span>
          <span>Musha</span>
        </div>
        <div class="topnav-actions">
          <span class="member-chip">
            🏠 {{ member.houseNumber }}
          </span>
          <button class="btn btn-ghost btn-sm" @click="logout">Sign Out</button>
        </div>
      </div>
    </nav>

    <div class="container page-body" v-if="!loading">
      <!-- Community Header -->
      <div class="community-hero" :style="{ '--hero-color': community.coverColor }">
        <div class="community-icon">{{ community.icon }}</div>
        <div>
          <h1 class="community-name">{{ community.name }}</h1>
          <p class="community-desc">{{ community.description }}</p>
        </div>
        <div class="community-id-chip">ID: {{ community.id }}</div>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-label">Your Total Paid</div>
          <div class="stat-value amount-positive">${{ myTotal.toFixed(2) }}</div>
          <div class="stat-sub">{{ myPayments.length }} payment{{ myPayments.length !== 1 ? 's' : '' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Community Raised</div>
          <div class="stat-value">${{ stats.totalPaid.toFixed(2) }}</div>
          <div class="stat-sub">of ${{ community.goal.toFixed(2) }} goal</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Goal Remaining</div>
          <div class="stat-value amount-negative">${{ stats.goalRemaining.toFixed(2) }}</div>
          <div class="stat-sub">{{ stats.progress }}% complete</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value" style="color:var(--gold)">${{ stats.totalExpenses.toFixed(2) }}</div>
          <div class="stat-sub">funds used</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="card" style="margin-bottom:1.5rem">
        <div class="progress-header">
          <span class="section-title">Project Progress</span>
          <span class="progress-pct">{{ stats.progress }}%</span>
        </div>
        <div class="progress-bar-wrap" style="margin-top:0.75rem">
          <div class="progress-bar-fill" :style="{ width: stats.progress + '%' }"></div>
        </div>
        <div class="progress-labels">
          <span>${{ stats.totalPaid.toFixed(2) }} raised</span>
          <span>Goal: ${{ community.goal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn" :class="{ active: tab === 'my' }" @click="tab = 'my'">My Payments</button>
        <button class="tab-btn" :class="{ active: tab === 'all' }" @click="tab = 'all'">All Contributions</button>
        <button class="tab-btn" :class="{ active: tab === 'expenses' }" @click="tab = 'expenses'">Expenses</button>
      </div>

      <!-- My Payments Tab -->
      <transition name="fade" mode="out-in">
        <div v-if="tab === 'my'" key="my">
          <div v-if="myPayments.length === 0" class="empty-state">
            <div class="empty-icon">💳</div>
            <div class="empty-text">No payments recorded for your house yet</div>
          </div>
          <div v-else class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Receipt #</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in myPayments" :key="p.id">
                  <td>{{ formatDate(p.date) }}</td>
                  <td>{{ p.description }}</td>
                  <td class="monospace">{{ p.receiptNumber }}</td>
                  <td class="amount-positive">${{ p.amount.toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="font-weight:600;font-size:0.85rem">Total Paid</td>
                  <td class="amount-positive" style="font-weight:700">${{ myTotal.toFixed(2) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- All Payments Tab -->
        <div v-else-if="tab === 'all'" key="all">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>House #</th>
                  <th>Description</th>
                  <th>Receipt #</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in allPayments" :key="p.id">
                  <td>{{ formatDate(p.date) }}</td>
                  <td>{{ p.firstName }} {{ p.lastName }}</td>
                  <td class="monospace">{{ p.houseNumber }}</td>
                  <td>{{ p.description }}</td>
                  <td class="monospace">{{ p.receiptNumber }}</td>
                  <td class="amount-positive">${{ p.amount.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Expenses Tab -->
        <div v-else key="expenses">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Description</th>
                  <th>Invoice #</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in expenses" :key="e.id">
                  <td>{{ formatDate(e.date) }}</td>
                  <td>{{ e.vendor }}</td>
                  <td>{{ e.description }}</td>
                  <td class="monospace">{{ e.invoiceNumber }}</td>
                  <td class="amount-negative">${{ e.amount.toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="font-weight:600;font-size:0.85rem">Total Expenses</td>
                  <td class="amount-negative" style="font-weight:700">${{ stats.totalExpenses.toFixed(2) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </transition>
    </div>

    <div class="loading-overlay" v-else>
      <div class="spinner"></div>
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

const member = computed(() => store.member)
const community = computed(() => store.currentCommunity)

const loading = ref(true)
const tab = ref('my')
const allPayments = ref([])
const myPayments = ref([])
const expenses = ref([])
const stats = ref({ totalPaid: 0, totalExpenses: 0, goalRemaining: 0, progress: 0, balance: 0 })

const myTotal = computed(() => myPayments.value.reduce((s, p) => s + p.amount, 0))

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function load() {
  loading.value = true
  const cid = community.value.id
  const [p, mp, e, s] = await Promise.all([
    api.getPayments(cid),
    api.getMemberPayments(cid, member.value.houseNumber),
    api.getExpenses(cid),
    api.getCommunityStats(cid)
  ])
  allPayments.value = p.sort((a, b) => new Date(b.date) - new Date(a.date))
  myPayments.value = mp.sort((a, b) => new Date(b.date) - new Date(a.date))
  expenses.value = e.sort((a, b) => new Date(b.date) - new Date(a.date))
  stats.value = s
  loading.value = false
}

function logout() {
  store.logoutMember()
  router.push('/')
}

onMounted(load)
</script>

<style scoped>
.member-page { min-height: 100vh; }
.page-body { padding-top: 1.5rem; padding-bottom: 3rem; }

.member-chip {
  background: var(--accent-light); color: var(--accent-dark);
  font-size: 0.8rem; font-weight: 500;
  padding: 0.3rem 0.75rem; border-radius: 100px;
}

.community-hero {
  background: linear-gradient(135deg, var(--hero-color, var(--accent-dark)), color-mix(in srgb, var(--hero-color, var(--accent-dark)) 70%, black));
  color: white; border-radius: var(--radius-lg);
  padding: 1.5rem 2rem; margin-bottom: 1.5rem;
  display: flex; align-items: center; gap: 1.25rem;
  flex-wrap: wrap; position: relative; overflow: hidden;
}
.community-hero::before {
  content: ''; position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.community-icon { font-size: 2.5rem; flex-shrink: 0; }
.community-name { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.25rem; }
.community-desc { font-size: 0.875rem; opacity: 0.85; }
.community-id-chip {
  margin-left: auto; background: rgba(255,255,255,0.18);
  padding: 0.3rem 0.875rem; border-radius: 100px;
  font-size: 0.8rem; font-weight: 600; letter-spacing: 0.06em;
  white-space: nowrap;
}

.progress-header { display: flex; align-items: center; justify-content: space-between; }
.progress-pct { font-family: var(--font-display); font-size: 1.25rem; color: var(--accent); }
.progress-labels {
  display: flex; justify-content: space-between;
  font-size: 0.78rem; color: var(--text-3); margin-top: 0.5rem;
}

tfoot td { padding: 0.75rem 1rem; background: var(--surface2); font-size: 0.875rem; border-top: 2px solid var(--border); }

@media (max-width: 640px) {
  .community-hero { padding: 1.25rem; gap: 1rem; }
  .community-icon { font-size: 1.75rem; }
  .community-name { font-size: 1.2rem; }
  .community-id-chip { margin-left: 0; }
}
</style>

<template>
  <div>
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand">
          <span>🌿</span>
          <span>Musha Admin</span>
        </div>
        <div class="topnav-actions">
          <router-link to="/admin" class="btn btn-ghost btn-sm">← All Communities</router-link>
          <button class="btn btn-ghost btn-sm" @click="logout">Sign Out</button>
        </div>
      </div>
    </nav>

    <div class="loading-overlay" v-if="loading"><div class="spinner"></div></div>

    <div class="container page-body" v-else-if="community">
      <!-- Hero -->
      <div class="community-hero" :style="{ '--hc': community.coverColor || '#2d6a4f' }">
        <span class="ch-icon">{{ community.icon }}</span>
        <div class="ch-info">
          <div class="ch-id">Community ID: <strong>{{ community.id }}</strong></div>
          <h1 class="ch-name">{{ community.name }}</h1>
          <p class="ch-desc">{{ community.description }}</p>
        </div>
        <div class="ch-stats">
          <div class="ch-stat">
            <div class="ch-stat-val">${{ stats.totalPaid.toFixed(2) }}</div>
            <div class="ch-stat-label">Raised</div>
          </div>
          <div class="ch-stat">
            <div class="ch-stat-val">{{ stats.progress }}%</div>
            <div class="ch-stat-label">Progress</div>
          </div>
          <div class="ch-stat">
            <div class="ch-stat-val">{{ stats.memberCount }}</div>
            <div class="ch-stat-label">Members</div>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-label">Total Contributions</div>
          <div class="stat-value amount-positive">${{ stats.totalPaid.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value" style="color:var(--gold)">${{ stats.totalExpenses.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Balance in Hand</div>
          <div class="stat-value" :class="stats.balance >= 0 ? 'amount-positive' : 'amount-negative'">${{ stats.balance.toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Goal Remaining</div>
          <div class="stat-value amount-negative">${{ stats.goalRemaining.toFixed(2) }}</div>
        </div>
      </div>

      <!-- Progress -->
      <div class="card" style="margin-bottom:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
          <span class="section-title">Project Goal Progress</span>
          <span style="font-family:var(--font-display);color:var(--accent);font-size:1.25rem">{{ stats.progress }}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" :style="{ width: stats.progress + '%' }"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-3);margin-top:0.5rem">
          <span>${{ stats.totalPaid.toFixed(2) }} raised</span>
          <span>Goal: ${{ community.goal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn" :class="{ active: tab === 'members' }" @click="tab = 'members'">
          Members ({{ members.length }})
        </button>
        <button class="tab-btn" :class="{ active: tab === 'payments' }" @click="tab = 'payments'">
          Payments ({{ payments.length }})
        </button>
        <button class="tab-btn" :class="{ active: tab === 'expenses' }" @click="tab = 'expenses'">
          Expenses ({{ expenses.length }})
        </button>
        <button class="tab-btn" :class="{ active: tab === 'settings' }" @click="tab = 'settings'">
          Settings
        </button>
      </div>

      <!-- Members -->
      <transition name="fade" mode="out-in">
        <div v-if="tab === 'members'" key="members">
          <div class="section-header">
            <span class="section-title">Community Members</span>
            <button class="btn btn-primary btn-sm" @click="showAddMember = true">+ Add Member</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>House #</th><th>Phone</th><th>Total Paid</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="m in membersWithPayments" :key="m.id">
                  <td>{{ m.firstName }} {{ m.lastName }}</td>
                  <td class="monospace">{{ m.houseNumber }}</td>
                  <td class="monospace">{{ m.phone }}</td>
                  <td class="amount-positive">${{ m.paid.toFixed(2) }}</td>
                  <td>
                    <button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="removeMember(m)">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Payments -->
        <div v-else-if="tab === 'payments'" key="payments">
          <div class="section-header">
            <span class="section-title">All Payments</span>
            <button class="btn btn-primary btn-sm" @click="showAddPayment = true">+ Record Payment</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>Date</th><th>Name</th><th>House #</th><th>Description</th><th>Receipt #</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="p in payments" :key="p.id">
                  <td>{{ formatDate(p.date) }}</td>
                  <td>{{ p.firstName }} {{ p.lastName }}</td>
                  <td class="monospace">{{ p.houseNumber }}</td>
                  <td>{{ p.description }}</td>
                  <td class="monospace">{{ p.receiptNumber }}</td>
                  <td class="amount-positive">${{ p.amount.toFixed(2) }}</td>
                  <td><button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="removePayment(p)">✕</button></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" style="font-weight:600">Total</td>
                  <td class="amount-positive" style="font-weight:700">${{ stats.totalPaid.toFixed(2) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Expenses -->
        <div v-else-if="tab === 'expenses'" key="expenses">
          <div class="section-header">
            <span class="section-title">Expenses</span>
            <button class="btn btn-primary btn-sm" @click="showAddExpense = true">+ Add Expense</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>Date</th><th>Vendor</th><th>Description</th><th>Invoice #</th><th>Amount</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="e in expenses" :key="e.id">
                  <td>{{ formatDate(e.date) }}</td>
                  <td>{{ e.vendor }}</td>
                  <td>{{ e.description }}</td>
                  <td class="monospace">{{ e.invoiceNumber }}</td>
                  <td class="amount-negative">${{ e.amount.toFixed(2) }}</td>
                  <td><button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="removeExpense(e)">✕</button></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="font-weight:600">Total</td>
                  <td class="amount-negative" style="font-weight:700">${{ stats.totalExpenses.toFixed(2) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Settings -->
        <div v-else key="settings">
          <div class="card">
            <h3 class="card-title">Community Settings</h3>
            <form @submit.prevent="saveSettings" class="settings-form">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Community Name</label>
                  <input v-model="settingsForm.name" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Goal Amount ($)</label>
                  <input v-model.number="settingsForm.goal" class="form-input" type="number" min="0" step="0.01" required />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="settingsForm.description" class="form-input" rows="2"></textarea>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Cover Color</label>
                  <div class="color-row">
                    <input v-model="settingsForm.coverColor" class="form-input color-input" type="color" />
                    <span class="color-val">{{ settingsForm.coverColor }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Icon (emoji)</label>
                  <input v-model="settingsForm.icon" class="form-input" maxlength="4" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select v-model="settingsForm.status" class="form-input">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div v-if="settingsSaved" class="alert alert-success">Settings saved!</div>
              <button class="btn btn-primary" type="submit">Save Changes</button>
            </form>
          </div>

          <div class="info-box">
            <strong>Community Login ID:</strong> <code>{{ community.id }}</code>
            <p>Share this ID with members so they can log in to view the dashboard.</p>
          </div>
        </div>
      </transition>
    </div>

    <!-- Add Member Modal -->
    <div class="modal-backdrop" v-if="showAddMember" @click.self="showAddMember = false">
      <div class="modal">
        <h2 class="modal-title">Add Member</h2>
        <form @submit.prevent="submitAddMember" class="modal-form">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input v-model="memberForm.firstName" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Last Name *</label>
              <input v-model="memberForm.lastName" class="form-input" required />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">House Number *</label>
              <input v-model="memberForm.houseNumber" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input v-model="memberForm.phone" class="form-input" required />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddMember = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Member</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Payment Modal -->
    <div class="modal-backdrop" v-if="showAddPayment" @click.self="showAddPayment = false">
      <div class="modal">
        <h2 class="modal-title">Record Payment</h2>
        <form @submit.prevent="submitAddPayment" class="modal-form">
          <div class="form-group">
            <label class="form-label">Member</label>
            <select v-model="paymentForm.memberId" class="form-input" @change="fillMemberDetails">
              <option value="">-- Select Member --</option>
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.firstName }} {{ m.lastName }} ({{ m.houseNumber }})</option>
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input v-model="paymentForm.date" class="form-input" type="date" required />
            </div>
            <div class="form-group">
              <label class="form-label">Amount ($)</label>
              <input v-model.number="paymentForm.amount" class="form-input" type="number" min="0" step="0.01" required />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Description</label>
              <input v-model="paymentForm.description" class="form-input" placeholder="e.g. Pole" required />
            </div>
            <div class="form-group">
              <label class="form-label">Receipt Number</label>
              <input v-model="paymentForm.receiptNumber" class="form-input" placeholder="e.g. 000320" />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddPayment = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Record Payment</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Expense Modal -->
    <div class="modal-backdrop" v-if="showAddExpense" @click.self="showAddExpense = false">
      <div class="modal">
        <h2 class="modal-title">Add Expense</h2>
        <form @submit.prevent="submitAddExpense" class="modal-form">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input v-model="expenseForm.date" class="form-input" type="date" required />
            </div>
            <div class="form-group">
              <label class="form-label">Amount ($)</label>
              <input v-model.number="expenseForm.amount" class="form-input" type="number" min="0" step="0.01" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Vendor</label>
            <input v-model="expenseForm.vendor" class="form-input" placeholder="Company or person name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input v-model="expenseForm.description" class="form-input" placeholder="What was purchased" required />
          </div>
          <div class="form-group">
            <label class="form-label">Invoice Number</label>
            <input v-model="expenseForm.invoiceNumber" class="form-input" placeholder="e.g. 4370" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showAddExpense = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Add Expense</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'
import * as api from '@/api/db.js'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const communityId = route.params.id
const loading = ref(true)
const tab = ref('members')

const community = ref(null)
const members = ref([])
const payments = ref([])
const expenses = ref([])
const stats = ref({ totalPaid: 0, totalExpenses: 0, goalRemaining: 0, progress: 0, balance: 0, memberCount: 0 })

// Modals
const showAddMember = ref(false)
const showAddPayment = ref(false)
const showAddExpense = ref(false)
const settingsSaved = ref(false)

// Forms
const memberForm = reactive({ firstName: '', lastName: '', houseNumber: '', phone: '' })
const paymentForm = reactive({ memberId: '', firstName: '', lastName: '', houseNumber: '', date: new Date().toISOString().slice(0, 10), amount: '', description: '', receiptNumber: '' })
const expenseForm = reactive({ date: new Date().toISOString().slice(0, 10), vendor: '', description: '', amount: '', invoiceNumber: '' })
const settingsForm = reactive({ name: '', description: '', goal: 0, coverColor: '#2d6a4f', icon: '🏘️', status: 'active' })

const membersWithPayments = computed(() =>
  members.value.map(m => ({
    ...m,
    paid: payments.value.filter(p => p.houseNumber === m.houseNumber).reduce((s, p) => s + p.amount, 0)
  }))
)

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function reload() {
  const [c, m, p, e, s] = await Promise.all([
    api.getCommunity(communityId),
    api.getMembers(communityId),
    api.getPayments(communityId),
    api.getExpenses(communityId),
    api.getCommunityStats(communityId)
  ])
  community.value = c
  members.value = m
  payments.value = p.sort((a, b) => new Date(b.date) - new Date(a.date))
  expenses.value = e.sort((a, b) => new Date(b.date) - new Date(a.date))
  stats.value = s
  Object.assign(settingsForm, { name: c.name, description: c.description, goal: c.goal, coverColor: c.coverColor, icon: c.icon, status: c.status })
}

async function submitAddMember() {
  await api.addMember({ ...memberForm, communityId })
  Object.assign(memberForm, { firstName: '', lastName: '', houseNumber: '', phone: '' })
  showAddMember.value = false
  await reload()
}

function fillMemberDetails() {
  const m = members.value.find(x => x.id === paymentForm.memberId)
  if (m) { paymentForm.firstName = m.firstName; paymentForm.lastName = m.lastName; paymentForm.houseNumber = m.houseNumber }
}

async function submitAddPayment() {
  await api.addPayment({ ...paymentForm, communityId })
  Object.assign(paymentForm, { memberId: '', firstName: '', lastName: '', houseNumber: '', date: new Date().toISOString().slice(0, 10), amount: '', description: '', receiptNumber: '' })
  showAddPayment.value = false
  await reload()
}

async function submitAddExpense() {
  await api.addExpense({ ...expenseForm, communityId })
  Object.assign(expenseForm, { date: new Date().toISOString().slice(0, 10), vendor: '', description: '', amount: '', invoiceNumber: '' })
  showAddExpense.value = false
  await reload()
}

async function removeMember(m) {
  if (!confirm(`Remove ${m.firstName} ${m.lastName} from this community?`)) return
  await api.deleteMember(m.id)
  await reload()
}

async function removePayment(p) {
  if (!confirm('Delete this payment record?')) return
  await api.deletePayment(p.id)
  await reload()
}

async function removeExpense(e) {
  if (!confirm('Delete this expense?')) return
  await api.deleteExpense(e.id)
  await reload()
}

async function saveSettings() {
  await api.updateCommunity(communityId, { ...settingsForm })
  settingsSaved.value = true
  setTimeout(() => { settingsSaved.value = false }, 3000)
  await reload()
}

function logout() { store.logoutAdmin(); router.push('/') }

onMounted(async () => { await reload(); loading.value = false })
</script>

<style scoped>
.page-body { padding-top: 1.5rem; padding-bottom: 3rem; }

.community-hero {
  background: linear-gradient(135deg, var(--hc, #2d6a4f), color-mix(in srgb, var(--hc, #2d6a4f) 65%, black));
  color: white; border-radius: var(--radius-lg); padding: 1.5rem 2rem;
  display: flex; align-items: center; gap: 1.25rem;
  flex-wrap: wrap; margin-bottom: 1.5rem;
  position: relative; overflow: hidden;
}
.community-hero::before {
  content: ''; position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.ch-icon { font-size: 3rem; flex-shrink: 0; }
.ch-info { flex: 1; min-width: 0; }
.ch-id { font-size: 0.75rem; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
.ch-name { font-family: var(--font-display); font-size: 1.6rem; margin-bottom: 0.25rem; }
.ch-desc { font-size: 0.875rem; opacity: 0.8; }
.ch-stats { display: flex; gap: 1.5rem; flex-shrink: 0; }
.ch-stat { text-align: center; }
.ch-stat-val { font-family: var(--font-display); font-size: 1.4rem; line-height: 1; }
.ch-stat-label { font-size: 0.72rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.2rem; }

tfoot td { padding: 0.75rem 1rem; background: var(--surface2); font-size: 0.875rem; border-top: 2px solid var(--border); }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }

.settings-form { display: flex; flex-direction: column; gap: 1rem; }
.color-row { display: flex; align-items: center; gap: 0.5rem; }
.color-input { width: 50px; height: 38px; padding: 2px; cursor: pointer; }
.color-val { font-size: 0.82rem; color: var(--text-2); font-family: monospace; }

.info-box {
  background: var(--accent-light); border: 1px solid rgba(45,106,79,0.2);
  border-radius: var(--radius); padding: 1rem 1.25rem;
  margin-top: 1rem; font-size: 0.875rem;
}
.info-box p { color: var(--text-2); margin-top: 0.25rem; font-size: 0.825rem; }
code { background: rgba(45,106,79,0.12); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.95rem; font-weight: 600; }

@media (max-width: 640px) {
  .ch-stats { display: none; }
  .community-hero { padding: 1.25rem; }
  .ch-name { font-size: 1.2rem; }
}
</style>

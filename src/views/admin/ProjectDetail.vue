<template>
  <div>
    <nav class="topnav">
      <div class="topnav-inner">
        <div class="topnav-brand"><span>🌿</span><span>Musha</span></div>
        <div class="topnav-actions">
          <router-link to="/admin" class="btn btn-ghost btn-sm">← Projects</router-link>
          <button class="btn btn-ghost btn-sm" @click="logout">Sign Out</button>
        </div>
      </div>
    </nav>

    <div class="loading-overlay" v-if="loading"><div class="spinner"></div></div>

    <div class="container page-body" v-else-if="project">
      <!-- Project header -->
      <div class="project-header" :style="{ '--pc': project.coverColor || '#2d6a4f' }">
        <span class="ph-icon">{{ project.icon || '🏗️' }}</span>
        <div class="ph-info">
          <h1 class="ph-name">{{ project.name }}</h1>
          <p class="ph-desc">{{ project.description }}</p>
        </div>
        <div class="ph-meta">
          <select v-model="project.status" class="status-select" @change="saveStatus">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      <!-- Phase cards — visual summary -->
      <div class="phases-overview">
        <div v-for="ph in phases" :key="ph.id" class="phase-overview-card" :class="ph.status" @click="selectPhase(ph)">
          <div class="poc-top">
            <span class="poc-num">Phase {{ ph.order }}</span>
            <span class="poc-status" :class="ph.status">{{ ph.status }}</span>
          </div>
          <div class="poc-name">{{ ph.name }}</div>
          <div class="poc-progress-row">
            <span class="poc-paid">${{ ph.totalPaid.toFixed(2) }}</span>
            <span class="poc-goal">/ ${{ ph.goal.toFixed(2) }}</span>
          </div>
          <div class="progress-bar-wrap" style="margin:.5rem 0;height:8px">
            <div class="progress-bar-fill" :style="{ width: ph.progress + '%', background: phaseGradient(ph.status) }"></div>
          </div>
          <div class="poc-pct">{{ ph.progress }}% — ${{ ph.remaining.toFixed(2) }} remaining</div>
        </div>
        <button class="phase-add-card" @click="showAddPhase = true">
          <span>+</span>
          <span>Add Phase</span>
        </button>
      </div>

      <!-- Total project bar -->
      <div class="card total-bar">
        <div class="total-bar-labels">
          <span class="section-title">Overall Project Progress</span>
          <span class="total-pct">{{ overallProgress }}%</span>
        </div>
        <div class="progress-bar-wrap" style="margin:.75rem 0;height:12px">
          <div class="progress-bar-fill" :style="{ width: overallProgress + '%' }"></div>
        </div>
        <div class="total-bar-stats">
          <div class="tbs"><span class="tbs-val amount-positive">${{ totalPaid.toFixed(2) }}</span><span class="tbs-lbl">Total Raised</span></div>
          <div class="tbs"><span class="tbs-val" style="color:var(--gold)">${{ totalExpenses.toFixed(2) }}</span><span class="tbs-lbl">Total Expenses</span></div>
          <div class="tbs"><span class="tbs-val" :class="balance >= 0 ? 'amount-positive' : 'amount-negative'">${{ balance.toFixed(2) }}</span><span class="tbs-lbl">Balance in Hand</span></div>
          <div class="tbs"><span class="tbs-val amount-negative">${{ totalGoal.toFixed(2) }}</span><span class="tbs-lbl">Total Goal</span></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn" :class="{ active: tab === 'payments' }" @click="tab = 'payments'">Payments ({{ payments.length }})</button>
        <button class="tab-btn" :class="{ active: tab === 'expenses' }" @click="tab = 'expenses'">Expenses ({{ expenses.length }})</button>
        <button class="tab-btn" :class="{ active: tab === 'members' }" @click="tab = 'members'">Members ({{ members.length }})</button>
        <button class="tab-btn" :class="{ active: tab === 'phases' }" @click="tab = 'phases'">Phase Settings</button>
      </div>

      <!-- Phase filter (for payments & expenses) -->
      <div class="phase-filter" v-if="tab === 'payments' || tab === 'expenses'">
        <button :class="['pf-btn', { active: phaseFilter === '' }]" @click="phaseFilter = ''; loadTabData()">All Phases</button>
        <button v-for="ph in phases" :key="ph.id" :class="['pf-btn', { active: phaseFilter === ph.id }]" @click="phaseFilter = ph.id; loadTabData()">
          Phase {{ ph.order }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <!-- Payments -->
        <div v-if="tab === 'payments'" key="payments">
          <div class="section-header">
            <span class="section-title">
              {{ phaseFilter ? 'Phase ' + phases.find(p=>p.id===phaseFilter)?.order + ' Payments' : 'All Payments' }}
            </span>
            <button class="btn btn-primary btn-sm" @click="showAddPayment = true">+ Record Payment</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Name</th><th>House #</th><th>Phase</th><th>Description</th><th>Receipt</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                <tr v-for="p in payments" :key="p.id">
                  <td>{{ fmtDate(p.date) }}</td>
                  <td>{{ p.firstName }} {{ p.lastName }}</td>
                  <td class="monospace">{{ p.houseNumber }}</td>
                  <td><span class="phase-chip">Ph.{{ phaseOrder(p.phaseId) }}</span></td>
                  <td>{{ p.description }}</td>
                  <td class="monospace">{{ p.receiptNumber }}</td>
                  <td class="amount-positive">${{ p.amount.toFixed(2) }}</td>
                  <td><button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="deletePayment(p)">✕</button></td>
                </tr>
              </tbody>
              <tfoot v-if="payments.length">
                <tr><td colspan="6" style="font-weight:600">Total</td><td class="amount-positive" style="font-weight:700">${{ payments.reduce((s,p)=>s+p.amount,0).toFixed(2) }}</td><td></td></tr>
              </tfoot>
            </table>
            <div v-if="!payments.length" class="empty-state" style="padding:2rem"><div class="empty-text">No payments recorded yet</div></div>
          </div>
        </div>

        <!-- Expenses -->
        <div v-else-if="tab === 'expenses'" key="expenses">
          <div class="section-header">
            <span class="section-title">{{ phaseFilter ? 'Phase ' + phases.find(p=>p.id===phaseFilter)?.order + ' Expenses' : 'All Expenses' }}</span>
            <button class="btn btn-primary btn-sm" @click="showAddExpense = true">+ Add Expense</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Vendor</th><th>Phase</th><th>Description</th><th>Invoice</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                <tr v-for="e in expenses" :key="e.id">
                  <td>{{ fmtDate(e.date) }}</td>
                  <td>{{ e.vendor }}</td>
                  <td><span class="phase-chip">Ph.{{ phaseOrder(e.phaseId) }}</span></td>
                  <td>{{ e.description }}</td>
                  <td class="monospace">{{ e.invoiceNumber }}</td>
                  <td class="amount-negative">${{ e.amount.toFixed(2) }}</td>
                  <td><button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="deleteExpense(e)">✕</button></td>
                </tr>
              </tbody>
              <tfoot v-if="expenses.length">
                <tr><td colspan="5" style="font-weight:600">Total</td><td class="amount-negative" style="font-weight:700">${{ expenses.reduce((s,e)=>s+e.amount,0).toFixed(2) }}</td><td></td></tr>
              </tfoot>
            </table>
            <div v-if="!expenses.length" class="empty-state" style="padding:2rem"><div class="empty-text">No expenses recorded yet</div></div>
          </div>
        </div>

        <!-- Members -->
        <div v-else-if="tab === 'members'" key="members">
          <div class="section-header">
            <span class="section-title">Community Members</span>
            <button class="btn btn-primary btn-sm" @click="showAddMember = true">+ Add Member</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>House #</th><th>Phone</th><th>Total Paid</th><th></th></tr></thead>
              <tbody>
                <tr v-for="m in membersWithTotals" :key="m.id">
                  <td>{{ m.firstName }} {{ m.lastName }}</td>
                  <td class="monospace">{{ m.houseNumber }}</td>
                  <td class="monospace">{{ m.phone }}</td>
                  <td class="amount-positive">${{ m.paid.toFixed(2) }}</td>
                  <td><button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="deleteMember(m)">✕</button></td>
                </tr>
              </tbody>
            </table>
            <div v-if="!members.length" class="empty-state" style="padding:2rem"><div class="empty-text">No members added yet</div></div>
          </div>
        </div>

        <!-- Phase Settings -->
        <div v-else key="phases">
          <div class="section-header">
            <span class="section-title">Phase Settings</span>
            <button class="btn btn-primary btn-sm" @click="showAddPhase = true">+ Add Phase</button>
          </div>
          <div class="phases-settings-list">
            <div v-for="ph in phases" :key="ph.id" class="phase-settings-card">
              <div class="psc-header">
                <span class="psc-num">Phase {{ ph.order }}</span>
                <div class="psc-actions">
                  <select v-model="ph.status" class="status-select-sm" @change="savePhaseStatus(ph)">
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="removePhase(ph)">✕</button>
                </div>
              </div>
              <div class="psc-name">{{ ph.name }}</div>
              <div class="psc-desc" v-if="ph.description">{{ ph.description }}</div>
              <div class="psc-goal">Goal: <strong>${{ ph.goal.toFixed(2) }}</strong></div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Add Phase Modal -->
    <div class="modal-backdrop" v-if="showAddPhase" @click.self="showAddPhase=false">
      <div class="modal">
        <h2 class="modal-title">Add Phase</h2>
        <div class="modal-form">
          <div class="form-group">
            <label class="form-label">Phase Name *</label>
            <input v-model="phaseForm.name" class="form-input" placeholder="e.g. Phase 2 — Cabling" required />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input v-model="phaseForm.description" class="form-input" placeholder="What happens in this phase?" />
          </div>
          <div class="form-group">
            <label class="form-label">Goal Amount ($) *</label>
            <input v-model.number="phaseForm.goal" class="form-input" type="number" min="0" step="0.01" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showAddPhase=false">Cancel</button>
            <button class="btn btn-primary" @click="addPhase">Add Phase</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Payment Modal -->
    <div class="modal-backdrop" v-if="showAddPayment" @click.self="showAddPayment=false">
      <div class="modal">
        <h2 class="modal-title">Record Payment</h2>
        <div class="modal-form">
          <div class="form-group">
            <label class="form-label">Phase *</label>
            <select v-model="paymentForm.phaseId" class="form-input" required>
              <option value="">-- Select Phase --</option>
              <option v-for="ph in phases" :key="ph.id" :value="ph.id">Phase {{ ph.order }}: {{ ph.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Member</label>
            <select v-model="paymentForm.memberId" class="form-input" @change="fillMember">
              <option value="">-- Select Member --</option>
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.firstName }} {{ m.lastName }} ({{ m.houseNumber }})</option>
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input v-model="paymentForm.date" class="form-input" type="date" />
            </div>
            <div class="form-group">
              <label class="form-label">Amount ($) *</label>
              <input v-model.number="paymentForm.amount" class="form-input" type="number" min="0" step="0.01" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Description</label>
              <input v-model="paymentForm.description" class="form-input" placeholder="e.g. Pole contribution" />
            </div>
            <div class="form-group">
              <label class="form-label">Receipt #</label>
              <input v-model="paymentForm.receiptNumber" class="form-input" placeholder="000320" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showAddPayment=false">Cancel</button>
            <button class="btn btn-primary" @click="addPayment">Record Payment</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Expense Modal -->
    <div class="modal-backdrop" v-if="showAddExpense" @click.self="showAddExpense=false">
      <div class="modal">
        <h2 class="modal-title">Add Expense</h2>
        <div class="modal-form">
          <div class="form-group">
            <label class="form-label">Phase *</label>
            <select v-model="expenseForm.phaseId" class="form-input" required>
              <option value="">-- Select Phase --</option>
              <option v-for="ph in phases" :key="ph.id" :value="ph.id">Phase {{ ph.order }}: {{ ph.name }}</option>
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input v-model="expenseForm.date" class="form-input" type="date" />
            </div>
            <div class="form-group">
              <label class="form-label">Amount ($) *</label>
              <input v-model.number="expenseForm.amount" class="form-input" type="number" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Vendor *</label>
            <input v-model="expenseForm.vendor" class="form-input" placeholder="Company or person name" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input v-model="expenseForm.description" class="form-input" placeholder="What was purchased" />
          </div>
          <div class="form-group">
            <label class="form-label">Invoice #</label>
            <input v-model="expenseForm.invoiceNumber" class="form-input" placeholder="4370" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showAddExpense=false">Cancel</button>
            <button class="btn btn-primary" @click="addExpense">Add Expense</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div class="modal-backdrop" v-if="showAddMember" @click.self="showAddMember=false">
      <div class="modal">
        <h2 class="modal-title">Add Member</h2>
        <div v-if="memberError" class="alert alert-error">{{ memberError }}</div>
        <div class="modal-form">
          <div class="grid-2">
            <div class="form-group"><label class="form-label">First Name</label><input v-model="memberForm.firstName" class="form-input" /></div>
            <div class="form-group"><label class="form-label">Last Name *</label><input v-model="memberForm.lastName" class="form-input" required /></div>
          </div>
          <div class="grid-2">
            <div class="form-group"><label class="form-label">House # *</label><input v-model="memberForm.houseNumber" class="form-input" required /></div>
            <div class="form-group"><label class="form-label">Phone *</label><input v-model="memberForm.phone" class="form-input" required /></div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showAddMember=false">Cancel</button>
            <button class="btn btn-primary" @click="addMember">Add Member</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/index.js'
import * as api from '@/api/db.js'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const projectId = route.params.id

const loading = ref(true)
const tab = ref('payments')
const phaseFilter = ref('')

const project = ref(null)
const phases = ref([])
const payments = ref([])
const expenses = ref([])
const members = ref([])

// Modals
const showAddPhase = ref(false)
const showAddPayment = ref(false)
const showAddExpense = ref(false)
const showAddMember = ref(false)
const memberError = ref('')

// Forms
const phaseForm = reactive({ name: '', description: '', goal: '' })
const paymentForm = reactive({ phaseId: '', memberId: '', firstName: '', lastName: '', houseNumber: '', date: new Date().toISOString().slice(0,10), amount: '', description: '', receiptNumber: '' })
const expenseForm = reactive({ phaseId: '', date: new Date().toISOString().slice(0,10), vendor: '', description: '', amount: '', invoiceNumber: '' })
const memberForm = reactive({ firstName: '', lastName: '', houseNumber: '', phone: '' })

// Computed
const totalPaid = computed(() => phases.value.reduce((s, ph) => s + ph.totalPaid, 0))
const totalExpenses = computed(() => phases.value.reduce((s, ph) => s + ph.totalExpenses, 0))
const totalGoal = computed(() => phases.value.reduce((s, ph) => s + ph.goal, 0))
const balance = computed(() => totalPaid.value - totalExpenses.value)
const overallProgress = computed(() => totalGoal.value > 0 ? Math.min(100, Math.round(totalPaid.value / totalGoal.value * 100)) : 0)
const membersWithTotals = computed(() => members.value.map(m => ({
  ...m, paid: payments.value.filter(p => p.houseNumber === m.houseNumber).reduce((s, p) => s + p.amount, 0)
})))

function phaseOrder(phaseId) { return phases.value.find(p => p.id === phaseId)?.order ?? '?' }
function phaseGradient(status) {
  if (status === 'completed') return 'linear-gradient(90deg,#52b788,#2d6a4f)'
  if (status === 'pending') return 'linear-gradient(90deg,#adb5bd,#868e96)'
  return 'linear-gradient(90deg,var(--accent),#52b788)'
}
function fmtDate(d) { return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) }

function selectPhase(ph) { phaseFilter.value = ph.id; tab.value = 'payments'; loadTabData() }

async function reload() {
  const [proj, phs, mems] = await Promise.all([
    api.getProject(projectId),
    api.getPhases(projectId),
    api.getMembers(store.user.communityId)
  ])
  project.value = proj
  phases.value = phs
  members.value = mems
  await loadTabData()
}

async function loadTabData() {
  const filter = { projectId, ...(phaseFilter.value ? { phaseId: phaseFilter.value } : {}) }
  const [p, e] = await Promise.all([api.getPayments(filter), api.getExpenses(filter)])
  payments.value = p
  expenses.value = e
}

async function saveStatus() { await api.updateProject(projectId, { status: project.value.status }) }
async function savePhaseStatus(ph) { await api.updatePhase(ph.id, { status: ph.status }); await reload() }

async function addPhase() {
  await api.addPhase({ ...phaseForm, projectId, communityId: store.user.communityId, order: phases.value.length + 1, goal: Number(phaseForm.goal) })
  Object.assign(phaseForm, { name: '', description: '', goal: '' })
  showAddPhase.value = false
  await reload()
}
async function removePhase(ph) {
  if (!confirm(`Delete phase "${ph.name}"? This cannot be undone.`)) return
  await api.deletePhase(ph.id); await reload()
}

function fillMember() {
  const m = members.value.find(x => x.id === paymentForm.memberId)
  if (m) { paymentForm.firstName = m.firstName; paymentForm.lastName = m.lastName; paymentForm.houseNumber = m.houseNumber }
}
async function addPayment() {
  await api.addPayment({ ...paymentForm, projectId, communityId: store.user.communityId, amount: Number(paymentForm.amount) })
  Object.assign(paymentForm, { phaseId: '', memberId: '', firstName: '', lastName: '', houseNumber: '', date: new Date().toISOString().slice(0,10), amount: '', description: '', receiptNumber: '' })
  showAddPayment.value = false; await reload()
}
async function deletePayment(p) { if (!confirm('Delete this payment?')) return; await api.deletePayment(p.id); await reload() }

async function addExpense() {
  await api.addExpense({ ...expenseForm, projectId, communityId: store.user.communityId, amount: Number(expenseForm.amount) })
  Object.assign(expenseForm, { phaseId: '', date: new Date().toISOString().slice(0,10), vendor: '', description: '', amount: '', invoiceNumber: '' })
  showAddExpense.value = false; await reload()
}
async function deleteExpense(e) { if (!confirm('Delete this expense?')) return; await api.deleteExpense(e.id); await reload() }

async function addMember() {
  memberError.value = ''
  try {
    await api.addMember({ ...memberForm, communityId: store.user.communityId })
    Object.assign(memberForm, { firstName: '', lastName: '', houseNumber: '', phone: '' })
    showAddMember.value = false; await reload()
  } catch (e) { memberError.value = e.message }
}
async function deleteMember(m) { if (!confirm(`Remove ${m.firstName} ${m.lastName}?`)) return; await api.deleteMember(m.id); await reload() }

function logout() { store.logout(); router.push('/') }
onMounted(async () => { await reload(); loading.value = false })
</script>

<style scoped>
.page-body { padding-top:1.5rem; padding-bottom:3rem; }

.project-header { background:linear-gradient(135deg,var(--pc,#2d6a4f),color-mix(in srgb,var(--pc,#2d6a4f) 65%,black)); color:white; border-radius:var(--radius-lg); padding:1.5rem 2rem; display:flex; align-items:center; gap:1.25rem; margin-bottom:1.5rem; flex-wrap:wrap; overflow:hidden; position:relative; }
.project-header::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E"); }
.ph-icon { font-size:2.5rem; flex-shrink:0; }
.ph-info { flex:1; min-width:0; }
.ph-name { font-family:var(--font-display); font-size:1.5rem; margin-bottom:.25rem; }
.ph-desc { font-size:.875rem; opacity:.85; }
.ph-meta { margin-left:auto; }
.status-select { background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.3); color:white; padding:.4rem .875rem; border-radius:var(--radius-sm); font-size:.82rem; font-weight:500; cursor:pointer; }
.status-select option { background:var(--text); color:white; }

.phases-overview { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1rem; margin-bottom:1.5rem; }
.phase-overview-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:1rem 1.125rem; cursor:pointer; transition:all var(--transition); }
.phase-overview-card:hover { border-color:var(--accent); box-shadow:var(--shadow); transform:translateY(-2px); }
.phase-overview-card.active { border-color:var(--accent); background:rgba(45,106,79,.04); }
.phase-overview-card.completed { border-color:#52b788; }
.poc-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
.poc-num { font-size:.72rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text-3); }
.poc-status { font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.07em; padding:.15rem .5rem; border-radius:100px; }
.poc-status.active { background:var(--accent-light); color:var(--accent-dark); }
.poc-status.completed { background:#d8f3dc; color:#1b4332; }
.poc-status.pending { background:var(--border); color:var(--text-3); }
.poc-name { font-size:.875rem; font-weight:600; margin-bottom:.5rem; line-height:1.3; }
.poc-progress-row { display:flex; gap:.25rem; align-items:baseline; }
.poc-paid { font-family:var(--font-display); font-size:1.1rem; color:var(--accent); }
.poc-goal { font-size:.78rem; color:var(--text-3); }
.poc-pct { font-size:.75rem; color:var(--text-3); margin-top:.25rem; }

.phase-add-card { background:var(--surface2); border:2px dashed var(--border); border-radius:var(--radius); padding:1rem; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.375rem; color:var(--text-3); font-size:.875rem; transition:all var(--transition); cursor:pointer; min-height:120px; }
.phase-add-card span:first-child { font-size:1.5rem; }
.phase-add-card:hover { border-color:var(--accent); color:var(--accent); background:var(--accent-light); }

.total-bar { margin-bottom:1.5rem; }
.total-bar-labels { display:flex; justify-content:space-between; align-items:center; }
.total-pct { font-family:var(--font-display); font-size:1.25rem; color:var(--accent); }
.total-bar-stats { display:flex; gap:2rem; flex-wrap:wrap; }
.tbs { display:flex; flex-direction:column; }
.tbs-val { font-family:var(--font-display); font-size:1.1rem; line-height:1; }
.tbs-lbl { font-size:.7rem; text-transform:uppercase; letter-spacing:.06em; color:var(--text-3); margin-top:.2rem; }

.phase-filter { display:flex; gap:.375rem; flex-wrap:wrap; margin-bottom:1rem; }
.pf-btn { padding:.35rem .875rem; border:1px solid var(--border); border-radius:100px; background:var(--surface); font-size:.8rem; font-weight:500; color:var(--text-2); transition:all var(--transition); cursor:pointer; }
.pf-btn.active { background:var(--accent); color:white; border-color:var(--accent); }
.pf-btn:hover:not(.active) { border-color:var(--accent); color:var(--accent); }

.phase-chip { background:var(--accent-light); color:var(--accent-dark); font-size:.7rem; font-weight:600; padding:.15rem .5rem; border-radius:100px; white-space:nowrap; }

.phases-settings-list { display:flex; flex-direction:column; gap:.875rem; }
.phase-settings-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:1rem 1.25rem; }
.psc-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.5rem; }
.psc-num { font-size:.72rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--accent); }
.psc-actions { display:flex; align-items:center; gap:.5rem; }
.status-select-sm { border:1px solid var(--border); background:var(--surface2); color:var(--text); padding:.3rem .625rem; border-radius:var(--radius-sm); font-size:.78rem; cursor:pointer; }
.psc-name { font-size:.9rem; font-weight:600; }
.psc-desc { font-size:.8rem; color:var(--text-2); margin-top:.2rem; }
.psc-goal { font-size:.82rem; color:var(--text-3); margin-top:.375rem; }

.modal-form { display:flex; flex-direction:column; gap:1rem; }
.modal-actions { display:flex; gap:.75rem; justify-content:flex-end; margin-top:.5rem; }

tfoot td { padding:.75rem 1rem; background:var(--surface2); font-size:.875rem; border-top:2px solid var(--border); }

@media (max-width:640px) {
  .phases-overview { grid-template-columns:1fr 1fr; }
  .total-bar-stats { gap:1rem; }
}
</style>

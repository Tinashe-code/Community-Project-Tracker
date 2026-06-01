/**
 * api/db.js — Mock data layer
 * Replace each function body with fetch() calls to your Express+MySQL backend.
 * Full MySQL schema is at the bottom of this file.
 */

// ─── Seed ─────────────────────────────────────────────────────────────────────

const DB = {
  siteAdmin: { id: 0, username: 'siteadmin', password: 'site@admin123', name: 'Site Administrator', role: 'site_admin' },

  communityAdmins: [
    { id: 1, username: 'admin_elec', password: 'elec123', name: 'Tinashe Moyo', email: 'tinashe@email.com', communityId: 'COM001', approved: true }
  ],

  communities: [
    { id: 'COM001', name: 'Ward 5 Development Committee', location: 'Harare South', adminId: 1, createdAt: '2025-01-01', coverColor: '#1a472a', icon: '🏘️', description: 'Grassroots community infrastructure development' }
  ],

  projects: [
    { id: 'PROJ001', communityId: 'COM001', name: 'Community Electrification', description: 'Bringing electricity to all 120 households in Ward 5', status: 'active', createdAt: '2025-01-15', icon: '⚡', coverColor: '#b5911a' }
  ],

  phases: [
    { id: 'PH001', projectId: 'PROJ001', communityId: 'COM001', name: 'Phase 1 — Poles', description: 'Purchase and plant electricity poles across the ward', goal: 850, order: 1, status: 'active' },
    { id: 'PH002', projectId: 'PROJ001', communityId: 'COM001', name: 'Phase 2 — Cabling', description: 'Purchase and connect all electrical cables between poles', goal: 1200, order: 2, status: 'pending' },
    { id: 'PH003', projectId: 'PROJ001', communityId: 'COM001', name: 'Phase 3 — Transformer & Energisation', description: 'Purchase transformer and energise the network', goal: 2000, order: 3, status: 'pending' }
  ],

  members: [
    { id: 1, communityId: 'COM001', firstName: '', lastName: 'Chikumbindi', houseNumber: '4684', phone: '773256451' },
    { id: 2, communityId: 'COM001', firstName: 'E', lastName: 'Chinhamhora', houseNumber: '4753', phone: '785500468' },
    { id: 3, communityId: 'COM001', firstName: 'R', lastName: 'Zvimba', houseNumber: '4759', phone: '772448537' },
    { id: 4, communityId: 'COM001', firstName: 'E', lastName: 'Chaeruka', houseNumber: '4712', phone: '774494487' }
  ],

  payments: [
    { id: 1, phaseId: 'PH001', projectId: 'PROJ001', communityId: 'COM001', memberId: 1, date: '2026-05-11', firstName: 'J', lastName: 'Chikumbindi', houseNumber: '4684', amount: 10, description: 'Pole contribution', receiptNumber: '000317' },
    { id: 2, phaseId: 'PH001', projectId: 'PROJ001', communityId: 'COM001', memberId: 2, date: '2025-05-13', firstName: 'E', lastName: 'Chinhamhora', houseNumber: '4753', amount: 10, description: 'Pole contribution', receiptNumber: '000319' },
    { id: 3, phaseId: 'PH001', projectId: 'PROJ001', communityId: 'COM001', memberId: 3, date: '2026-05-05', firstName: 'R', lastName: 'Zvimba', houseNumber: '4759', amount: 20, description: 'Pole contribution', receiptNumber: '000311' },
    { id: 4, phaseId: 'PH001', projectId: 'PROJ001', communityId: 'COM001', memberId: 4, date: '2026-05-11', firstName: 'E', lastName: 'Chaeruka', houseNumber: '4712', amount: 10, description: 'Pole contribution', receiptNumber: '000318' }
  ],

  expenses: [
    { id: 1, phaseId: 'PH001', projectId: 'PROJ001', communityId: 'COM001', date: '2026-04-30', vendor: 'Madzvamuse Transport Logistics', description: 'Poles purchase and transport', amount: 850, invoiceNumber: '4369' },
    { id: 2, phaseId: 'PH001', projectId: 'PROJ001', communityId: 'COM001', date: '2021-11-17', vendor: 'Crystone Concrete', description: 'Poles purchase and transport', amount: 805, invoiceNumber: '1136' }
  ],

  _ids: { communityAdmins: 2, communities: 2, projects: 2, phases: 4, members: 5, payments: 5, expenses: 3 }
}

function nextId(t) { return DB._ids[t]++ }
const delay = (ms = 100) => new Promise(r => setTimeout(r, ms))

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function siteAdminLogin(username, password) {
  await delay()
  const a = DB.siteAdmin
  if (a.username !== username || a.password !== password) throw new Error('Invalid site admin credentials')
  return { id: a.id, name: a.name, role: 'site_admin' }
}

export async function communityAdminLogin(username, password) {
  await delay()
  const a = DB.communityAdmins.find(x => x.username === username && x.password === password)
  if (!a) throw new Error('Invalid credentials')
  if (!a.approved) throw new Error('Your account is pending approval by the site admin')
  const community = DB.communities.find(c => c.id === a.communityId)
  return { id: a.id, name: a.name, email: a.email, communityId: a.communityId, role: 'community_admin', community }
}

export async function registerCommunityAdmin(data) {
  await delay()
  const exists = DB.communityAdmins.find(a => a.username === data.username)
  if (exists) throw new Error('Username already taken')
  const admin = { ...data, id: nextId('communityAdmins'), approved: false }
  DB.communityAdmins.push(admin)
  return admin
}

export async function memberLogin(communityId, houseNumber, phone) {
  await delay()
  const community = DB.communities.find(c => c.id === communityId)
  if (!community) throw new Error('Community not found. Check your Community ID.')
  const member = DB.members.find(m => m.communityId === communityId && m.houseNumber === houseNumber && m.phone === phone)
  if (!member) throw new Error('Member not found. Check your house number and phone number.')
  return { member, community }
}

// ─── Site Admin: manage admins ────────────────────────────────────────────────

export async function getAllCommunityAdmins() {
  await delay()
  return DB.communityAdmins.map(a => {
    const community = DB.communities.find(c => c.id === a.communityId)
    return { ...a, password: undefined, communityName: community?.name }
  })
}

export async function approveCommunityAdmin(id) {
  await delay()
  const a = DB.communityAdmins.find(x => x.id === id)
  if (a) a.approved = true
  return a
}

export async function deleteCommunityAdmin(id) {
  await delay()
  const idx = DB.communityAdmins.findIndex(x => x.id === id)
  if (idx > -1) DB.communityAdmins.splice(idx, 1)
}

export async function getAllCommunitiesSiteAdmin() {
  await delay()
  return DB.communities.map(c => {
    const admin = DB.communityAdmins.find(a => a.communityId === c.id)
    const projects = DB.projects.filter(p => p.communityId === c.id)
    return { ...c, adminName: admin?.name, projectCount: projects.length }
  })
}

// ─── Communities ──────────────────────────────────────────────────────────────

export async function createCommunity(data, adminId) {
  await delay()
  const id = 'COM' + String(nextId('communities')).padStart(3, '0')
  const community = { ...data, id, adminId, createdAt: new Date().toISOString().slice(0, 10) }
  DB.communities.push(community)
  // bind to admin
  const admin = DB.communityAdmins.find(a => a.id === adminId)
  if (admin) admin.communityId = id
  return community
}

export async function getCommunity(id) {
  await delay()
  const c = DB.communities.find(c => c.id === id)
  if (!c) throw new Error('Community not found')
  return { ...c }
}

export async function updateCommunity(id, data) {
  await delay()
  const idx = DB.communities.findIndex(c => c.id === id)
  if (idx === -1) throw new Error('Not found')
  DB.communities[idx] = { ...DB.communities[idx], ...data }
  return DB.communities[idx]
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(communityId) {
  await delay()
  return DB.projects.filter(p => p.communityId === communityId).map(p => {
    const phases = DB.phases.filter(ph => ph.projectId === p.id)
    const totalGoal = phases.reduce((s, ph) => s + ph.goal, 0)
    const totalPaid = DB.payments.filter(pay => pay.projectId === p.id).reduce((s, pay) => s + pay.amount, 0)
    const totalExpenses = DB.expenses.filter(e => e.projectId === p.id).reduce((s, e) => s + e.amount, 0)
    const progress = totalGoal > 0 ? Math.min(100, Math.round((totalPaid / totalGoal) * 100)) : 0
    return { ...p, phases, totalGoal, totalPaid, totalExpenses, progress, phaseCount: phases.length }
  })
}

export async function getProject(id) {
  await delay()
  const p = DB.projects.find(p => p.id === id)
  if (!p) throw new Error('Project not found')
  const phases = DB.phases.filter(ph => ph.projectId === id).sort((a, b) => a.order - b.order)
  return { ...p, phases }
}

export async function createProject(data) {
  await delay()
  const id = 'PROJ' + String(nextId('projects')).padStart(3, '0')
  const project = { ...data, id, createdAt: new Date().toISOString().slice(0, 10), status: 'active' }
  DB.projects.push(project)
  // create phases
  if (data.phases && data.phases.length) {
    data.phases.forEach((ph, i) => {
      const phId = 'PH' + String(nextId('phases')).padStart(3, '0')
      DB.phases.push({ ...ph, id: phId, projectId: id, communityId: data.communityId, order: i + 1, status: i === 0 ? 'active' : 'pending' })
    })
  }
  return project
}

export async function updateProject(id, data) {
  await delay()
  const idx = DB.projects.findIndex(p => p.id === id)
  if (idx === -1) throw new Error('Not found')
  DB.projects[idx] = { ...DB.projects[idx], ...data }
  return DB.projects[idx]
}

// ─── Phases ───────────────────────────────────────────────────────────────────

export async function getPhases(projectId) {
  await delay()
  return DB.phases.filter(ph => ph.projectId === projectId)
    .sort((a, b) => a.order - b.order)
    .map(ph => {
      const paid = DB.payments.filter(p => p.phaseId === ph.id).reduce((s, p) => s + p.amount, 0)
      const expenses = DB.expenses.filter(e => e.phaseId === ph.id).reduce((s, e) => s + e.amount, 0)
      const progress = ph.goal > 0 ? Math.min(100, Math.round((paid / ph.goal) * 100)) : 0
      return { ...ph, totalPaid: paid, totalExpenses: expenses, balance: paid - expenses, progress, remaining: Math.max(0, ph.goal - paid) }
    })
}

export async function addPhase(data) {
  await delay()
  const id = 'PH' + String(nextId('phases')).padStart(3, '0')
  const phase = { ...data, id, status: 'pending' }
  DB.phases.push(phase)
  return phase
}

export async function updatePhase(id, data) {
  await delay()
  const idx = DB.phases.findIndex(p => p.id === id)
  if (idx === -1) throw new Error('Not found')
  DB.phases[idx] = { ...DB.phases[idx], ...data }
  return DB.phases[idx]
}

export async function deletePhase(id) {
  await delay()
  const idx = DB.phases.findIndex(p => p.id === id)
  if (idx > -1) DB.phases.splice(idx, 1)
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function getMembers(communityId) {
  await delay()
  return DB.members.filter(m => m.communityId === communityId)
}

export async function addMember(data) {
  await delay()
  const exists = DB.members.find(m => m.communityId === data.communityId && m.houseNumber === data.houseNumber)
  if (exists) throw new Error('A member with this house number already exists')
  const member = { ...data, id: nextId('members') }
  DB.members.push(member)
  return member
}

export async function deleteMember(id) {
  await delay()
  const idx = DB.members.findIndex(m => m.id === id)
  if (idx > -1) DB.members.splice(idx, 1)
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function getPayments(filter = {}) {
  await delay()
  let list = [...DB.payments]
  if (filter.communityId) list = list.filter(p => p.communityId === filter.communityId)
  if (filter.projectId) list = list.filter(p => p.projectId === filter.projectId)
  if (filter.phaseId) list = list.filter(p => p.phaseId === filter.phaseId)
  if (filter.houseNumber) list = list.filter(p => p.houseNumber === filter.houseNumber)
  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function addPayment(data) {
  await delay()
  const payment = { ...data, id: nextId('payments') }
  DB.payments.push(payment)
  return payment
}

export async function deletePayment(id) {
  await delay()
  const idx = DB.payments.findIndex(p => p.id === id)
  if (idx > -1) DB.payments.splice(idx, 1)
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpenses(filter = {}) {
  await delay()
  let list = [...DB.expenses]
  if (filter.communityId) list = list.filter(e => e.communityId === filter.communityId)
  if (filter.projectId) list = list.filter(e => e.projectId === filter.projectId)
  if (filter.phaseId) list = list.filter(e => e.phaseId === filter.phaseId)
  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function addExpense(data) {
  await delay()
  const expense = { ...data, id: nextId('expenses') }
  DB.expenses.push(expense)
  return expense
}

export async function deleteExpense(id) {
  await delay()
  const idx = DB.expenses.findIndex(e => e.id === id)
  if (idx > -1) DB.expenses.splice(idx, 1)
}

/*
══════════════════════════════════════════════════════════════
  MySQL SCHEMA
══════════════════════════════════════════════════════════════

CREATE TABLE site_admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100)
);

CREATE TABLE community_admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  community_id VARCHAR(20),
  approved TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE communities (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  admin_id INT REFERENCES community_admins(id),
  cover_color VARCHAR(20),
  icon VARCHAR(10),
  created_at DATE
);

CREATE TABLE projects (
  id VARCHAR(20) PRIMARY KEY,
  community_id VARCHAR(20) REFERENCES communities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('active','completed','paused') DEFAULT 'active',
  icon VARCHAR(10),
  cover_color VARCHAR(20),
  created_at DATE
);

CREATE TABLE phases (
  id VARCHAR(20) PRIMARY KEY,
  project_id VARCHAR(20) REFERENCES projects(id) ON DELETE CASCADE,
  community_id VARCHAR(20) REFERENCES communities(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  goal DECIMAL(12,2) NOT NULL,
  `order` INT DEFAULT 1,
  status ENUM('pending','active','completed') DEFAULT 'pending'
);

CREATE TABLE members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  community_id VARCHAR(20) REFERENCES communities(id) ON DELETE CASCADE,
  first_name VARCHAR(50),
  last_name VARCHAR(100) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  UNIQUE KEY (community_id, house_number)
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phase_id VARCHAR(20) REFERENCES phases(id),
  project_id VARCHAR(20) REFERENCES projects(id),
  community_id VARCHAR(20) REFERENCES communities(id),
  member_id INT REFERENCES members(id),
  date DATE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(100),
  house_number VARCHAR(20),
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  receipt_number VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phase_id VARCHAR(20) REFERENCES phases(id),
  project_id VARCHAR(20) REFERENCES projects(id),
  community_id VARCHAR(20) REFERENCES communities(id),
  date DATE NOT NULL,
  vendor VARCHAR(200),
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  invoice_number VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
*/

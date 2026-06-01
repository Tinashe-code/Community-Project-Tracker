# 🌿 Musha — Community Project Dashboard

> *Musha* (Shona: "home / village") — A platform for grassroots communities to transparently track contributions, expenses, and progress across multi-phase infrastructure projects.

![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [👤 For End Users](#-for-end-users)
  - [What is Musha?](#what-is-musha)
  - [Who uses it?](#who-uses-it)
  - [How to access your dashboard](#how-to-access-your-dashboard)
  - [What you can see](#what-you-can-see)
  - [Admin registration](#admin-registration)
- [🛠️ For Developers](#️-for-developers)
  - [Tech stack](#tech-stack)
  - [Project structure](#project-structure)
  - [Quick start (mock data)](#quick-start-mock-data)
  - [Connecting a MySQL database](#connecting-a-mysql-database)
  - [MySQL schema](#mysql-schema)
  - [Building the backend API](#building-the-backend-api)
  - [Full API reference](#full-api-reference)
  - [Environment variables](#environment-variables)
  - [Deployment](#deployment)
  - [Demo credentials](#demo-credentials)

---

## Overview

Musha is a multi-tenant community project dashboard. Each community registers their own admin, creates projects (e.g. electrification, road repair, water supply), breaks those projects into phases with individual funding goals, and lets members log in to track progress and see their personal payment history.

**Key capabilities:**
- Multi-community, multi-project, multi-phase architecture
- Two-tier admin system: Site Admin (platform owner) + Community Admin (per community)
- Member login via House Number + Phone — no password required
- Payments and expenses tracked at the phase level
- Project history preserved even for completed projects
- Fully mobile responsive

---

## 👤 For End Users

### What is Musha?

Musha is a website your community committee uses to keep everyone informed about how community funds are being raised and spent. Instead of waiting for a meeting to find out how much has been collected or what was purchased, you can check the dashboard at any time from your phone or computer.

---

### Who uses it?

There are three types of people on Musha:

| Role | Who they are | What they can do |
|------|-------------|-----------------|
| **Site Admin** | The platform developer / owner | Approves community admins, oversees all communities |
| **Community Admin** | Your elected committee secretary or treasurer | Creates projects, records payments and expenses, adds members |
| **Member** | Any household in the community | Views project progress, sees their own payment history |

---

### How to access your dashboard

You do not need to create an account or remember a password. You only need three things:

1. **Community ID** — a short code like `COM001`. Ask your community admin for this. They should share it at the beginning of the project or pin it on a notice board.
2. **House Number** — the number of your house or plot (e.g. `4684`)
3. **Phone Number** — the phone number your admin registered you with (e.g. `773256451`) — no spaces, no leading zero

**Steps:**
1. Go to the Musha website
2. Click **"View My Dashboard"**
3. Enter your Community ID, House Number, and Phone Number
4. Click **"View My Dashboard"** — you will be taken straight to your community's page

> ⚠️ If you get an error saying "Member not found", contact your community admin to confirm which phone number was registered for your household.

---

### What you can see

Once logged in, your dashboard shows:

**For each project:**
- The project name, description, and current status (Active / Completed / Paused)
- Each phase with its own progress bar, amount raised, and goal
- The overall project progress bar and percentage
- Total raised across all phases vs. the total project goal

**Your personal payment history:**
- Expand "My payments for this project" under each project
- See every payment recorded for your house number: date, phase, description, receipt number, and amount
- Your running total across all projects is shown at the top of the page

**Example — Electrification Project with 3 phases:**

```
⚡ Community Electrification
├── Phase 1 — Poles         ████████░░  $50 raised / $850 goal   (6%)
├── Phase 2 — Cabling       ░░░░░░░░░░  $0  raised / $1,200 goal (0%)  [Pending]
└── Phase 3 — Transformer   ░░░░░░░░░░  $0  raised / $2,000 goal (0%)  [Pending]
                Overall:    ██░░░░░░░░  $50 raised / $4,050 goal (1%)
```

---

### Admin registration

If you are a committee secretary or treasurer and want to set up Musha for your community:

1. Go to the Musha website and click **"Admin Login"** in the top right
2. Click **"Register as community admin"**
3. Fill in:
   - Your full name
   - Your email address
   - A username (e.g. `ward5_admin`)
   - A password (at least 6 characters)
   - Your community name (e.g. "Ward 5 Development Committee")
4. Click **Submit Registration**
5. Wait for the site admin to approve your account — you will be notified by email (or by the site admin directly)
6. Once approved, log in with your username and password
7. You will be prompted to finish setting up your community profile (location, colour, icon)
8. Start creating projects!

---

## 🛠️ For Developers

### Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Vue 3 (Composition API) |
| Build tool | Vite 5 |
| State management | Pinia |
| Routing | Vue Router 4 (hash mode) |
| Styling | Vanilla CSS with custom properties |
| Database | MySQL 8 (production) / in-memory mock (development) |
| Recommended backend | Node.js + Express + mysql2 |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |

---

### Project structure

```
musha/
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── package.json
│
└── src/
    ├── main.js                   # App bootstrap
    ├── App.vue                   # Root component
    │
    ├── api/
    │   └── db.js                 # ⭐ DATA LAYER — swap mock → real API here
    │
    ├── store/
    │   └── index.js              # Pinia store (auth state)
    │
    ├── router/
    │   └── index.js              # Vue Router (route guards)
    │
    ├── assets/
    │   └── global.css            # Design system / global styles
    │
    └── views/
        ├── LandingPage.vue       # Public home page
        ├── MemberLogin.vue       # Member login (house# + phone)
        ├── AdminLogin.vue        # Admin login (site + community tabs)
        ├── AdminRegister.vue     # Community admin self-registration
        │
        ├── member/
        │   └── MemberDashboard.vue    # Member view: projects + phases
        │
        ├── admin/
        │   ├── CommunityAdminHome.vue # Community admin: projects overview
        │   ├── NewProject.vue         # Create project with phase builder
        │   └── ProjectDetail.vue      # Manage payments, expenses, members
        │
        └── siteadmin/
            └── SiteAdminHome.vue      # Site admin: approve admins, view all
```

---

### Quick start (mock data)

The app ships with an in-memory mock database so you can run it immediately without any backend setup.

**Requirements:**
- Node.js 18 or higher
- npm 9 or higher

**Check your Node version:**
```bash
node --version   # must be v18.x.x or higher
```

If your Node is older, upgrade with NVM:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

**Clone and run:**
```bash
git clone https://github.com/YOUR_USERNAME/musha.git
cd musha
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Build for production:**
```bash
npm run build
# Output is in the dist/ folder — deploy this to any static host
```

---

### Connecting a MySQL database

All data access is isolated in a single file: **`src/api/db.js`**

Every exported function is a standalone `async` function. To switch from mock data to a real MySQL backend, replace each function body with a `fetch()` call to your Express API. Nothing else in the app needs to change.

**Step 1 — Create the database**

```sql
CREATE DATABASE musha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE musha;
```

Then run the full schema below.

**Step 2 — Set up the Express backend**

```bash
mkdir musha-api && cd musha-api
npm init -y
npm install express mysql2 bcrypt jsonwebtoken cors dotenv
```

Create `server.js`:

```js
require('dotenv').config()
const express = require('express')
const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

// Database connection pool
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'musha',
  waitForConnections: true,
  connectionLimit: 10
})

// ── Auth middleware ───────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Site admin login ──────────────────────────────────────────────
app.post('/api/auth/site-admin', async (req, res) => {
  const { username, password } = req.body
  const [rows] = await pool.query(
    'SELECT * FROM site_admins WHERE username = ?', [username]
  )
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' })
  const valid = await bcrypt.compare(password, rows[0].password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign(
    { id: rows[0].id, role: 'site_admin', name: rows[0].name },
    process.env.JWT_SECRET, { expiresIn: '8h' }
  )
  res.json({ token, id: rows[0].id, name: rows[0].name, role: 'site_admin' })
})

// ── Community admin login ─────────────────────────────────────────
app.post('/api/auth/community-admin', async (req, res) => {
  const { username, password } = req.body
  const [rows] = await pool.query(
    'SELECT * FROM community_admins WHERE username = ?', [username]
  )
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' })
  const valid = await bcrypt.compare(password, rows[0].password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
  if (!rows[0].approved) return res.status(403).json({ error: 'Account pending approval' })
  const admin = rows[0]
  let community = null
  if (admin.community_id) {
    const [cRows] = await pool.query('SELECT * FROM communities WHERE id = ?', [admin.community_id])
    community = cRows[0] || null
  }
  const token = jwt.sign(
    { id: admin.id, role: 'community_admin', communityId: admin.community_id },
    process.env.JWT_SECRET, { expiresIn: '8h' }
  )
  res.json({ token, id: admin.id, name: admin.name, email: admin.email,
             communityId: admin.community_id, role: 'community_admin', community })
})

// ── Community admin registration ──────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { username, password, name, email, communityName } = req.body
  const hash = await bcrypt.hash(password, 12)
  try {
    await pool.query(
      'INSERT INTO community_admins (username, password_hash, name, email, community_name_requested) VALUES (?,?,?,?,?)',
      [username, hash, name, email, communityName]
    )
    res.json({ success: true })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username already taken' })
    throw e
  }
})

// ── Member login ──────────────────────────────────────────────────
app.post('/api/auth/member', async (req, res) => {
  const { communityId, houseNumber, phone } = req.body
  const [cRows] = await pool.query('SELECT * FROM communities WHERE id = ?', [communityId])
  if (!cRows.length) return res.status(404).json({ error: 'Community not found' })
  const [mRows] = await pool.query(
    'SELECT * FROM members WHERE community_id = ? AND house_number = ? AND phone = ?',
    [communityId, houseNumber, phone]
  )
  if (!mRows.length) return res.status(401).json({ error: 'Member not found' })
  res.json({ member: mRows[0], community: cRows[0] })
})

// ── Projects ──────────────────────────────────────────────────────
app.get('/api/projects', authMiddleware, async (req, res) => {
  const communityId = req.query.communityId
  const [projects] = await pool.query(
    'SELECT * FROM projects WHERE community_id = ? ORDER BY created_at DESC', [communityId]
  )
  // Attach phases and computed stats to each project
  for (const p of projects) {
    const [phases] = await pool.query(
      'SELECT * FROM phases WHERE project_id = ? ORDER BY `order`', [p.id]
    )
    const [paid] = await pool.query(
      'SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE project_id = ?', [p.id]
    )
    const [expenses] = await pool.query(
      'SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE project_id = ?', [p.id]
    )
    const totalGoal = phases.reduce((s, ph) => s + Number(ph.goal), 0)
    const totalPaid = Number(paid[0].total)
    p.phases = phases
    p.totalGoal = totalGoal
    p.totalPaid = totalPaid
    p.totalExpenses = Number(expenses[0].total)
    p.progress = totalGoal > 0 ? Math.min(100, Math.round(totalPaid / totalGoal * 100)) : 0
    p.phaseCount = phases.length
  }
  res.json(projects)
})

app.post('/api/projects', authMiddleware, async (req, res) => {
  const { communityId, name, description, icon, coverColor, phases } = req.body
  const id = 'PROJ' + Date.now().toString(36).toUpperCase()
  await pool.query(
    'INSERT INTO projects (id, community_id, name, description, icon, cover_color, created_at) VALUES (?,?,?,?,?,?,CURDATE())',
    [id, communityId, name, description, icon, coverColor]
  )
  for (let i = 0; i < phases.length; i++) {
    const ph = phases[i]
    const phId = 'PH' + Date.now().toString(36).toUpperCase() + i
    await pool.query(
      'INSERT INTO phases (id, project_id, community_id, name, description, goal, `order`, status) VALUES (?,?,?,?,?,?,?,?)',
      [phId, id, communityId, ph.name, ph.description, ph.goal, i + 1, i === 0 ? 'active' : 'pending']
    )
  }
  res.json({ id })
})

// ── Payments ──────────────────────────────────────────────────────
app.get('/api/payments', async (req, res) => {
  const { communityId, projectId, phaseId, houseNumber } = req.query
  let sql = 'SELECT * FROM payments WHERE 1=1'
  const params = []
  if (communityId)  { sql += ' AND community_id = ?';  params.push(communityId) }
  if (projectId)    { sql += ' AND project_id = ?';    params.push(projectId) }
  if (phaseId)      { sql += ' AND phase_id = ?';      params.push(phaseId) }
  if (houseNumber)  { sql += ' AND house_number = ?';  params.push(houseNumber) }
  sql += ' ORDER BY date DESC'
  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

app.post('/api/payments', authMiddleware, async (req, res) => {
  const { phaseId, projectId, communityId, memberId, date, firstName,
          lastName, houseNumber, amount, description, receiptNumber } = req.body
  const [result] = await pool.query(
    `INSERT INTO payments (phase_id, project_id, community_id, member_id, date,
     first_name, last_name, house_number, amount, description, receipt_number)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [phaseId, projectId, communityId, memberId, date, firstName,
     lastName, houseNumber, amount, description, receiptNumber]
  )
  res.json({ id: result.insertId })
})

app.delete('/api/payments/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id])
  res.json({ success: true })
})

// ── Expenses ──────────────────────────────────────────────────────
app.get('/api/expenses', authMiddleware, async (req, res) => {
  const { communityId, projectId, phaseId } = req.query
  let sql = 'SELECT * FROM expenses WHERE 1=1'
  const params = []
  if (communityId) { sql += ' AND community_id = ?'; params.push(communityId) }
  if (projectId)   { sql += ' AND project_id = ?';   params.push(projectId) }
  if (phaseId)     { sql += ' AND phase_id = ?';     params.push(phaseId) }
  sql += ' ORDER BY date DESC'
  const [rows] = await pool.query(sql, params)
  res.json(rows)
})

app.post('/api/expenses', authMiddleware, async (req, res) => {
  const { phaseId, projectId, communityId, date, vendor, description, amount, invoiceNumber } = req.body
  const [result] = await pool.query(
    `INSERT INTO expenses (phase_id, project_id, community_id, date, vendor, description, amount, invoice_number)
     VALUES (?,?,?,?,?,?,?,?)`,
    [phaseId, projectId, communityId, date, vendor, description, amount, invoiceNumber]
  )
  res.json({ id: result.insertId })
})

app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM expenses WHERE id = ?', [req.params.id])
  res.json({ success: true })
})

// ── Members ───────────────────────────────────────────────────────
app.get('/api/members', authMiddleware, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM members WHERE community_id = ?', [req.query.communityId]
  )
  res.json(rows)
})

app.post('/api/members', authMiddleware, async (req, res) => {
  const { communityId, firstName, lastName, houseNumber, phone } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO members (community_id, first_name, last_name, house_number, phone) VALUES (?,?,?,?,?)',
      [communityId, firstName, lastName, houseNumber, phone]
    )
    res.json({ id: result.insertId })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'House number already exists' })
    throw e
  }
})

app.delete('/api/members/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM members WHERE id = ?', [req.params.id])
  res.json({ success: true })
})

// ── Site admin: manage community admins ───────────────────────────
app.get('/api/site/admins', authMiddleware, async (req, res) => {
  if (req.user.role !== 'site_admin') return res.status(403).json({ error: 'Forbidden' })
  const [rows] = await pool.query(`
    SELECT ca.id, ca.username, ca.name, ca.email, ca.community_id, ca.approved,
           c.name AS community_name
    FROM community_admins ca
    LEFT JOIN communities c ON c.id = ca.community_id
    ORDER BY ca.approved ASC, ca.created_at DESC
  `)
  res.json(rows)
})

app.patch('/api/site/admins/:id/approve', authMiddleware, async (req, res) => {
  if (req.user.role !== 'site_admin') return res.status(403).json({ error: 'Forbidden' })
  await pool.query('UPDATE community_admins SET approved = 1 WHERE id = ?', [req.params.id])
  res.json({ success: true })
})

app.delete('/api/site/admins/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'site_admin') return res.status(403).json({ error: 'Forbidden' })
  await pool.query('DELETE FROM community_admins WHERE id = ?', [req.params.id])
  res.json({ success: true })
})

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Musha API running on port ${PORT}`))
```

**Step 3 — Replace `src/api/db.js` functions**

Replace each exported function to call your API. Example:

```js
// src/api/db.js (production version)

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function token() {
  return localStorage.getItem('musha_token') || ''
}

async function api(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export async function siteAdminLogin(username, password) {
  const data = await api('/api/auth/site-admin', { method: 'POST', body: { username, password } })
  localStorage.setItem('musha_token', data.token)
  return data
}

export async function communityAdminLogin(username, password) {
  const data = await api('/api/auth/community-admin', { method: 'POST', body: { username, password } })
  localStorage.setItem('musha_token', data.token)
  return data
}

export async function memberLogin(communityId, houseNumber, phone) {
  return api('/api/auth/member', { method: 'POST', body: { communityId, houseNumber, phone } })
}

export async function getProjects(communityId) {
  return api(`/api/projects?communityId=${communityId}`)
}

export async function getPayments(filter = {}) {
  const q = new URLSearchParams(filter).toString()
  return api(`/api/payments?${q}`)
}

// ... and so on for each function
```

---

### MySQL schema

Run this SQL in your `musha` database to create all required tables:

```sql
-- Site administrator (platform owner / developer)
CREATE TABLE site_admins (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100)
);

-- Insert the default site admin (change the hash — generated with bcrypt rounds=12)
-- Default password: site@admin123
INSERT INTO site_admins (username, password_hash, name)
VALUES ('siteadmin', '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH', 'Site Administrator');

-- Community administrators (one per community, self-registered, requires approval)
CREATE TABLE community_admins (
  id                      INT PRIMARY KEY AUTO_INCREMENT,
  username                VARCHAR(50) UNIQUE NOT NULL,
  password_hash           VARCHAR(255) NOT NULL,
  name                    VARCHAR(100),
  email                   VARCHAR(100),
  community_id            VARCHAR(20),
  community_name_requested VARCHAR(200),
  approved                TINYINT(1) DEFAULT 0,
  created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Communities (one per community admin, set up after approval)
CREATE TABLE communities (
  id          VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  location    VARCHAR(200),
  admin_id    INT REFERENCES community_admins(id),
  cover_color VARCHAR(20),
  icon        VARCHAR(10),
  created_at  DATE
);

-- Projects (many per community, track history forever)
CREATE TABLE projects (
  id           VARCHAR(20) PRIMARY KEY,
  community_id VARCHAR(20) REFERENCES communities(id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  status       ENUM('active','completed','paused') DEFAULT 'active',
  icon         VARCHAR(10),
  cover_color  VARCHAR(20),
  created_at   DATE
);

-- Phases (many per project, each with own funding goal)
CREATE TABLE phases (
  id           VARCHAR(20) PRIMARY KEY,
  project_id   VARCHAR(20) REFERENCES projects(id) ON DELETE CASCADE,
  community_id VARCHAR(20) REFERENCES communities(id),
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  goal         DECIMAL(12,2) NOT NULL,
  `order`      INT DEFAULT 1,
  status       ENUM('pending','active','completed') DEFAULT 'pending'
);

-- Community members (login: house_number + phone)
CREATE TABLE members (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  community_id VARCHAR(20) REFERENCES communities(id) ON DELETE CASCADE,
  first_name   VARCHAR(50),
  last_name    VARCHAR(100) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  phone        VARCHAR(20) NOT NULL,
  UNIQUE KEY unique_member (community_id, house_number)
);

-- Member contribution payments
CREATE TABLE payments (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  phase_id       VARCHAR(20) REFERENCES phases(id),
  project_id     VARCHAR(20) REFERENCES projects(id),
  community_id   VARCHAR(20) REFERENCES communities(id),
  member_id      INT REFERENCES members(id),
  date           DATE NOT NULL,
  first_name     VARCHAR(50),
  last_name      VARCHAR(100),
  house_number   VARCHAR(20),
  amount         DECIMAL(10,2) NOT NULL,
  description    VARCHAR(255),
  receipt_number VARCHAR(50),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Project expenses (purchases, transport, labour, etc.)
CREATE TABLE expenses (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  phase_id       VARCHAR(20) REFERENCES phases(id),
  project_id     VARCHAR(20) REFERENCES projects(id),
  community_id   VARCHAR(20) REFERENCES communities(id),
  date           DATE NOT NULL,
  vendor         VARCHAR(200),
  description    TEXT,
  amount         DECIMAL(10,2) NOT NULL,
  invoice_number VARCHAR(50),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Generate the site admin bcrypt hash:**

```js
// Run this once with Node.js to get your hash
const bcrypt = require('bcrypt')
bcrypt.hash('your_chosen_password', 12).then(console.log)
// Paste the output into the INSERT statement above
```

---

### Full API reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/site-admin` | None | Site admin login → returns JWT |
| `POST` | `/api/auth/community-admin` | None | Community admin login → returns JWT |
| `POST` | `/api/auth/register` | None | Community admin self-registration |
| `POST` | `/api/auth/member` | None | Member login (house# + phone) |
| `GET` | `/api/projects?communityId=` | JWT | List projects with phase stats |
| `POST` | `/api/projects` | JWT | Create project + phases |
| `PATCH` | `/api/projects/:id` | JWT | Update project status/details |
| `GET` | `/api/phases?projectId=` | JWT | List phases for a project |
| `POST` | `/api/phases` | JWT | Add a phase to a project |
| `PATCH` | `/api/phases/:id` | JWT | Update phase status/goal |
| `DELETE` | `/api/phases/:id` | JWT | Delete a phase |
| `GET` | `/api/payments?communityId=&projectId=&phaseId=&houseNumber=` | None* | List payments (filtered) |
| `POST` | `/api/payments` | JWT | Record a payment |
| `DELETE` | `/api/payments/:id` | JWT | Delete a payment |
| `GET` | `/api/expenses?communityId=&projectId=&phaseId=` | JWT | List expenses (filtered) |
| `POST` | `/api/expenses` | JWT | Add an expense |
| `DELETE` | `/api/expenses/:id` | JWT | Delete an expense |
| `GET` | `/api/members?communityId=` | JWT | List members |
| `POST` | `/api/members` | JWT | Add a member |
| `DELETE` | `/api/members/:id` | JWT | Remove a member |
| `GET` | `/api/site/admins` | JWT (site) | List all community admins |
| `PATCH` | `/api/site/admins/:id/approve` | JWT (site) | Approve a community admin |
| `DELETE` | `/api/site/admins/:id` | JWT (site) | Remove a community admin |
| `GET` | `/api/site/communities` | JWT (site) | List all communities |

> \* Member payment reads are public so members can view their own data without authentication. Apply rate limiting in production.

---

### Environment variables

**Frontend** — create `.env.local` in the project root:

```env
VITE_API_URL=http://localhost:3000
```

For production:

```env
VITE_API_URL=https://api.yourdomain.com
```

**Backend** — create `.env` in your API folder:

```env
DB_HOST=localhost
DB_USER=musha_user
DB_PASS=strong_password_here
DB_NAME=musha
JWT_SECRET=a_very_long_random_string_change_this
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Deployment

#### Frontend (static hosting)

```bash
npm run build
# Upload the dist/ folder to any of these:
```

| Host | Free tier | Notes |
|------|-----------|-------|
| **Netlify** | ✅ Yes | Drag and drop `dist/` or connect GitHub |
| **Vercel** | ✅ Yes | `vercel --prod` from project root |
| **GitHub Pages** | ✅ Yes | Push `dist/` to `gh-pages` branch |
| **Cloudflare Pages** | ✅ Yes | Fastest global CDN, generous free tier |

For Netlify/Vercel with hash routing, no extra config is needed. For Apache/Nginx, add a rewrite rule:

```nginx
# nginx.conf
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Backend (Node.js server)

```bash
# Using PM2 for process management
npm install -g pm2
pm2 start server.js --name musha-api
pm2 save
pm2 startup
```

Or containerise with Docker:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

### Demo credentials

These work out of the box with the mock data (no database needed):

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| Site Admin | `siteadmin` | `site@admin123` | Full platform access |
| Community Admin | `admin_elec` | `elec123` | Ward 5 community |
| Member | Community: `COM001`, House: `4684`, Phone: `773256451` | — | Chikumbindi household |
| Member | Community: `COM001`, House: `4753`, Phone: `785500468` | — | Chinhamhora household |
| Member | Community: `COM001`, House: `4759`, Phone: `772448537` | — | Zvimba household |
| Member | Community: `COM001`, House: `4712`, Phone: `774494487` | — | Chaeruka household |

---

## License

This project is licensed under the **GNU General Public License v3.0**.

© 2026 Tinashe — Original creator and maintainer of Musha.

You are free to use, modify, and distribute this software, but any derivative
work must also be released as open source under the same GPL-3.0 license.

See the [LICENSE](./LICENSE) file for full terms.
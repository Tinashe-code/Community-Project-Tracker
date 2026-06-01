<template>
  <div class="landing">
    <div class="landing-bg"></div>
    <header class="landing-header">
      <div class="brand"><span class="brand-icon">🌿</span><span class="brand-name">Musha</span></div>
      <router-link to="/admin/login" class="btn btn-ghost btn-sm">Admin Login →</router-link>
    </header>
    <main class="landing-main container">
      <div class="hero">
        <p class="hero-eyebrow">Community Project Management</p>
        <h1 class="hero-title">Track your community's<br /><em>progress together</em></h1>
        <p class="hero-desc">Monitor contributions, expenses and multi-phase project goals for your community — from electrification to roads and water supply.</p>
        <router-link to="/login" class="btn btn-primary btn-lg">View My Dashboard</router-link>
      </div>
      <div class="feature-cards">
        <div class="feature-card"><div class="fi">⚡</div><h3>Multi-Phase Projects</h3><p>Track each phase of a project with individual goals and progress</p></div>
        <div class="feature-card"><div class="fi">💳</div><h3>Payment Records</h3><p>Every contribution logged with date and receipt number</p></div>
        <div class="feature-card"><div class="fi">📊</div><h3>Live Progress</h3><p>Visual goal tracking updated in real time</p></div>
        <div class="feature-card"><div class="fi">🔒</div><h3>Simple Login</h3><p>Members access their dashboard with house number and phone</p></div>
      </div>
    </main>
    <footer class="landing-footer"><p>© 2026 Musha</p></footer>
  </div>
</template>
<script setup></script>
<style scoped>
.landing { min-height:100vh; display:flex; flex-direction:column; }
.landing-bg { position:fixed; inset:0; z-index:-1; background:radial-gradient(ellipse 80% 60% at 50% -10%,rgba(45,106,79,.12),transparent),var(--bg); }
.landing-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 2rem; border-bottom:1px solid var(--border); background:rgba(255,255,255,.85); backdrop-filter:blur(12px); position:sticky; top:0; z-index:10; }
.brand { display:flex; align-items:center; gap:.5rem; }
.brand-icon { font-size:1.5rem; }
.brand-name { font-family:var(--font-display); font-size:1.25rem; color:var(--accent-dark); }
.landing-main { flex:1; padding-top:4rem; padding-bottom:4rem; }
.hero { text-align:center; max-width:640px; margin:0 auto 4rem; }
.hero-eyebrow { display:inline-block; font-size:.8rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); background:var(--accent-light); padding:.3rem .875rem; border-radius:100px; margin-bottom:1.25rem; }
.hero-title { font-family:var(--font-display); font-size:clamp(2rem,5vw,3.5rem); line-height:1.15; margin-bottom:1.25rem; }
.hero-title em { color:var(--accent); font-style:italic; }
.hero-desc { color:var(--text-2); font-size:1.05rem; line-height:1.7; margin-bottom:2rem; }
.feature-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1.25rem; max-width:900px; margin:0 auto; }
.feature-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:1.5rem; text-align:center; box-shadow:var(--shadow-sm); transition:transform var(--transition),box-shadow var(--transition); }
.feature-card:hover { transform:translateY(-3px); box-shadow:var(--shadow); }
.fi { font-size:2rem; margin-bottom:.75rem; }
.feature-card h3 { font-size:.95rem; font-weight:600; margin-bottom:.375rem; }
.feature-card p { font-size:.825rem; color:var(--text-2); line-height:1.5; }
.landing-footer { text-align:center; padding:1.5rem; font-size:.8rem; color:var(--text-3); border-top:1px solid var(--border); }
</style>

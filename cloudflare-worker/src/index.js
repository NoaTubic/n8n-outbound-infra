export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type' };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } });
    }

    if (url.pathname === '/api/status') {
      const apiUrl = env.N8N_STATUS_WEBHOOK_URL || 'https://n8n-production-7e59.up.railway.app/webhook/domain-status';
      const apiKey = env.STATUS_API_KEY || 'demo-key-change-me';
      try {
        const resp = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        const data = await resp.text();
        return new Response(data, { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch status' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/add-domain' && request.method === 'POST') {
      const addUrl = env.N8N_ADD_DOMAIN_URL || 'https://n8n-production-7e59.up.railway.app/webhook/add-domain';
      const apiKey = env.STATUS_API_KEY || 'demo-key-change-me';
      try {
        const body = await request.text();
        const resp = await fetch(addUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body
        });
        const data = await resp.text();
        return new Response(data, { status: resp.status, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to add domain' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/enrich' && request.method === 'POST') {
      const enrichUrl = env.N8N_ENRICH_URL || 'https://n8n-production-7e59.up.railway.app/webhook/enrich';
      try {
        const body = await request.text();
        const resp = await fetch(enrichUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        const data = await resp.text();
        return new Response(data, { status: resp.status, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to enrich' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/' || url.pathname === '') {
      return new Response(dashboardHTML(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    return new Response('Not Found', { status: 404 });
  }
};

function dashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DomainPulse - Domain Health Dashboard</title>
  <meta name="description" content="Monitor DNS & email deliverability health for all your sending domains">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --surface-hover: #F1F5F9;
      --border: #E2E8F0;
      --border-light: #CBD5E1;
      --accent: #4B6BFB;
      --accent-hover: #3B5BEB;
      --accent-soft: rgba(75, 107, 251, 0.08);
      --accent-border: rgba(75, 107, 251, 0.2);
      --t0: #0F172A;
      --t1: #1E293B;
      --t2: #475569;
      --t3: #64748B;
      --t4: #94A3B8;
      --t5: #CBD5E1;
      --green: #22C55E;
      --green-soft: rgba(34, 197, 94, 0.08);
      --green-border: rgba(34, 197, 94, 0.2);
      --yellow: #EAB308;
      --yellow-soft: rgba(234, 179, 8, 0.08);
      --yellow-border: rgba(234, 179, 8, 0.2);
      --red: #EF4444;
      --red-soft: rgba(239, 68, 68, 0.08);
      --red-border: rgba(239, 68, 68, 0.2);
      --nav-bg: rgba(248, 250, 252, 0.8);
      --font: 'Instrument Sans', system-ui, sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #060A13;
        --surface: #0B0F1A;
        --surface-hover: #111827;
        --border: rgba(255, 255, 255, 0.06);
        --border-light: rgba(255, 255, 255, 0.1);
        --accent: #4B6BFB;
        --accent-hover: #5B7BFF;
        --accent-soft: rgba(75, 107, 251, 0.1);
        --accent-border: rgba(75, 107, 251, 0.2);
        --t0: #FFFFFF;
        --t1: #F1F5F9;
        --t2: #94A3B8;
        --t3: #64748B;
        --t4: #475569;
        --t5: #334155;
        --green: #4ADE80;
        --green-soft: rgba(34, 197, 94, 0.1);
        --green-border: rgba(34, 197, 94, 0.15);
        --yellow: #FACC15;
        --yellow-soft: rgba(234, 179, 8, 0.1);
        --yellow-border: rgba(234, 179, 8, 0.15);
        --red: #F87171;
        --red-soft: rgba(239, 68, 68, 0.1);
        --red-border: rgba(239, 68, 68, 0.15);
        --nav-bg: rgba(6, 10, 19, 0.8);
      }
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--t1);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* Nav */
    .nav {
      position: sticky;
      top: 0;
      z-index: 50;
      height: 56px;
      background: var(--nav-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-icon {
      width: 30px;
      height: 30px;
      background: var(--accent-soft);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-icon svg { width: 16px; height: 16px; color: var(--accent); }
    .nav-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--t0);
    }
    .nav-title span { color: var(--accent); }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .nav-badge {
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid var(--accent-border);
    }
    .nav-live {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: var(--t3);
    }
    .nav-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Container */
    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* Hero */
    .hero { margin-bottom: 2rem; }
    .hero h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--t0);
      margin-bottom: 0.35rem;
    }
    .hero p {
      color: var(--t3);
      font-size: 0.875rem;
    }

    /* Stats */
    .stats {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .stat {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
    }
    .stat-value {
      font-family: var(--mono);
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--t0);
    }
    .stat-label {
      font-family: var(--mono);
      font-size: 0.65rem;
      color: var(--t4);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 0.1rem;
    }

    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 0.75rem;
    }

    /* Card */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      border-color: var(--accent-border);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .card-domain {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .card-domain svg { width: 16px; height: 16px; color: var(--t4); }
    .card-domain-text {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--t0);
    }
    .badge {
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-family: var(--mono);
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge.healthy { background: var(--green-soft); color: var(--green); border: 1px solid var(--green-border); }
    .badge.warning { background: var(--yellow-soft); color: var(--yellow); border: 1px solid var(--yellow-border); }
    .badge.critical { background: var(--red-soft); color: var(--red); border: 1px solid var(--red-border); }
    .badge.unknown { background: var(--accent-soft); color: var(--t4); border: 1px solid var(--border); }

    /* Checks */
    .checks {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.4rem;
    }
    .check {
      text-align: center;
      padding: 0.5rem 0.25rem;
      background: var(--bg);
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .check-icon { margin-bottom: 0.1rem; }
    .check-icon svg { width: 18px; height: 18px; }
    .check-label {
      font-family: var(--mono);
      font-size: 0.6rem;
      color: var(--t4);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 500;
    }
    .check-pass .check-icon svg { color: var(--green); }
    .check-fail .check-icon svg { color: var(--red); }
    .check-na .check-icon svg { color: var(--t5); }
    .check-mx-val {
      font-family: var(--mono);
      font-size: 1rem;
      font-weight: 600;
      color: var(--accent);
    }

    .card-footer {
      margin-top: 0.75rem;
      font-size: 0.7rem;
      color: var(--t4);
    }

    /* Sections */
    .tool-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
    }
    .section-header svg { width: 18px; height: 18px; color: var(--accent); }
    .section-header h2 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--t0);
    }
    .section-num {
      font-family: var(--mono);
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
    }
    .tool-section > p {
      font-size: 0.8rem;
      color: var(--t3);
      margin-bottom: 1rem;
    }
    .tool-form {
      display: flex;
      gap: 0.5rem;
      max-width: 560px;
    }
    .tool-form input {
      flex: 1;
      padding: 0.6rem 0.85rem;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--t1);
      font-family: var(--font);
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .tool-form input:focus { border-color: var(--accent); }
    .tool-form input::placeholder { color: var(--t4); }
    .tool-form button {
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: #fff;
      font-family: var(--font);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .tool-form button:hover { background: var(--accent-hover); }
    .tool-form button:disabled { opacity: 0.5; cursor: not-allowed; }
    .tool-msg {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      min-height: 1.2em;
    }
    .tool-msg.ok { color: var(--green); }
    .tool-msg.err { color: var(--red); }

    /* Enrich results */
    .enrich-result {
      margin-top: 1rem;
      display: none;
    }
    .enrich-result.visible { display: block; animation: fadeUp 0.3s ease both; }
    .enrich-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 0.75rem;
    }
    .enrich-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
    }
    .enrich-card-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    .enrich-card-header svg { width: 14px; height: 14px; color: var(--accent); }
    .enrich-card-header span {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--t0);
    }
    .enrich-row {
      display: flex;
      justify-content: space-between;
      padding: 0.3rem 0;
    }
    .enrich-key {
      font-family: var(--mono);
      font-size: 0.7rem;
      color: var(--t4);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .enrich-val {
      font-size: 0.8rem;
      color: var(--t1);
      text-align: right;
      max-width: 60%;
    }
    .enrich-contact {
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border);
    }
    .enrich-contact:last-child { border-bottom: none; }
    .enrich-contact-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--t0);
    }
    .enrich-contact-title {
      font-size: 0.75rem;
      color: var(--t3);
    }
    .enrich-contact-email {
      font-family: var(--mono);
      font-size: 0.7rem;
      color: var(--accent);
      margin-top: 0.15rem;
    }
    .enrich-status-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: var(--green-soft);
      border: 1px solid var(--green-border);
      border-radius: 8px;
      font-size: 0.75rem;
      color: var(--green);
    }
    .enrich-status-bar svg { width: 14px; height: 14px; }
    .enrich-status-bar.partial { background: var(--yellow-soft); border-color: var(--yellow-border); color: var(--yellow); }
    .enrich-status-bar.failed { background: var(--red-soft); border-color: var(--red-border); color: var(--red); }
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Footer */
    .footer {
      text-align: center;
      padding: 3rem 1.5rem 2rem;
      border-top: 1px solid var(--border);
      margin-top: 2rem;
    }
    .footer-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      opacity: 0.5;
      transition: opacity 0.2s;
      margin-bottom: 0.4rem;
    }
    .footer-brand:hover { opacity: 1; }
    .footer-brand svg { width: 14px; height: 14px; color: var(--accent); }
    .footer-brand span {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--t2);
    }
    .footer-brand span em { font-style: normal; color: var(--accent); }
    .footer p {
      font-size: 0.7rem;
      color: var(--t4);
    }

    .loading { text-align: center; padding: 4rem; color: var(--t4); font-size: 0.85rem; }
    .error { color: var(--red); text-align: center; padding: 2rem; font-size: 0.85rem; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .card { animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .card:nth-child(2) { animation-delay: 0.05s; }
    .card:nth-child(3) { animation-delay: 0.1s; }
    .card:nth-child(4) { animation-delay: 0.15s; }
    .card:nth-child(5) { animation-delay: 0.2s; }
    .card:nth-child(6) { animation-delay: 0.25s; }

    @media (max-width: 640px) {
      .container { padding: 1.25rem 1rem; }
      .grid { grid-template-columns: 1fr; }
      .stats { flex-wrap: wrap; }
      .stat { min-width: calc(50% - 0.5rem); }
      .add-form { flex-direction: column; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-brand">
        <div class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="nav-title">Domain<span>Pulse</span></div>
      </div>
      <div class="nav-right">
        <div class="nav-badge">Free Tool</div>
        <div class="nav-live">
          <div class="nav-dot"></div>
          <span>Live</span>
        </div>
      </div>
    </div>
  </nav>

  <div class="container">
    <div class="hero">
      <h1>Domain Health</h1>
      <p>Monitor DNS & email deliverability for all your sending domains</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="count">--</div>
        <div class="stat-label">Tracked</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="healthy-count">--</div>
        <div class="stat-label">Healthy</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="issues-count">--</div>
        <div class="stat-label">Issues</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="updated">--</div>
        <div class="stat-label">Last check</div>
      </div>
    </div>

    <div id="app" class="grid">
      <div class="loading">Loading domain status...</div>
    </div>

    <div class="tool-section">
      <div class="section-header">
        <span class="section-num">01</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>Add Domain</h2>
      </div>
      <p>Add a sending domain to monitor. It will be checked on the next daily scan.</p>
      <div class="tool-form">
        <input type="text" id="add-domain" placeholder="e.g. outreach.company.com" />
        <input type="text" id="add-owner" placeholder="Owner (optional)" style="max-width:180px" />
        <button id="add-btn" onclick="addDomain()">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add
        </button>
      </div>
      <div class="tool-msg" id="add-msg"></div>
    </div>

    <div class="tool-section">
      <div class="section-header">
        <span class="section-num">02</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <h2>Lead Enrichment</h2>
      </div>
      <p>Enter a company domain to get AI-powered company data, tech stack analysis, and key decision-maker contacts.</p>
      <div class="tool-form">
        <input type="text" id="enrich-domain" placeholder="e.g. stripe.com" />
        <button id="enrich-btn" onclick="enrichDomain()">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Enrich
        </button>
      </div>
      <div class="tool-msg" id="enrich-msg"></div>
      <div class="enrich-result" id="enrich-result"></div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span>Domain<em>Pulse</em></span>
    </div>
    <p>Deliverability best practices from 10,000+ outbound campaigns</p>
  </div>

  <script>
    /* Lucide-style SVG icons */
    const icons = {
      check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
      minus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
      globe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
    };

    async function fetchStatus() {
      try {
        const resp = await fetch('/api/status');
        if (!resp.ok) throw new Error('API returned ' + resp.status);
        const data = await resp.json();
        render(data);
      } catch (err) {
        document.getElementById('app').innerHTML = '<div class="error">Failed to load: ' + err.message + '</div>';
      }
    }

    function render(data) {
      const app = document.getElementById('app');
      const domains = data.domains || [];
      const healthy = domains.filter(d => (d.status || '').toLowerCase() === 'healthy').length;
      const issues = domains.length - healthy;

      document.getElementById('count').textContent = data.checked_count || domains.length;
      document.getElementById('healthy-count').textContent = healthy;
      document.getElementById('issues-count').textContent = issues;

      if (data.last_updated) {
        const d = new Date(data.last_updated);
        document.getElementById('updated').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      if (domains.length === 0) {
        app.innerHTML = '<div class="loading">No domain checks yet. Run the Domain Watchdog workflow first.</div>';
        return;
      }

      app.innerHTML = domains.map(d => {
        const status = (d.status || 'unknown').toLowerCase();
        const ci = (val) => {
          if (val === true) return '<div class="check check-pass"><div class="check-icon">' + icons.check + '</div>';
          if (val === false) return '<div class="check check-fail"><div class="check-icon">' + icons.x + '</div>';
          return '<div class="check check-na"><div class="check-icon">' + icons.minus + '</div>';
        };
        const checked = d.checked_at ? new Date(d.checked_at).toLocaleString() : 'Never';

        return '<div class="card">' +
          '<div class="card-header">' +
            '<div class="card-domain">' + icons.globe + '<span class="card-domain-text">' + d.domain + '</span></div>' +
            '<span class="badge ' + status + '">' + status + '</span>' +
          '</div>' +
          '<div class="checks">' +
            ci(d.spf_valid) + '<div class="check-label">SPF</div></div>' +
            ci(d.dkim_valid) + '<div class="check-label">DKIM</div></div>' +
            ci(d.dmarc_valid) + '<div class="check-label">DMARC</div></div>' +
            '<div class="check"><div class="check-icon"><span class="check-mx-val">' + (d.mx_count || 0) + '</span></div><div class="check-label">MX</div></div>' +
          '</div>' +
          '<div class="card-footer">Checked ' + checked + '</div>' +
        '</div>';
      }).join('');
    }

    async function addDomain() {
      const domainInput = document.getElementById('add-domain');
      const ownerInput = document.getElementById('add-owner');
      const msg = document.getElementById('add-msg');
      const btn = document.getElementById('add-btn');
      const domain = domainInput.value.trim();
      if (!domain) { msg.className = 'tool-msg err'; msg.textContent = 'Enter a domain'; return; }

      btn.disabled = true;
      msg.className = 'tool-msg'; msg.textContent = '';
      try {
        const resp = await fetch('/api/add-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, owner: ownerInput.value.trim() || undefined })
        });
        const data = await resp.json();
        if (data.error) { msg.className = 'tool-msg err'; msg.textContent = data.error; }
        else { msg.className = 'tool-msg ok'; msg.textContent = domain + ' added. Will appear after next Watchdog run.'; domainInput.value = ''; ownerInput.value = ''; }
      } catch (err) { msg.className = 'tool-msg err'; msg.textContent = 'Failed: ' + err.message; }
      btn.disabled = false;
    }

    async function enrichDomain() {
      const input = document.getElementById('enrich-domain');
      const msg = document.getElementById('enrich-msg');
      const result = document.getElementById('enrich-result');
      const btn = document.getElementById('enrich-btn');
      const domain = input.value.trim();
      if (!domain) { msg.className = 'tool-msg err'; msg.textContent = 'Enter a domain'; return; }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Enriching...';
      msg.className = 'tool-msg'; msg.textContent = '';
      result.className = 'enrich-result'; result.innerHTML = '';

      try {
        const resp = await fetch('/api/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain })
        });
        const data = await resp.json();

        if (data.error) {
          msg.className = 'tool-msg err';
          msg.textContent = data.error;
        } else {
          renderEnrichment(data, result);
        }
      } catch (err) {
        msg.className = 'tool-msg err';
        msg.textContent = 'Failed: ' + err.message;
      }

      btn.disabled = false;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Enrich';
    }

    function renderEnrichment(data, container) {
      const esc = s => String(s || '--').replace(/</g, '&lt;');
      let html = '';

      /* Status bar */
      const statusClass = data.status === 'completed' ? '' : data.status === 'partial' ? ' partial' : ' failed';
      const statusIcon = data.status === 'completed' ? icons.check : icons.x;
      html += '<div class="enrich-status-bar' + statusClass + '">' + statusIcon + ' <span>Enrichment ' + esc(data.status) + ' for <strong>' + esc(data.domain) + '</strong></span></div>';

      html += '<div class="enrich-grid">';

      /* Company card */
      if (data.company_data) {
        const c = data.company_data;
        html += '<div class="enrich-card"><div class="enrich-card-header"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg><span>Company</span></div>';
        const fields = [['name','Name'],['industry','Industry'],['employee_count_range','Size'],['headquarters','HQ'],['founded_year','Founded'],['website','Website']];
        fields.forEach(([k,l]) => {
          if (c[k]) html += '<div class="enrich-row"><span class="enrich-key">' + l + '</span><span class="enrich-val">' + esc(c[k]) + '</span></div>';
        });
        if (c.description) html += '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--t3);line-height:1.4">' + esc(c.description) + '</div>';
        html += '</div>';
      }

      /* Tech stack card */
      if (data.tech_stack) {
        const t = data.tech_stack;
        html += '<div class="enrich-card"><div class="enrich-card-header"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg><span>Tech Stack</span></div>';
        const fields = [['cms','CMS'],['crm','CRM'],['analytics','Analytics'],['email_platform','Email'],['marketing_automation','Marketing'],['hosting','Hosting'],['frontend_framework','Frontend']];
        fields.forEach(([k,l]) => {
          if (t[k]) html += '<div class="enrich-row"><span class="enrich-key">' + l + '</span><span class="enrich-val">' + esc(t[k]) + '</span></div>';
        });
        if (t.other_tools) {
          const tools = Array.isArray(t.other_tools) ? t.other_tools.join(', ') : t.other_tools;
          html += '<div class="enrich-row"><span class="enrich-key">Other</span><span class="enrich-val">' + esc(tools) + '</span></div>';
        }
        html += '</div>';
      }

      /* Contacts card */
      if (data.contacts) {
        const contacts = Array.isArray(data.contacts) ? data.contacts : [];
        html += '<div class="enrich-card"><div class="enrich-card-header"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Key Contacts</span></div>';
        contacts.forEach(c => {
          html += '<div class="enrich-contact">';
          html += '<div class="enrich-contact-name">' + esc(c.name) + '</div>';
          html += '<div class="enrich-contact-title">' + esc(c.title) + (c.department ? ' · ' + esc(c.department) : '') + '</div>';
          if (c.likely_email_pattern) html += '<div class="enrich-contact-email">' + esc(c.likely_email_pattern) + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
      container.innerHTML = html;
      container.className = 'enrich-result visible';
    }

    document.getElementById('add-domain').addEventListener('keydown', e => { if (e.key === 'Enter') addDomain(); });
    document.getElementById('enrich-domain').addEventListener('keydown', e => { if (e.key === 'Enter') enrichDomain(); });
    fetchStatus();
    setInterval(fetchStatus, 60000);
  </script>
</body>
</html>`;
}

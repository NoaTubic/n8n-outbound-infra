export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const base = env.N8N_BASE_URL || 'https://n8n-production-7e59.up.railway.app';
    const apiKey = env.STATUS_API_KEY || 'demo-key-change-me';
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } });
    }

    // --- API proxy routes ---

    if (url.pathname === '/api/status') {
      try {
        const resp = await fetch(`${base}/webhook/domain-status`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
        const data = await resp.text();
        return new Response(data, { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch status' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/add-domain' && request.method === 'POST') {
      try {
        const body = await request.text();
        const resp = await fetch(`${base}/webhook/add-domain`, {
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
      try {
        const body = await request.text();
        const resp = await fetch(`${base}/webhook/enrich`, {
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

    if (url.pathname === '/api/lead-stats') {
      try {
        const resp = await fetch(`${base}/webhook/lead-stats`);
        const data = await resp.text();
        return new Response(data, { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch lead stats' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/inbound-lead' && request.method === 'POST') {
      try {
        const body = await request.text();
        const resp = await fetch(`${base}/webhook/inbound-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        const data = await resp.text();
        return new Response(data, { status: resp.status, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to submit lead' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/content-stats') {
      try {
        const resp = await fetch(`${base}/webhook/content-stats`);
        const data = await resp.text();
        return new Response(data, { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to fetch content stats' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/new-content' && request.method === 'POST') {
      try {
        const body = await request.text();
        const resp = await fetch(`${base}/webhook/new-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        const data = await resp.text();
        return new Response(data, { status: resp.status, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to submit content' }), { status: 502, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/approve-content' && request.method === 'POST') {
      try {
        const body = await request.text();
        const resp = await fetch(`${base}/webhook/approve-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        const data = await resp.text();
        return new Response(data, { status: resp.status, headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Failed to update draft' }), { status: 502, headers: corsHeaders });
      }
    }

    // --- SPA ---

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
  <title>OpsPulse — Unified Dashboard</title>
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
    .nav-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
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
      font-weight: 700;
      color: var(--t0);
    }
    .nav-title span { color: var(--accent); }

    /* Tabs */
    .nav-tabs {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-tab {
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--t3);
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      background: none;
      font-family: var(--font);
    }
    .nav-tab:hover {
      color: var(--t1);
      background: var(--surface-hover);
    }
    .nav-tab.active {
      color: var(--accent);
      background: var(--accent-soft);
      border-color: var(--accent-border);
      font-weight: 600;
    }

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

    /* Tab panels */
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .stats-grid.five { grid-template-columns: repeat(5, 1fr); }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
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

    /* Card grid */
    .card-grid {
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
      animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
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

    /* Badges */
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
    .badge.hot { background: var(--green-soft); color: var(--green); border: 1px solid var(--green-border); }
    .badge.warm { background: var(--yellow-soft); color: var(--yellow); border: 1px solid var(--yellow-border); }
    .badge.cold { background: var(--surface-hover); color: var(--t3); border: 1px solid var(--border); }

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

    /* Forms */
    .tool-form {
      display: flex;
      gap: 0.5rem;
      max-width: 560px;
    }
    .tool-form input, .lead-form input, .lead-form select, .lead-form textarea {
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
    .tool-form input:focus, .lead-form input:focus, .lead-form select:focus, .lead-form textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }
    .tool-form input::placeholder, .lead-form input::placeholder, .lead-form textarea::placeholder { color: var(--t4); }
    .tool-form input { flex: 1; }
    .tool-form button, .btn-primary {
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
    .tool-form button:hover, .btn-primary:hover { background: var(--accent-hover); }
    .tool-form button:disabled, .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .tool-msg {
      margin-top: 0.5rem;
      font-size: 0.8rem;
      min-height: 1.2em;
    }
    .tool-msg.ok { color: var(--green); }
    .tool-msg.err { color: var(--red); }

    /* Enrich results */
    .enrich-result { margin-top: 1rem; display: none; }
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
    .enrich-card-header span { font-size: 0.8rem; font-weight: 600; color: var(--t0); }
    .enrich-row { display: flex; justify-content: space-between; padding: 0.3rem 0; }
    .enrich-key { font-family: var(--mono); font-size: 0.7rem; color: var(--t4); text-transform: uppercase; letter-spacing: 0.04em; }
    .enrich-val { font-size: 0.8rem; color: var(--t1); text-align: right; max-width: 60%; }
    .enrich-contact { padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
    .enrich-contact:last-child { border-bottom: none; }
    .enrich-contact-name { font-size: 0.8rem; font-weight: 600; color: var(--t0); }
    .enrich-contact-title { font-size: 0.75rem; color: var(--t3); }
    .enrich-contact-email { font-family: var(--mono); font-size: 0.7rem; color: var(--accent); margin-top: 0.15rem; }
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

    /* Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .data-table thead tr {
      background: var(--surface-hover);
      border-bottom: 1px solid var(--border);
    }
    .data-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--t3);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .data-table td { padding: 0.75rem 1rem; }
    .data-table tbody tr:nth-child(even) { background: var(--bg); }
    .data-table tbody tr:nth-child(odd) { background: var(--surface); }

    /* Lead form */
    .lead-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      max-width: 600px;
    }
    .lead-form .full-width { grid-column: 1 / -1; }
    .lead-form textarea { min-height: 80px; resize: vertical; }
    .lead-form select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2rem; }

    /* Coming soon */
    .coming-soon {
      text-align: center;
      padding: 4rem 2rem;
    }
    .coming-soon-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      background: var(--accent-soft);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .coming-soon-icon svg { width: 28px; height: 28px; color: var(--accent); }
    .coming-soon h2 { font-size: 1.1rem; font-weight: 700; color: var(--t0); margin-bottom: 0.5rem; }
    .coming-soon p { color: var(--t3); font-size: 0.85rem; max-width: 400px; margin: 0 auto; }

    /* Spinner */
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
    .footer-brand span { font-size: 0.8rem; font-weight: 600; color: var(--t2); }
    .footer-brand span em { font-style: normal; color: var(--accent); }
    .footer p { font-size: 0.7rem; color: var(--t4); }

    .loading { text-align: center; padding: 4rem; color: var(--t4); font-size: 0.85rem; }
    .error { color: var(--red); text-align: center; padding: 2rem; font-size: 0.85rem; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Draft cards */
    .draft-card {
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      margin-bottom: 0.5rem;
      animation: fadeUp 0.3s ease both;
    }
    .draft-card-title { font-size: 0.7rem; color: var(--t4); margin-bottom: 0.35rem; }
    .draft-card-text { font-size: 0.8rem; color: var(--t1); line-height: 1.4; white-space: pre-wrap; }
    .draft-card-actions { display: flex; gap: 0.35rem; margin-top: 0.5rem; }
    .draft-btn {
      font-family: var(--font); font-size: 0.7rem; font-weight: 600;
      padding: 4px 12px; border-radius: 6px; cursor: pointer; border: 1px solid;
    }
    .draft-btn.approve { background: var(--green-soft); color: var(--green); border-color: var(--green-border); }
    .draft-btn.reject { background: var(--red-soft); color: var(--red); border-color: var(--red-border); }
    .draft-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Progress bar */
    .progress-bar { width: 80px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--green); border-radius: 2px; }

    /* Content status badge */
    .content-badge {
      display: inline-block; font-family: var(--mono); font-size: 0.65rem; font-weight: 600;
      padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .content-badge.drafts_ready { background: var(--yellow-soft); color: var(--yellow); border: 1px solid var(--yellow-border); }
    .content-badge.approved { background: var(--green-soft); color: var(--green); border: 1px solid var(--green-border); }
    .content-badge.pending, .content-badge.processing { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-border); }
    .content-badge.draft { background: var(--surface-hover); color: var(--t3); border: 1px solid var(--border); }
    .content-badge.rejected, .content-badge.failed { background: var(--red-soft); color: var(--red); border: 1px solid var(--red-border); }

    .platform-col-header { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.75rem; }
    .platform-col-header svg { width: 16px; height: 16px; color: var(--accent); }
    .platform-col-header span { font-size: 0.85rem; font-weight: 600; color: var(--t0); }

    @media (max-width: 768px) {
      .container { padding: 1.25rem 1rem; }
      .card-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-grid.five { grid-template-columns: repeat(2, 1fr); }
      .nav-tabs { display: none; }
      .nav-tabs-mobile { display: flex !important; }
      .lead-form { grid-template-columns: 1fr; }
      .data-table { font-size: 0.75rem; }
      .data-table th, .data-table td { padding: 0.5rem 0.6rem; }
      .cf-platform-grid { grid-template-columns: 1fr !important; }
    }

    .nav-tabs-mobile {
      display: none;
      gap: 0.25rem;
      padding: 0.75rem 1.5rem;
      max-width: 1120px;
      margin: 0 auto;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-left">
        <div class="nav-brand">
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div class="nav-title">Ops<span>Pulse</span></div>
        </div>
        <div class="nav-tabs" id="nav-tabs">
          <button class="nav-tab active" data-tab="domainpulse">DomainPulse</button>
          <button class="nav-tab" data-tab="leadrouter">Lead Router</button>
          <button class="nav-tab" data-tab="contentflow">Content Flow</button>
        </div>
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

  <div class="nav-tabs-mobile" id="nav-tabs-mobile">
    <button class="nav-tab active" data-tab="domainpulse">DomainPulse</button>
    <button class="nav-tab" data-tab="leadrouter">Lead Router</button>
    <button class="nav-tab" data-tab="contentflow">Content Flow</button>
  </div>

  <div class="container">

    <!-- ==================== DOMAINPULSE TAB ==================== -->
    <div class="tab-panel active" id="panel-domainpulse">
      <div style="margin-bottom: 1.5rem">
        <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--t0); margin-bottom: 0.25rem">Domain Health</h1>
        <p style="color: var(--t3); font-size: 0.85rem">Monitor DNS & email deliverability for your sending domains</p>
      </div>

      <div class="stats-grid" id="dp-stats">
        <div class="stat-card"><div class="stat-value" id="dp-count">--</div><div class="stat-label">Tracked</div></div>
        <div class="stat-card"><div class="stat-value" id="dp-healthy">--</div><div class="stat-label">Healthy</div></div>
        <div class="stat-card"><div class="stat-value" id="dp-issues">--</div><div class="stat-label">Issues</div></div>
        <div class="stat-card"><div class="stat-value" id="dp-updated">--</div><div class="stat-label">Last check</div></div>
      </div>

      <div id="dp-grid" class="card-grid">
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

    <!-- ==================== LEAD ROUTER TAB ==================== -->
    <div class="tab-panel" id="panel-leadrouter">
      <div style="margin-bottom: 1.5rem">
        <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--t0); margin-bottom: 0.25rem">Lead Router</h1>
        <p style="color: var(--t3); font-size: 0.85rem">Inbound lead scoring, routing & enrichment pipeline</p>
      </div>

      <div class="stats-grid five" id="lr-stats">
        <div class="stat-card"><div class="stat-value" id="lr-total">--</div><div class="stat-label">Total Leads</div></div>
        <div class="stat-card"><div class="stat-value" id="lr-hot" style="color:var(--green)">--</div><div class="stat-label">Hot</div></div>
        <div class="stat-card"><div class="stat-value" id="lr-warm" style="color:var(--yellow)">--</div><div class="stat-label">Warm</div></div>
        <div class="stat-card"><div class="stat-value" id="lr-cold" style="color:var(--t3)">--</div><div class="stat-label">Cold</div></div>
        <div class="stat-card"><div class="stat-value" id="lr-avg" style="color:var(--accent)">--</div><div class="stat-label">Avg Score</div></div>
      </div>

      <div class="card" style="padding:0; overflow:hidden; margin-bottom: 2rem">
        <table class="data-table" id="lr-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Role</th>
              <th>Score</th>
              <th>Tier</th>
              <th>Routed To</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody id="lr-tbody">
            <tr><td colspan="7" class="loading">Loading leads...</td></tr>
          </tbody>
        </table>
      </div>

      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 2rem" id="lr-enrich-stats">
        <div class="stat-card"><div class="stat-value" id="lr-e-completed" style="color:var(--green)">--</div><div class="stat-label">Completed</div></div>
        <div class="stat-card"><div class="stat-value" id="lr-e-partial" style="color:var(--yellow)">--</div><div class="stat-label">Partial</div></div>
        <div class="stat-card"><div class="stat-value" id="lr-e-failed" style="color:var(--red)">--</div><div class="stat-label">Failed</div></div>
        <div class="stat-card"><div class="stat-value" id="lr-e-total">--</div><div class="stat-label">Total Jobs</div></div>
      </div>

      <div class="tool-section" style="margin-top:0; border-top: 1px solid var(--border); padding-top: 2rem">
        <div class="section-header">
          <span class="section-num">01</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          <h2>Submit Lead</h2>
        </div>
        <p>Submit an inbound lead for scoring and routing.</p>
        <div class="lead-form" id="lead-form">
          <input type="text" id="lead-name" placeholder="Full name" />
          <input type="email" id="lead-email" placeholder="Email address" />
          <input type="text" id="lead-company" placeholder="Company name" />
          <input type="text" id="lead-role" placeholder="Role / Title" />
          <select id="lead-size">
            <option value="" disabled selected>Company size</option>
            <option value="1-10">1-10</option>
            <option value="10-50">10-50</option>
            <option value="50-200">50-200</option>
            <option value="200-1000">200-1000</option>
            <option value="1000+">1000+</option>
          </select>
          <select id="lead-budget">
            <option value="" disabled selected>Budget range</option>
            <option value="under-1k">Under $1k</option>
            <option value="1k-5k">$1k-$5k</option>
            <option value="5k-15k">$5k-$15k</option>
            <option value="15k-50k">$15k-$50k</option>
            <option value="50k+">$50k+</option>
          </select>
          <textarea id="lead-message" class="full-width" placeholder="Message / what are they looking for?"></textarea>
          <div class="full-width" style="display:flex; gap:0.5rem; align-items:center">
            <button class="btn-primary" id="lead-btn" onclick="submitLead()">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Submit Lead
            </button>
            <span class="tool-msg" id="lead-msg"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== CONTENT FLOW TAB ==================== -->
    <div class="tab-panel" id="panel-contentflow">
      <div style="margin-bottom: 1.5rem">
        <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--t0); margin-bottom: 0.25rem">Content Flow</h1>
        <p style="color: var(--t3); font-size: 0.85rem">Multi-channel content distribution &mdash; LinkedIn, Twitter/X, and email newsletter</p>
      </div>

      <div class="stats-grid" id="cf-stats">
        <div class="stat-card"><div class="stat-value" id="cf-total">--</div><div class="stat-label">Total Content</div></div>
        <div class="stat-card"><div class="stat-value" id="cf-drafts" style="color:var(--yellow)">--</div><div class="stat-label">Drafts Ready</div></div>
        <div class="stat-card"><div class="stat-value" id="cf-approved" style="color:var(--green)">--</div><div class="stat-label">Approved</div></div>
        <div class="stat-card"><div class="stat-value" id="cf-pending" style="color:var(--accent)">--</div><div class="stat-label">Pending</div></div>
      </div>

      <!-- Content items -->
      <div style="margin-bottom: 2rem">
        <div class="section-header" style="margin-bottom: 0.3rem">
          <span class="section-num">01</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <h2>Content Items</h2>
        </div>
        <p style="font-size:0.8rem;color:var(--t3);margin-bottom:1rem">Recent content submissions and their draft status</p>
        <div class="card-grid" id="cf-content-grid">
          <div class="loading">Loading content...</div>
        </div>
      </div>

      <!-- Drafts by platform -->
      <div style="margin-bottom: 2rem">
        <div class="section-header" style="margin-bottom: 0.3rem">
          <span class="section-num">02</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <h2>Drafts by Platform</h2>
        </div>
        <p style="font-size:0.8rem;color:var(--t3);margin-bottom:1rem">Review and approve content drafts</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem" class="cf-platform-grid" id="cf-drafts-grid">
          <div class="loading">Loading drafts...</div>
        </div>
      </div>

      <!-- Submit content form -->
      <div class="tool-section" style="margin-top:0; border-top: 1px solid var(--border); padding-top: 2rem">
        <div class="section-header">
          <span class="section-num">03</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <h2>Submit Content</h2>
        </div>
        <p>Paste an article or blog post to generate LinkedIn, Twitter, and email drafts.</p>
        <div class="lead-form" id="content-form" style="max-width:600px">
          <input type="text" id="cf-title" placeholder="Content title" class="full-width" />
          <input type="text" id="cf-url" placeholder="URL (optional)" />
          <select id="cf-type">
            <option value="blog_post">Blog Post</option>
            <option value="case_study">Case Study</option>
            <option value="news">News</option>
            <option value="guide">Guide</option>
          </select>
          <textarea id="cf-content" class="full-width" placeholder="Paste the full article content here..." style="min-height:120px"></textarea>
          <div class="full-width" style="display:flex; gap:0.5rem; align-items:center">
            <button class="btn-primary" id="cf-btn" onclick="submitContent()">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Generate Drafts
            </button>
            <span class="tool-msg" id="cf-msg"></span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="footer">
    <div class="footer-brand">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      <span>Ops<em>Pulse</em></span>
    </div>
    <p>Unified operations dashboard</p>
  </div>

  <script>
    /* ---- SVG icons ---- */
    const icons = {
      check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
      minus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
      globe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
    };

    /* ---- Tab switching ---- */
    function switchTab(tabId) {
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.getElementById('panel-' + tabId).classList.add('active');
      document.querySelectorAll('[data-tab="' + tabId + '"]').forEach(t => t.classList.add('active'));
    }
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    /* ---- Helpers ---- */
    const esc = s => String(s || '--').replace(/</g, '&lt;');

    function timeAgo(dateStr) {
      if (!dateStr) return '\\u2014';
      const now = new Date();
      const then = new Date(dateStr);
      const diff = Math.floor((now - then) / 1000);
      if (diff < 60) return diff + 's ago';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      return Math.floor(diff / 86400) + 'd ago';
    }

    function scoreColor(score) {
      if (score >= 80) return 'var(--green)';
      if (score >= 50) return 'var(--yellow)';
      return 'var(--red)';
    }

    /* ==================== DOMAINPULSE ==================== */

    async function fetchDomainStatus() {
      try {
        const resp = await fetch('/api/status');
        if (!resp.ok) throw new Error('API returned ' + resp.status);
        const data = await resp.json();
        renderDomains(data);
      } catch (err) {
        document.getElementById('dp-grid').innerHTML = '<div class="error">Failed to load: ' + err.message + '</div>';
      }
    }

    function renderDomains(data) {
      const grid = document.getElementById('dp-grid');
      const domains = data.domains || [];
      const healthy = domains.filter(d => (d.status || '').toLowerCase() === 'healthy').length;
      const issues = domains.length - healthy;

      document.getElementById('dp-count').textContent = data.checked_count || domains.length;
      document.getElementById('dp-healthy').textContent = healthy;
      document.getElementById('dp-issues').textContent = issues;

      if (data.last_updated) {
        const d = new Date(data.last_updated);
        document.getElementById('dp-updated').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      if (domains.length === 0) {
        grid.innerHTML = '<div class="loading">No domain checks yet. Run the Domain Watchdog workflow first.</div>';
        return;
      }

      grid.innerHTML = domains.map((d, i) => {
        const status = (d.status || 'unknown').toLowerCase();
        const ci = (val) => {
          if (val === true) return '<div class="check check-pass"><div class="check-icon">' + icons.check + '</div>';
          if (val === false) return '<div class="check check-fail"><div class="check-icon">' + icons.x + '</div>';
          return '<div class="check check-na"><div class="check-icon">' + icons.minus + '</div>';
        };
        const checked = d.checked_at ? new Date(d.checked_at).toLocaleString() : 'Never';

        return '<div class="card" style="animation-delay:' + (i * 0.05) + 's">' +
          '<div class="card-header">' +
            '<div class="card-domain">' + icons.globe + '<span class="card-domain-text">' + esc(d.domain) + '</span></div>' +
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
        if (data.error) { msg.className = 'tool-msg err'; msg.textContent = data.error; }
        else { renderEnrichment(data, result); }
      } catch (err) { msg.className = 'tool-msg err'; msg.textContent = 'Failed: ' + err.message; }

      btn.disabled = false;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Enrich';
    }

    function renderEnrichment(data, container) {
      let html = '';
      const statusClass = data.status === 'completed' ? '' : data.status === 'partial' ? ' partial' : ' failed';
      const statusIcon = data.status === 'completed' ? icons.check : icons.x;
      html += '<div class="enrich-status-bar' + statusClass + '">' + statusIcon + ' <span>Enrichment ' + esc(data.status) + ' for <strong>' + esc(data.domain) + '</strong></span></div>';
      html += '<div class="enrich-grid">';

      if (data.company_data) {
        const c = data.company_data;
        html += '<div class="enrich-card"><div class="enrich-card-header"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg><span>Company</span></div>';
        [['name','Name'],['industry','Industry'],['employee_count_range','Size'],['headquarters','HQ'],['founded_year','Founded'],['website','Website']].forEach(([k,l]) => {
          if (c[k]) html += '<div class="enrich-row"><span class="enrich-key">' + l + '</span><span class="enrich-val">' + esc(c[k]) + '</span></div>';
        });
        if (c.description) html += '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--t3);line-height:1.4">' + esc(c.description) + '</div>';
        html += '</div>';
      }

      if (data.tech_stack) {
        const t = data.tech_stack;
        html += '<div class="enrich-card"><div class="enrich-card-header"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg><span>Tech Stack</span></div>';
        [['cms','CMS'],['crm','CRM'],['analytics','Analytics'],['email_platform','Email'],['marketing_automation','Marketing'],['hosting','Hosting'],['frontend_framework','Frontend']].forEach(([k,l]) => {
          if (t[k]) html += '<div class="enrich-row"><span class="enrich-key">' + l + '</span><span class="enrich-val">' + esc(t[k]) + '</span></div>';
        });
        if (t.other_tools) {
          const tools = Array.isArray(t.other_tools) ? t.other_tools.join(', ') : t.other_tools;
          html += '<div class="enrich-row"><span class="enrich-key">Other</span><span class="enrich-val">' + esc(tools) + '</span></div>';
        }
        html += '</div>';
      }

      if (data.contacts) {
        const contacts = Array.isArray(data.contacts) ? data.contacts : [];
        html += '<div class="enrich-card"><div class="enrich-card-header"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Key Contacts</span></div>';
        contacts.forEach(c => {
          html += '<div class="enrich-contact">';
          html += '<div class="enrich-contact-name">' + esc(c.name) + '</div>';
          html += '<div class="enrich-contact-title">' + esc(c.title) + (c.department ? ' \\u00b7 ' + esc(c.department) : '') + '</div>';
          if (c.likely_email_pattern) html += '<div class="enrich-contact-email">' + esc(c.likely_email_pattern) + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
      container.innerHTML = html;
      container.className = 'enrich-result visible';
    }

    /* ==================== LEAD ROUTER ==================== */

    async function fetchLeadStats() {
      try {
        const resp = await fetch('/api/lead-stats');
        if (!resp.ok) throw new Error('API returned ' + resp.status);
        const data = await resp.json();
        renderLeadStats(data);
      } catch (err) {
        document.getElementById('lr-tbody').innerHTML = '<tr><td colspan="7" class="error">Failed to load: ' + err.message + '</td></tr>';
      }
    }

    function renderLeadStats(data) {
      const s = data.stats || {};
      document.getElementById('lr-total').textContent = s.total_leads || 0;
      document.getElementById('lr-hot').textContent = s.hot_leads || 0;
      document.getElementById('lr-warm').textContent = s.warm_leads || 0;
      document.getElementById('lr-cold').textContent = s.cold_leads || 0;
      document.getElementById('lr-avg').textContent = s.avg_score || 0;

      const e = data.enrichment || {};
      document.getElementById('lr-e-completed').textContent = e.completed || 0;
      document.getElementById('lr-e-partial').textContent = e.partial || 0;
      document.getElementById('lr-e-failed').textContent = e.failed || 0;
      document.getElementById('lr-e-total').textContent = e.total_jobs || 0;

      const leads = data.recent_leads || [];
      const tbody = document.getElementById('lr-tbody');

      if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding:3rem;text-align:center;color:var(--t3)">No leads yet. Use the form below to submit one.</td></tr>';
        return;
      }

      tbody.innerHTML = leads.map(l => {
        return '<tr>' +
          '<td style="font-weight:500;color:var(--t0)">' + esc(l.name) + '</td>' +
          '<td style="color:var(--t2)">' + esc(l.company) + '</td>' +
          '<td style="color:var(--t3)">' + esc(l.role) + '</td>' +
          '<td><span style="font-family:var(--mono);font-weight:600;color:' + scoreColor(l.score) + '">' + (l.score || 0) + '</span></td>' +
          '<td><span class="badge ' + (l.tier || 'cold') + '">' + esc(l.tier) + '</span></td>' +
          '<td style="color:var(--t3);font-size:0.8rem">' + esc(l.routed_to) + '</td>' +
          '<td style="color:var(--t4);font-size:0.8rem;font-family:var(--mono)">' + timeAgo(l.created_at) + '</td>' +
        '</tr>';
      }).join('');
    }

    async function submitLead() {
      const msg = document.getElementById('lead-msg');
      const btn = document.getElementById('lead-btn');
      const name = document.getElementById('lead-name').value.trim();
      const email = document.getElementById('lead-email').value.trim();
      const company = document.getElementById('lead-company').value.trim();
      const role = document.getElementById('lead-role').value.trim();
      const company_size = document.getElementById('lead-size').value;
      const budget = document.getElementById('lead-budget').value;
      const message = document.getElementById('lead-message').value.trim();

      if (!email) { msg.className = 'tool-msg err'; msg.textContent = 'Email is required'; return; }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Submitting...';
      msg.className = 'tool-msg'; msg.textContent = '';

      try {
        const resp = await fetch('/api/inbound-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, company, role, company_size, budget, message, source: 'ops_dashboard' })
        });
        const data = await resp.json();
        if (data.error) {
          msg.className = 'tool-msg err'; msg.textContent = data.error;
        } else {
          const tier = data.tier || 'unknown';
          const score = data.score || '?';
          msg.className = 'tool-msg ok';
          msg.textContent = 'Lead scored ' + score + ' (' + tier + ') — routed to ' + (data.routed_to || 'queue');
          document.getElementById('lead-name').value = '';
          document.getElementById('lead-email').value = '';
          document.getElementById('lead-company').value = '';
          document.getElementById('lead-role').value = '';
          document.getElementById('lead-size').selectedIndex = 0;
          document.getElementById('lead-budget').selectedIndex = 0;
          document.getElementById('lead-message').value = '';
          fetchLeadStats();
        }
      } catch (err) {
        msg.className = 'tool-msg err'; msg.textContent = 'Failed: ' + err.message;
      }

      btn.disabled = false;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Lead';
    }

    /* ---- Enter key handlers ---- */
    document.getElementById('add-domain').addEventListener('keydown', e => { if (e.key === 'Enter') addDomain(); });
    document.getElementById('enrich-domain').addEventListener('keydown', e => { if (e.key === 'Enter') enrichDomain(); });

    /* ==================== CONTENT FLOW ==================== */

    const platformIcons = {
      linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
      twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>',
      email_newsletter: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
    };
    const platformLabels = { linkedin: 'LinkedIn', twitter: 'Twitter/X', email_newsletter: 'Email Newsletter' };

    async function fetchContentStats() {
      try {
        const resp = await fetch('/api/content-stats');
        if (!resp.ok) throw new Error('API returned ' + resp.status);
        const data = await resp.json();
        renderContentStats(data);
      } catch (err) {
        document.getElementById('cf-content-grid').innerHTML = '<div class="error">Failed to load: ' + err.message + '</div>';
      }
    }

    function renderContentStats(data) {
      const s = data.stats || {};
      document.getElementById('cf-total').textContent = s.total_content || 0;
      document.getElementById('cf-drafts').textContent = s.drafts_ready || 0;
      document.getElementById('cf-approved').textContent = s.approved || 0;
      document.getElementById('cf-pending').textContent = (s.pending || 0) + (s.processing || 0);

      const content = data.recent_content || [];
      const grid = document.getElementById('cf-content-grid');

      if (content.length === 0) {
        grid.innerHTML = '<div style="padding:3rem;text-align:center;color:var(--t3)">No content yet. Use the form below to submit your first article.</div>';
      } else {
        grid.innerHTML = content.map((c, i) => {
          const approved = Number(c.approved_drafts) || 0;
          const total = Number(c.total_drafts) || 0;
          const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
          const title = c.url
            ? '<a href="' + esc(c.url) + '" target="_blank" style="color:var(--t0);text-decoration:none;font-weight:600">' + esc(c.title) + '</a>'
            : '<span style="font-weight:600;color:var(--t0)">' + esc(c.title) + '</span>';
          return '<div class="card" style="animation-delay:' + (i * 0.05) + 's">' +
            '<div style="margin-bottom:0.75rem">' + title +
              '<div style="display:flex;gap:0.5rem;margin-top:0.35rem;align-items:center">' +
                '<span class="content-badge ' + (c.content_status || 'pending') + '">' + esc(c.content_status) + '</span>' +
                '<span class="content-badge" style="background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent-border)">' + esc(c.source_type) + '</span>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
              '<div style="font-size:0.8rem;color:var(--t2)">' + approved + '/' + total + ' approved</div>' +
              '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
            '</div>' +
            '<div style="margin-top:0.5rem;font-size:0.7rem;color:var(--t4)">' + timeAgo(c.created_at) + '</div>' +
          '</div>';
        }).join('');
      }

      // Drafts by platform
      const drafts = data.drafts || [];
      const platforms = ['linkedin', 'twitter', 'email_newsletter'];
      const draftsGrid = document.getElementById('cf-drafts-grid');

      // Deduplicate drafts by draft_id
      const seen = new Set();
      const uniqueDrafts = drafts.filter(d => {
        if (seen.has(d.draft_id)) return false;
        seen.add(d.draft_id);
        return true;
      });

      draftsGrid.innerHTML = platforms.map(p => {
        const filtered = uniqueDrafts.filter(d => d.platform === p);
        const header = '<div class="platform-col-header">' + (platformIcons[p] || '') + '<span>' + (platformLabels[p] || p) + '</span></div>';
        if (filtered.length === 0) return '<div>' + header + '<div style="padding:1.5rem;text-align:center;color:var(--t4);font-size:0.8rem">No drafts</div></div>';
        const cards = filtered.map((d, i) => {
          const preview = esc((d.draft_text || '').substring(0, 200));
          const more = (d.draft_text || '').length > 200 ? '...' : '';
          const approvedAt = d.approved_at ? '<div style="font-size:0.65rem;color:var(--green);margin-top:0.35rem">Approved ' + timeAgo(d.approved_at) + '</div>' : '';
          const actions = d.status === 'draft' ?
            '<div class="draft-card-actions">' +
              '<button class="draft-btn approve" onclick="approveDraft(' + d.draft_id + ',\\'approve\\')">Approve</button>' +
              '<button class="draft-btn reject" onclick="approveDraft(' + d.draft_id + ',\\'reject\\')">Reject</button>' +
            '</div>' : '';
          return '<div class="draft-card" style="animation-delay:' + (i * 0.05) + 's">' +
            '<div class="draft-card-title">' + esc(d.content_title) + '</div>' +
            '<div class="draft-card-text">' + preview + more + '</div>' +
            '<div style="margin-top:0.35rem"><span class="content-badge ' + (d.status || 'draft') + '">' + esc(d.status) + '</span></div>' +
            approvedAt + actions +
          '</div>';
        }).join('');
        return '<div>' + header + cards + '</div>';
      }).join('');
    }

    async function submitContent() {
      const msg = document.getElementById('cf-msg');
      const btn = document.getElementById('cf-btn');
      const title = document.getElementById('cf-title').value.trim();
      const content = document.getElementById('cf-content').value.trim();
      const url = document.getElementById('cf-url').value.trim();
      const source_type = document.getElementById('cf-type').value;

      if (!title || !content) { msg.className = 'tool-msg err'; msg.textContent = 'Title and content are required'; return; }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Generating...';
      msg.className = 'tool-msg'; msg.textContent = '';

      try {
        const resp = await fetch('/api/new-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, url, source_type })
        });
        const data = await resp.json();
        if (data.error) {
          msg.className = 'tool-msg err'; msg.textContent = data.error;
        } else {
          const platforms = data.platforms || {};
          const ok = Object.values(platforms).filter(Boolean).length;
          msg.className = 'tool-msg ok';
          msg.textContent = 'Generated ' + ok + '/3 drafts for content #' + data.content_id;
          document.getElementById('cf-title').value = '';
          document.getElementById('cf-url').value = '';
          document.getElementById('cf-content').value = '';
          fetchContentStats();
        }
      } catch (err) {
        msg.className = 'tool-msg err'; msg.textContent = 'Failed: ' + err.message;
      }

      btn.disabled = false;
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Generate Drafts';
    }

    async function approveDraft(draftId, action) {
      const btn = event.target;
      btn.disabled = true;
      btn.textContent = action === 'approve' ? 'Approving...' : 'Rejecting...';
      try {
        const resp = await fetch('/api/approve-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draft_id: draftId, action: action })
        });
        if (resp.ok) {
          fetchContentStats();
        } else {
          btn.disabled = false;
          btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
        }
      } catch (e) {
        btn.disabled = false;
        btn.textContent = action === 'approve' ? 'Approve' : 'Reject';
      }
    }

    /* ---- Initial fetch & auto-refresh ---- */
    fetchDomainStatus();
    fetchLeadStats();
    fetchContentStats();
    setInterval(() => {
      fetchDomainStatus();
      fetchLeadStats();
      fetchContentStats();
    }, 60000);
  </script>
</body>
</html>`;
}

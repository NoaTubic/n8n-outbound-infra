# OpsPulse

Production B2B operations platform built on n8n, Railway, PostgreSQL, and Cloudflare Workers. Three integrated tools for domain health monitoring, inbound lead routing, and AI-powered content distribution.

**[Live Dashboard](https://ops-pulse.noatubic.workers.dev)**

## What It Does

### DomainPulse — Domain Health Monitoring
Automated daily checks of SPF, DKIM, DMARC, and MX records across all sending domains. Detects misconfigurations before they tank deliverability. Add domains and run lead enrichment directly from the dashboard.

### Lead Router — Inbound Lead Scoring
Webhook-based lead intake with rule-based scoring (company size, role, budget, message quality). AI-powered ICP matching classifies leads into hot/warm/cold tiers, routes them to the right queue, and generates personalized auto-replies.

### Content Flow — Multi-Channel Distribution
Paste an article and get AI-generated drafts for LinkedIn, Twitter/X, and email newsletter. Review drafts side-by-side, approve or reject per platform, and track content status through the pipeline.

## Architecture

```
                     Cloudflare Workers
                          |
                    +-----v-----------+
                    |   OpsPulse      |  Edge Dashboard
                    |   Dashboard     |  + API Proxy
                    +-----+-----------+
                          |
                    +-----v-----+
                    |   n8n     |  Railway
                    +-----+-----+
                          |
                    +-----v-----+
                    | PostgreSQL |  Railway
                    +-----------+

n8n Workflows (12 active):
  DomainPulse:
    1. Lead Enrichment Pipeline  - POST /webhook/enrich       (18 nodes)
    2. Domain Watchdog           - Cron daily 07:00 UTC       (18 nodes)
    3. Domain Status API         - GET  /webhook/domain-status (7 nodes)

  Lead Router:
    4. Inbound Lead Router       - POST /webhook/inbound-lead (20 nodes)
    5. Lead Dashboard            - GET  /webhook/leads         (6 nodes)
    6. Lead Stats API            - GET  /webhook/lead-stats    (6 nodes)

  Content Flow:
    7. Content Distribution      - POST /webhook/new-content  (17 nodes)
    8. Content Approval API      - POST /webhook/approve-content (11 nodes)
    9. Content Dashboard         - GET  /webhook/content       (6 nodes)
   10. Content Stats API         - GET  /webhook/content-stats  (6 nodes)
```

## Workflows

### Lead Enrichment Pipeline
Webhook-triggered pipeline that enriches a company domain using 3 parallel LLM branches (Groq, llama-3.3-70b-versatile):
- Company data (name, industry, size, HQ, description)
- Tech stack (CMS, CRM, analytics, email, hosting)
- Key contacts (3 decision-makers with titles and email patterns)

Features: idempotency (daily dedup), partial success handling, full error audit trail in PostgreSQL.

### Domain Watchdog
Daily cron job checking DNS health for all monitored domains:
- **SPF** — Record exists, no dangerous `+all`
- **DKIM** — Key present on google selector
- **DMARC** — Record exists, policy value checked
- **MX** — Mail exchange records present

Compares with previous results, classifies as healthy/warning/critical, generates alerts on status changes.

### Inbound Lead Router
Scores inbound leads on 4 factors (company size, role, budget, message quality) up to 120 points. Uses Groq for ICP matching. Routes:
- **Hot** (80+) — `sales_urgent`, notification + auto-reply
- **Warm** (50-79) — `sales_queue`, notification + auto-reply
- **Cold** (<50) — `nurture`, no notification

Deduplicates by email + date.

### Content Distribution Pipeline
Takes article content and generates platform-specific drafts via 3 parallel Groq branches:
- **LinkedIn** — Professional hook opener, <1300 chars
- **Twitter/X** — Punchy thread, max 3 tweets, <280 chars each
- **Email Newsletter** — 2-3 sentence summary + CTA

Drafts are stored in PostgreSQL with approve/reject workflow. When all drafts for a content item are approved, the parent item is automatically marked as approved.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Workflow Engine | n8n on Railway |
| Database | PostgreSQL on Railway (SSL) |
| LLM | Groq (llama-3.3-70b-versatile) |
| DNS Checks | Google Public DNS API |
| Dashboard | Cloudflare Workers (edge-served SPA) |
| Auth | Bearer token for status API |

## Setup

### Prerequisites
- Railway account with n8n deployed
- Groq API key (free at [console.groq.com](https://console.groq.com))
- Cloudflare account (for dashboard)

### 1. Database
Run the schema workflows in n8n to create tables:
- `db/schema.sql` — Domain monitoring + enrichment tables
- `db/schema-lead-router.sql` — Lead routing tables
- `db/schema-content.sql` — Content pipeline tables

### 2. Credentials
Configure in n8n:
- **PostgreSQL** — Railway connection string (SSL enabled)
- **Groq** — Add as predefined credential type

### 3. Activate Workflows
Activate all workflows in the n8n UI. The domain watchdog runs automatically at 07:00 UTC. All webhook-based workflows are ready once activated.

### 4. Deploy Dashboard
```bash
cd ops-worker
npm install
npx wrangler login
npx wrangler deploy
```

## Project Structure

```
coldiq-n8n-infra/
  db/
    schema.sql                     - Domain + enrichment tables
    schema-lead-router.sql         - Lead routing tables
    schema-content.sql             - Content pipeline tables
  workflows/
    lead-enrichment.json           - Enrichment pipeline (18 nodes)
    domain-watchdog.json           - DNS health monitor (18 nodes)
    status-api.json                - Status endpoint (7 nodes)
    inbound-lead-router.json       - Lead scoring + routing (20 nodes)
    lead-dashboard.json            - Lead HTML dashboard (6 nodes)
    content-distribution.json      - Content draft generation (17 nodes)
    content-approval-api.json      - Approve/reject API (11 nodes)
    content-dashboard.json         - Content HTML dashboard (6 nodes)
  ops-worker/
    src/index.js                   - OpsPulse unified dashboard + API proxy
    wrangler.toml                  - Cloudflare config
  docs/
    ARCHITECTURE.md                - Data flow + dependency map
    WORKFLOWS.md                   - Detailed workflow documentation
    RUNBOOK.md                     - Operations runbook
  .env.example
```

## Environment Variables

See `.env.example` for the full list:
- `GROQ_API_KEY` — For lead enrichment + content generation
- `STATUS_API_KEY` — Bearer token for domain status API
- `N8N_BASE_URL` — n8n instance URL (used by Cloudflare Worker)

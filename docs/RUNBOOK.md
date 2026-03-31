# Operations Runbook

## Checking Workflow Status

### Via n8n UI
1. Go to https://n8n-production-7e59.up.railway.app
2. Navigate to Workflows
3. Green toggle = active, grey = inactive

### Via n8n API
```bash
curl -s -H "X-N8N-API-KEY: <your-api-key>" \
  https://n8n-production-7e59.up.railway.app/api/v1/workflows | jq '.data[] | {name, active}'
```

## Manual Operations

### Trigger a Domain Check
The Domain Watchdog runs daily at 07:00 UTC. To run it manually:
1. Open the Domain Watchdog workflow in n8n
2. Click "Test workflow" (play button)
3. It will check all active domains and store results

### Test Lead Enrichment
```bash
curl -X POST https://n8n-production-7e59.up.railway.app/webhook/enrich \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### Check Domain Status API
```bash
curl -H "Authorization: Bearer demo-key-change-me" \
  https://n8n-production-7e59.up.railway.app/webhook/domain-status
```

### Add a New Domain to Monitoring
```sql
INSERT INTO monitored_domains (domain, owner_name)
VALUES ('newdomain.com', 'Owner Name');
```
Or via n8n: create a simple workflow with a Postgres node to run this query.

### Remove a Domain from Monitoring
```sql
UPDATE monitored_domains SET is_active = false WHERE domain = 'olddomain.com';
```

## Debugging

### Failed Enrichment Job
1. Check the `enrichment_jobs` table:
```sql
SELECT id, input_domain, status, enrichment_steps, error_log, created_at
FROM enrichment_jobs
WHERE status IN ('failed', 'partial')
ORDER BY created_at DESC LIMIT 10;
```
2. The `error_log` JSONB column contains per-step error details
3. Check if the error is transient (retryable) or permanent
4. For transient errors: wait and re-trigger with the same domain (next day for fresh idempotency key, or delete the job record)

### Domain Watchdog Not Running
1. Verify the workflow is active in n8n UI
2. Check execution history: Workflows > Domain Watchdog > Executions
3. Look for failed executions and check error messages
4. Common issue: PostgreSQL credential expired/changed

### No Data on Dashboard
1. Verify Domain Watchdog has run at least once
2. Check Status API directly: `curl -H "Authorization: Bearer ..." /webhook/domain-status`
3. If API returns empty, check `domain_checks` table has rows
4. If Cloudflare Worker fails, check `wrangler tail` for errors

## Inbound Lead Router

### Test Lead Router
```bash
# Hot lead (score >= 80)
curl -X POST https://n8n-production-7e59.up.railway.app/webhook/inbound-lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@dataflow.io",
    "name": "Sarah Chen",
    "company": "DataFlow",
    "role": "VP Marketing",
    "company_size": "200-1000",
    "budget": "15k-50k",
    "message": "We are doing 10 meetings per month and want to 3x that. We have budget allocated for Q2 and need a partner who can build the full outbound system end to end.",
    "source": "website_form"
  }'

# Warm lead (score 50-79)
curl -X POST https://n8n-production-7e59.up.railway.app/webhook/inbound-lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mike@startupco.com",
    "name": "Mike Johnson",
    "company": "StartupCo",
    "role": "Head of Growth",
    "company_size": "50-200",
    "budget": "5k-15k",
    "message": "Interested in learning more about your outbound services.",
    "source": "linkedin"
  }'

# Cold lead (score < 50)
curl -X POST https://n8n-production-7e59.up.railway.app/webhook/inbound-lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@gmail.com",
    "name": "Test User",
    "company": "None",
    "role": "Student",
    "company_size": "1-10",
    "budget": "under-1k",
    "message": "Hi",
    "source": "website_form"
  }'
```

### View Lead Dashboard
Open in browser:
```
https://n8n-production-7e59.up.railway.app/webhook/leads
```

### Check Lead Scores in PostgreSQL
```sql
-- Recent leads with scores
SELECT id, name, company, score, tier, routed_to, created_at
FROM inbound_leads ORDER BY created_at DESC LIMIT 20;

-- Score distribution
SELECT tier, COUNT(*), ROUND(AVG(score)) as avg_score
FROM inbound_leads GROUP BY tier;

-- Check scoring breakdown for a specific lead
SELECT name, score, tier, scoring_breakdown, icp_match
FROM inbound_leads WHERE id = <lead_id>;

-- Check auto-reply content
SELECT name, tier, auto_reply, auto_reply_sent
FROM inbound_leads WHERE auto_reply IS NOT NULL ORDER BY created_at DESC;
```

### Idempotency
Leads are deduplicated by email + date. Sending the same email twice in one day returns:
```json
{ "status": "already_processed", "lead_id": 1, "tier": "hot", "score": 85 }
```

---

## OpsPulse — Unified Dashboard

### Access
```
https://ops-pulse.noatubic.workers.dev
```

The unified dashboard combines all tools in one tabbed interface:
- **DomainPulse**: Domain health monitoring, add domains, lead enrichment
- **Lead Router**: Lead stats, recent leads table, submit lead form
- **Content Flow**: Content pipeline stats, content items, drafts by platform with approve/reject, submit content form

### Deploy / Update
```bash
cd ops-worker
npx wrangler deploy
```

### Configuration
Environment variables in `wrangler.toml`:
- `N8N_BASE_URL` — n8n instance URL
- `STATUS_API_KEY` — API key for Domain Status webhook

### Test Lead Stats API
```bash
curl https://n8n-production-7e59.up.railway.app/webhook/lead-stats
```

---

## Content Distribution Pipeline

### Submit New Content
```bash
curl -X POST https://n8n-production-7e59.up.railway.app/webhook/new-content \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to Scale Outbound with AI",
    "url": "https://blog.example.com/scale-outbound-ai",
    "content": "Full article text goes here. The pipeline will generate LinkedIn, Twitter, and email newsletter drafts from this content.",
    "source_type": "blog_post"
  }'
```

### View Content Dashboard
Open in browser:
```
https://n8n-production-7e59.up.railway.app/webhook/content
```

### Approve/Reject a Draft
```bash
# Approve
curl -X POST https://n8n-production-7e59.up.railway.app/webhook/approve-content \
  -H "Content-Type: application/json" \
  -d '{"draft_id": 1, "action": "approve"}'

# Reject
curl -X POST https://n8n-production-7e59.up.railway.app/webhook/approve-content \
  -H "Content-Type: application/json" \
  -d '{"draft_id": 2, "action": "reject"}'
```

### Check Content Pipeline in PostgreSQL
```sql
-- Recent content items with status
SELECT id, title, source_type, status, created_at, processed_at
FROM content_items ORDER BY created_at DESC LIMIT 10;

-- Drafts for a content item
SELECT cd.id, cd.platform, cd.status, LEFT(cd.draft_text, 80) as preview
FROM content_drafts cd WHERE cd.content_id = <content_id>;

-- Overall pipeline stats
SELECT
  (SELECT COUNT(*) FROM content_items) as total_content,
  (SELECT COUNT(*) FROM content_items WHERE status = 'drafts_ready') as drafts_ready,
  (SELECT COUNT(*) FROM content_items WHERE status = 'approved') as approved,
  (SELECT COUNT(*) FROM content_drafts WHERE status = 'draft') as pending_drafts,
  (SELECT COUNT(*) FROM content_drafts WHERE status = 'approved') as approved_drafts;
```

---

## Railway Operations

### Restart n8n
1. Go to Railway dashboard > n8n service
2. Click "Restart" or redeploy from latest commit

### Check Logs
1. Railway dashboard > n8n service > Logs
2. Filter by "error" to find issues

### Database Access
```bash
# Connect to Railway PostgreSQL
railway connect postgres
# Or use the connection string from Railway dashboard
psql $DATABASE_URL
```

### Common Queries
```sql
-- Check latest domain checks
SELECT d.domain, dc.overall_status, dc.checked_at
FROM domain_checks dc
JOIN monitored_domains d ON d.id = dc.domain_id
ORDER BY dc.checked_at DESC LIMIT 20;

-- Check recent alerts
SELECT da.*, d.domain
FROM domain_alerts da
JOIN monitored_domains d ON d.id = da.domain_id
ORDER BY da.created_at DESC LIMIT 20;

-- Check enrichment job stats
SELECT status, COUNT(*) FROM enrichment_jobs GROUP BY status;
```

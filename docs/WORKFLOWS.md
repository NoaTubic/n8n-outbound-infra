# Workflow Documentation

## 1. Lead Enrichment Pipeline

**ID:** `iGimafTZ82tQpkma`
**Trigger:** Webhook POST `/enrich`
**Nodes:** 18

### Input
```json
POST /webhook/enrich
{ "domain": "example.com" }
```

### Output
```json
{
  "job_id": 1,
  "status": "completed",
  "domain": "example.com",
  "company_data": { "name": "...", "industry": "...", ... },
  "tech_stack": { "cms": "...", "crm": "...", ... },
  "contacts": [{ "name": "...", "title": "...", ... }],
  "enrichment_steps": { "company": "ok", "techStack": "ok", "contacts": "ok" }
}
```

### Node Flow
```
Webhook -> Validate & Check Idempotency -> Is Valid?
  -> (invalid) Respond 400
  -> (valid) Check Cache -> Has Cached Result?
    -> (cached) Respond 200 with cached data
    -> (new) Create Job Record -> [3 parallel branches]
      Branch A: Enrich Company Data -> Parse Company Data
      Branch B: Enrich Tech Stack -> Parse Tech Stack
      Branch C: Enrich Contacts -> Parse Contacts
    -> Merge Results -> Determine Status -> Update Job Record -> Respond 200
```

### Error Scenarios
| Scenario | Behavior |
|----------|----------|
| Invalid domain format | Returns 400 immediately |
| Already enriched today | Returns cached result |
| 1 Groq branch fails | Status: 'partial', other data still returned |
| All Groq branches fail | Status: 'failed', error_log populated |
| Groq 429 rate limit | Classified as transient, logged as retryable |

---

## 2. Domain Watchdog

**ID:** `5DhWSRYqPjLsE351`
**Trigger:** Schedule (Cron) daily at 07:00 UTC
**Nodes:** 18

### Flow
```
Daily Schedule -> Get Active Domains -> Split In Batches (1 at a time)
  -> Check SPF -> Parse SPF
  -> Check DMARC -> Parse DMARC
  -> Check MX -> Parse MX
  -> Check DKIM -> Parse DKIM
  -> Determine Status -> Store Check -> Get Previous Check -> Compare Changes
  -> Has Changes?
    -> (yes) Build Alert SQL -> Insert Alerts -> Loop back
    -> (no) Loop back
```

### DNS Checks
| Check | API Call | Validates |
|-------|----------|-----------|
| SPF | `dns.google/resolve?type=TXT` | `v=spf1` record exists, no `+all` |
| DMARC | `dns.google/resolve?name=_dmarc.{domain}&type=TXT` | `v=DMARC1` record, policy value |
| MX | `dns.google/resolve?type=MX` | MX records exist |
| DKIM | `dns.google/resolve?name=google._domainkey.{domain}&type=TXT` | DKIM key on google selector |

### Status Classification
| Status | Conditions |
|--------|-----------|
| healthy | All checks pass |
| warning | DMARC or DKIM missing (but SPF and MX ok) |
| critical | SPF missing, MX missing, or SPF has `+all` |

### Alert Types
`spf_missing`, `dkim_failed`, `dmarc_missing`, `status_change`

---

## 3. Domain Status API

**ID:** `HNVVMf2KdJXeJgxE`
**Trigger:** Webhook GET `/domain-status`
**Nodes:** 7

### Input
```
GET /webhook/domain-status
Authorization: Bearer <STATUS_API_KEY>
```

### Output
```json
{
  "domains": [
    {
      "domain": "example.com",
      "checked_at": "2026-03-31T07:00:00Z",
      "spf_valid": true,
      "dkim_valid": true,
      "dmarc_valid": true,
      "status": "healthy",
      "blacklist_hits": 0,
      "mx_count": 3
    }
  ],
  "checked_count": 5,
  "last_updated": "2026-03-31T07:30:00Z"
}
```

### Flow
```
Webhook -> Auth Check -> Is Authorized?
  -> (no) Respond 401
  -> (yes) Query Latest Status -> Format Response -> Respond 200
```

---

## 4. Inbound Lead Router

**ID:** `Oduqr2AXZwGXfPVQ`
**Trigger:** Webhook POST `/inbound-lead`
**Nodes:** 20

### Input
```json
POST /webhook/inbound-lead
{
  "email": "sarah@dataflow.io",
  "name": "Sarah Chen",
  "company": "DataFlow",
  "role": "VP Marketing",
  "company_size": "50-200",
  "budget": "5k-15k",
  "message": "We're looking to scale our outbound.",
  "source": "website_form"
}
```

### Output
```json
{
  "status": "processed",
  "lead_id": 1,
  "score": 85,
  "tier": "hot",
  "routed_to": "sales_urgent",
  "icp_match": { "icp_score": 8, "fit_reasons": [...], "concerns": [...] },
  "auto_reply": { "subject": "...", "body": "..." }
}
```

### Scoring Logic
| Factor | Values | Points |
|--------|--------|--------|
| Company Size | 1-10: 5, 10-50: 15, 50-200: 25, 200-1000: 30, 1000+: 20 | 5-30 |
| Role | C-suite/Head of: 35, VP/Director/Founder: 30, Manager: 20, Other: 10 | 10-35 |
| Budget | under-1k: 5, 1k-5k: 15, 5k-15k: 25, 15k-50k: 35, 50k+: 30 | 5-35 |
| Message Quality | <50 chars: 5, 50-100: 10, 100-200: 15, 200+: 20 | 5-20 |

### Tier Classification
| Tier | Score Range | Routing |
|------|-------------|---------|
| Hot | >= 80 | `sales_urgent` — notification + auto-reply |
| Warm | 50-79 | `sales_queue` — notification + auto-reply |
| Cold | < 50 | `nurture` — no notification, no reply |

### ICP Matching
Uses Groq to evaluate lead against the Ideal Customer Profile. Returns icp_score (1-10), fit_reasons, concerns, recommended_approach, and personalization_hooks.

### Node Flow
```
Webhook -> Validate & Idempotency -> Is Valid?
  -> (invalid) Respond Error 400
  -> (valid) Check Duplicates -> Is Duplicate?
    -> (duplicate) Respond Already Processed
    -> (new) Score Lead -> ICP Match (OpenAI) -> Parse ICP -> Save Lead (PG)
      -> Route Lead -> Is Hot or Warm?
        -> (hot/warm) Send Notification -> Generate Auto Reply (OpenAI)
          -> Parse Reply -> Update Lead -> Respond Success
        -> (cold) Update Cold Lead -> Respond Cold
```

### Idempotency
Key format: `{email}_{date}` — same email on the same day returns cached result.

### Required Credentials
- PostgreSQL (existing)
- OpenAI API (for ICP Match and Auto Reply nodes)
- Slack/Discord webhook URL (for Send Notification node — currently placeholder)

---

## 5. Lead Dashboard

**ID:** `opLfNUn9IR6bqbxH`
**Trigger:** Webhook GET `/leads`
**Nodes:** 6

### Access
```
GET https://n8n-production-7e59.up.railway.app/webhook/leads
```

### What It Shows
- **Overview cards**: Total leads, hot/warm/cold counts, average score
- **Recent leads table**: Last 15 submissions with name, company, role, score, tier, routing, and time
- **Enrichment pipeline stats**: Completed/partial/failed/total enrichment jobs

### Features
- Follows OpsPulse design system (Instrument Sans, JetBrains Mono, full dark mode support)
- Auto-refreshes every 30 seconds
- Color-coded score and tier badges
- Responsive layout

### Node Flow
```
Webhook GET -> Lead Stats (PG) -> Recent Leads (PG) -> Enrichment Stats (PG)
  -> Generate HTML (Code) -> Respond with HTML
```

---

## 6. Lead Stats API

**ID:** `qnDo94pReWrgOXUl`
**Trigger:** Webhook GET `/lead-stats`
**Nodes:** 6

### Access
```
GET https://n8n-production-7e59.up.railway.app/webhook/lead-stats
```

### Output
```json
{
  "stats": { "total_leads": 3, "hot_leads": 1, "warm_leads": 1, "cold_leads": 1, "avg_score": 62 },
  "recent_leads": [{ "id": 1, "name": "...", "company": "...", "role": "...", "score": 85, "tier": "hot", "routed_to": "sales_urgent", "created_at": "..." }],
  "enrichment": { "total_jobs": 5, "completed": 4, "partial": 1, "failed": 0 }
}
```

### What It Does
Returns the same data as the Lead Dashboard (workflow `opLfNUn9IR6bqbxH`) but as JSON instead of HTML. Used by the OpsPulse unified dashboard (Cloudflare Worker).

### Node Flow
```
Webhook GET -> Lead Stats (PG) -> Recent Leads (PG) -> Enrichment Stats (PG)
  -> Build Response (Code) -> Respond to Webhook (JSON)
```

---

## 7. Content Distribution Pipeline

**ID:** `EWqe87yHGWz7rl3g`
**Trigger:** Webhook POST `/new-content`
**Nodes:** 17

### Input
```json
POST /webhook/new-content
{
  "title": "How to Scale Outbound with AI",
  "url": "https://blog.example.com/scale-outbound-ai",
  "content": "Full article text here...",
  "source_type": "blog_post"
}
```

### Output
```json
{
  "status": "drafts_generated",
  "content_id": 1,
  "platforms": { "linkedin": true, "twitter": true, "email_newsletter": true },
  "drafts": [
    { "platform": "linkedin", "success": true, "preview": "..." },
    { "platform": "twitter", "success": true, "preview": "..." },
    { "platform": "email_newsletter", "success": true, "preview": "..." }
  ]
}
```

### Node Flow
```
Webhook -> Validate Input -> Is Valid?
  -> (invalid) Respond Error 400
  -> (valid) Store Content (PG) -> [3 parallel branches]
    Branch A: Gen LinkedIn (Groq) -> Parse LinkedIn
    Branch B: Gen Twitter (Groq) -> Parse Twitter
    Branch C: Gen Email (Groq) -> Parse Email
  -> Merge Drafts -> Store Drafts (Code) -> Insert Drafts (PG)
  -> Update Content Status (PG) -> Build Response -> Respond Success
```

### Platforms
| Platform | Prompt Style | Output |
|----------|-------------|--------|
| LinkedIn | Professional, hook opener, <1300 chars | `{ text, hook, char_count }` |
| Twitter/X | Punchy thread, max 3 tweets, <280 chars each | `{ tweets[], hook, tweet_count }` |
| Email Newsletter | 2-3 sentence summary + CTA | `{ headline, body, cta_text }` |

### Error Handling
- Each Groq branch has `continueOnFail: true`
- Failed branches produce `{ success: false, error: "..." }`
- Drafts marked as `failed` in DB, other successful drafts still stored
- Content status set to `drafts_ready` regardless (check individual draft statuses)

### Required Credentials
- PostgreSQL (existing)
- Groq API (llama-3.3-70b-versatile)

---

## 8. Content Approval API

**ID:** `NRLuGWMVZuzLLM5Q`
**Trigger:** Webhook POST `/approve-content`
**Nodes:** 11

### Input
```json
POST /webhook/approve-content
{ "draft_id": 1, "action": "approve" }
```

### Output
```json
{
  "status": "updated",
  "draft_id": 1,
  "action": "approved",
  "all_approved": false,
  "approved_count": 1,
  "total_drafts": 3
}
```

### Node Flow
```
Webhook -> Validate -> Is Valid?
  -> (invalid) Respond Error 400
  -> (valid) Update Draft (PG) -> Check All Approved (PG) -> Build Response
    -> All Approved?
      -> (yes) Mark Content Approved (PG) -> Respond { all_approved: true }
      -> (no) Respond { all_approved: false, approved_count, total_drafts }
```

### Behavior
- `action: "approve"` sets draft status to `approved` and sets `approved_at`
- `action: "reject"` sets draft status to `rejected`
- When all drafts for a content item are approved, the parent `content_items` row is updated to `status = 'approved'`

---

## 9. Content Dashboard

**ID:** `7d0I6QnBXtzqSK9R`
**Trigger:** Webhook GET `/content`
**Nodes:** 6

### Access
```
GET https://n8n-production-7e59.up.railway.app/webhook/content
```

### What It Shows
- **Overview cards**: Total content, drafts ready, approved, pending counts
- **Content items**: Cards with title, status badge, source type, approval progress bar
- **Drafts by platform**: Three columns (LinkedIn, Twitter/X, Email) with draft previews, approve/reject buttons

### Features
- OpsPulse brand design (Instrument Sans, JetBrains Mono, full dark mode)
- Approve/reject buttons call `/webhook/approve-content` inline
- Auto-refreshes every 60 seconds
- Color-coded status badges and progress bars

### Node Flow
```
Webhook GET -> Content Stats (PG) -> Recent Content (PG) -> All Drafts (PG)
  -> Generate HTML (Code) -> Respond with HTML
```

---

## 10. Content Stats API

**ID:** `WzwrjCpALL3q1lty`
**Trigger:** Webhook GET `/content-stats`
**Nodes:** 6

### Access
```
GET https://n8n-production-7e59.up.railway.app/webhook/content-stats
```

### Output
```json
{
  "stats": { "total_content": 2, "drafts_ready": 1, "approved": 1, "pending": 0, "processing": 0 },
  "recent_content": [{ "id": 1, "title": "...", "url": "...", "source_type": "blog_post", "content_status": "approved", "total_drafts": "3", "approved_drafts": "3" }],
  "drafts": [{ "draft_id": 1, "content_id": 1, "platform": "linkedin", "draft_text": "...", "status": "approved", "content_title": "..." }]
}
```

### What It Does
Returns content pipeline data as JSON. Used by the OpsPulse unified dashboard (Cloudflare Worker) Content Flow tab.

### Node Flow
```
Webhook GET -> Content Stats (PG) -> Recent Content (PG) -> All Drafts (PG)
  -> Build Response (Code) -> Respond to Webhook (JSON)
```

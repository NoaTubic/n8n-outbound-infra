# Architecture

## Data Flow

```
                         +-----------------+
                         | OpsPulse        |  Cloudflare Workers
                         | Dashboard (SPA) |  Edge-served
                         +--------+--------+
                                  |
                 /api/status  /api/lead-stats  /api/content-stats
                 /api/enrich  /api/inbound-lead /api/new-content
                 /api/add-domain               /api/approve-content
                                  |
                         +--------v--------+
                         |      n8n        |  Railway
                         |  (12 workflows) |
                         +--------+--------+
                                  |
                         +--------v--------+
                         |   PostgreSQL    |  Railway (SSL)
                         +-----------------+


=== DOMAINPULSE ===

  POST /webhook/enrich
          |
  +-------v---------+
  | Lead Enrichment  |
  |   Pipeline       |
  +-------+---------+
          |
  +-------+-------+-------+
  |               |               |
  v               v               v
  Groq: Company   Groq: Tech      Groq: Contacts
  |               |               |
  +-------+-------+-------+
          |
  +-------v--------+
  |  PostgreSQL    |
  | enrichment_jobs|
  +----------------+


  Cron 07:00 UTC
        |
  +-----v----------+     +-----------------+
  | Domain Watchdog | --> | Google DNS API  |
  | (per domain)    |     | SPF/DKIM/DMARC/MX
  +-----+----------+     +-----------------+
        |
  +-----v----------+
  |  PostgreSQL    |
  | domain_checks  |
  | domain_alerts  |
  +----------------+


=== LEAD ROUTER ===

  POST /webhook/inbound-lead
          |
  +-------v---------+
  | Validate &       |
  | Idempotency      |
  +-------+---------+
          |
  +-------v---------+
  | Score Lead       |  Rule-based: size + role + budget + message
  +-------+---------+
          |
  +-------v---------+
  | ICP Match (Groq) |  AI evaluation against ideal customer profile
  +-------+---------+
          |
  +-------v---------+
  |  PostgreSQL     |
  | inbound_leads   |
  +-------+---------+
          |
      Hot/Warm? -----> Auto Reply (Groq) --> Update Lead
          |
        Cold --------> Update Lead (nurture)


=== CONTENT FLOW ===

  POST /webhook/new-content
          |
  +-------v---------+
  | Validate & Store |
  +-------+---------+
          |
  +-------+-------+-------+
  |               |               |
  v               v               v
  Groq: LinkedIn  Groq: Twitter   Groq: Email
  |               |               |
  +-------+-------+-------+
          |
  +-------v--------+
  |  PostgreSQL    |
  | content_items  |
  | content_drafts |
  +-------+--------+

  POST /webhook/approve-content
          |
  +-------v---------+
  | Update Draft     |  approve / reject
  +-------+---------+
          |
  All approved? --> Mark content_items.status = 'approved'
```

## Dependency Map

### Tables -> Workflows
| Table | Used By |
|-------|---------|
| `monitored_domains` | Domain Watchdog (read), Status API (read) |
| `domain_checks` | Domain Watchdog (write), Status API (read) |
| `domain_alerts` | Domain Watchdog (write) |
| `enrichment_jobs` | Lead Enrichment (read/write), Lead Stats API (read) |
| `inbound_leads` | Lead Router (write), Lead Dashboard (read), Lead Stats API (read) |
| `content_items` | Content Distribution (write), Content Approval (write), Content Dashboard (read), Content Stats API (read) |
| `content_drafts` | Content Distribution (write), Content Approval (read/write), Content Dashboard (read), Content Stats API (read) |

### External APIs
| API | Used By | Auth |
|-----|---------|------|
| Groq (llama-3.3-70b-versatile) | Lead Enrichment (3 branches), Lead Router (ICP + auto-reply), Content Distribution (3 branches) | Groq API Key |
| Google DNS (dns.google) | Domain Watchdog (4 checks) | None (public) |

### Credentials Required in n8n
1. **PostgreSQL** — Railway connection string (used across all workflows)
2. **Groq** — Groq API key (free tier, used by HTTP Request nodes)

## Error Handling Strategy

### Lead Enrichment
- Each Groq HTTP Request has `continueOnFail: true`
- Parse nodes classify errors as transient (429, 5xx) or permanent (4xx)
- Pipeline completes even if 1-2 branches fail (status: 'partial')
- All errors logged in `enrichment_jobs.error_log` JSONB array
- Idempotency key prevents duplicate enrichment within the same day

### Domain Watchdog
- DNS checks have `continueOnFail: true`
- Missing records are flagged but don't stop the pipeline
- Each domain is checked independently (Split In Batches)
- Changes are compared with previous results
- Alerts are only generated when status degrades

### Lead Router
- Validation rejects malformed input with 400
- Idempotency by email + date prevents duplicate processing
- ICP matching failure doesn't block lead storage (graceful degradation)

### Content Distribution
- Each Groq branch has `continueOnFail: true`
- Failed branches produce drafts with `status: 'failed'`
- Successful drafts are stored regardless of other branch failures
- Content item marked as `drafts_ready` after all branches complete

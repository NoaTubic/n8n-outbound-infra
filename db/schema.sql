-- ColdIQ n8n Infrastructure - PostgreSQL Schema

CREATE TABLE IF NOT EXISTS monitored_domains (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  owner_name VARCHAR(255),
  added_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS domain_checks (
  id SERIAL PRIMARY KEY,
  domain_id INTEGER REFERENCES monitored_domains(id),
  checked_at TIMESTAMP DEFAULT NOW(),
  spf_valid BOOLEAN,
  spf_record TEXT,
  dkim_valid BOOLEAN,
  dkim_record TEXT,
  dmarc_valid BOOLEAN,
  dmarc_record TEXT,
  mx_records JSONB,
  blacklist_hits JSONB DEFAULT '[]',
  overall_status VARCHAR(20) DEFAULT 'unknown',
  raw_results JSONB
);

CREATE TABLE IF NOT EXISTS domain_alerts (
  id SERIAL PRIMARY KEY,
  domain_id INTEGER REFERENCES monitored_domains(id),
  alert_type VARCHAR(50),
  message TEXT,
  severity VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  is_resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id SERIAL PRIMARY KEY,
  input_domain VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  idempotency_key VARCHAR(255) UNIQUE,
  company_data JSONB,
  contacts JSONB,
  tech_stack JSONB,
  enrichment_steps JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_log JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_domain_checks_domain_id ON domain_checks(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_checks_checked_at ON domain_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status ON enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_idempotency_key ON enrichment_jobs(idempotency_key);

INSERT INTO monitored_domains (domain, owner_name) VALUES
  ('coldiq.com', 'ColdIQ'),
  ('lemlist.com', 'Lemlist'),
  ('apollo.io', 'Apollo'),
  ('outreach.io', 'Outreach'),
  ('salesloft.com', 'SalesLoft')
ON CONFLICT (domain) DO NOTHING;

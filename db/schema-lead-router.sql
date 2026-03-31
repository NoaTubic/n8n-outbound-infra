CREATE TABLE IF NOT EXISTS inbound_leads (
  id SERIAL PRIMARY KEY,
  idempotency_key VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  role VARCHAR(255),
  company_size VARCHAR(50),
  budget VARCHAR(50),
  message TEXT,
  source VARCHAR(100),
  score INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'unscored',
  icp_match JSONB,
  routed_to VARCHAR(100),
  auto_reply JSONB,
  auto_reply_sent BOOLEAN DEFAULT false,
  scoring_breakdown JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inbound_leads_email ON inbound_leads(email);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_tier ON inbound_leads(tier);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_idempotency ON inbound_leads(idempotency_key);

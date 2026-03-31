CREATE TABLE IF NOT EXISTS content_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  url TEXT,
  source_type VARCHAR(50),
  original_content TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_drafts (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES content_items(id),
  platform VARCHAR(50) NOT NULL,
  draft_text TEXT NOT NULL,
  parsed_content JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  approved_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON content_drafts(status);
CREATE INDEX IF NOT EXISTS idx_content_drafts_content ON content_drafts(content_id);

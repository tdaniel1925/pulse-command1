-- Lead magnets table
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  landing_page_url TEXT,
  leads_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_own_lead_magnets" ON lead_magnets
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

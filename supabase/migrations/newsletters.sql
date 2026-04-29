CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  UNIQUE(client_id, email)
);
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_own_newsletters" ON newsletters FOR ALL USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
CREATE POLICY "clients_own_subscribers" ON newsletter_subscribers FOR ALL USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

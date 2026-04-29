-- Add Ayrshare profile key to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ayrshare_profile_key TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ayrshare_connected_platforms JSONB DEFAULT '[]';

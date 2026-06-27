-- Several features (pause posting, brand/profile/notification settings, admin
-- notes) read/write clients.metadata, but the column was never created. Add it.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

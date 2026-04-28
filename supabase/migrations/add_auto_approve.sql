-- Add auto_approve to clients table (default true = posts go straight to scheduled)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS auto_approve boolean NOT NULL DEFAULT true;

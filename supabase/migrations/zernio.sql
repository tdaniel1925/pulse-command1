-- Zernio social-posting integration (replaces Ayrshare).
-- One Zernio "profile" per client; their connected social accounts live under it.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zernio_profile_id TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS zernio_connected_platforms JSONB DEFAULT '[]';

-- Per-post id returned by Zernio when a social_post is published.
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS zernio_post_id TEXT;

-- Backfill is not needed: Ayrshare profile keys are not transferable to Zernio;
-- clients reconnect their accounts through the new OAuth flow.

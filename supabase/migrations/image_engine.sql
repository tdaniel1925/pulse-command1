-- Image generation tracking table
CREATE TABLE IF NOT EXISTS image_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,
  infographic_style TEXT,
  photo_style TEXT,
  classifier_reasoning TEXT,
  gemini_model TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_dimensions JSONB,
  cost_usd DECIMAL(10, 6),
  generation_time_ms INTEGER,
  attempts INTEGER DEFAULT 1,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_gens_client ON image_generations(client_id);
CREATE INDEX IF NOT EXISTS idx_image_gens_type ON image_generations(image_type);
CREATE INDEX IF NOT EXISTS idx_image_gens_date ON image_generations(generated_at);
CREATE INDEX IF NOT EXISTS idx_image_gens_infographic_style ON image_generations(infographic_style)
  WHERE infographic_style IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_image_gens_photo_style ON image_generations(photo_style)
  WHERE photo_style IS NOT NULL;

-- Add brand_vibe to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS brand_vibe TEXT;

-- Add brand_vibe to brand_profiles for override
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS brand_vibe TEXT;

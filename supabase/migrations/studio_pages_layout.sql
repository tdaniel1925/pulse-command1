-- The living canvas: a page is an ordered list of block types. Stored as a JSON
-- array of strings (e.g. ["header","hero","features","pricing","cta","footer"]).
-- Null/absent layout falls back to the default order at render time.
alter table public.studio_pages add column if not exists layout jsonb;

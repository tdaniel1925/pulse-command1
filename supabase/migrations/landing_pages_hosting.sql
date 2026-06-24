-- In-app landing page hosting. Pages are rendered HTML stored here and served
-- from the public /p/[slug] route on our own domain — no external deploy.
-- Adds the columns the dashboard + deploy flow use, idempotently.
alter table public.landing_pages
  add column if not exists slug text,
  add column if not exists html text,
  add column if not exists status text not null default 'draft', -- draft | live
  add column if not exists content jsonb,
  add column if not exists visits integer not null default 0,
  add column if not exists leads integer not null default 0,
  add column if not exists conversion_rate numeric,
  add column if not exists published_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- Slugs are the public URL key, so they must be globally unique.
create unique index if not exists landing_pages_slug_key on public.landing_pages (slug)
  where slug is not null;

-- Atomic visit counter for the public /p/[slug] route.
create or replace function public.increment_landing_page_visits(page_id uuid)
returns void language sql as $$
  update public.landing_pages set visits = coalesce(visits, 0) + 1 where id = page_id;
$$;

-- RLS: owners manage their own pages; the public /p/[slug] route reads LIVE pages
-- via the service-role client (RLS-bypassing), so no public select policy here.
alter table public.landing_pages enable row level security;
do $$ begin
  create policy "owners manage their landing pages" on public.landing_pages
    for all using (
      client_id in (select id from public.clients where user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

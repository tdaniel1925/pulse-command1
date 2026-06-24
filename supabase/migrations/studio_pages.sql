-- Studio pages: AI-built landing pages from the constraint-engine builder.
-- content (KitContent JSON) + theme (ThemeProps JSON) are the editable source of
-- truth; html is the baked, published output served from /p/[slug].
create table if not exists public.studio_pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kit text not null default 'atlas',
  title text,
  goal text,
  content jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  slug text,
  html text,
  status text not null default 'draft', -- draft | live
  visits integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists studio_pages_slug_key on public.studio_pages (slug)
  where slug is not null;
create index if not exists studio_pages_client_idx on public.studio_pages (client_id);

alter table public.studio_pages enable row level security;
do $$ begin
  create policy "owners manage their studio pages" on public.studio_pages
    for all using (
      client_id in (select id from public.clients where user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

-- Atomic visit counter for the public /p/[slug] route.
create or replace function public.increment_studio_page_visits(page_id uuid)
returns void language sql as $$
  update public.studio_pages set visits = coalesce(visits, 0) + 1 where id = page_id;
$$;

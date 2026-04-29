-- Presentations table
create table if not exists presentations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  topic text not null,
  audience text,
  tone text default 'professional',
  slide_count int default 10,
  slides jsonb default '[]'::jsonb,
  status text default 'generating', -- generating | ready | failed
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table presentations enable row level security;

create policy "clients can read own presentations"
  on presentations for select
  using (client_id in (select id from clients where user_id = auth.uid()));

create policy "clients can insert own presentations"
  on presentations for insert
  with check (client_id in (select id from clients where user_id = auth.uid()));

create policy "clients can update own presentations"
  on presentations for update
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Admin access via service role (bypasses RLS entirely — no policy needed)

-- Add presentations_used to clients if not exists
alter table clients add column if not exists presentations_used int default 0;
alter table clients add column if not exists presentations_limit int default 1;

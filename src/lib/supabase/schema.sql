-- PulseCommand Full Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_cron;

-- =============================================
-- CLIENTS (Core CRM table)
-- =============================================
create table clients (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Account
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  business_name text not null,
  website text,
  industry text,

  -- Auth (links to Supabase auth.users)
  user_id uuid references auth.users(id) on delete cascade,

  -- Status
  status text not null default 'lead'
    check (status in ('lead','onboarding','active','paused','churned')),
  subscription_status text default 'trialing'
    check (subscription_status in ('trialing','active','past_due','cancelled')),

  -- Stripe
  stripe_customer_id text,
  stripe_subscription_id text,

  -- VAPI onboarding
  onboarding_pin char(6) not null default lpad(floor(random()*1000000)::text, 6, '0'),
  onboarding_step text not null default 'signup'
    check (onboarding_step in (
      'signup','call_scheduled','call_done','profile_built',
      'assets_recorded','avatar_pending','avatar_done','active'
    )),
  vapi_call_id text,
  call_scheduled_at timestamptz,
  call_completed_at timestamptz,

  -- Relations
  brand_profile_id uuid,

  -- Meta
  notes text,
  tags text[],
  assigned_to text
);

-- =============================================
-- BRAND PROFILES
-- =============================================
create table brand_profiles (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Business
  business_description text,
  unique_value_prop text,
  target_audience text,
  audience_pain_points text,
  competitors text,
  differentiators text,

  -- Brand voice
  tone_of_voice text,
  brand_personality text,
  content_pillars jsonb default '[]',
  keywords jsonb default '[]',
  hashtags jsonb default '[]',

  -- Visual
  primary_color text,
  secondary_color text,
  font_preference text,
  style_direction text,
  logo_url text,

  -- Social
  priority_channels jsonb default '[]',
  posting_frequency text,
  best_times text,
  past_social_notes text,

  -- Raw data
  vapi_transcript text,
  ai_analysis_raw text
);

-- Add FK back to clients
alter table clients add constraint fk_brand_profile
  foreign key (brand_profile_id) references brand_profiles(id);

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  stripe_subscription_id text not null,
  plan text not null default 'pulsecommand',
  price integer not null default 74500, -- cents
  status text not null,
  trial_start timestamptz,
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now()
);

-- =============================================
-- ASSETS (all media)
-- =============================================
create table assets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  type text not null check (type in (
    'video_recording','audio_recording','avatar','voice_clone',
    'heygen_video','elevenlabs_audio','audiogram','landing_page',
    'social_post','report'
  )),
  status text not null default 'pending'
    check (status in ('pending','processing','ready','failed')),
  url text,
  storage_path text,
  metadata jsonb default '{}',
  external_id text -- HeyGen/ElevenLabs/HeyGen reference
);

-- =============================================
-- SOCIAL POSTS
-- =============================================
create table social_posts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  content text not null,
  image_url text,
  video_url text,
  platforms jsonb not null default '[]',
  scheduled_at timestamptz,
  published_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft','scheduled','published','failed')),
  ayrshare_post_id text,
  performance jsonb default '{}',
  month_batch text -- e.g. "2024-05"
);

-- =============================================
-- VIDEOS
-- =============================================
create table videos (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  title text not null,
  script text,
  heygen_video_id text,
  status text not null default 'pending'
    check (status in ('script_ready','rendering','ready','published','failed','pending')),
  url text,
  thumbnail_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  ayrshare_post_id text
);

-- =============================================
-- AUDIO EPISODES
-- =============================================
create table audio_episodes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  title text not null,
  script text,
  elevenlabs_audio_id text,
  audiogram_url text,
  status text not null default 'pending'
    check (status in ('script_ready','rendering','audiogram','ready','published','failed','pending')),
  url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  ayrshare_post_id text
);

-- =============================================
-- LANDING PAGES
-- =============================================
create table landing_pages (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  title text not null,
  slug text not null,
  url text,
  content jsonb default '{}',
  status text not null default 'draft'
    check (status in ('draft','deploying','live','archived')),
  github_commit_sha text,
  vercel_deployment_id text,
  conversion_rate numeric default 0,
  visits integer default 0,
  leads integer default 0
);

-- =============================================
-- MONTHLY REPORTS
-- =============================================
create table reports (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  month integer not null,
  year integer not null,
  status text not null default 'generating'
    check (status in ('generating','ready','sent')),
  data jsonb default '{}',
  pdf_url text,
  sent_at timestamptz
);

-- =============================================
-- CRM ACTIVITIES (timeline)
-- =============================================
create table activities (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  type text not null check (type in (
    'call','email','sms','note','status_change','content_published',
    'report_sent','payment','error','onboarding_step'
  )),
  title text not null,
  description text,
  metadata jsonb default '{}',
  created_by text not null default 'system'
    check (created_by in ('admin','system','client'))
);

-- =============================================
-- NOTES
-- =============================================
create table notes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  created_at timestamptz default now(),
  updated_by text,
  content text not null,
  pinned boolean default false
);

-- =============================================
-- TASKS
-- =============================================
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  created_at timestamptz default now(),
  due_at timestamptz,
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending','in_progress','done')),
  priority text not null default 'medium'
    check (priority in ('low','medium','high','urgent')),
  assigned_to text,
  completed_at timestamptz
);

-- =============================================
-- PIPELINE NODES (React Flow state)
-- =============================================
create table pipeline_nodes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade, -- null = master template
  node_id text not null,
  node_type text not null,
  position_x numeric not null default 0,
  position_y numeric not null default 0,
  config jsonb default '{}',
  status text not null default 'idle'
    check (status in ('idle','running','success','error')),
  last_run_at timestamptz,
  last_error text,
  unique(client_id, node_id)
);

create table pipeline_edges (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  source_node_id text not null,
  target_node_id text not null,
  config jsonb default '{}'
);

-- =============================================
-- WORKFLOW TEMPLATES
-- =============================================
create table workflow_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  nodes jsonb not null default '[]',
  edges jsonb not null default '[]',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ADMIN USERS
-- =============================================
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'admin'
    check (role in ('admin','super_admin')),
  avatar_url text,
  created_at timestamptz default now()
);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger brand_profiles_updated_at before update on brand_profiles
  for each row execute function update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table clients enable row level security;
alter table brand_profiles enable row level security;
alter table social_posts enable row level security;
alter table videos enable row level security;
alter table audio_episodes enable row level security;
alter table landing_pages enable row level security;
alter table reports enable row level security;
alter table activities enable row level security;
alter table notes enable row level security;
alter table tasks enable row level security;
alter table assets enable row level security;
alter table pipeline_nodes enable row level security;
alter table pipeline_edges enable row level security;

-- Clients can only see their own data
create policy "clients_own_data" on clients
  for all using (auth.uid() = user_id);

create policy "clients_own_brand_profile" on brand_profiles
  for all using (
    client_id in (select id from clients where user_id = auth.uid())
  );

create policy "clients_own_posts" on social_posts
  for all using (
    client_id in (select id from clients where user_id = auth.uid())
  );

create policy "clients_own_videos" on videos
  for all using (
    client_id in (select id from clients where user_id = auth.uid())
  );

create policy "clients_own_audio" on audio_episodes
  for all using (
    client_id in (select id from clients where user_id = auth.uid())
  );

create policy "clients_own_pages" on landing_pages
  for all using (
    client_id in (select id from clients where user_id = auth.uid())
  );

create policy "clients_own_reports" on reports
  for all using (
    client_id in (select id from clients where user_id = auth.uid())
  );

-- Admins can see everything (service role bypasses RLS)
-- Use service role key in admin API routes

-- =============================================
-- MONTHLY CRON JOBS (pg_cron)
-- =============================================
-- Run on 1st of each month at 6am UTC
select cron.schedule(
  'monthly-content-pipeline',
  '0 6 1 * *',
  $$
    select net.http_post(
      url := current_setting('app.url') || '/api/pipeline/monthly',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

-- Run on last day of month at 8am UTC for reports
select cron.schedule(
  'monthly-reports',
  '0 8 28 * *',
  $$
    select net.http_post(
      url := current_setting('app.url') || '/api/pipeline/reports',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

-- =============================================
-- INDEXES
-- =============================================
create index idx_clients_user_id on clients(user_id);
create index idx_clients_status on clients(status);
create index idx_clients_onboarding_pin on clients(onboarding_pin);
create index idx_social_posts_client_id on social_posts(client_id);
create index idx_social_posts_status on social_posts(status);
create index idx_social_posts_scheduled on social_posts(scheduled_at);
create index idx_videos_client_id on videos(client_id);
create index idx_audio_client_id on audio_episodes(client_id);
create index idx_activities_client_id on activities(client_id);
create index idx_tasks_client_id on tasks(client_id);
create index idx_tasks_status on tasks(status);

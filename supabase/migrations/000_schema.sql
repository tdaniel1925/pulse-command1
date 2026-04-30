-- Core clients table
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  business_name text,

  -- Onboarding
  onboarding_step text default 'welcome',
  onboarding_pin text,

  -- Status
  status text default 'active',
  subscription_status text default 'free',

  -- Stripe
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  plan_name text default 'free',
  plan_status text default 'trialing',
  plan_period_end timestamptz,
  presentations_limit int default 1,

  -- Call tracking
  vapi_call_id text,
  call_completed_at timestamptz,

  -- Social
  ayrshare_profile_key text,
  ayrshare_connected_platforms jsonb default '[]'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_clients_user_id on clients(user_id);
create index if not exists idx_clients_email on clients(email);
create index if not exists idx_clients_stripe_customer on clients(stripe_customer_id);
create index if not exists idx_clients_stripe_subscription on clients(stripe_subscription_id);

alter table clients enable row level security;

create policy "users can read own record"
  on clients for select
  using (user_id = auth.uid());

create policy "users can update own record"
  on clients for update
  using (user_id = auth.uid());

-- Brand profiles
create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,

  -- Brand assets
  logo_url text,
  brand_colors text[],
  brand_voice text,

  -- VAPI interview data
  vapi_transcript text,
  ai_analysis_raw jsonb,

  -- Analysis results from Claude Opus
  business_description text,
  unique_value_prop text,
  target_audience text,
  audience_pain_points text,
  competitors text,
  differentiators text,
  tone_of_voice text,
  brand_personality text,
  content_pillars text[],
  keywords text[],
  hashtags text[],
  priority_channels text[],
  posting_frequency text,
  best_times text,

  -- Settings
  posts_per_week int default 5,

  -- Avatar & voice selection
  heygen_avatar_id text,
  heygen_avatar_group_id text,
  elevenlabs_voice_id text,

  -- Social integration
  ayrshare_profile_id text,
  ayrshare_connected boolean default false,
  connected_platforms text[],

  -- Metadata
  metadata jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_brand_profiles_client on brand_profiles(client_id);

alter table brand_profiles enable row level security;

create policy "users can read own brand profile"
  on brand_profiles for select
  using (client_id in (select id from clients where user_id = auth.uid()));

create policy "users can update own brand profile"
  on brand_profiles for update
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Activities
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  post_id uuid,
  video_id uuid,
  presentation_id uuid,
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_activities_client on activities(client_id, created_at desc);
create index if not exists idx_activities_type on activities(type);

alter table activities enable row level security;

create policy "users can read own activities"
  on activities for select
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Social posts
create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  content text not null,
  image_url text,
  image_prompt text,
  layout text,
  status text default 'draft', -- draft | scheduled | published | failed
  published_at timestamptz,
  scheduled_for timestamptz,
  platforms text[] default '{}',
  ayrshare_post_id text,
  engagement_score numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_social_posts_client on social_posts(client_id, created_at desc);
create index if not exists idx_social_posts_status on social_posts(status);

alter table social_posts enable row level security;

create policy "users can read own posts"
  on social_posts for select
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Videos
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text,
  script text,
  video_url text,
  thumbnail_url text,
  status text default 'generating', -- generating | ready | failed
  heygen_video_id text,
  heygen_avatar_id text,
  heygen_avatar_group_id text,
  elevenlabs_voice_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_videos_client on videos(client_id);
create index if not exists idx_videos_status on videos(status);

alter table videos enable row level security;

create policy "users can read own videos"
  on videos for select
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Presentations
create table if not exists presentations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  topic text not null,
  audience text,
  tone text default 'professional',
  slide_count int default 10,
  slides jsonb default '[]'::jsonb,
  status text default 'generating',
  thumbnail_url text,
  source_mode text default 'ai',
  source_content text,
  source_url text,
  slide_style text default 'regular',
  interview_answers jsonb,
  template_id text default 'pitch',
  deck_mode text default 'standard',
  narrative_framework text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_presentations_client on presentations(client_id);
create index if not exists idx_presentations_status on presentations(status);

alter table presentations enable row level security;

create policy "users can read own presentations"
  on presentations for select
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_client on notifications(client_id, read, created_at desc);

alter table notifications enable row level security;

create policy "users read own notifications"
  on notifications for select
  using (client_id in (select id from clients where user_id = auth.uid()));

create policy "users update own notifications"
  on notifications for update
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Lead magnets
create table if not exists lead_magnets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text,
  content text,
  content_type text, -- pdf | email-course | checklist | template
  download_url text,
  created_leads int default 0,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_lead_magnets_client on lead_magnets(client_id);

alter table lead_magnets enable row level security;

create policy "users can read own lead magnets"
  on lead_magnets for select
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Newsletters
create table if not exists newsletters (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  subject text,
  content text,
  sent_at timestamptz,
  subscriber_count int default 0,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_newsletters_client on newsletters(client_id);

alter table newsletters enable row level security;

create policy "users can read own newsletters"
  on newsletters for select
  using (client_id in (select id from clients where user_id = auth.uid()));

-- Other tables referenced in code
create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid unique references clients(id) on delete cascade,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists content_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text,
  description text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  type text,
  content text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists content_briefs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  content jsonb,
  created_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  report_type text,
  data jsonb,
  created_at timestamptz default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  name text,
  url text,
  type text,
  created_at timestamptz default now()
);

create table if not exists logos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  url text,
  created_at timestamptz default now()
);

create table if not exists heygen_avatars (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  avatar_id text,
  name text,
  created_at timestamptz default now()
);

create table if not exists recordings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  url text,
  type text,
  created_at timestamptz default now()
);

create table if not exists audio_episodes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text,
  audio_url text,
  created_at timestamptz default now()
);

create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text,
  content text,
  url text,
  created_at timestamptz default now()
);

create table if not exists content (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  type text,
  body text,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists addons (
  id uuid primary key default gen_random_uuid(),
  name text,
  price numeric,
  description text,
  created_at timestamptz default now()
);

create table if not exists client_addons (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  addon_id uuid references addons(id),
  quantity int default 1,
  created_at timestamptz default now()
);

create table if not exists content_request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references content_requests(id) on delete cascade,
  file_url text,
  created_at timestamptz default now()
);

create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  email text,
  name text,
  created_at timestamptz default now()
);

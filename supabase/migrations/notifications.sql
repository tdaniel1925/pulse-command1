create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null, -- post_ready | post_published | video_ready | presentation_ready | payment_failed | welcome
  title text not null,
  body text,
  link text, -- where to go when clicked e.g. /dashboard/social
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_client on notifications(client_id, read, created_at desc);

alter table notifications enable row level security;

create policy "clients read own notifications"
  on notifications for select
  using (client_id in (select id from clients where user_id = auth.uid()));

create policy "clients update own notifications"
  on notifications for update
  using (client_id in (select id from clients where user_id = auth.uid()));

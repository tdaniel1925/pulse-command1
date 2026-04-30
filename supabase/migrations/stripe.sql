-- Add Stripe fields to clients
alter table clients add column if not exists stripe_customer_id text;
alter table clients add column if not exists stripe_subscription_id text;
alter table clients add column if not exists stripe_price_id text;
alter table clients add column if not exists plan_name text default 'free';
alter table clients add column if not exists plan_status text default 'trialing'; -- trialing | active | past_due | canceled | unpaid
alter table clients add column if not exists plan_period_end timestamptz;
alter table clients add column if not exists presentations_limit int default 1;

-- Index for webhook lookups
create index if not exists idx_clients_stripe_customer on clients(stripe_customer_id);
create index if not exists idx_clients_stripe_subscription on clients(stripe_subscription_id);

-- Idempotency ledger for Stripe webhooks. The webhook handler inserts each
-- event.id; a unique-violation (23505) means we've already processed it and
-- can safely skip. No RLS policies — written only by the service-role client
-- in src/app/api/webhooks/stripe/route.ts.
create table if not exists public.stripe_events (
  id text primary key,
  type text,
  created_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- No policies: service role bypasses RLS; no client/browser access is intended.

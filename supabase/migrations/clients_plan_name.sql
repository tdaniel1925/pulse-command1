-- The app standardized on clients.plan_name (set by Stripe checkout/webhook and
-- read by entitlement gates). The original schema only had `plan`. Add the
-- canonical column and backfill from the legacy `plan` value so existing rows
-- keep their tier.
alter table public.clients add column if not exists plan_name text;

update public.clients
  set plan_name = plan
  where plan_name is null and plan is not null;

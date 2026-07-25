-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: guarded with "if not exists" / "or replace" where possible.

create table if not exists public.visits (
  user_id uuid references auth.users (id) on delete cascade not null,
  park_slug text not null,
  visited_at date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, park_slug)
);

alter table public.visits enable row level security;

drop policy if exists "Users manage their own visits" on public.visits;
create policy "Users manage their own visits"
  on public.visits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

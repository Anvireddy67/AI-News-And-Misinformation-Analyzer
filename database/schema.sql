create extension if not exists pgcrypto;

create table if not exists public.news_analyses (
  id uuid primary key default gen_random_uuid(),
  headline varchar(300) not null,
  content text not null,
  verdict varchar(30) not null check (verdict in ('Likely True', 'Likely False', 'Needs Review')),
  confidence_score numeric(5,2) not null check (confidence_score >= 0 and confidence_score <= 100),
  explanation text not null,
  created_at timestamptz not null default now()
);

create index if not exists news_analyses_created_at_idx
  on public.news_analyses (created_at desc);

create index if not exists news_analyses_verdict_idx
  on public.news_analyses (verdict);

alter table public.news_analyses enable row level security;

-- The backend uses the Supabase service-role key and therefore performs
-- authorization server-side. The service-role key must never be exposed
-- to the browser.

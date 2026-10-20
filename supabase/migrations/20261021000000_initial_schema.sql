-- ==============================================================================
-- Rasbari / VelvetTales Database Schema
-- Supabase PostgreSQL Migration for Adult Romance & Fantasy Platform
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Custom Enum Types
do $$ begin
  create type user_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type story_language as enum ('english', 'hindi', 'hinglish');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type story_category as enum ('romance', 'erotica', 'fantasy', 'taboo', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type content_rating as enum ('spicy', 'explicit');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type story_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type report_status as enum ('open', 'resolved');
exception
  when duplicate_object then null;
end $$;

-- 2. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role user_role not null default 'user',
  daily_ai_quota int not null default 5,
  last_quota_reset timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles RLS Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Stories Table
create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  summary text,
  language story_language not null default 'hinglish',
  category story_category not null default 'romance',
  content_rating content_rating not null default 'spicy',
  is_ai_generated boolean not null default false,
  status story_status not null default 'pending',
  views_count int not null default 0,
  likes_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for stories
alter table public.stories enable row level security;

-- Stories RLS Policies
create policy "Approved stories are readable by everyone"
  on public.stories for select
  using (status = 'approved');

create policy "Authors can view own pending or rejected stories"
  on public.stories for select
  using (auth.uid() = author_id);

create policy "Authenticated users can submit stories"
  on public.stories for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own pending stories"
  on public.stories for update
  using (auth.uid() = author_id and status = 'pending');

create policy "Anyone can increment views and likes"
  on public.stories for update
  using (status = 'approved')
  with check (true);

-- 4. Reports Table (Safe-Harbor Compliance)
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  reporter_id uuid not null,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

-- Enable RLS for reports
alter table public.reports enable row level security;

-- Reports RLS Policies
create policy "Anyone can submit a safe-harbor report"
  on public.reports for insert
  with check (true);

create policy "Only admins can view reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Indexes for high-performance feed filtering
create index if not exists idx_stories_status_created on public.stories (status, created_at desc);
create index if not exists idx_stories_lang_cat on public.stories (language, category);
create index if not exists idx_reports_status on public.reports (status);

-- TubeSynth initial schema (PRD §8.3)
-- Run with: supabase db push  (after `supabase link`)

-- ── videos ────────────────────────────────────────────────────
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id varchar(20) unique not null,
  title text not null,
  channel_name text,
  channel_id varchar(50),
  duration_seconds int not null,
  thumbnail_url text,
  language varchar(10),
  created_at timestamptz default now(),
  fetched_at timestamptz default now()
);

create index if not exists idx_videos_youtube_id on public.videos (youtube_id);

-- ── transcripts ───────────────────────────────────────────────
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos (id) on delete cascade,
  language varchar(10),
  is_auto_generated boolean default false,
  raw_data jsonb not null, -- array of {text, start, duration}
  word_count int,
  created_at timestamptz default now(),
  unique (video_id, language)
);

-- ── summaries ─────────────────────────────────────────────────
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  language varchar(10) default 'en',
  strategy varchar(20),          -- 'single' | 'chunked' | 'hierarchical'
  status varchar(20) default 'pending', -- pending|processing|completed|failed
  progress int default 0,        -- 0-100
  current_step text,
  content jsonb,                 -- structured summary
  model_used varchar(50),
  tokens_input int,
  tokens_output int,
  processing_time_ms int,
  error_message text,
  is_public boolean default false,
  share_slug varchar(20) unique,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create index if not exists idx_summaries_video_id on public.summaries (video_id);
create index if not exists idx_summaries_user_id on public.summaries (user_id);
create index if not exists idx_summaries_share_slug on public.summaries (share_slug);

-- ── qa_sessions ───────────────────────────────────────────────
create table if not exists public.qa_sessions (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid references public.summaries (id) on delete cascade,
  user_id uuid references auth.users (id),
  messages jsonb not null, -- [{role, content, citations, timestamp}]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────
-- Server uses the service-role key (bypasses RLS). These policies allow
-- public read of completed public summaries and owners reading their own.
alter table public.videos enable row level security;
alter table public.transcripts enable row level security;
alter table public.summaries enable row level security;
alter table public.qa_sessions enable row level security;

drop policy if exists "videos readable by all" on public.videos;
create policy "videos readable by all"
  on public.videos for select using (true);

drop policy if exists "public summaries readable" on public.summaries;
create policy "public summaries readable"
  on public.summaries for select
  using (is_public = true or auth.uid() = user_id);

drop policy if exists "owners read own qa" on public.qa_sessions;
create policy "owners read own qa"
  on public.qa_sessions for select using (auth.uid() = user_id);

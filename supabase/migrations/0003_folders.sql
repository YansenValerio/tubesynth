-- Folders / collections: group a user's summaries (PRD §6 / Design §6).

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

create index if not exists idx_folders_user_id on public.folders (user_id);

alter table public.summaries
  add column if not exists folder_id uuid
    references public.folders (id) on delete set null;

create index if not exists idx_summaries_folder_id
  on public.summaries (folder_id);

-- RLS: a user only sees and manages their own folders.
alter table public.folders enable row level security;

drop policy if exists "owners manage folders" on public.folders;
create policy "owners manage folders"
  on public.folders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

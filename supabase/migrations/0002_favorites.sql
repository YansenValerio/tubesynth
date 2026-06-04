-- Favorites: let a user bookmark their own summaries (PRD Phase 2).

alter table public.summaries
  add column if not exists is_favorite boolean not null default false;

create index if not exists idx_summaries_favorite
  on public.summaries (user_id, is_favorite)
  where is_favorite = true;

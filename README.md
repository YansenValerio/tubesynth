# TubeSynth

> Read any YouTube video, even 12-hour ones.

TubeSynth turns long-form YouTube videos (podcasts, lectures, conference talks)
into structured, readable summaries with timestamps, key quotes, and Q&A.

See [`PRD-YouTube-Summarizer.md`](./PRD-YouTube-Summarizer.md) for the full
product spec and [`TubeSynth-Design-Prompts.md`](./TubeSynth-Design-Prompts.md)
for the design system.

## Tech stack

| Layer        | Choice                                            |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 16 (App Router), React 19, TypeScript     |
| Styling      | Tailwind v4 (tokens in `src/app/globals.css`)     |
| Database     | Supabase (Postgres + Auth)                        |
| Cache / RL   | Upstash Redis + `@upstash/ratelimit`              |
| Background   | Trigger.dev                                       |
| AI           | Google Gemini 2.0 Flash                           |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in credentials
npm run dev                  # http://localhost:3000
```

The app builds and runs without any credentials — integrations are read lazily
and only error when a feature that needs them is invoked.

### Database

```bash
npx supabase link            # link your Supabase project
npx supabase db push         # apply supabase/migrations/0001_init.sql
```

### Background jobs (long videos)

When **both** Supabase and Trigger.dev are configured, summarization runs as a
background job and the UI polls `/api/summarize/status` for live progress.
Otherwise it falls back to inline processing in the request. To run the worker
locally:

```bash
npx trigger.dev@latest dev   # runs the summarize-video task locally
```

## Project structure

```
src/
  app/
    page.tsx              Landing page
    summary/[id]/         Summary view (live pipeline / sample)
    dashboard/            Auth-gated user dashboard + history
    login/                Sign-in (Google + magic link)
    auth/callback|signout Auth route handlers
    api/summarize         Orchestrator + /status polling endpoint
    api/qa                Q&A endpoint
    globals.css           Design tokens + theme (Tailwind v4 @theme)
  components/
    url-input.tsx         Hero/CTA YouTube URL input
    landing/              Landing sections (examples, FAQ)
    summary/              Reading view, tabs, player, Q&A, processing
    dashboard/            Dashboard grid/list + search + stats
    auth/                 Login form
  lib/
    env.ts                Lazy, validated env access
    auth.ts               getCurrentUser() + display name
    youtube.ts            URL parsing / id extraction
    types.ts              Domain types + Zod schemas
    utils.ts              cn(), duration/timestamp/relative-time
    metadata.ts           oEmbed video metadata
    transcript.ts         Transcript fetch + helpers
    gemini.ts             Gemini client (JSON + text)
    summarize/            Strategies, prompts, chunking, normalize
    qa.ts                 Q&A prompt + grounding context
    cache.ts              Supabase summary cache + job lifecycle
    history.ts            User summary history
    redis.ts              Upstash client + rate limiters
    export.ts             Summary → Markdown
    sample.ts             Demo/sample summary
    supabase/             Browser, admin, SSR clients + schema types
  trigger/
    summarize.ts          Background summarization job
  proxy.ts                Supabase session refresh (Next 16 proxy)
supabase/migrations/      SQL schema
trigger.config.ts         Trigger.dev config
```

## Roadmap (current state)

- [x] Scaffold, design system, landing page
- [x] Full-stack infra scaffolding (Supabase, Upstash, Trigger.dev, env)
- [x] Summarization engine (transcript fetch, single/chunked/hierarchical)
- [x] Orchestrator API with caching + rate limiting + sample fallback
- [x] Summary reading view + processing & error states + Markdown export/share
- [x] Q&A mode with timestamp citations (panel, Cmd+K, sample fallback)
- [x] Background processing via Trigger.dev with live progress polling
- [x] Supabase Auth (Google + magic link) + dashboard with history
- [x] Public share pages (`/s/[slug]`) with conversion CTAs
- [x] Multi-language summary translation (timestamp-preserving)
- [x] Favorites: bookmark summaries (optimistic, ownership-checked)
- [x] Persist Q&A conversations across reloads (per-video localStorage)
- [x] Folders/collections in the dashboard (create, assign, filter)

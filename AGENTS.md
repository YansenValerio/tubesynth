<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TubeSynth

Web app that turns long YouTube videos (up to 12h) into structured, readable
summaries. See `PRD-YouTube-Summarizer.md` (product) and
`TubeSynth-Design-Prompts.md` (design system) for the source of truth.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind v4 — theme tokens live in `src/app/globals.css` via `@theme`
- Supabase (Postgres + Auth), Upstash Redis (cache + rate limit),
  Trigger.dev (background jobs), Gemini (summarization)

## Conventions
- Dark mode is the primary aesthetic; `.dark` is set on `<html>` by default.
- Use semantic color utilities (`bg-surface`, `text-text-secondary`,
  `text-accent`, `border-border`) — never raw hex in components.
- Fonts: `font-serif` (Instrument Serif) for headings/emphasis, `font-sans`
  (Inter) for body, `font-mono` (JetBrains Mono) for timestamps.
- Env access goes through `src/lib/env.ts` (lazy — app builds without creds).
- Server-only modules import `"server-only"`; never use the service-role key
  or Redis client from client components.

## Setup
1. `cp .env.example .env.local` and fill in credentials.
2. `npm run dev`
3. DB: `supabase link` then `supabase db push` (schema in `supabase/migrations`).

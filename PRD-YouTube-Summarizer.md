# Product Requirements Document (PRD)
## YouTube Long-Form Video Summarizer

---

**Product Name:** TubeSynth (working title)
**Document Version:** 1.0
**Last Updated:** Juni 2026
**Status:** Draft — Ready for Development
**Owner:** [Your Name]

---

## 1. Executive Summary

TubeSynth adalah web application yang mengubah video YouTube panjang (podcast, lecture, conference talk, course recording) menjadi structured summary yang dapat dikonsumsi dalam hitungan menit. Berbeda dengan tools sejenis yang umumnya terbatas pada video pendek (< 1 jam), TubeSynth dirancang khusus untuk handle video super panjang hingga 12+ jam dengan strategi chunking dan hierarchical summarization yang cerdas.

**Value Proposition:** "Watch hours of content in minutes, without losing the gold."

**Target Launch:** MVP dalam 6 minggu dari kickoff.

**Primary Metric:** Time saved per user per week (target: 5+ jam/minggu untuk active user).

---

## 2. Problem Statement

### 2.1 Konteks

Konten video panjang di YouTube semakin marak — Lex Fridman Podcast (3-5 jam), Joe Rogan (2-4 jam), MIT OpenCourseWare lectures (1-2 jam per video, puluhan video per course), AWS re:Invent talks, dan berbagai keynote yang bisa mencapai 8-12 jam.

Audiens dari konten ini umumnya:
- Knowledge workers yang ingin update tapi waktu terbatas
- Pelajar/mahasiswa yang butuh menyerap course recording cepat
- Researcher yang perlu screen banyak konten untuk riset
- Professional yang ingin track keynote/conference yang tidak sempat ditonton

### 2.2 Masalah yang Dihadapi User

1. **Time scarcity** — tidak punya waktu nonton 3 jam podcast saat lunch break
2. **Information overload** — terlalu banyak konten bagus, mustahil di-consume semua
3. **Hard to find specific moments** — sulit cari quote atau topik spesifik di video 5 jam tanpa scrub manual
4. **Note-taking friction** — sulit ambil notes sambil nonton, sering miss detail
5. **Existing tools tidak handle long-form** — kebanyakan summarizer existing limit ke video < 1 jam

### 2.3 Mengapa Sekarang?

- LLM dengan context window besar (Gemini 2.0 Flash dengan 1M tokens) baru tersedia
- YouTube transcript API/scraping makin stable
- Background processing infrastructure (Trigger.dev, Inngest) makin accessible untuk solo developer
- Tren content panjang (podcast boom) terus naik

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

**Primary Goals:**
1. Berikan summary berkualitas dari video apapun (1 menit hingga 12+ jam) dengan akurasi tinggi
2. Sediakan navigasi dengan timestamp ke moment penting di video
3. Buat pengalaman cepat dan tidak memerlukan instalasi

**Secondary Goals:**
1. Bangun komunitas user yang share summary public
2. Position sebagai go-to tool untuk long-form content di pasar Indonesia & global
3. Foundation untuk monetization model (freemium) di masa depan

### 3.2 Non-Goals (MVP)

- ❌ Mobile native app (web-first, responsive sudah cukup)
- ❌ Browser extension (Phase 2)
- ❌ Payment/subscription system (Phase 2)
- ❌ Real-time live stream summarization
- ❌ Video editing atau clip generation
- ❌ Social media auto-posting

### 3.3 Success Metrics

| Metric | Target (3 bulan post-launch) |
|--------|------------------------------|
| Daily Active Users (DAU) | 200+ |
| Weekly Active Users (WAU) | 1.000+ |
| Videos summarized per day | 500+ |
| Avg. summary quality rating (1-5) | 4.2+ |
| Avg. processing time (1 jam video) | < 45 detik |
| Avg. processing time (12 jam video) | < 8 menit |
| Cache hit rate | > 30% |
| Cost per summary (avg) | < $0.01 |
| User retention (7-day) | > 25% |

---

## 4. Target Users & Personas

### 4.1 Persona 1 — "The Knowledge Hungry Professional"

**Nama:** Andi, 28, Product Manager di startup
**Behavior:** Subscribe 15+ podcast channels, save ratusan video "Watch Later", actually nonton < 10%
**Pain point:** FOMO konten bagus, tapi tidak ada waktu
**Use case:** Summarize podcast saat commute, buka video full kalau topik menarik

### 4.2 Persona 2 — "The Learning Student"

**Nama:** Sari, 21, mahasiswa Teknik Informatika
**Behavior:** Nonton MIT OCW, Stanford CS courses, lectures dari profesor luar
**Pain point:** Lecture 1.5 jam terlalu lama untuk review berkali-kali, sulit cari section spesifik
**Use case:** Generate notes dari lecture, Q&A mode untuk drill specific concepts

### 4.3 Persona 3 — "The Research Analyst"

**Nama:** Budi, 35, Industry Analyst
**Behavior:** Track conference talks (AWS re:Invent, Google I/O), butuh insights dari ratusan jam content
**Pain point:** Mustahil nonton semua, butuh way untuk skim 8-12 jam content cepat
**Use case:** Bulk summarize conference talks, compare summaries across videos

### 4.4 Persona 4 — "The Content Creator"

**Nama:** Maya, 30, YouTube reviewer & blogger
**Behavior:** Riset topik dengan nonton video kompetitor/source material
**Pain point:** Riset 1 video butuh nonton 10+ jam content
**Use case:** Quick research, extract key quotes, identify gaps

---

## 5. User Journey & Flow

### 5.1 Primary Flow — Summarize Video Pendek (< 2 jam)

```
[Landing Page]
     ↓
[Paste YouTube URL] → [Validate URL]
     ↓
[Show video metadata + estimated processing time]
     ↓
[Click "Summarize"] → [Loading state dengan progress]
     ↓
[Display summary dengan tabs: Overview | Chapters | Quotes | Action Items]
     ↓
[Optional: Q&A mode, Export, Share]
```

**Expected time:** 15-60 detik

### 5.2 Long-form Flow (> 2 jam)

```
[Paste URL] → [Validate]
     ↓
[Show warning: "This video is X hours. Processing may take Y minutes"]
     ↓
[Click "Start Processing"] → [Job queued]
     ↓
[Real-time progress: "Chunking... 3/24" → "Summarizing chunk 5/24" → "Finalizing..."]
     ↓
[Option: "Notify me when done" (email) OR stay on page]
     ↓
[Summary ready] → [Full view dengan navigation]
```

**Expected time:** 2-8 menit untuk video 6-12 jam

### 5.3 Returning User Flow

```
[Login (optional)]
     ↓
[Dashboard: history of summaries]
     ↓
[Search/filter previous summaries]
     ↓
[Click summary → resume reading]
```

---

## 6. Functional Requirements

### 6.1 MVP Features (Phase 1 — Must Have)

#### F1. Video Input & Validation
- **F1.1** Input YouTube URL via single text field
- **F1.2** Support format: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, dengan/tanpa timestamps
- **F1.3** Validate URL dan fetch metadata (title, channel, duration, thumbnail) via YouTube oEmbed API
- **F1.4** Tampilkan estimated processing time berdasarkan durasi
- **F1.5** Reject video > 12 jam dengan friendly error untuk MVP

#### F2. Transcript Acquisition
- **F2.1** Auto-fetch transcript via `youtube-transcript` library
- **F2.2** Prefer manual transcript over auto-generated
- **F2.3** Tampilkan warning kalau hanya auto-generated tersedia (quality lebih rendah)
- **F2.4** Handle multi-language video (default ke language paling lengkap)
- **F2.5** Graceful error untuk video tanpa transcript (kasih opsi atau cancel)

#### F3. Summarization Engine
- **F3.1** **Strategy A — Single Pass** untuk video < 2 jam (langsung kirim ke Gemini)
- **F3.2** **Strategy B — Chunked** untuk video 2-6 jam (chunk 30 menit, summarize parallel, synthesize)
- **F3.3** **Strategy C — Hierarchical** untuk video 6+ jam (chunk 1 jam, summarize, group, synthesize 2 level)
- **F3.4** Output structured dalam JSON dengan schema:
  ```
  {
    tldr: string,
    overview: string,
    chapters: [{title, startTime, endTime, summary}],
    keyPoints: [{point, timestamp, importance}],
    keyQuotes: [{quote, speaker, timestamp}],
    actionItems: [string],
    topics: [string],
    estimatedReadTime: number
  }
  ```

#### F4. Summary Display
- **F4.1** Clean reading interface dengan tabs/sections
- **F4.2** Sticky video player di sidebar (collapsible)
- **F4.3** Click timestamp → jump ke moment di video (embed YouTube player)
- **F4.4** Estimated reading time terlihat di atas
- **F4.5** Dark mode support

#### F5. Caching System
- **F5.1** Hash URL → key, cache result di Supabase
- **F5.2** TTL: 30 hari untuk summary, infinite untuk transcript
- **F5.3** Cache hit returns instantly, gratis cost
- **F5.4** Background re-summarize kalau request param berubah (length preference, language)

#### F6. Export & Share
- **F6.1** Export ke Markdown (download .md)
- **F6.2** Copy to clipboard (formatted)
- **F6.3** Generate shareable public link
- **F6.4** Export ke PDF (via React-PDF, Phase 1.5 acceptable)

#### F7. Progress Tracking
- **F7.1** Real-time progress untuk long video via Server-Sent Events atau polling
- **F7.2** Show current step: "Fetching transcript" → "Chunking" → "Summarizing X/Y" → "Synthesizing" → "Done"
- **F7.3** Show estimated time remaining
- **F7.4** Email notification kalau processing > 5 menit (optional, butuh email input)

### 6.2 Advanced Features (Phase 2 — Should Have)

#### F8. Q&A Mode
- **F8.1** Text input untuk ask pertanyaan tentang video
- **F8.2** AI jawab dengan citation timestamp
- **F8.3** Click citation → jump ke moment di video
- **F8.4** Conversation history (max 10 turns per session)

#### F9. Topic Tracking
- **F9.1** Search topic di summary (e.g., "Python")
- **F9.2** Highlight semua mentions di summary
- **F9.3** Tampilkan timeline visualization di mana topik dibahas

#### F10. Multi-Language Support
- **F10.1** Translate summary ke bahasa lain (Indonesia, English, Spanish, Mandarin)
- **F10.2** Preserve formatting dan timestamp

#### F11. Comparison Mode
- **F11.1** Input 2-3 video URLs
- **F11.2** Generate comparison summary dengan similarities & differences
- **F11.3** Side-by-side view

#### F12. Audio Summary (TTS)
- **F12.1** Generate audio version pakai browser Web Speech API
- **F12.2** Playback controls (speed, pause)
- **F12.3** Future: integrate Eleven Labs free tier untuk quality lebih baik

### 6.3 Future Features (Phase 3 — Nice to Have)

- F13. Browser extension untuk one-click summarize
- F14. Chrome side panel integration
- F15. Notion/Obsidian export integration
- F16. Team workspace (collaborative summaries)
- F17. API access untuk developers
- F18. Custom summary templates (academic, business, casual)
- F19. Highlight/annotation system
- F20. Cross-video knowledge base (RAG over all your summaries)

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Scenario | Target |
|----------|--------|
| Page load (Lighthouse) | > 90 score |
| Time to first contentful paint | < 1.5s |
| Summary cached, time to display | < 500ms |
| Video 1 jam processing | < 60s p50, < 90s p95 |
| Video 6 jam processing | < 4 min p50, < 6 min p95 |
| Video 12 jam processing | < 8 min p50, < 12 min p95 |

### 7.2 Reliability

- Uptime target: 99.5% (cocok untuk free product)
- Graceful degradation: kalau Gemini API down, queue request dan retry
- Error tracking via Sentry (free tier)
- Failed jobs auto-retry max 3x dengan exponential backoff

### 7.3 Scalability

- Initial target: 500 daily summaries
- Architecture harus handle 5.000 daily summaries tanpa rewrite
- Background job queue untuk absorb spike traffic
- Aggressive caching untuk minimize API calls

### 7.4 Security & Privacy

- HTTPS only
- No store of personal user data tanpa explicit consent
- Public video only (tidak handle private/unlisted)
- Rate limiting per IP: 10 video/jam untuk anonymous, 50/jam untuk authenticated
- Sanitize all input untuk prevent injection
- Environment variables untuk semua secrets (API keys)

### 7.5 Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader friendly
- Color contrast minimal 4.5:1
- Focus indicators jelas

### 7.6 Internationalization

- UI: Bahasa Indonesia + English (MVP)
- Summary output: bahasa sumber atau translate ke bahasa user
- Future: Mandarin, Spanish, Japanese

---

## 8. Technical Architecture

### 8.1 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Tanstack Query untuk data fetching
- Zustand untuk client state
- React Hook Form + Zod untuk forms

**Backend:**
- Next.js Server Actions + Route Handlers
- Supabase (PostgreSQL) untuk database
- Supabase Auth (optional login dengan Google)
- Trigger.dev untuk background jobs (free tier: 10K runs/bulan)
- Upstash Redis untuk rate limiting & quick cache (free tier)

**AI/ML:**
- Gemini 2.0 Flash (primary) — 1M context, gratis dengan rate limit
- Fallback: Gemini 1.5 Flash untuk graceful degradation
- Future: Claude Haiku via Anthropic API untuk premium tier

**Infrastructure:**
- Vercel hosting (free tier)
- Supabase free tier (500MB DB, 1GB storage)
- Custom domain: $12/tahun
- Total monthly cost target: $0-10 untuk MVP

**Monitoring:**
- Vercel Analytics
- Sentry (error tracking, free tier)
- PostHog (product analytics, free tier)

### 8.2 System Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐         ┌──────────────┐
│  Next.js (Vercel)├────────►│   Supabase   │
│                 │         │  (DB + Auth) │
│  - Pages        │         └──────────────┘
│  - API Routes   │
│  - Server Actions│         ┌──────────────┐
│                 ├────────►│ Upstash Redis│
└────────┬────────┘         │  (Cache,     │
         │                  │   Rate Limit)│
         │                  └──────────────┘
         ▼
┌─────────────────┐
│  Trigger.dev    │
│  (Background    │
│   Jobs)         │
└────────┬────────┘
         │
         ├──────► YouTube (transcript scraping)
         │
         └──────► Gemini API (summarization)
```

### 8.3 Data Model

#### Tabel `videos`
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  channel_name TEXT,
  channel_id VARCHAR(50),
  duration_seconds INT NOT NULL,
  thumbnail_url TEXT,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  fetched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_videos_youtube_id ON videos(youtube_id);
```

#### Tabel `transcripts`
```sql
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  language VARCHAR(10),
  is_auto_generated BOOLEAN DEFAULT FALSE,
  raw_data JSONB NOT NULL, -- array of {text, start, duration}
  word_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, language)
);
```

#### Tabel `summaries`
```sql
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  language VARCHAR(10) DEFAULT 'en',
  strategy VARCHAR(20), -- 'single', 'chunked', 'hierarchical'
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  progress INT DEFAULT 0, -- 0-100
  current_step TEXT,
  content JSONB, -- structured summary
  model_used VARCHAR(50),
  tokens_input INT,
  tokens_output INT,
  processing_time_ms INT,
  error_message TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  share_slug VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_summaries_video_id ON summaries(video_id);
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_share_slug ON summaries(share_slug);
```

#### Tabel `qa_sessions`
```sql
CREATE TABLE qa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID REFERENCES summaries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  messages JSONB NOT NULL, -- [{role, content, citations, timestamp}]
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8.4 Core Algorithm — Summarization Pipeline

```typescript
// Pseudo-code

async function summarizeVideo(videoUrl: string, options: SummaryOptions) {
  // Step 1: Extract & validate
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) throw new Error('Invalid URL');

  // Step 2: Check cache
  const cached = await getCachedSummary(videoId, options.language);
  if (cached && !options.forceRefresh) return cached;

  // Step 3: Fetch metadata
  const metadata = await fetchVideoMetadata(videoId);
  if (metadata.duration > 12 * 3600) {
    throw new Error('Video exceeds 12-hour limit');
  }

  // Step 4: Fetch transcript
  const transcript = await fetchTranscript(videoId, options.language);
  if (!transcript) throw new Error('No transcript available');

  // Step 5: Choose strategy
  const strategy = chooseStrategy(metadata.duration);
  await updateProgress(videoId, 10, 'Strategy selected');

  // Step 6: Execute summarization
  let summary;
  switch (strategy) {
    case 'single':
      summary = await singlePassSummarize(transcript, metadata);
      break;
    case 'chunked':
      summary = await chunkedSummarize(transcript, metadata, {
        chunkSize: 30 * 60, // 30 minutes
      });
      break;
    case 'hierarchical':
      summary = await hierarchicalSummarize(transcript, metadata, {
        chunkSize: 60 * 60, // 1 hour
        groupSize: 3, // group 3 chunks together
      });
      break;
  }

  // Step 7: Post-process
  summary = await enrichWithTimestamps(summary, transcript);
  summary = await validateSummary(summary);

  // Step 8: Save & return
  await saveSummary(videoId, summary, options);
  return summary;
}

function chooseStrategy(durationSeconds: number): Strategy {
  if (durationSeconds < 2 * 3600) return 'single';
  if (durationSeconds < 6 * 3600) return 'chunked';
  return 'hierarchical';
}

async function chunkedSummarize(transcript, metadata, { chunkSize }) {
  const chunks = chunkByDuration(transcript, chunkSize);
  await updateProgress(metadata.id, 20, `Chunked into ${chunks.length} parts`);

  // Process parallel with rate limiting (max 5 concurrent)
  const chunkSummaries = await pMap(
    chunks,
    async (chunk, i) => {
      const result = await summarizeChunk(chunk, {
        chunkIndex: i,
        totalChunks: chunks.length,
        videoTitle: metadata.title,
      });
      await updateProgress(
        metadata.id,
        20 + Math.floor((i / chunks.length) * 60),
        `Summarized ${i + 1}/${chunks.length}`
      );
      return result;
    },
    { concurrency: 5 }
  );

  await updateProgress(metadata.id, 85, 'Synthesizing final summary');
  return synthesizeFromChunks(chunkSummaries, metadata);
}
```

### 8.5 Prompt Engineering

#### Master Prompt untuk Single Pass Summarization

```
You are an expert at distilling long-form video content into actionable summaries.

VIDEO METADATA:
- Title: {title}
- Channel: {channel}
- Duration: {duration}
- Language: {language}

TRANSCRIPT:
{transcript}

OUTPUT FORMAT:
Return a JSON object with this exact schema:
{
  "tldr": "2-3 sentence summary capturing the core message",
  "overview": "1-2 paragraph executive summary",
  "chapters": [
    {
      "title": "Chapter title",
      "startTime": <seconds>,
      "endTime": <seconds>,
      "summary": "Detailed paragraph summary of this chapter"
    }
  ],
  "keyPoints": [
    {
      "point": "Specific insight or claim",
      "timestamp": <seconds>,
      "importance": "high|medium|low"
    }
  ],
  "keyQuotes": [
    {
      "quote": "Exact memorable quote",
      "speaker": "Speaker name if identifiable",
      "timestamp": <seconds>
    }
  ],
  "actionItems": ["concrete takeaway 1", "..."],
  "topics": ["main topic 1", "..."]
}

GUIDELINES:
1. Extract 5-15 chapters depending on video length and content density
2. Include 8-20 key points, prioritized by importance
3. Extract 3-8 memorable quotes that capture key ideas
4. Action items must be concrete and actionable
5. Topics: 5-10 main themes covered
6. Use exact timestamps from transcript
7. Write in {output_language}
8. Preserve technical terms and proper nouns
9. Do not invent information not in the transcript
10. If video has clear chapters from uploader, use those as baseline
```

#### Chunk Summarization Prompt

```
You are summarizing chunk {chunk_index} of {total_chunks} from a longer video.

CONTEXT:
- Video title: {title}
- This chunk covers: {chunk_start_time} to {chunk_end_time}
- Previous chunk ended discussing: {previous_chunk_topic}

CHUNK TRANSCRIPT:
{chunk_transcript}

TASK:
Produce a detailed summary of THIS CHUNK ONLY. Output JSON:
{
  "chunkTitle": "Suggested chapter title",
  "summary": "Detailed paragraph",
  "keyPoints": [{point, timestamp, importance}],
  "keyQuotes": [{quote, speaker, timestamp}],
  "topicsDiscussed": ["topic1", ...],
  "transitionsTo": "What this chunk leads into"
}

Be detailed — this will be combined with other chunk summaries later.
```

#### Synthesis Prompt

```
You are synthesizing summaries from {n} chunks into a unified video summary.

VIDEO METADATA:
- Title: {title}
- Total duration: {duration}

CHUNK SUMMARIES:
{chunk_summaries_json}

TASK:
Produce a unified summary following the full output schema (tldr, overview, chapters, keyPoints, keyQuotes, actionItems, topics).

PRINCIPLES:
1. Merge similar chapters intelligently
2. Pick THE BEST quotes (not all)
3. Synthesize keyPoints — promote ones that appear across multiple chunks
4. Action items: consolidate, dedupe, prioritize
5. Topics: identify the MAIN themes (not exhaustive list)
6. Preserve all original timestamps
7. TLDR must reflect the FULL video, not just first chunks
```

---

## 9. UI/UX Requirements

### 9.1 Key Screens

1. **Landing Page**
   - Hero: "Summarize any YouTube video, even 12-hour ones"
   - Input field prominent
   - Sample summaries dengan video populer
   - How it works (3 steps)
   - Pricing (FREE) badge

2. **Processing Page**
   - Video thumbnail + metadata
   - Progress bar dengan current step
   - Estimated time remaining
   - "Notify me" email input
   - Fun loading messages

3. **Summary View**
   - Header: video metadata, duration, processing info
   - Embedded YouTube player (sticky sidebar atau collapsible)
   - Main content tabs:
     - **Overview** (TLDR + executive summary)
     - **Chapters** (timestamped sections)
     - **Key Points** (sortable by importance)
     - **Quotes** (card layout)
     - **Action Items** (checklist style)
   - Q&A floating button
   - Export/share toolbar

4. **Dashboard (logged-in)**
   - History grid dengan thumbnails
   - Search & filter
   - Folders/tags (Phase 2)

5. **Public Share Page**
   - Read-only summary view
   - "Make your own" CTA
   - Social share buttons

### 9.2 Design Principles

- **Clarity over cleverness** — informasi harus immediately scannable
- **Reading-first** — typography optimized untuk long-form reading
- **Mobile-friendly** — banyak user akan baca di HP
- **Fast perceived performance** — show skeleton, progressive disclosure
- **Delightful loading** — long processing harus tetap menyenangkan

### 9.3 Wireframe Sketch (Summary View)

```
┌──────────────────────────────────────────────────────┐
│  [Logo]    My Summaries    Account                   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  [Thumbnail]  Lex Fridman Podcast: AI Future         │
│               3h 42m · Processed in 2m 14s            │
│               [Export ▾] [Share] [Q&A]                │
│                                                       │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ [Overview][Chapters] │  │                      │  │
│  │ [Points][Quotes][Do] │  │   [Video Player]     │  │
│  │                      │  │                      │  │
│  │  TL;DR               │  │   ⏱ Current: 12:34  │  │
│  │  Lorem ipsum dolor..│  │                      │  │
│  │                      │  └──────────────────────┘  │
│  │  Overview            │                            │
│  │  Detailed para...    │   Reading Time: 8 min      │
│  │                      │                            │
│  │  Key Points          │   Topics:                  │
│  │  • Point 1 [12:34]  │   #AI #Philosophy #Tech   │
│  │  • Point 2 [45:12]  │                            │
│  │                      │                            │
│  └──────────────────────┘                            │
└──────────────────────────────────────────────────────┘
```

---

## 10. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| YouTube blocks transcript scraping | Medium | High | Pakai multiple libraries, fallback ke Whisper API kalau perlu |
| Gemini API rate limit | High | Medium | Aggressive caching, queue, multiple API keys rotation |
| Gemini quality drop pada chunk synthesis | Medium | Medium | Hierarchical strategy, prompt tuning, eval set |
| Cost explosion kalau viral | Medium | High | Rate limit per IP, daily caps, monitoring alerts |
| Video tanpa transcript (banyak) | High | Medium | Clear messaging, opsi Whisper transcription (later) |
| Legal: copyright concern | Low | High | Terms clearly state user-provided URL, no rehosting content, fair use disclaimer |
| Competitor launches similar | Medium | Medium | Move fast, focus on long-form niche, build community |
| Solo developer burnout | High | High | Realistic timeline, phase releases, don't over-promise |

---

## 11. Implementation Roadmap

### Phase 1 — MVP (6 minggu)

**Week 1: Foundation**
- Setup Next.js project, Supabase, Vercel deployment
- Database schema implementation
- Basic UI: landing, input form, navigation shell
- YouTube URL validation logic
- Transcript fetching (test dengan video pendek)

**Week 2: Single-Pass Summarization**
- Gemini API integration
- Implement single-pass summarization (< 2 jam video)
- Display summary view (overview tab)
- Caching layer

**Week 3: Long-Form Strategy**
- Implement chunking algorithm
- Setup Trigger.dev untuk background jobs
- Progress tracking (DB + polling/SSE)
- Test dengan video 2-6 jam

**Week 4: Hierarchical & Polish**
- Implement hierarchical strategy
- Test dengan video 6-12 jam
- Optimize prompts berdasarkan eval
- All summary tabs (chapters, quotes, action items)

**Week 5: UX Polish & Export**
- Timestamp navigation (click to jump)
- Export (Markdown, copy)
- Share public links
- Dark mode
- Mobile responsive

**Week 6: Launch Prep**
- Error handling & edge cases
- Rate limiting implementation
- Analytics (PostHog) integration
- Landing page polish
- Sample summaries content
- Soft launch ke 10-20 beta users

### Phase 2 — Growth (Bulan 2-3)

- Q&A mode dengan citations
- Multi-language summaries
- Topic tracking & search
- User accounts & dashboard
- PDF export
- SEO content (blog posts dari summaries populer)

### Phase 3 — Scale (Bulan 4-6)

- Browser extension
- Comparison mode
- Notion/Obsidian export
- API access (paid)
- Premium tier dengan model upgrade (Claude/GPT-4)

---

## 12. Open Questions

1. Apakah perlu user authentication untuk MVP, atau anonymous saja? (Rekomendasi: anonymous-first, auth optional untuk save history)
2. Bagaimana handle video dengan transcript tapi quality jelek (auto-gen)? Tetap proses dengan warning atau reject?
3. Strategi monetization: ads, freemium, atau donation? Tunggu data dulu sebelum decide.
4. Bahasa default UI: Indonesia atau English? (Rekomendasi: detect dari browser, default ke English untuk reach lebih luas)
5. Apakah perlu OAuth dengan YouTube untuk akses video private user sendiri? (Tidak untuk MVP — adds complexity, low value)

---

## 13. Appendix

### A. Glossary

- **Chunking** — proses memecah transcript panjang jadi bagian-bagian yang fit ke LLM context window
- **Hierarchical Summarization** — multi-level summarization (chunk → group → final)
- **LLM Context Window** — jumlah token yang bisa diproses LLM dalam satu kali API call
- **TTS** — Text-to-Speech
- **TTL** — Time To Live (durasi cache valid)

### B. Reference Tools & Libraries

- `youtube-transcript` — npm package untuk fetch YouTube transcript
- `googleapis` — official Google APIs SDK (untuk Gemini)
- `@trigger.dev/sdk` — background jobs platform
- `@upstash/redis` — serverless Redis untuk cache & rate limit
- `p-map` — concurrency control untuk parallel processing
- `@react-pdf/renderer` — PDF generation
- `sonner` — toast notifications
- `lucide-react` — icon library

### C. Competitor Analysis

| Tool | Strength | Weakness | Our Differentiation |
|------|----------|----------|---------------------|
| Glasp | Browser extension, social | Limited to short videos | Long-form support |
| Eightify | Good UX | Paid, limit pendek | Free, long-form |
| Summarize.tech | Free, simple | Quality inconsistent, no long-form | Better quality, structured output |
| YouTube AI Summary | Native YouTube | Limited features | Q&A, export, multi-lang |

### D. Validation Strategy

Sebelum/saat development, validate via:
1. Posting di Reddit (r/productivity, r/podcast) untuk gauge interest
2. Beta program dengan 20 users, weekly feedback
3. Track behavior: berapa % user yang summarize > 1 video
4. NPS survey setelah 5 summaries

### E. Cost Projections

**Bulan 1 (100 users, 500 summaries):**
- Vercel: $0 (free tier)
- Supabase: $0 (free tier)
- Gemini API: ~$0 (free tier 1.5M tokens/day)
- Trigger.dev: $0 (free tier)
- Upstash: $0 (free tier)
- Domain: $1/bulan
- **Total: ~$1/bulan**

**Bulan 6 (2.000 users, 10.000 summaries):**
- Vercel: $0-20 (likely still free)
- Supabase: $0-25 (might need Pro)
- Gemini API: $50-150
- Trigger.dev: $0-20
- Upstash: $0-10
- Domain: $1
- **Total: ~$60-200/bulan**

---

**Document Status:** READY FOR DEVELOPMENT
**Next Step:** Setup repo, init project, kickoff Week 1 tasks

---

*PRD ini adalah living document. Update sesuai progress, learnings, dan user feedback.*

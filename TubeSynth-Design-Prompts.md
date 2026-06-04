# TubeSynth — UI/UX Design Prompts
## Untuk Generate Design di Claude (Artifacts)

---

## Cara Pakai Dokumen Ini

1. **Mulai dengan Master Design Brief** (Section 1) — paste ini dulu untuk set context
2. **Lanjutkan dengan Screen Prompts** (Section 2 onwards) — generate satu screen at a time untuk hasil terbaik
3. **Iterate dengan refinement prompts** (Section 7) — improve hasilnya step-by-step

**Tips Penting:**
- Generate **satu screen per artifact** untuk hasil maximum quality
- Jangan minta semua sekaligus, hasilnya jadi mediocre
- Untuk responsive: minta desktop dulu, baru mobile variant
- Save artifact yang bagus, reference di prompt selanjutnya untuk consistency

---

## SECTION 1: MASTER DESIGN BRIEF

Paste prompt ini **di awal conversation** untuk set context. Setelah ini baru lanjut ke screen-specific prompts.

```
I'm designing a product called TubeSynth — a web app that summarizes long YouTube videos (up to 12 hours) into structured, readable summaries with timestamps, key quotes, and Q&A.

I want you to act as a senior product designer with strong taste, inspired by products like Linear, Substack, Vercel, Arc Browser, and Notion. Avoid generic AI dashboard aesthetics (no boring sidebars with gradients, no over-the-top glassmorphism, no "ChatGPT clone" look).

==================================
PRODUCT PERSONALITY
==================================
- Editorial, calm, premium — feels like a high-quality reading app
- Confident but not loud
- Built for focus, not distraction
- Respects user's intelligence

==================================
TARGET USERS
==================================
- Knowledge workers, researchers, students, content creators
- People who value their time and dislike fluffy interfaces
- Both Indonesia and global audience

==================================
DESIGN SYSTEM
==================================

COLORS (Light Mode):
- Background: #FAFAF7 (warm off-white, paper-like)
- Surface: #FFFFFF (cards, elevated)
- Border: #E8E6E0 (subtle warm gray)
- Text Primary: #0F0F0F (near black)
- Text Secondary: #5C5C5C (medium gray)
- Text Tertiary: #8A8A8A (light gray)
- Accent: #E85D2F (warm coral — energy without YouTube red)
- Accent Hover: #D44A1F
- Success: #2D7A3E
- Warning: #C77D0E
- Danger: #B83A2E

COLORS (Dark Mode — primary aesthetic):
- Background: #0E0E0C (deep warm black)
- Surface: #18181A (elevated cards)
- Surface 2: #222224 (modals, popovers)
- Border: #2A2A2C (subtle dividers)
- Text Primary: #F5F5F0 (warm white)
- Text Secondary: #A8A8A0 (warm gray)
- Text Tertiary: #6B6B65 (muted)
- Accent: #FF7A4D (slightly brighter coral for dark bg)
- Accent Hover: #FF9068

TYPOGRAPHY:
- Display/Headings: "Instrument Serif" or "Newsreader" (editorial serif, italic-friendly)
- Body: "Inter" (clean, neutral, excellent readability)
- Mono: "JetBrains Mono" (for timestamps, code)
- Sizes: 13/14/15/16 base, with generous line-height (1.6 for body, 1.2 for headings)

SPACING:
- Generous, not cramped
- Use 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- Reading content max-width: 680px (optimal for prose)
- Comfortable padding around interactive elements

VISUAL STYLE:
- Minimal borders (1px, subtle warm gray)
- Subtle shadows for elevation (rarely, only when needed)
- Border radius: 8px standard, 12px for cards, 999px for pills
- Smooth transitions (200ms cubic-bezier)
- Subtle hover states (background tint, not heavy effects)
- Icons: Lucide React (outline style, 16-20px standard)

ANTI-PATTERNS (DO NOT DO):
- ❌ Linear gradient backgrounds across the whole page
- ❌ Glassmorphism / heavy backdrop blur
- ❌ Neon colors or excessive accent usage
- ❌ Generic SaaS sidebar layouts
- ❌ Stock illustrations with floating shapes
- ❌ "Powered by AI" badges everywhere
- ❌ Cluttered dashboards with too many widgets
- ❌ Tiny text (anything below 13px for body)

==================================
TECHNICAL CONSTRAINTS
==================================
- Generate as React component using Tailwind CSS
- Use shadcn/ui patterns where applicable
- Icons from lucide-react
- Make it fully responsive (we'll do mobile separately)
- Default to DARK MODE for the main views (it's the primary aesthetic)
- Include realistic placeholder content (NOT lorem ipsum)
- Use actual YouTube video examples for realism (Lex Fridman, Andrej Karpathy lectures, etc.)

Confirm you understand the brief, then wait for me to specify which screen to design first.
```

---

## SECTION 2: LANDING PAGE PROMPT

```
Design the LANDING PAGE for TubeSynth.

GOAL: Convert visitors to try the product within 5 seconds of landing.

STRUCTURE (top to bottom):

1. NAVIGATION BAR
- Logo "TubeSynth" (use a simple wordmark with subtle accent on one letter)
- Right side: "How it works" link, "Examples" link, "Sign in" (ghost button)
- Sticky on scroll, minimal padding when scrolled

2. HERO SECTION (above fold, ~80vh)
- Eyebrow text (small, accent color): "FOR PEOPLE WHO VALUE TIME"
- Headline (large serif, italic emphasis on key word): "Read any YouTube video, *even 12-hour ones*."
- Subtext (1 line): "Structured summaries with timestamps, key quotes, and Q&A. Built for podcasts, lectures, and conference recordings."
- Primary input field (prominent, ~600px wide):
  - Placeholder: "Paste a YouTube URL..."
  - Large submit button next to it: "Summarize →"
- Below input, small text: "Free. No signup required. Works with videos up to 12 hours."
- Subtle visual element on the right or background — maybe a stylized waveform, or a faux "summary preview" floating panel showing what they'll get
- NO stock illustrations

3. SOCIAL PROOF STRIP
- "Trusted by 2,000+ readers from companies like" + 5-6 company logos in grayscale (you can use placeholder text logos)

4. HOW IT WORKS (3 steps, horizontal cards)
- Step 01: "Paste a link" — any YouTube video, even hours long
- Step 02: "We process" — chunking, AI summarization, smart synthesis
- Step 03: "You read" — structured summary in minutes
- Each card: number in large serif font, title, 2-line description, subtle icon

5. EXAMPLE SUMMARIES SECTION
- Headline: "See what you'd get"
- Tab-like switcher: "Lex Fridman Podcast" | "Andrej Karpathy Lecture" | "AWS re:Invent Keynote"
- Below tabs: preview of actual summary (TLDR + 2-3 key points with timestamps)
- "See full summary →" CTA

6. FEATURES GRID (2x3)
Highlight 6 features, each as a small card:
- "Up to 12-hour videos" with infinity-like icon
- "Timestamped highlights" with clock icon
- "Ask questions" with chat icon
- "Export to anywhere" with download icon
- "Multi-language support" with globe icon
- "Always free for personal use" with heart icon

7. FAQ SECTION
- 5-6 collapsible questions:
  - "Is it really free?"
  - "How does it handle very long videos?"
  - "What about videos without captions?"
  - "Can I use it for commercial purposes?"
  - "Is my data private?"

8. FOOTER
- Minimal: copyright, Twitter link, "Made with care in Indonesia"

DESIGN NOTES:
- Use serif headings sparingly but impactfully (Instrument Serif or similar)
- Plenty of vertical breathing room
- Single-column flow, max-width 1200px
- Coral accent used SPARINGLY — only on CTAs and 1-2 italic words in headlines
- Add subtle entrance animations (fade-up on scroll)
- Show realistic copy, no lorem ipsum

Generate as a single React component with Tailwind. Use dark mode as default.
```

---

## SECTION 3: SUMMARY VIEW (Main Screen) PROMPT

```
Design the SUMMARY VIEW — this is the most important screen of the app, where users actually consume the summary.

CONTEXT: User has just finished processing a 3h 42m Lex Fridman podcast with Andrej Karpathy. They're here to read the summary.

LAYOUT (Desktop):

┌────────────────────────────────────────────────────────────┐
│  Top Bar (slim, sticky):                                   │
│  [← Back]  TubeSynth  [Search history]   [Account ▾]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Content (max-width 1200px, centered):                     │
│  ┌─────────────────────────────┬───────────────────────┐  │
│  │ MAIN COLUMN (680px)         │ SIDEBAR (320px)       │  │
│  │                             │                       │  │
│  │ Video Header                │ ┌─────────────────┐   │  │
│  │ Tab Navigation              │ │ Video Player    │   │  │
│  │ Active Tab Content          │ │ (sticky)        │   │  │
│  │                             │ └─────────────────┘   │  │
│  │                             │ Metadata             │  │
│  │                             │ Topics chips         │  │
│  │                             │ Action toolbar       │  │
│  └─────────────────────────────┴───────────────────────┘  │
└────────────────────────────────────────────────────────────┘

DETAILED SPECS:

VIDEO HEADER (top of main column):
- Tiny breadcrumb: "Lex Fridman Podcast" (channel name, muted)
- Video title (serif, large, ~32px): "Andrej Karpathy: Software in the Era of AI"
- Metadata row: "3h 42m" • "Processed in 2m 14s" • "1,247 reads"
- Subtle separator below

TAB NAVIGATION (horizontal, underlined active state):
Tabs: "Overview" | "Chapters" | "Key Points" | "Quotes" | "Action Items"
- Subtle, not buttons — more like editorial section tabs
- Active tab: underline accent color + slightly bolder
- Counter badges next to each tab (e.g., "Chapters (12)", "Quotes (8)")

OVERVIEW TAB CONTENT:
- "TL;DR" section heading (serif, italic)
- 2-3 sentence summary in large body text (~18px)
- Subtle horizontal rule
- "Overview" section heading
- 2-3 paragraphs of executive summary
- Generous line-height (1.7), serif optional for emphasis

CHAPTERS TAB CONTENT (when active):
- List of 8-12 chapters as cards/items
- Each chapter:
  - Timestamp (mono font, accent color): "00:14:32 — 00:32:08"
  - Chapter title (serif, medium): "On the Death of Software Engineering"
  - 2-3 sentence summary (body, secondary text)
  - Hover state: subtle background tint + arrow icon appears
- Click → jumps video player to that timestamp

KEY POINTS TAB:
- List of 15-20 points
- Each point:
  - Timestamp pill (small, clickable, mono)
  - Importance indicator (subtle dot: filled = high, half = medium, empty = low)
  - Point text (body, 1-2 lines)
- Sort/filter controls at top: "By importance" | "Chronological"

QUOTES TAB:
- 2-column masonry layout (single column on mobile)
- Each quote in a card:
  - Large quote mark icon (subtle, accent)
  - Quote text (serif, italic, ~17px)
  - Speaker name + timestamp at bottom
  - Subtle border, no heavy shadow

ACTION ITEMS TAB:
- Checklist style
- Each item: checkbox (subtle, no accent until checked) + text
- "Mark all" / "Clear" tiny actions at top

SIDEBAR (right column):

VIDEO PLAYER:
- Embedded YouTube player at top (16:9, rounded corners)
- Below player, small "Now playing: [current timestamp]" indicator
- Player is sticky as user scrolls

METADATA CARD:
- Compact card below player
- Reading time: "~8 min read"
- Word count: "2,341 words"
- Language: "English"
- Generated: "2 hours ago"

TOPICS (chips):
- Heading: "Topics covered"
- Wrap chips: #AI #SoftwareEngineering #Education #FutureOfWork
- Subtle outline style, hoverable

ACTION TOOLBAR (sticky bottom of sidebar):
- Q&A button (primary, full width): "💬 Ask about this video"
- Row of icon buttons: Export, Share, Bookmark, Copy link
- Each icon has subtle hover state with tooltip

DESIGN PRINCIPLES:
- READING-FIRST: typography is the hero
- Generous whitespace, never cramped
- Timestamps are SUPER prominent and clickable (mono font, accent)
- Use serif for emphasis and headings, sans-serif for body
- Dark mode default (we're in deep focus mode)
- Subtle micro-interactions on hover
- No heavy borders, no glassmorphism

Generate as React with Tailwind. Make the Overview tab visible by default. Include realistic Karpathy/Lex content. Make it feel premium.
```

---

## SECTION 4: PROCESSING/LOADING STATE PROMPT

```
Design the PROCESSING STATE that users see while their video is being summarized.

CONTEXT: User just submitted a 6-hour podcast. They're now waiting. This screen needs to feel premium and not boring — the wait is part of the product experience.

LAYOUT (centered, full-screen takeover):

TOP:
- Same minimal top bar as other screens
- "← Cancel" small ghost button on the left

CENTER (vertically + horizontally centered, max-width 600px):

1. VIDEO PREVIEW CARD
- Thumbnail (rounded, with subtle play icon overlay)
- Title: "AI and the Future of Programming" (serif)
- Channel + duration: "Lex Fridman Podcast · 6h 12m"

2. STATUS SECTION (below video card)
- Current step in serif, italic, medium size: "*Synthesizing final summary...*"
- Progress bar: thin, accent color, animated shimmer
- Percentage: "78%" (small, mono, muted)
- Below progress: "Estimated 1m 24s remaining"

3. STEP INDICATOR (vertical list, subtle)
- ✓ Fetching transcript
- ✓ Detecting chapters
- ✓ Summarizing chunks (12/12)
- ◐ Synthesizing final summary  ← active, with spinner
- ○ Polishing output
- Each step has subtle state styling: completed (checked + dim), active (spinner + accent), pending (empty circle + muted)

4. ROTATING LOADING MESSAGE
- Below steps, small italic text that rotates every 3-4 seconds:
- Examples:
  - "Karpathy's making some bold claims here..."
  - "Found 47 interesting moments so far..."
  - "Cross-referencing key concepts..."
  - "Almost there, the synthesis is the hardest part..."
- Should feel human, slightly playful, but not silly

5. OPTIONAL EMAIL NOTIFICATION
- Below messaging, small section:
- "This is taking a while. Want us to email you when it's ready?"
- Inline email input + "Notify me" button (subtle, ghost style)

6. WHILE YOU WAIT SECTION
- Below the main flow, smaller text section
- Heading: "While you wait"
- 2-3 sample summaries from other videos as small cards (could be educational)
- "Browse more examples →"

VISUAL TREATMENT:
- The center stack should feel CALM and intentional, not anxious
- Background: same dark mode, but maybe with a VERY subtle radial gradient behind the center content
- The active step's spinner is small and elegant (not a big loading wheel)
- Progress bar has a subtle shimmer animation
- Transitions between steps should be smooth (200ms fade)
- Avoid all "loading dot" clichés

ANIMATION DETAILS:
- Steps tick off with a subtle scale + fade
- Rotating messages slide up/fade smoothly
- Progress bar fills smoothly with cubic-bezier easing
- No bouncing, no excessive motion

Generate as React with Tailwind. Make it feel like the wait is enjoyable, not painful.
```

---

## SECTION 5: Q&A INTERFACE PROMPT

```
Design the Q&A MODAL/PANEL — where users ask questions about the video and get answers with timestamp citations.

INVOCATION: User clicks "Ask about this video" from sidebar. This opens as a side panel (slide in from right), NOT a full takeover.

LAYOUT (side panel, ~480px wide, full height):

HEADER (top of panel):
- Small breadcrumb: "Q&A about *Andrej Karpathy: Software in the Era of AI*"
- Close button (X) on the right
- Subtle border below

EMPTY STATE (when first opened):
- Center of panel, vertical stack:
- Subtle icon (chat/sparkle, minimal)
- Heading (serif): "Ask anything about this video"
- Subtext: "I'll answer with exact timestamps so you can verify."
- Suggested questions as clickable chips:
  - "What's the main thesis?"
  - "What does Karpathy say about LLMs and education?"
  - "What are the controversial takes?"
  - "Best moments to share?"
  - "What's the most surprising claim?"

CONVERSATION STATE:
- Scrollable message list (newest at bottom)
- User messages: right-aligned, subtle background tint, no avatar
- AI responses: left-aligned, no avatar (just text)
- Response style:
  - Body text (serif optional for important points)
  - Inline citations as clickable timestamp pills: like "[14:32]" in accent color
  - Click citation → video jumps to that moment (sidebar visible behind panel)
  - Multiple citations can appear in one paragraph

MESSAGE COMPOSITION:
- Sticky at bottom of panel:
- Textarea (auto-growing, max 4 lines)
- Placeholder: "Ask a follow-up..."
- Send button: subtle, only highlights when text exists
- Below textarea: tiny hint "Cmd+Enter to send"

THINKING STATE (while AI responds):
- Subtle animated dots or "thinking..." in italic
- Should feel light, not heavy loading
- AI response streams in token-by-token (like ChatGPT)

INTERACTION DETAILS:
- Cmd/Ctrl+K shortcut anywhere on the page opens this panel
- Esc closes it
- Conversation auto-saves
- Bottom of panel: small "Clear conversation" link

VISUAL TREATMENT:
- Panel slides in from right with backdrop dim (subtle, not heavy)
- The video player in sidebar remains visible AND interactive
- Citations are the hero — make them feel important and tappable
- Subtle "AI" indicator at top (small, not flashy badge)

EXAMPLE CONVERSATION TO INCLUDE:
User: "What does Karpathy think about LLMs replacing programmers?"

AI: "Karpathy's view is nuanced — he doesn't think LLMs will *replace* programmers, but they will fundamentally change what programming means. He argues that natural language is becoming the new programming language [14:32], and the role of a programmer will shift toward orchestration and prompt engineering [28:45].

He's particularly excited about the democratization aspect, mentioning that 'now anyone who can describe what they want can build software' [45:21]. However, he warns that this doesn't eliminate the need for deep technical understanding — it actually increases it for the people building the foundations [1:12:08]."

User: "What's his timeline for this transformation?"

[show this conversation in the design]

Generate as React + Tailwind. Make citations CLEARLY clickable. Premium feel, not chatbot-y.
```

---

## SECTION 6: DASHBOARD (Logged-in User) PROMPT

```
Design the USER DASHBOARD — where logged-in users see their history of summaries.

CONTEXT: User has summarized 30+ videos over the past 2 months. They need to find old summaries quickly and create new ones easily.

LAYOUT:

TOP BAR:
- Logo on left
- Center: search bar (prominent, expandable)
  - Placeholder: "Search your summaries..."
  - Cmd+K shortcut indicator
- Right: account dropdown + "New Summary" primary CTA

MAIN CONTENT (max-width 1280px, centered):

TOP SECTION (above the fold):
- Small greeting: "Welcome back, Andi" (subtle, secondary text)
- Stats strip (horizontal, 4 small stats):
  - "47 summaries" 
  - "186 hours saved"
  - "12 hours of content this week"
  - "Streak: 8 days"
- Each stat: number in large serif + label in small muted text
- Subtle dividers between stats

NEW SUMMARY INPUT (prominent, below stats):
- Same input field from landing page, but slightly smaller
- "Paste a YouTube URL to summarize..."
- Big submit button

FILTERS/SORT BAR:
- Tabs: "All" | "Recent" | "Favorites" | "Folders"
- Right side: Sort dropdown ("Recently added" / "Oldest" / "By duration")
- View toggle: Grid / List icons

SUMMARY GRID/LIST:

GRID VIEW (3 columns desktop):
Each summary card:
- Thumbnail (16:9, rounded top corners)
- Card body:
  - Channel name (tiny, muted)
  - Video title (2 lines max, ellipsis, serif)
  - Bottom row: duration · summarized X time ago
- Hover state: subtle lift + show "Continue reading" overlay
- Top-right corner of thumbnail: subtle bookmark icon (filled if favorited)

LIST VIEW:
Each row:
- Small thumbnail (left, 80x45)
- Title + channel (middle, takes most space)
- Duration + date (right, muted)
- Icon actions on hover: bookmark, share, delete

EMPTY STATE (for new users):
- Center of grid area
- Subtle illustration or icon (NOT stock illustration)
- "No summaries yet"
- "Paste any YouTube URL above to get started"

FOLDERS/COLLECTIONS (if Folders tab active):
- Show folders as cards (like macOS folder feel)
- Each folder: name, count, last updated
- "+ New folder" card with dashed border

SIDEBAR (optional, can hide):
- Compact, ~200px wide
- Sections:
  - Library (default selected)
  - Favorites
  - Folders (expandable list)
  - Recently viewed
  - Trash
- Bottom: usage info ("47/50 free summaries this month") with subtle progress

VISUAL TREATMENT:
- Cards have subtle border, no heavy shadows
- Thumbnails dominate the visual hierarchy
- Lots of whitespace between cards
- Hover states are subtle (lift, tint, not flashy)
- Search bar is the productivity star
- Dark mode default

INTERACTIONS:
- Click summary → opens summary view
- Right-click summary → context menu (favorite, share, delete, move to folder)
- Drag to reorder favorites
- Cmd+K opens search from anywhere

INCLUDE REALISTIC EXAMPLES:
- "Andrej Karpathy: Software in the Era of AI" — Lex Fridman Podcast — 3h 42m
- "AWS re:Invent 2025 Keynote" — AWS Events — 2h 15m
- "MIT 6.S191: Introduction to Deep Learning" — Alexander Amini — 1h 02m
- "Naval Ravikant on Wealth & Happiness" — Joe Rogan Experience — 4h 18m
- "How Transformers Work" — 3Blue1Brown — 28m
- (Add 4-5 more realistic ones)

Generate as React + Tailwind. Make it feel like Linear meets Substack — productive but readable.
```

---

## SECTION 7: ADDITIONAL SCREEN PROMPTS

### 7.1 Error State Prompt

```
Design the ERROR STATE for when video processing fails (e.g., no transcript available).

LAYOUT (centered card, ~500px):
- Subtle icon (NOT a big red X — something more thoughtful, maybe a broken link icon, minimal)
- Heading (serif): "We couldn't process this video"
- Body text explaining the specific issue:
  - "This video doesn't have a transcript or captions available. YouTube relies on either the creator providing captions or auto-generation, and neither is available here."
- Suggestions (bulleted, simple):
  - "Try a different video from the same channel"
  - "Check if the video has CC enabled when you play it"
  - "Some live streams take time to generate captions"
- Two CTAs:
  - Primary: "Try another video"
  - Secondary (ghost): "Report this issue"
- Below: tiny "Error code: NO_TRANSCRIPT_AVAILABLE" in mono, muted

Calm tone, not alarming. Generate as React + Tailwind.
```

### 7.2 Public Share Page Prompt

```
Design the PUBLIC SHARE PAGE — when someone shares a summary publicly, this is what visitors see.

KEY DIFFERENCE FROM SUMMARY VIEW:
- Slightly different top bar: focuses on "Make your own" CTA
- Watermark/attribution: "Summary by [user] via TubeSynth"
- Footer adds: "TubeSynth helps you read any YouTube video. Try it free →"
- Otherwise same beautiful reading experience

Add a subtle banner at the top: "💡 You're viewing a shared summary. Create your own →"

Generate as React + Tailwind. Make conversion the secondary goal, not intrusive.
```

### 7.3 Mobile View Prompt

```
Design the MOBILE VERSION of the Summary View (the most important screen).

CONSTRAINTS:
- Viewport: 375px width (iPhone standard)
- Single column, no sidebar
- Video player at top, collapsible

LAYOUT:
- Sticky mini top bar: back button, video title (truncated), menu (3 dots)
- Collapsible video player at top (can be hidden)
- Tab navigation: scrollable horizontal pills (Overview, Chapters, Key Points, Quotes, Actions)
- Content below in single column
- Bottom: floating action button for Q&A (right side, subtle)

OPTIMIZATIONS:
- Larger tap targets (min 44px height)
- Typography slightly smaller but still readable (15px body)
- Timestamps still prominent
- Easy thumb access to common actions

Generate as React + Tailwind, demonstrate as if it's in a phone frame.
```

### 7.4 Onboarding Flow Prompt

```
Design a 3-STEP ONBOARDING that appears after first signup.

STEP 1: Welcome
- Hero: "Welcome to TubeSynth"
- Subtext: 1 sentence about value
- "Let's get you started" button

STEP 2: Try it
- "Paste your first YouTube URL"
- Input field (large)
- Suggested examples: 3 popular videos as clickable cards
- Skip option (muted)

STEP 3: Quick preferences
- "How will you use TubeSynth?"
- 4 cards (single-select):
  - "Podcasts & interviews"
  - "Lectures & courses"
  - "Conference talks"
  - "Mix of everything"
- This personalizes future recommendations

Should feel CONVERSATIONAL, not bureaucratic. Generate as React + Tailwind.
```

---

## SECTION 8: REFINEMENT & ITERATION PROMPTS

Use these to improve any generated design.

### 8.1 Make it More Premium

```
The design is good but feels slightly generic. Make it more premium:
- Use more editorial typography (serif headers with italics)
- Add more whitespace, especially around the main content
- Reduce visual noise (fewer borders, simpler hover states)
- Use the accent color even more sparingly — only 1-2 places max
- The mono font for timestamps should feel more deliberate
- Subtle entrance animations (200ms fade-up)

Don't change the structure, just refine the visual treatment.
```

### 8.2 Make it More "Linear-like"

```
Refine the design to feel more like Linear (linear.app):
- Tighter typography
- More efficient information density (but still readable)
- Subtle borders instead of cards-with-shadows
- Hover states that feel snappy and responsive
- Use keyboard shortcuts visibly
- Slight gradient hints (very subtle, only in specific places)
```

### 8.3 Improve Reading Experience

```
Optimize for reading:
- Increase body text size to 17px
- Line-height to 1.75
- Max-width of reading content to 680px
- Use a serif font for body if it improves readability
- Add subtle drop caps at the start of major sections
- Better paragraph spacing (24px between paragraphs)
- Ensure timestamp pills don't break reading flow
```

### 8.4 Improve Dark Mode

```
Refine the dark mode:
- The background should be warmer (not pure black, more #0E0E0C)
- Surfaces should layer subtly (background → surface → elevated)
- Text contrast should hit WCAG AA at minimum
- Accent color should be slightly brighter in dark mode (#FF7A4D)
- Borders should be visible but not harsh (#2A2A2C area)
- Avoid pure white text — use #F5F5F0 for warmth
```

### 8.5 Add Personality

```
The design feels too clinical. Add personality:
- Use serif italics for moments of emphasis
- Loading messages should feel human ("Almost there..." not "78%")
- Empty states should have a friendly tone
- Microcopy throughout should feel written by a human, not a corporation
- One small delightful detail (like a custom cursor on hover for video timestamps)
```

---

## SECTION 9: GENERATION TIPS

### Tips for Best Results

1. **Always paste the Master Brief first** — sets the foundation
2. **Generate one screen at a time** — multi-screen prompts produce mediocre results
3. **If first generation isn't great, refine with specific feedback** — don't restart
4. **Save artifacts you like** — reference them in subsequent prompts for consistency
5. **Use the design system colors EXACTLY** — paste hex codes if you must
6. **Show realistic content** — Lex Fridman, Karpathy, real examples beat lorem ipsum
7. **Ask Claude to explain design decisions** — sometimes triggers better quality

### Quality Checks

After each generation, evaluate:
- [ ] Does it look like a generic AI dashboard? (If yes, reject)
- [ ] Are timestamps prominent and clickable-looking?
- [ ] Is the reading experience optimized (line-height, max-width)?
- [ ] Are the accent colors used sparingly?
- [ ] Does it feel premium and intentional?
- [ ] Is the typography hierarchy clear?
- [ ] Would a designer at Linear/Vercel approve?

### Iteration Pattern

```
First gen → Get baseline
↓
Refine (Section 8 prompts) → Polish
↓
Show to user/get feedback → Specific changes
↓
Final polish → Production-ready
```

---

## SECTION 10: BONUS — DESIGN INSPIRATION REFERENCES

Mention these to Claude for visual reference:

**For overall feel:**
- linear.app — clean, focused, premium tech
- arc.net — delightful, modern, opinionated
- vercel.com — minimal, developer-friendly
- stripe.com — masterful spacing and typography

**For reading experience:**
- substack.com — editorial typography
- readwise.io — focus on content consumption
- matter.app — beautiful reading experience
- medium.com — typography hierarchy

**For dashboard/productivity:**
- linear.app/dashboard
- notion.so
- raycast.com
- height.app

**For dark mode done right:**
- linear.app (dark)
- arc.net
- vercel.com
- github.com (new dark theme)

---

## CLOSING NOTE

Design generation is iterative. Don't expect perfection in one shot. The prompts above are your foundation — refine, iterate, and trust your taste.

Good luck building TubeSynth! 🚀

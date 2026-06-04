import Link from "next/link";
import {
  Clock,
  Download,
  Globe,
  Heart,
  Infinity as InfinityIcon,
  MessageSquare,
} from "lucide-react";
import { UrlInput } from "@/components/url-input";
import { ExampleTabs } from "@/components/landing/example-tabs";
import { Faq } from "@/components/landing/faq";

const STEPS = [
  {
    n: "01",
    title: "Paste a link",
    body: "Any YouTube video — a 20-minute explainer or a 12-hour conference recording.",
  },
  {
    n: "02",
    title: "We process",
    body: "Smart chunking, AI summarization, and synthesis that keeps the through-line intact.",
  },
  {
    n: "03",
    title: "You read",
    body: "A structured summary with timestamps and quotes, ready in minutes.",
  },
];

const FEATURES = [
  { icon: InfinityIcon, title: "Up to 12-hour videos", body: "Built for long-form, not just clips." },
  { icon: Clock, title: "Timestamped highlights", body: "Jump straight to the moment that matters." },
  { icon: MessageSquare, title: "Ask questions", body: "Q&A with answers cited to exact timestamps." },
  { icon: Download, title: "Export anywhere", body: "Markdown, copy to clipboard, shareable links." },
  { icon: Globe, title: "Multi-language", body: "Summarize and translate across languages." },
  { icon: Heart, title: "Free for personal use", body: "No signup, no paywall on the essentials." },
];

const LOGOS = ["Stripe", "Linear", "Notion", "Vercel", "Figma", "Ramp"];

function Wordmark() {
  return (
    <span className="font-serif text-xl tracking-tight text-text-primary">
      Tube<span className="text-accent">Synth</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <a
              href="#how-it-works"
              className="hidden rounded-pill px-3 py-2 text-text-secondary transition-colors hover:text-text-primary sm:block"
            >
              How it works
            </a>
            <a
              href="#examples"
              className="hidden rounded-pill px-3 py-2 text-text-secondary transition-colors hover:text-text-primary sm:block"
            >
              Examples
            </a>
            <Link
              href="/login"
              className="rounded-pill px-4 py-2 text-text-secondary transition-colors hover:text-text-primary"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="animate-fade-up mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              For people who value time
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[1.1] tracking-tight text-text-primary sm:text-6xl">
              Read any YouTube video,{" "}
              <span className="italic text-accent">even 12-hour ones.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
              Structured summaries with timestamps, key quotes, and Q&amp;A.
              Built for podcasts, lectures, and conference recordings.
            </p>
            <div className="mx-auto mt-10 max-w-2xl">
              <UrlInput size="lg" />
            </div>
            <p className="mt-4 text-sm text-text-tertiary">
              Free. No signup required. Works with videos up to 12 hours.
            </p>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-y border-border/60 bg-surface/30 py-10">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <p className="text-sm text-text-tertiary">
              Trusted by 2,000+ readers from teams like
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {LOGOS.map((logo) => (
                <span
                  key={logo}
                  className="font-serif text-lg text-text-tertiary/70"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="font-serif text-3xl text-text-primary sm:text-4xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-card border border-border bg-surface p-7"
              >
                <span className="font-serif text-4xl text-accent">{step.n}</span>
                <h3 className="mt-4 text-lg font-medium text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-text-secondary">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* EXAMPLES */}
        <section
          id="examples"
          className="border-t border-border/60 bg-surface/30 py-24"
        >
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="font-serif text-3xl text-text-primary sm:text-4xl">
              See what you&apos;d get
            </h2>
            <p className="mt-3 text-text-secondary">
              Real summaries from real long-form videos.
            </p>
            <div className="mt-10">
              <ExampleTabs />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="font-serif text-3xl text-text-primary sm:text-4xl">
            Everything you need to read smarter
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-card border border-border bg-surface p-6 transition-colors duration-200 hover:border-text-tertiary/40"
              >
                <feature.icon className="h-5 w-5 text-accent" />
                <h3 className="mt-4 font-medium text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/60 bg-surface/30 py-24">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-10 font-serif text-3xl text-text-primary sm:text-4xl">
              Questions, answered
            </h2>
            <Faq />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-serif text-4xl text-text-primary">
            Stop saving videos you&apos;ll never watch.
          </h2>
          <div className="mx-auto mt-8 max-w-2xl">
            <UrlInput size="lg" />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-text-tertiary sm:flex-row">
          <Wordmark />
          <p>
            © {new Date().getFullYear()} TubeSynth · Made with care in Indonesia
          </p>
          <a
            href="https://twitter.com"
            className="transition-colors hover:text-text-primary"
          >
            Twitter
          </a>
        </div>
      </footer>
    </>
  );
}

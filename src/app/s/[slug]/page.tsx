import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicSummaryBySlug } from "@/lib/cache";
import { SummaryView } from "@/components/summary/summary-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shared = await getPublicSummaryBySlug(slug);
  if (!shared) return { title: "Shared summary · TubeSynth" };
  return {
    title: `${shared.metadata.title} · TubeSynth`,
    description: shared.content.tldr,
  };
}

/** Read-only public share page (Design §7.2). */
export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const shared = await getPublicSummaryBySlug(slug);
  if (!shared) notFound();

  return (
    <SummaryView
      metadata={shared.metadata}
      content={shared.content}
      shareMode
    />
  );
}

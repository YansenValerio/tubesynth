import { SummaryClient } from "@/components/summary/summary-client";

/**
 * Summary route. Handles three id shapes:
 *   - "example-*"  → renders the bundled sample summary
 *   - 11-char id   → runs the live pipeline via /api/summarize
 * The client component manages processing/error/done states.
 */
export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SummaryClient id={id} />;
}

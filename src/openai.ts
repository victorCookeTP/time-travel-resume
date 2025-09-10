export type AlternateFuture = {
  title: string;
  year: string; // can be a single year or a range like "2010-2015"
  company: string;
  description: string;
};

type AlternateFutureRaw = {
  title?: string;
  year?: string;
  years?: string;
  company?: string;
  description?: string;
};

// Backend API base (set VITE_API_BASE for prod; defaults to localhost dev server)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5175";

export async function getAlternateFutures(
  resumeText: string,
  opts: { futureCount: number; spanYears: number } = { futureCount: 4, spanYears: 20 }
): Promise<AlternateFuture[]> {
  try {
    const resp = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, futureCount: opts.futureCount, spanYears: opts.spanYears }),
    });
    if (!resp.ok) throw new Error("API error");
    const { content: raw } = (await resp.json()) as { content: string };

    try {
      const parsed = JSON.parse(raw) as AlternateFutureRaw[];
      if (!Array.isArray(parsed)) return [];
      const normalized = parsed.map((i) => ({
        title: i.title ?? "",
        year: (i.years ?? i.year ?? "") as string,
        company: i.company ?? "",
        description: i.description ?? "",
      }));
      // Enforce the requested future count and span post-hoc if model over-returns
      // Keep all existing past entries; clamp future ones by start year and count
      const startYear = (y: string) => Number(String(y).split("-")[0] || 0);
      const lastKnownStart = normalized.reduce((m, e) => Math.max(m, startYear(e.year)), 0);
      const maxYear = lastKnownStart + opts.spanYears;
      const past = normalized.filter((e) => startYear(e.year) <= lastKnownStart);
      const future = normalized
        .filter((e) => startYear(e.year) > lastKnownStart && startYear(e.year) <= maxYear)
        .sort((a, b) => startYear(a.year) - startYear(b.year))
        .slice(0, opts.futureCount);
      return [...past, ...future];
    } catch {
      // Fallback: try to extract JSON between brackets
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]) as AlternateFutureRaw[];
          if (!Array.isArray(parsed)) return [];
          const normalized = parsed.map((i) => ({
            title: i.title ?? "",
            year: (i.years ?? i.year ?? "") as string,
            company: i.company ?? "",
            description: i.description ?? "",
          }));
          const startYear = (y: string) => Number(String(y).split("-")[0] || 0);
          const lastKnownStart = normalized.reduce((m, e) => Math.max(m, startYear(e.year)), 0);
          const maxYear = lastKnownStart + opts.spanYears;
          const past = normalized.filter((e) => startYear(e.year) <= lastKnownStart);
          const future = normalized
            .filter((e) => startYear(e.year) > lastKnownStart && startYear(e.year) <= maxYear)
            .sort((a, b) => startYear(a.year) - startYear(b.year))
            .slice(0, opts.futureCount);
          return [...past, ...future];
        } catch (jsonError) {
          console.warn("Failed to parse extracted JSON:", jsonError);
        }
      }
      return [];
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    return [];
  }
}

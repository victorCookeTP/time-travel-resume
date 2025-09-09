import OpenAI from "openai";

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

// Create a typed client
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true, // ⚠️ Browser usage for hackathon/demo only
});

export async function getAlternateFutures(
  resumeText: string,
  opts: { futureCount: number; spanYears: number } = { futureCount: 4, spanYears: 20 }
): Promise<AlternateFuture[]> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a career AI that extends career timelines. Use a light, witty, professional tone. Output ONLY a compact JSON array of objects using this schema strictly: [{\\\"title\\\":\\\"string\\\",\\\"years\\\":\\\"YYYY-YYYY\\\",\\\"company\\\":\\\"string\\\",\\\"description\\\":\\\"string\\\"}]. No markdown fences or extra text.",
        },
        {
          role: "user",
          content:
            `Here is the resume/work history (plain text):\n\n${resumeText}\n\nTask: Normalize the given experiences into the schema above (use \\"years\\" with YYYY-YYYY, converting single years to ranges when needed), THEN append exactly ${opts.futureCount} future roles that logically follow from the last year, covering roughly the next ${opts.spanYears} years in total.\nRules for the future roles:\n- Use realistic job titles, fake company names, and concise, vivid descriptions (<= 2 sentences)\n- Keep tone witty yet professional\n- Use plausible, non-overlapping ranges (typically 3-6 years) that fit within ~${opts.spanYears} years overall\n- Preserve the original experiences (do not remove or rewrite them, only normalize years)\n- Sort the entire array ascending by the starting year.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const raw = response.choices[0]?.message?.content ?? "[]";
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

import { useMemo, useState } from "react";
import Layout from "./components/Layout";
import Hero from "./components/Hero";
import ResumeInput from "./components/ResumeInput";
import { type FutureItem } from "./components/AlternateFutures";
import Timeline, { type TimelineEvent } from "./components/Timeline";
import { getAlternateFutures } from "./openai";

function App() {
  const [mode, setMode] = useState<"input" | "timeline" | "futures">("input");
  const [loading, setLoading] = useState(false);
  const [futures, setFutures] = useState<FutureItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastResumeText, setLastResumeText] = useState<string | null>(null);
  const hasApiKey = Boolean(import.meta.env.VITE_OPENAI_API_KEY);
  const [realEvents, setRealEvents] = useState<TimelineEvent[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [futuresKey, setFuturesKey] = useState(0);
  const [futureCount, setFutureCount] = useState(2);
  const [spanYears, setSpanYears] = useState(5);

  async function handleGenerate(resumeText: string, opts?: { futureCount: number; spanYears: number }) {
    setLoading(true);
    setError(null);
    setLastResumeText(resumeText);
    setRealEvents(parseResumeToTimeline(resumeText));
    try {
      const params = opts ?? { futureCount, spanYears };
      const items = await getAlternateFutures(resumeText, params);
      setFutures(items);
      setFuturesKey((k) => k + 1);
      if (!items.length) {
        setError("No results generated. Check your API key and try different input.");
      }
      setMode("futures");
    } catch (e) {
      console.error(e);
      setError("Failed to generate. Open console for details and verify API key.");
    } finally {
      setLoading(false);
    }
  }

  function parseResumeToTimeline(text: string): TimelineEvent[] {
    // Heuristic parser supporting:
    // 2021 - Title @ Company: Description
    // 2021 Title at Company - Description
    // 2021 Title - Description
    // 2021 Title
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const events: TimelineEvent[] = [];
    const yearsRegex = /^(?:19|20|21)\d{2}(?:\s*[–—-]\s*(?:19|20|21)\d{2})?/; // YYYY or YYYY-YYYY
    for (const rawLine of lines) {
      const line = rawLine.replace(/^[\u2022*-]\s+/, ""); // strip leading bullets/dashes
      const yearsMatch = line.match(yearsRegex);
      if (!yearsMatch) continue;
      const year = yearsMatch[0];
      const rest = line.slice(year.length).replace(/^\s*[-–:\u2013]?\s*/, "");

      let title = "";
      let company = "";
      let description = "";

      // Pattern A: Title @ Company : Desc  OR  Title at Company - Desc
      const a = rest.match(/^(?<title>[^@:-]+?)\s*(?:@|\bat\b)\s*(?<company>[^:-]+?)\s*(?:[-:]\s*(?<desc>.*))?$/i);
      if (a && a.groups) {
        title = (a.groups.title || "").trim();
        company = (a.groups.company || "").trim();
        description = (a.groups.desc || "").trim();
      } else {
        // Pattern B: Title : Desc  OR Title - Desc
        const b = rest.match(/^(?<title>[^:-]+?)\s*(?:[-:]\s*(?<desc>.*))?$/);
        if (b && b.groups) {
          title = (b.groups.title || "").trim();
          description = (b.groups.desc || "").trim();
        } else {
          // Fallback: take whole rest as title
          title = rest.trim();
        }
      }

      // Clean stray '@' if company missing
      title = title.replace(/@+\s*$/, "").trim();
      if (!title && company) {
        title = company; company = "";
      }

      if (!title && !company && !description) continue;

      events.push({ year, title, company, description });
    }

    return events.sort((a, b) => a.year.localeCompare(b.year));
  }

  const nav = useMemo(
    () => (
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-2 no-print">
        {/* Left: view tabs */}
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm border ${mode === "input" ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            onClick={() => setMode("input")}
          >
            Resume Input
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm border ${mode === "timeline" ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            onClick={() => setMode("timeline")}
          >
            Real Timeline
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm border ${mode === "futures" ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
            onClick={() => setMode("futures")}
          >
            Alternate Futures
          </button>
        </div>
        {/* Right: futures actions */}
        {mode === "futures" && (
          <div className="ml-auto flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md text-sm border border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => setMode("input")}
            >
              New input
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm border border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => window.print()}
            >
              Download PDF
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm border bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
              onClick={() => (lastResumeText ? handleGenerate(lastResumeText) : setMode("input"))}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate another future"}
            </button>
          </div>
        )}
      </div>
    ),
    [mode, loading, lastResumeText]
  );

  return (
    <Layout>
      {!hasApiKey && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-4 py-2 text-sm">
            Missing OPENAI_API_KEY. Add it and restart the server.
          </div>
        </div>
      )}
      {error && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-md border border-rose-300 bg-rose-50 text-rose-900 px-4 py-2 text-sm">
            {error}
          </div>
        </div>
      )}
      <Hero />
      {nav}
      {mode === "input" && (
        <ResumeInput
          onSubmit={(t, genOpts) => { setResumeText(t); handleGenerate(t, genOpts); }}
          isLoading={loading}
          value={resumeText}
          onChangeText={(t) => { setResumeText(t); setRealEvents(parseResumeToTimeline(t)); }}
          futureCount={futureCount}
          onChangeFutureCount={setFutureCount}
          spanYears={spanYears}
          onChangeSpanYears={setSpanYears}
        />
      )}
      {mode === "timeline" && (
        <div className="py-8">
          <Timeline title="Real Timeline" events={realEvents} />
        </div>
      )}
      {mode === "futures" && (
        <>
          <div id="futures-print" className="py-8">
            <Timeline
              key={futuresKey}
              title="Alternate Futures"
              events={[...futures] as unknown as TimelineEvent[]}
            />
          </div>
        </>
      )}
    </Layout>
  );
}

export default App;

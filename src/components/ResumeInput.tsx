import { useRef, useState } from "react";

type ResumeInputProps = {
  onSubmit: (resumeText: string, opts: { futureCount: number; spanYears: number }) => void;
  isLoading?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  futureCount?: number;
  onChangeFutureCount?: (n: number) => void;
  spanYears?: number;
  onChangeSpanYears?: (n: number) => void;
};

export default function ResumeInput({ onSubmit, isLoading, value, onChangeText, futureCount: fcProp, onChangeFutureCount, spanYears: syProp, onChangeSpanYears }: ResumeInputProps) {
  const [internal, setInternal] = useState("");
  const text = value !== undefined ? value : internal;
  const setText = onChangeText ?? setInternal;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [futureCountState, setFutureCountState] = useState(2);
  const [spanYearsState, setSpanYearsState] = useState(5);
  const futureCount = fcProp ?? futureCountState;
  const setFutureCount = onChangeFutureCount ?? setFutureCountState;
  const spanYears = syProp ?? spanYearsState;
  const setSpanYears = onChangeSpanYears ?? setSpanYearsState;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      const current = typeof text === "string" ? text : "";
      setText((current ? current + "\n\n" : "") + content);
    };
    reader.readAsText(file);
  }

  function submit() {
    const trimmed = text.trim();
    if (trimmed) onSubmit(trimmed, { futureCount, spanYears });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
        <h2 className="text-xl font-semibold mb-2 text-slate-900">Paste or upload your resume</h2>
        <p className="text-sm text-slate-600 mb-4">Plain text or simple markdown is best.</p>

        <textarea
          className="w-full h-48 rounded-md bg-white border border-slate-300 p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={"Paste your resume or work history here...\n\nFormat should look like:\n2018 - 2020  Junior Developer @ Startup XYZ: Built internal tools\n2021 - 2023 Senior Engineer at Alpha Co - Led microservices migration"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">How many future scenarios would you like to generate?</label>
            <input
              type="number"
              min={1}
              max={12}
              value={futureCount}
              onChange={(e) => setFutureCount(Number(e.target.value) || 1)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">How many years would you like to project?</label>
            <input
              type="number"
              min={1}
              max={50}
              value={spanYears}
              onChange={(e) => setSpanYears(Number(e.target.value) || 1)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown"
            onChange={handleFile}
            className="hidden"
          />
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Upload file
          </button>
          <button
            className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
            onClick={submit}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Check your future!"}
          </button>
        </div>
      </div>
    </div>
  );
}



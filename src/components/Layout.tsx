import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">⏳</span>
            <div>
              <h1 className="text-lg font-semibold tracking-wide">Time Travel Resume</h1>
              <p className="text-xs text-slate-600">Check how your career future might look like!</p>
            </div>
          </div>
          <nav className="text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">Home</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        Built for Howdy's hackathon · Dream boldly ✦
      </footer>
    </div>
  );
}



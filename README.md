# Time Travel Resume

A lightweight React + Vite app that turns a real career history into a clean timeline and imagines alternate future paths. Paste your resume as text, choose how many future experiences to project and how many years to span, then generate witty-yet-professional future roles. You can switch between your real timeline and alternate futures.

## Features

- Paste/upload resume text and parse into a timeline (supports `YYYY` and `YYYY-YYYY` formats)
- Choose future count and year span; generate with OpenAI
- Consistent timeline UI for real and generated entries
- Tailwind v4 styles and Framer Motion animations

## Quick start

Requirements:
- Node.js 18+ and npm
- An OpenAI API key

1) Install dependencies
```bash
npm install
```

2) Create a `.env` file in the project root
```bash
echo 'VITE_OPENAI_API_KEY=sk-...' > .env
```

3) Run the dev client
```bash
npm run dev
```

4) Run the dev server
```bash
npm run dev:server
```

Open the URL shown by Vite (e.g. `http://localhost:5174`).

## How it works

1) You paste resume lines like:
```
2018 - 2020 Junior Engineer @ Tilt – Built internal tools
2021 - 2025 Mid Engineer – Alpha Co – Integrated different apps
```
2) The app parses each line, extracting years, title, optional company, and a short description, then renders a vertical timeline.
3) When you click “Generate alternate futures”, the app calls OpenAI (`gpt-4o-mini`) with your desired future count and year span. The model returns structured JSON with fields: `title`, `years` (YYYY-YYYY), `company`, `description`.
4) The client normalizes the response and enforces your requested count and span (keeps your existing entries, then clamps future entries to the next N roles within the next M years).

## Project structure

- `src/components/ResumeInput.tsx` — paste/upload, inputs for future count and years span
- `src/components/Timeline.tsx` — animated vertical timeline component
- `src/App.tsx` — view switching, state management, and wiring
- `api/generate.js` — OpenAI client

## Environment

- Set `VITE_OPENAI_API_KEY` in `.env` (browser client for hackathon/demo). Do not ship this to production without a backend proxy.

## Notes

- Prompting asks for concise, witty professional tone and strict JSON. The client still validates and enforces limits post-response.
- Resume parser is heuristic-based; using clear `YYYY` or `YYYY-YYYY` prefixes improves results.


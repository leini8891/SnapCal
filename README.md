# SnapCal

SnapCal is a Singapore-first hawker food logging PWA prototype built with Next.js. The current app includes:

- a primary logging flow on `/`
- shared persisted state across `/today`, `/history`, and `/settings`
- a `/welcome` setup flow for goal, pace, and Free vs Pro selection
- auto-promoted saved shortcuts after repeated meals
- browser-storage fallback with optional private Supabase sync
- email/password cloud login plus manual sync/retry controls in Settings
- heuristic meal analysis with optional OpenAI vision upgrade
- Supabase schema and hardening migrations in `supabase/`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Optional: add environment variables to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_ANALYZE_MODEL=gpt-4.1-mini
```

If you enable Supabase for the pilot cloud flow, keep Supabase Email auth enabled
and sign in before writing cloud records. Anonymous sign-ins are not required for
the personal cloud build. Email confirmation can stay on; for a private
single-user pilot, use custom SMTP or disable email confirmation if Supabase's
default email rate limit blocks testing.

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For phone testing on the same Wi-Fi, prefer the LAN-hosted command:

```bash
npm run dev:lan
```

Then open `http://<your-mac-lan-ip>:3000`, for example
`http://192.168.1.54:3000/demo`.

If Supabase env vars are not set, SnapCal will continue using browser storage so the app stays fully usable during development. If `OPENAI_API_KEY` is not set, the meal analysis route falls back to the local SG heuristic pipeline automatically.

## Current Architecture

- [src/components/snapcal-provider.tsx](src/components/snapcal-provider.tsx)
- [src/components/snapcal-welcome.tsx](src/components/snapcal-welcome.tsx)
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts)
- [src/lib/mock-data.ts](src/lib/mock-data.ts)
- [src/lib/analyze/meal-analysis.ts](src/lib/analyze/meal-analysis.ts)
- [src/lib/analyze/glm-analysis.ts](src/lib/analyze/glm-analysis.ts)
- [src/lib/analyze/openai-analysis.ts](src/lib/analyze/openai-analysis.ts)
- [src/lib/food-catalog.ts](src/lib/food-catalog.ts)
- [src/lib/snapcal-utils.ts](src/lib/snapcal-utils.ts)

## Cloud Setup

1. Create a Supabase project and run the SQL files in `supabase/` in order.
2. Keep Email auth enabled in Supabase Auth Providers. Do not enable Anonymous
   sign-ins for the personal cloud deployment.
3. Set these variables locally and in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
GLM_API_KEY=...
GLM_ANALYZE_MODEL=glm-4.6v-flashx
GLM_API_BASE_URL=...
```

`OPENAI_API_KEY` is optional. The current private pilot can use GLM only.

## Useful Commands

```bash
npm run dev
npm run dev:lan
npm run lint
npm run build
npm run start:lan
```

## Notes

- Supabase cloud sync uses email/password Auth. RLS policies restrict rows to
  the signed-in user.
- Settings exposes cloud session state, last sync time, and manual sync / retry actions.
- The app still keeps a local browser snapshot for resilience during development.
- OpenAI image analysis is optional and server-side only; the route downgrades to heuristics if the model call fails.
- Mobile photo uploads are compressed in the browser before analysis. Raw image files are not persisted to Supabase or local SnapCal state.
- The temporary `bootstrap-app/` scaffold copy remains in the workspace but is ignored by ESLint.

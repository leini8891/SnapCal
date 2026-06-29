# SnapCal

SnapCal is a Singapore-first calorie and meal logging PWA for people who want to lose fat without fighting generic Western food databases.

Live prototype: [snapcal-omega.vercel.app](https://snapcal-omega.vercel.app)

The product direction is simple: take a food photo, pick the closest match, log the meal, and get timely feedback against a daily weight-loss target. The current build focuses on Singapore hawker and food-court meals, bilingual food-name handling, cloud sync, daily weight tracking, and pragmatic nutrition ranges instead of false precision.

## Why This Exists

Most calorie trackers are powerful but high-friction: search-heavy, barcode-heavy, and not tuned for mixed local meals like yong tau foo, lei cha, cai png, fish soup, laksa, or nasi lemak.

SnapCal is exploring a more local flow:

- photo-first meal capture
- three likely food guesses instead of manual typing
- Singapore food database with hawker-style portion ranges
- AI fallback when the local database cannot match a food
- automatic database enrichment after a new food is confirmed
- daily calorie feedback tied to fat-loss goals
- optional body-weight logging

## Current Features

- Mobile-first logging flow on `/`
- Photo upload with browser-side image compression
- Heuristic Singapore food recognition with optional AI vision fallback
- Saved meal shortcuts after repeated foods
- Today, History, Settings, and Welcome flows
- Email/password cloud sync through Supabase
- Browser-storage fallback when cloud env vars are missing
- Daily body-weight records
- Manual sync and retry controls
- Supabase RLS migrations for user-owned records

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- OpenAI-compatible vision analysis endpoint
- Vercel deployment

## Local Development

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and add only the services you want to test:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
OPENAI_ANALYZE_MODEL=gpt-4.1-mini
GLM_API_KEY=
GLM_ANALYZE_MODEL=glm-4.6v-flashx
GLM_API_BASE_URL=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For phone testing on the same Wi-Fi:

```bash
npm run dev:lan
```

Then open `http://<your-mac-lan-ip>:3000`.

## Cloud Setup

1. Create a Supabase project.
2. Run the SQL files in `supabase/` in order.
3. Keep Email auth enabled in Supabase Auth Providers.
4. Set the public Supabase env vars and AI provider keys in Vercel.

If Supabase env vars are missing, SnapCal still works locally with browser storage. If AI keys are missing or the model call fails, the analysis route falls back to the local Singapore food heuristic pipeline.

## Privacy Notes

- Raw uploaded images are compressed in the browser for analysis and are not persisted to Supabase by the current app state model.
- Cloud records are scoped by Supabase Auth user id and protected by RLS policies.
- `.env.local`, Vercel project metadata, local personal health imports, build output, and temporary scaffold files are intentionally ignored by Git.

## Useful Commands

```bash
npm run dev
npm run dev:lan
npm run lint
npm run build
npm run start:lan
```

## Roadmap

- Faster mobile capture flow with tap-to-confirm food guesses
- Duplicate meal protection for repeated taps
- Better meal edit and delete flows
- Bulk import only for developer migration, not normal users
- Larger Singapore hawker food database
- AI-assisted nutrition fallback with review before database enrichment
- GitHub-driven Vercel previews and production deploys

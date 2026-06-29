<div align="center">

# 📸 SnapCal

### Snap a photo. Log the meal. Lose the fat.

**A Singapore-first calorie & meal-tracking PWA — built for laksa, cai png and yong tau foo, not generic Western food databases.**

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-snapcal--omega.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://snapcal-omega.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)

</div>

---

## ✨ The 10-Second Pitch

> Most calorie trackers are powerful but high-friction — search-heavy, barcode-heavy, and clueless about a plate of **cai png** with three mixed dishes. SnapCal flips the flow: **take a photo → pick from three smart guesses → done.** It speaks Singapore hawker food natively, gives you honest portion *ranges* instead of fake precision, and quietly nudges you toward a daily fat-loss target.

<div align="center">

| 🍜 Local-first | 📷 Photo-first | 🎯 Goal-first |
|:---:|:---:|:---:|
| Tuned for hawker & food-court meals | Three likely guesses, zero typing | Daily feedback against your fat-loss target |

</div>

---

## 🔥 Why This Exists

Generic trackers choke on the way Singaporeans actually eat — yong tau foo, lei cha, cai png, fish soup, laksa, nasi lemak. SnapCal is an experiment in a flow that fits the local plate:

- 🖼️ **Photo-first capture** — point, shoot, log
- 🤖 **Three smart guesses** instead of manual search-and-type
- 🇸🇬 **Singapore food database** with hawker-style portion ranges
- 🧠 **AI vision fallback** when the local database can't find a match
- 🌱 **Self-enriching database** — confirmed foods make the next match smarter
- 📊 **Honest nutrition ranges** instead of false precision
- ⚖️ **Optional body-weight logging** to close the feedback loop

---

## 🚀 Features

| | |
|---|---|
| 📱 **Mobile-first flow** | The entire logging journey lives on a thumb-friendly home screen |
| 📷 **Photo upload + compression** | Browser-side image compression before anything leaves the device |
| 🍱 **Hybrid food recognition** | Heuristic Singapore matcher first, AI vision as graceful fallback |
| ⚡ **Saved meal shortcuts** | Repeated foods become one-tap logs |
| 🗂️ **Today · History · Settings · Welcome** | Clean, focused screens for each job |
| ☁️ **Cloud sync** | Email/password auth + Postgres via Supabase |
| 💾 **Offline-friendly fallback** | Works on browser storage when cloud env vars are absent |
| 🔁 **Manual sync & retry** | You stay in control of when data moves |
| 🔐 **Row-Level Security** | Every record is scoped and locked to its owner |

---

## 🏗️ Architecture

```
                  ┌──────────────────────────────┐
                  │      📱 SnapCal PWA           │
                  │   Next.js 16 · React 19 · TS  │
                  │        Tailwind CSS 4         │
                  └───────────────┬──────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
   │  🧠 Analyze API  │ │  ☁️ Supabase     │ │ 💾 Browser Store │
   │ Heuristic ▸ AI   │ │ Auth · Postgres  │ │  Offline fallback│
   │ vision fallback  │ │ Row-Level Security│ │  (no-cloud mode) │
   └──────────────────┘ └──────────────────┘ └──────────────────┘
```

**The smart bit:** the `/analyze` route always tries the local Singapore heuristic pipeline first. Only when it can't confidently match does it reach for an OpenAI-compatible **or** GLM vision model — and a confirmed result can enrich the database for next time. No AI keys? It degrades gracefully back to heuristics. No cloud? It degrades gracefully to browser storage. **Nothing hard-fails.**

---

## 🛠️ Tech Stack

- **Framework** — Next.js 16 (App Router) + React 19
- **Language** — TypeScript 5
- **Styling** — Tailwind CSS 4
- **Backend** — Supabase (Auth + Postgres + RLS)
- **AI** — OpenAI-compatible & GLM vision endpoints, with heuristic fallback
- **Delivery** — Installable PWA, deployed on Vercel

---

## ⚡ Quick Start

```bash
# 1. Install
npm install

# 2. Configure — copy the example and fill in only what you want to test
cp .env.example .env.local

# 3. Run
npm run dev          # → http://localhost:3000
```

<details>
<summary><b>📲 Test on your phone (same Wi-Fi)</b></summary>

```bash
npm run dev:lan
# then open http://<your-mac-lan-ip>:3000 on your phone
```

</details>

<details>
<summary><b>🔑 Environment variables</b></summary>

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
OPENAI_ANALYZE_MODEL=gpt-4.1-mini
GLM_API_KEY=
GLM_ANALYZE_MODEL=glm-4.6v-flashx
GLM_API_BASE_URL=
```

Every key is optional — SnapCal runs with whatever you give it and falls back gracefully for the rest.

</details>

<details>
<summary><b>☁️ Cloud setup (Supabase)</b></summary>

1. Create a Supabase project
2. Run the SQL files in `supabase/` **in order**
3. Keep Email auth enabled in Auth Providers
4. Set the public Supabase env vars + AI keys in Vercel

</details>

---

## 🧰 Scripts

```bash
npm run dev          # Local dev server
npm run dev:lan      # Dev server exposed on your LAN (phone testing)
npm run lint         # ESLint
npm run build        # Production build
npm run start:lan    # Production server on your LAN
```

---

## 🔒 Privacy by Design

- 🖼️ Uploaded images are **compressed in-browser** for analysis and are **not persisted** to Supabase under the current app model
- 🔐 Cloud records are scoped by Supabase Auth user id and locked down with **Row-Level Security**
- 🙈 `.env.local`, Vercel metadata, personal health imports, build output and scaffold files are intentionally **git-ignored**

---

## 🗺️ Roadmap

- [ ] ⚡ Faster capture flow with tap-to-confirm food guesses
- [ ] 🛡️ Duplicate-meal protection for repeated taps
- [ ] ✏️ Richer meal edit & delete flows
- [ ] 🍲 Larger Singapore hawker food database
- [ ] 🧠 AI-assisted nutrition fallback with review-before-enrich
- [ ] 🚀 GitHub-driven Vercel previews & production deploys

---

<div align="center">

**Built with ❤️ in Singapore** · [Live Demo →](https://snapcal-omega.vercel.app)

</div>

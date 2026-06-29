# SnapCal
## Product Requirements Document (PRD) v1.1

Working title only. Naming validation for brand, domain, and app-store availability is still pending.

Version: 1.1
Market: Singapore
Date: March 24, 2026
Document goal: Founder-usable execution PRD for MVP build

---

## 1. Executive Summary

SnapCal is a Singapore-first hawker food logging assistant for fat-loss users who want a fast, low-effort way to track what they eat without relying on generic Western food databases.

The MVP is `web/PWA-first`, not WhatsApp-first. Users can upload a meal photo, choose from candidate dish guesses, tap quick local modifiers like `half rice`, `less gravy`, `fried`, or `add egg`, and confirm a log in seconds. The product should help users stay aware of their daily calorie budget, not pretend to deliver clinical precision.

### One-Line Pitch

Snap a hawker meal, tap the right portion tweaks, and know where you stand for the day.

### Product Thesis

This product is not trying to beat large calorie trackers on database size or beat frontier AI models on raw image recognition alone. The wedge is:

- Singapore food realism
- fast correction instead of fake certainty
- a lower-friction habit loop for everyday fat loss

The core user value is `fast estimate + one-tap correction + daily budget awareness`.

Founder note: 这版 PRD 的核心转向，是把产品从一个看起来很顺手的 distribution idea，改回一个更稳的 product idea。先把 logging loop 做对，比先押某个渠道重要得多。

### What Changed From v1.0

1. `Channel pivot`: SnapCal is now `web/PWA-first`; WhatsApp moves from core channel to a later experiment.
2. `Accuracy framing`: we now position results as `best-effort estimates` and `user-confirmed logs`, not "exactly what you ate".
3. `Competitive reality`: the market is not empty; existing players already offer meal scan or local food logging, so differentiation must be sharper.
4. `Monetization simplification`: v1.1 uses a simpler `Free + Pro` model designed to preserve habit formation.

---

## 2. Problem Statement

### 2.1 User Pain

For many Singapore adults trying to lose weight, calorie awareness breaks down at the exact point where it should be easiest: everyday hawker and food-court meals.

Current tools usually fail in one or more of these ways:

- logging is too slow, so users quit within days
- local dishes are recognized poorly or too generically
- portion differences matter more than dish labels, but correction UX is weak
- users get calorie numbers without useful context for the rest of the day
- products are built for fitness enthusiasts, not busy people who just want to eat slightly better

### 2.2 Why This Problem Is Worth Solving

This is a real behavior problem, not just a technology demo.

- In Singapore's `National Population Health Survey 2024`, published on `October 17, 2025`, MOH said obesity remains a concern and reported obesity prevalence rising from `10.5% in 2019-2020` to `12.7% in 2023-2024`.
- HPB's 2024 annual report said Healthy 365 had over `830,000 monthly active users` and piloted a `Meal Log Challenge` in 2024, which suggests mainstream interest in meal-tracking behavior still exists.
- Founding-user evidence also matters: photographing meals for AI-assisted calorie estimation already works as a real habit, but the workflow is fragmented, inconsistent, and not designed for longitudinal tracking.

Founder note: 这里要看见两个事实同时成立。第一，需求是真的；第二，用户并不会因为有需求就忍受麻烦。所以 MVP 不是证明 AI 能识图，而是证明用户愿意连续记录。

### 2.3 Why v1.0's WhatsApp Thesis Is Too Risky

WhatsApp was attractive because it minimizes download friction, but the platform is no longer a safe foundation for a Singapore AI-first nutrition product.

On `March 6, 2026`, WhatsApp updated its `WhatsApp Business Solution Terms`. The terms say AI providers are prohibited from using the WhatsApp Business Solution when AI is the product's primary functionality, with specific carve-outs mainly for EEA and Brazil numbers. Even if SnapCal is not itself a foundation model company, a Singapore `WhatsApp-first AI calorie assistant` now sits in a strategic gray zone that is too risky for the main MVP bet.

Conclusion: use the web as the control layer, and treat messaging adapters as optional distribution experiments later.

Tradeoff: 这会牺牲一部分“零下载”的故事性，但换来更可控的产品路线、数据结构和平台风险暴露，值得。

---

## 3. Product Principles

### 3.1 Speed Over Perfection

Users should be able to log a common meal faster than they could manually search a calorie database. A useful estimate now beats a perfect estimate that requires effort.

### 3.2 Visible Uncertainty

The product should show `confidence`, `range`, or `best guess` where appropriate. Trust comes from honesty plus correction, not from pretending the model knows exact calories from a single photo.

### 3.3 Local Food Realism

The core domain is not "food" in general. It is `Singapore hawker, kopitiam, food court, local chain, and drink ordering patterns`. Portion logic and modifier logic are first-class.

### 3.4 Habit Formation First

The MVP should help users log meals consistently for 7-30 days. Features that feel advanced but do not strengthen the daily loop should be delayed.

Founder note: 如果一个功能不能提升 `记录速度`、`确认率` 或 `次日继续打开的概率`，它大概率不该进 MVP。

---

## 4. Target Market and Personas

### 4.1 Primary Wedge

Busy Singapore adults who:

- eat hawker or food-court meals frequently
- want fat loss, not bodybuilding complexity
- are willing to pay for something that actually fits local eating patterns
- will not tolerate a slow or high-friction logging flow

### 4.2 Primary Persona: The Busy Slimmer

| Attribute | Detail |
| --- | --- |
| Age | 28-45 |
| Occupation | Office-based working professional |
| Goal | Lose 5-15kg, feel in control, look better |
| Behavior | Eats out often, limited time, low patience for manual logging |
| Pain point | Generic apps make hawker tracking feel annoying and inaccurate |
| Willingness to pay | Around SGD 7-12/month if the product becomes part of a real habit |

### 4.3 Secondary Persona: The Gym Regular (Phase 2)

This user cares more about protein targets, body composition, and deeper macro control. They are still relevant, but they are not the MVP wedge. The MVP should avoid overfitting to advanced fitness behavior.

Tradeoff: gym 用户通常表达更强、更愿意给反馈，但他们也更容易把产品拉向复杂 macro tool。v1 先服务减脂大众，反而更清晰。

---

## 5. Positioning

### 5.1 Positioning Statement

For Singapore adults trying to lose weight without spending time on manual logging, SnapCal is a hawker-aware food logging assistant that turns meal photos or text into fast, editable calorie estimates and daily budget tracking.

Unlike generic calorie apps, SnapCal is designed around local dishes, portion variation, and quick correction.

### 5.2 Competitive Reality

The market is active. SnapCal should not assume greenfield conditions.

| Product | What it already does | Why users still churn or hesitate | What SnapCal should do differently |
| --- | --- | --- | --- |
| MyFitnessPal Meal Scan | Strong general logging stack, meal scan, huge database | Local hawker realism is weak; premium-gated scan; correction still feels database-first | Win on local dish patterns and faster confirmation for SG meals |
| SingaporeCalorie | SG-local positioning, hawker database, photo scan messaging | Still needs to prove superior habit loop and correction UX | Compete on logging speed, trust, and daily budget loop |
| Ventrickle | Verified nutrition angle, SG food context | Better for known or verified foods than messy everyday hawker estimation | Focus on "good-enough now" logging for regular meals |
| Healthy 365 / HPB context | Strong distribution and habit programs; meal logging exists | Government product scope is broad, not optimized for a premium sharp wedge | Build a narrower, more delightful consumer fat-loss experience |

### 5.3 SnapCal's Real Edge

SnapCal should not position AI vision alone as the moat. That will not hold.

The moat should come from:

- `local food ontology`: hawker dish families, naming variants, and common meal structures
- `modifier UX`: portion chips and edits that match how Singaporeans actually order
- `correction data`: repeated user confirmations that improve dish/portion defaults over time
- `faster logging loop`: fewer taps from meal to confidence

Founder note: 这也是竞争策略。别人也能接 vision model，但不一定愿意花时间把 `cai png`、饮料甜度、sauce/gravy、加蛋去皮这些高频小修改做成真正顺手的 UX。

---

## 6. Core Product Definition

### 6.1 MVP Entry Points

The MVP should support three ways to start a log:

1. `Camera upload`
2. `Gallery upload`
3. `Manual text search`

WhatsApp commands are removed from the core MVP definition.

### 6.2 Primary User Flow

`snap or search -> top dish guess -> portion/modifier chips -> confirm log -> daily budget update -> end-of-day summary`

This flow is the product. If a feature does not strengthen this loop, it probably should not be in MVP.

### 6.3 P0, P1, P2 Scope

| Priority | Feature | What it must do |
| --- | --- | --- |
| P0 | Photo and text meal logging | Accept image or typed query and return top candidate dishes |
| P0 | Candidate dish suggestions | Let user choose the closest dish instead of forcing one answer |
| P0 | Modifier correction | Provide one-tap edits for portion and meal composition |
| P0 | Daily calorie budget | Show daily total, remaining budget, and simple context |
| P0 | Same-day summary | Show today's logged meals, estimated intake, and simple insight |
| P0 | Recent meal history | Let user review and reuse recent meals |
| P1 | Saved meals / favorites | Speed up repeat logging for common meals |
| P1 | 7-day trends | Show average daily calories and consistency trend |
| P1 | Bilingual local search improvements | Better English and Chinese food-name matching |
| P2 | Reminders | Optional nudges once retention proves it is useful |
| P2 | Richer coaching | More opinionated guidance after the logging loop works |
| P2 | WhatsApp / Telegram adapters | Experimental channel extensions, not platform foundations |

### 6.4 Quick Correction Is a Core Feature, Not a Fallback

Correction is how the product becomes trustworthy.

Tradeoff: 这意味着我们接受“第一猜不完美”是常态，但要求“修正非常快”。从产品上看，这比盲目追求一次命中更现实。

Examples of modifier chips:

- `half rice`
- `less gravy`
- `add egg`
- `fried`
- `steamed`
- `drink: kosong`
- `drink: siew dai`
- `cai png: 2 veg 1 meat`
- `extra tofu`
- `skin removed`

### 6.5 Out of Scope for MVP

- native iOS/Android app
- friend challenges and social competition
- medical-grade nutrition claims
- exercise tracking
- weight logging
- full AI coaching
- meal planning and recipes

---

## 7. UX and Interface Requirements

### 7.1 UX Goals

The product should feel:

- faster than manual logging
- more local than global nutrition apps
- more honest than "magic AI" apps
- simple enough for everyday use without coaching the user every step

### 7.2 Response Pattern

When a user uploads a meal photo, the system should not jump straight to a single hard answer. It should prefer:

1. a top guess
2. 2-4 plausible alternatives when confidence is mixed
3. a set of quick portion/modifier chips
4. a confirm action that turns the estimate into a `user-confirmed log`

Example output pattern:

```text
Likely meal: Hainanese Chicken Rice
Estimate: 480-620 kcal
Confidence: Medium

Quick edits:
[Half rice] [Roasted] [Skin removed] [Add egg] [Extra sauce]

Confirm this meal
```

### 7.3 Trust and Safety Language

All UX copy should avoid overclaiming.

Use:

- best-effort estimate
- estimated range
- confidence
- confirm meal
- adjust portion

Avoid:

- exact calories
- exactly what you ate
- clinically accurate
- guaranteed nutrition result

### 7.4 Daily Summary

The summary should emphasize awareness, not judgment.

Minimum content:

- today's logged meals
- estimated calorie total
- macro snapshot if available
- remaining vs target budget
- one simple observation, for example "lunch was heavier than expected because of rice + sauce"

---

## 8. Technical Architecture

### 8.1 Recommended Stack

Build for speed and solo-dev maintainability.

- `Frontend`: TypeScript + Next.js + PWA shell
- `Backend`: Next.js server routes or lightweight API layer
- `Database`: Supabase Postgres
- `Auth`: Supabase Auth or magic-link email
- `Storage`: Supabase Storage for meal images
- `AI layer`: vision model plus a small curated SG dish/modifier catalog
- `Analytics`: lightweight event tracking for logging funnel and correction behavior

### 8.2 System Design Principle

AI is only one layer of the stack.

The system should combine:

1. `vision guess` from image or text input
2. `local dish normalization` into SnapCal's food ontology
3. `modifier application` to update the calorie/macros estimate
4. `user confirmation` to persist a trusted meal log

### 8.3 Lightweight Log Entry Interface

The product should store meals in a structured way that supports later analytics, saved meals, and correction learning.

```json
{
  "dish": "Hainanese Chicken Rice",
  "portion_modifiers": ["half rice", "skin removed"],
  "estimated_kcal_range": [480, 620],
  "estimated_macros_range": {
    "protein_g": [24, 34],
    "carbs_g": [40, 58],
    "fat_g": [12, 20]
  },
  "confidence": "medium",
  "input_source": "camera_upload",
  "user_confirmation_state": "confirmed_with_edits",
  "timestamp": "2026-03-24T12:31:00+08:00"
}
```

### 8.4 What The Moat Is

The moat is not "we call a vision API".

The moat is:

- a local dish and modifier ontology
- better defaults for hawker portions
- better correction UX
- data from repeated confirmations and edits

Founder note: 这决定了研发优先级。早期最值钱的数据不是图片本身，而是“用户把什么改成了什么”。

### 8.5 Data and Privacy

- meal images and logs should be user-owned product data, not training fodder by default
- the product should support deletion and export early
- the PRD should assume nutrition estimates are informational, not medical advice

---

## 9. Monetization

### 9.1 Pricing Model

v1.1 simplifies monetization to `Free + Pro`.

The main reason: free usage must be good enough to build a habit before asking for payment.

| Tier | Price | Designed for | Included |
| --- | --- | --- | --- |
| Free | SGD 0 | New and casual users | generous core logging, same-day summary, recent meals |
| Pro | SGD 8.90-12.90/month target range | Users who keep logging and want more leverage | longer history, 7-day trends, saved shortcuts, richer insights, future coaching features |

### 9.2 Monetization Principles

- Do not block the core logging loop too early.
- Charge for depth, memory, and leverage, not for first usefulness.
- If a free user cannot build a 1-2 week habit, conversion will stay weak.

Tradeoff: 短期看，free 放宽会让收入故事没那么漂亮；但如果免费层太抠，产品甚至进不了用户习惯，后面更没有转化。

---

## 10. Go-To-Market

### 10.1 Launch Strategy

Validation-first, not growth-first.

1. `Self-test`: log the founder's own meals for 1-2 weeks
2. `Manual pilot`: recruit 10-15 users who eat hawker meals often
3. `Tight feedback loop`: study missed dishes, confusing modifiers, and drop-off in confirmation flow
4. `Small public launch`: share only after correction UX is stable enough

Founder note: 不要太早追求“1000 注册”。前 10-15 个 pilot 用户的 meal logs、修正路径和流失点，比早期大多数表面增长数字都更有用。

### 10.2 Early Distribution Channels

- SG Reddit
- Xiaohongshu
- Telegram health / fitness groups
- founder network and warm intros

### 10.3 Messaging

Do not market the product as "AI knows exactly what you ate".

Better message:

`Built for Singapore meals. Snap, adjust, and stay on budget.`

---

## 11. Success Metrics

The product should be judged on habit quality, not vanity signups.

| Metric | Why it matters | Early target direction |
| --- | --- | --- |
| Time-to-log | Measures real friction | As low as possible; target under 20 seconds for common meals |
| % of meals confirmed in <= 2 taps after initial guess | Measures correction UX quality | Increase steadily through pilot |
| Correction rate | Reveals where defaults are weak | High at first is acceptable if confirmation is fast |
| D7 retention | Core habit health | Main product-health KPI |
| Meals logged per active user | Indicates whether the tool becomes routine | Target repeat daily use |
| Free-to-paid conversion | Business viability | Only meaningful after retention stabilizes |

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Food recognition is inconsistent | High | High | make candidate selection and correction central, not hidden |
| Portion estimates vary too much | High | High | use ranges, modifiers, and repeated saved-meal shortcuts |
| Users do not form a habit | Medium | High | optimize time-to-log and recent-meal reuse before adding coaching |
| Competitors copy image logging | High | Medium | build defensible local ontology and correction data |
| Overbuilding before validation | High | High | stay focused on one loop and pilot with 10-15 users first |
| WhatsApp policy or other platform dependency returns as a distraction | Medium | Medium | keep messaging adapters decoupled from the core product |

---

## 13. Roadmap and Sequencing

### Weekend 1

- photo upload and text search
- return candidate meal estimates
- basic dish normalization for common SG foods

### Weekend 2

- portion and modifier chips
- confirm log flow
- daily totals and recent logs

### Weekend 3

- user goals
- 7-day history
- basic analytics instrumentation

### Weekend 4

- pilot onboarding
- feedback collection workflow
- pricing gate for Pro exploration

---

## 14. Non-Goals for This Version

This PRD does not try to solve:

- clinical nutrition accuracy
- a full behavior-change coaching platform
- exercise + food + weight all-in-one health tracking
- cross-market expansion before Singapore usage feels strong

This is intentionally a narrow wedge product.

---

## 15. Assumptions and Defaults

- `SnapCal` remains the placeholder name for now.
- Deliverable for this round is `Markdown only`.
- The MVP is `web/PWA-first`.
- WhatsApp and Telegram are optional later adapters, not required channels.
- Bilingual support means English first with practical Chinese food-name handling, not full multilingual content parity on day one.
- Any nutrition output is product guidance, not medical advice.

---

## 16. References

These references matter because they materially change product strategy, competitive framing, or market context.

1. Singapore MOH, `National Population Health Survey 2024 shows Singaporeans are adopting healthier lifestyles, but rising obesity is a concern`, published `October 17, 2025`
   https://www.moh.gov.sg/newsroom/national-population-health-survey-2024-shows-singaporeans-are-adopting-healthier-lifestyles---but-rising-obesity-is-a-concern/

2. Singapore MOH, `National Population Health Survey (NPHS) 2024 Report`
   https://www.moh.gov.sg/others/resources-and-statistics/national-population-health-survey--nphs--2024-report/

3. HPB Annual Report 2024/2025, including Healthy 365 usage and the 2024 Meal Log Challenge references
   https://www.hpb.gov.sg/docs/default-source/annual-reports/hpb-annual-report-2024.pdf

4. WhatsApp, `WhatsApp Business Solution Terms`, last modified `March 6, 2026`
   https://www.whatsapp.com/legal/business-solution-terms/

5. WhatsApp Business, `WhatsApp Business Messaging Policy`
   https://business.whatsapp.com/policy

6. MyFitnessPal Help, `Meal Scan FAQ`, updated `January 22, 2026`
   https://support.myfitnesspal.com/hc/en-us/articles/360045761612-Meal-Scan-FAQ

7. SingaporeCalorie official site
   https://www.singaporecalorie.com/

8. Ventrickle official site
   https://ventrickle.com/

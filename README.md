# Mo Studios · Alan

Mo Studios is an internal content generation tool built for Alan's health coaching platform. It takes a user's wearable health data and generates personalized health content — articles, meditations, or video scripts — powered by Mistral AI.

---

## 🚀 What it does

1. **Select a profile** — choose from 8 Alan member personas (IT Manager, Active Gym Guy, etc.), each mapped to real wearable data sources (Withings, Whoop, Apple, Garmin…)
2. **Describe the situation** — free-text input for the member's health topic or concern
3. **Choose duration** — 5, 10, or 20 minutes of content
4. **Confirm & generate** — Mo fetches the member's health analysis, then calls Mistral to produce structured content
5. **Result page** — displays explanation sections + interactive objectives with an XP/leveling system

---

## ✨ Key features

### 🧠 Personalized content generation

* Calls `/api/analyse_data` to fetch real wearable health data per user
* Calls `/api/generate` (Mistral `mistral-large-latest`) with a structured prompt including sleep, HRV, and activity data
* Returns a JSON with:

  * `explanation[]` sections
  * `objectives[]` (each with a category, description, and XP value)

---

### 🎯 Interactive objectives

* Each objective is a **color-coded card** based on its health category:

  * Sleep, Nutrition, Breathing & relaxation, Mental well-being, etc.
* "Mark as done" checkbox awards XP per objective
* Sticky sidebar shows:

  * Current level
  * XP progress bar
  * Mini checklist
* XP persists in `localStorage` across sessions

---

### 🔊 Audio summary

* `/api/audio-summary` takes generated content and:

  1. Uses Mistral to extract 3–4 micro-challenges
  2. Rewrites them into a 30–45s spoken coach script
  3. Synthesizes audio via Voxtral TTS (`voxtral-mini-tts-2603`)
* Serves MP3 via `/api/audio-summary/file/[filename]`

---

### 🏆 XP & leveling

* 300 XP per level
* XP accumulates across sessions via `localStorage`
* Level-up toast notification on milestone

---

## 🧱 Tech stack

| Layer      | Tech                                                                 |
| ---------- | -------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                                   |
| Styling    | Tailwind CSS                                                         |
| Language   | TypeScript                                                           |
| AI         | Mistral AI (`mistral-large-latest`, `voxtral-mini-tts-2603`)         |
| Validation | Zod                                                                  |
| Data       | Wearable health APIs (Withings, Whoop, Apple, Garmin, Samsung, Oura) |

---

## ⚙️ Getting started

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Add:
# MISTRAL_API_KEY
# VOXTRAL_VOICE_ID (optional)

# Run dev server
npm run dev
```

Open: http://localhost:3000

---

## 🔐 Environment variables

| Variable         | Required | Description                                                     |
| ---------------- | -------- | --------------------------------------------------------------- |
| MISTRAL_API_KEY  | Yes      | Your Mistral API key                                            |
| VOXTRAL_VOICE_ID | No       | Specific voice ID for TTS (defaults to French voice if omitted) |

---

## 🗂️ Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/        # Content generation (Mistral)
│   │   ├── audio-summary/   # TTS coach script (Voxtral)
│   │   └── analyse_data/    # Wearable health data proxy
│   └── result/              # Result page with objectives + XP sidebar
├── components/
│   ├── StepProfile.tsx      # Profile selector
│   ├── StepCustom.tsx       # Topic input
│   ├── StepDuration.tsx     # Duration picker
│   ├── StepConfirm.tsx      # Summary before generation
│   └── StepLoading.tsx      # Generation progress + API calls
├── constants.ts             # Categories color map, XP_PER_LEVEL
└── types.ts                 # AppData, AnalysisResult, Objective interfaces
```

---

## 🧩 Health categories

Each objective is tagged with one of 10 categories, each with a distinct color:

* Mental well-being
* Sleep
* Sport & physical activity
* Nutrition
* Breathing & relaxation
* Digital detox
* Habits & addictions
* Productivity & organization
* Relationships & social life
* Personal development

---

## 🧪 How it works (flow summary)

1. User selects profile + inputs situation
2. System fetches wearable data via `/api/analyse_data`
3. Data is structured into a prompt and sent to Mistral
4. Mistral returns:

   * Explanation content
   * Actionable objectives
5. Frontend renders results + tracks XP
6. Optional: audio summary generated via TTS

---

## 🏁 Built for

Built at the **Alan Hackathon** — designed to explore how AI + real health data can drive **personalized, actionable coaching experiences**.

---

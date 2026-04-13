# Mo Studios · Alan

> Generate personalized health content from wearable data using AI-powered coaching.

## Team

| Name | LinkedIn Profile Link |
| ---- | --------------------- |
| Christophe | https://www.linkedin.com/in/christophe-prat-b9a9a41ba |
| Samuel     | https://www.linkedin.com/in/samuel-rajzman-562a85271/ |
| Tassilo  | https://www.linkedin.com/in/tassilo-westphalen-08299a386/ |

## The Problem

Users have access to rich wearable health data (sleep, HRV, activity) but struggle to understand what it means and how to act on it. Generic health advice misses individual context—a person's sleep issues are different from someone else's, yet they receive the same recommendations. Real, personalized health coaching requires understanding individual data patterns and generating contextual, actionable advice.

## What It Does

Mo Studios is a personalized health coaching tool that:

1. **Select a profile** — choose from 8 Alan member personas (IT Manager, Active Gym Guy, etc.), each mapped to real wearable data
2. **Describe your situation** — free-text input for your health topic or concern
3. **Choose duration** — 5, 10, or 20 minutes of content
4. **Confirm & generate** — Mo fetches your health analysis and generates structured content
5. **View results** — interactive objectives with progress tracking and an XP/leveling system and Mbappé explaining the objectives in a personalized voice script

Users get personalized articles, meditations, or video scripts grounded in their actual health data. Each objective is color-coded by health category (sleep, nutrition, mental well-being, etc.), and users can track completion with an XP system that persists across sessions. Optional: generate a 30-45s audio coach script from the content using text-to-speech.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI**: Mistral AI 🚀 (`mistral-large-latest`, `voxtral-mini-tts-2603`)
- **Validation**: Zod
- **Data**: Thryve

## Special Track

- [x] Alan Play: Mo Studios
- [ ] Alan Play: Living Avatars
- [ ] Alan Play: Personalized Wrapped
- [ ] Alan Play: Health App in a Prompt
- [ ] Alan Precision

## What We'd Do Next

If you had more time, we'd build:

- **Real wearable integration** — OAuth flows for each platform instead of mock data
- **Multi-language support** — generate content in user's preferred language
- **Content variants** — A/B test different coaching styles (motivational vs. technical)
- **Video generation** — create short personalized coaching videos from scripts
- **Community features** — share health journeys and objectives with friends
- **Advanced analytics** — track which types of content drive the most behavior change
- **Offline mode** — cache generated content and objectives for offline access

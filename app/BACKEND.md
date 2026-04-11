# Mo Studios — Backend Integration Guide

## Overview

The frontend sends a single `POST /api/analyse_data` request and expects a structured JSON response. Everything else (auth, user profiles, XP persistence) is your call.

---

## Endpoint

| Field    | Value                     |
|----------|---------------------------|
| Method   | `POST`                    |
| Path     | `/api/analyse_data`           |
| Auth     | Optional — add `Authorization: Bearer <token>` header if needed |

---

## Request Body

```json
{
  "goal":     "sleep",
  "custom":   "Je me réveille plusieurs fois par nuit depuis quelques semaines.",
  "format":   "meditation",
  "duration": "10"
}
```

| Field      | Type   | Possible values                                                  |
|------------|--------|------------------------------------------------------------------|
| `goal`     | string | `sleep` · `stress` · `detox` · `nutrition` · `tobacco` · `breathing` |
| `custom`   | string | (Optional) Free text from the user about their specific situation |
| `format`   | string | `meditation` · `article` · `video`                              |
| `duration` | string | `"5"` · `"10"` · `"20"` (minutes, sent as string)              |

---

## Expected Response — `200 OK`

```json
{
  "title": "Votre méditation sommeil de 10 minutes",
  "body":  "Texte généré complet…\n\nDeuxième paragraphe…",
  "scores": {
    "medical":         94,
    "brand":           88,
    "personalization": 91
  },
  "xp": 120
}
```

| Field                    | Type   | Description                                         |
|--------------------------|--------|-----------------------------------------------------|
| `title`                  | string | Display title shown at the top of the result card   |
| `body`                   | string | Full content; newlines (`\n`) are preserved         |
| `scores.medical`         | number | 0–100 — medical accuracy score                      |
| `scores.brand`           | number | 0–100 — Alan brand voice alignment                  |
| `scores.personalization` | number | 0–100 — personalization depth                       |
| `xp`                     | number | XP to award (shown in the pop-up banner)            |

---

## Error Handling

If the backend returns a **non-2xx status** or the fetch **throws**, the frontend falls back to a built-in mock — no crash, no user-facing error. To surface real errors, catch them in `StepLoading.jsx` and call `setResult({ error: true })`.

---

## CORS

Allow your frontend origin:

```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Auth / User Context

To pass auth or member identity, add headers in `StepLoading.jsx` inside the `fetch()` call:

```js
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,    // from your auth context
  'X-Alan-Member-Id': memberId,           // optional
}
```

TOKEN and memberId would come from an auth context/store wired at the App.jsx level.

---

## Vite Proxy (dev only)

Add to `vite.config.js` if your backend runs locally on a different port:

```js
server: {
  proxy: {
    '/api': 'http://localhost:8000',
  }
}
```

---

## Environment Variable (production)

```
# .env
VITE_API_BASE=https://api.your-domain.com
```

Then in `StepLoading.jsx`:

```js
const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/analyse_data`, { ... })
```

---

## Summary Checklist

- [ ] Implement `POST /api/analyse_data` accepting `{ goal, format, duration }`
- [ ] Return `{ title, body, scores: { medical, brand, personalization }, xp }`
- [ ] Set CORS headers for your frontend domain
- [ ] (Optional) Parse `Authorization` header for auth
- [ ] (Optional) Configure Vite proxy for local dev

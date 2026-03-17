# cf_ai_runcoach 🏃

An AI-powered personal running coach built on Cloudflare's AI stack. Log workouts, get personalised training plans, and ask coaching questions — the coach remembers your full session history.

## Architecture

| Requirement | Implementation |
|---|---|
| LLM | Llama 3.3 70B via **Workers AI** |
| Workflow / coordination | **Cloudflare Worker** — routes all API calls |
| User input | **Chat UI** served as static asset via Workers Assets |
| Memory / state | **Durable Objects** — persists conversation history per session |

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Log in to Cloudflare
npx wrangler login

# 3. Start local dev server
npx wrangler dev

# Visit http://localhost:8787
```

## Deploying

```bash
npx wrangler deploy
```

## Project structure

```
cf_ai_runcoach/
├── src/
│   ├── index.js      # Worker entry point — routing
│   └── coach.js      # CoachSession Durable Object — memory + LLM
├── public/
│   └── index.html    # Chat frontend
├── wrangler.toml
├── package.json
├── README.md
└── PROMPTS.md
```

## Built by

Tatiana Nohra — tatiananohra5@gmail.com

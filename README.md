# FitCoach AI

A Next.js App Router chat app with a server-side Groq-powered multi-agent fitness and nutrition assistant.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and add your Groq key:

   ```bash
   cp .env.local.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000/fitness-agent`

## Environment variables

- `GROQ_API_KEY`: required, server-only Groq API key.
- `GEMINI_API_KEY`: optional placeholder for the server-only Gemini provider. The active multi-agent route uses Groq.

## Agent configuration

- The agents area lives in `lib/agents`.
- Each agent persona and metadata lives in its own `agent.ts`.
- Each system prompt lives in that agent's `prompt.ts`.
- Safety and response style rules live in that agent's `rules.ts`.
- Starter/example questions live in that agent's `examples.ts`.
- Agent selection lives in `lib/agents/router.ts`.
- Server-owned message construction lives in `lib/agents/message-builder.ts`.
- Groq provider setup lives in `lib/ai/providers/groq.ts`.
- The default Groq model is centralized in `lib/agents/model.ts`.

Current agents:

- `fitness-coach`: general gym, strength, muscle building, fat loss, cardio, recovery, and healthy habits.
- `nutrition-coach`: calories, macros, meal planning, food choices, hydration, and supplements.
- `workout-planner`: structured workout plans, splits, routines, and progression.
- `exercise-form-coach`: exercise technique, setup, cues, common mistakes, and safer alternatives.
- `safety-guard`: risky medical, injury, eating disorder, steroid, extreme dieting, and unsafe training requests.

To change an agent personality later, edit that agent's `prompt.ts`, `rules.ts`, `examples.ts`, or `agent.ts`.

## API contract

`POST /api/agent`

```ts
{
  message: string;
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
}
```

Response:

```ts
{
  reply: string;
  agent: {
    id: string;
    name: string;
  };
}
```

`POST /api/fitness-agent` remains as a compatibility wrapper around the new route.

## Safety notes

- The API route rejects empty or oversized messages.
- Conversation history is sanitized and limited on the server.
- The client cannot provide or override a system prompt.
- The Groq key is used only on the server.
- Medical, injury, and high-risk topics are redirected toward qualified professionals.
"# Fitness_Agent" 

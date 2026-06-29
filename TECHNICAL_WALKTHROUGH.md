# TECHNICAL WALKTHROUGH

## 1. Project overview

This project is a Next.js AI fitness and nutrition assistant called FitCoach AI. A user opens a chat page, types a fitness or nutrition question, and the backend routes that question to one of several specialized AI agents before calling the LLM provider.

Based on the actual codebase, the project is using:

- Next.js App Router via the `app/` directory and route handlers such as `app/api/agent/route.ts`
- React for the UI components in `app/` and `components/`
- TypeScript throughout the codebase (`.ts` and `.tsx` files)
- Tailwind CSS via `app/globals.css` and the Tailwind/PostCSS setup
- Groq as the active AI provider in `lib/ai/providers/groq.ts`
- Gemini as a present but inactive provider helper in `lib/ai/providers/gemini.ts`
- A multi-agent architecture under `lib/agents/`

The important design idea is that this is not a single hardcoded chatbot prompt. It is a router-plus-agent system:

- the router decides which specialist should answer
- the selected agent provides persona, mission, system prompt, safety rules, and model settings
- the message builder creates server-controlled LLM input
- the provider sends the final request to Groq

## 2. Full folder structure explanation

Important project structure:

```txt
app/
  api/
    agent/route.ts
    fitness-agent/route.ts
  fitness-agent/page.tsx
  globals.css
  layout.tsx
  page.tsx

components/
  fitness-agent/
    ChatBox.tsx
    MessageBubble.tsx
    types.ts

lib/
  agents/
    exercise-form-coach/
      agent.ts
      examples.ts
      prompt.ts
      rules.ts
    fitness-coach/
      agent.ts
      examples.ts
      prompt.ts
      rules.ts
    nutrition-coach/
      agent.ts
      examples.ts
      prompt.ts
      rules.ts
    safety-guard/
      agent.ts
      examples.ts
      prompt.ts
      rules.ts
    workout-planner/
      agent.ts
      examples.ts
      prompt.ts
      rules.ts
    index.ts
    message-builder.ts
    model.ts
    router.ts
    types.ts
  ai/
    providers/
      gemini.ts
      groq.ts
    types.ts

.env.local.example
package.json
```

Folder purposes:

- `app/`: Next.js App Router entry points, pages, shared layout, global styles, and server API routes.
- `app/api/`: backend route handlers that receive chat requests.
- `app/fitness-agent/`: the main user-facing chat page.
- `components/fitness-agent/`: reusable frontend chat UI pieces.
- `lib/agents/`: the multi-agent system, including agent definitions, routing, and message construction.
- `lib/ai/`: provider-facing code and shared AI provider types.
- `.env.local.example`: non-secret template of required environment variables.
- `package.json`: project metadata, dependencies, and npm scripts.

## 3. Main user flow

Actual runtime flow in this repo:

```txt
User opens page
-> `app/page.tsx` redirects to `/fitness-agent`
-> `app/fitness-agent/page.tsx` renders the chat page and `ChatBox`
-> User types a message in `components/fitness-agent/ChatBox.tsx`
-> `ChatBox` sends `POST /api/agent` with `{ message, history }`
-> `app/api/agent/route.ts` parses and validates the request
-> `lib/agents/router.ts` selects the agent ID
-> `lib/agents/index.ts` returns the selected agent config
-> `lib/agents/message-builder.ts` creates the final safe LLM messages
-> `lib/ai/providers/groq.ts` calls Groq using the selected agent's model and temperature
-> Groq returns model output
-> `app/api/agent/route.ts` returns `{ reply, agent }`
-> `ChatBox` displays the assistant message and optionally shows which agent answered
```

## 4. Frontend explanation

### File: `app/page.tsx`
Purpose:
This file is the root entry page and immediately redirects users to the main chat UI.

Important logic:
It calls `redirect("/fitness-agent")`, so the homepage is effectively just a redirect.

Line/block explanation:
- `app/page.tsx` lines 1-4 redirect the root path to the chat page.

### File: `app/layout.tsx`
Purpose:
Defines the global app layout, font loading, and page metadata.

Important logic:
- imports IBM Plex Sans and Space Grotesk with `next/font/google`
- applies CSS variables for fonts to the `<body>`
- sets metadata title and description

Line/block explanation:
- `app/layout.tsx` lines 5-13 configure the heading and body fonts.
- lines 15-18 define the app metadata.
- lines 20-30 wrap all pages in the global layout.

### File: `app/fitness-agent/page.tsx`
Purpose:
This is the main chat page the user sees.

Important logic:
- renders a hero/header section explaining the product
- renders the actual chat interface with `<ChatBox />`

Line/block explanation:
- `app/fitness-agent/page.tsx` lines 5-37 build the page hero and explain that the app uses focused agents for workouts, nutrition, programming, exercise form, and safer next steps.
- line 39 mounts `ChatBox`, which is the functional chat experience.

### File: `components/fitness-agent/ChatBox.tsx`
Purpose:
This file is the main frontend chat controller. It owns message state, input state, request submission, loading state, and UI behavior.

Important logic:
- stores chat messages in local React state
- stores current input text
- computes client-side history from existing messages
- posts the message to `/api/agent`
- rolls back optimistic UI if the request fails
- supports Enter to send and Shift+Enter for newline
- shows starter questions and an inline loading bubble

Line/block explanation:
- lines 7-17 define the welcome message, max input length, and starter questions.
- lines 19-30 define `createMessage`, which gives each frontend message an ID and optional agent metadata.
- lines 32-39 create component state for `messages`, `input`, `isLoading`, and `error`.
- lines 41-43 auto-scroll the chat to the bottom whenever messages or loading state change.
- lines 45-51 derive `history` by removing the first assistant welcome message and sending only role/content pairs.
- lines 53-115 implement `handleSubmit()`.
  - lines 54-63 trim and validate the message locally.
  - lines 66-73 add the user message optimistically and start loading.
  - lines 75-85 send `POST /api/agent`.
  - lines 87-98 parse the backend response and throw a friendly error if the backend did not return a valid reply.
  - lines 100-103 append the assistant reply and store the returned `agent`.
  - lines 104-115 roll back on failure and restore the original input text.
- lines 118-126 implement Enter-to-send behavior and preserve Shift+Enter for new lines.
- lines 128-131 prefill the input when a starter question is clicked.
- lines 133-225 render the chat UI, starter questions, loading bubble, textarea, validation hints, and send button.

### File: `components/fitness-agent/MessageBubble.tsx`
Purpose:
Renders one chat bubble.

Important logic:
- visually separates assistant and user messages
- shows the assistant name from the selected agent if present
- optionally shows `Answered by ...`

Line/block explanation:
- `components/fitness-agent/MessageBubble.tsx` lines 8-18 choose different classes for assistant versus user messages.
- lines 20-21 show `message.agent?.name ?? "FitCoach AI"` for assistant messages.
- lines 26-30 show the optional "Answered by {agent.name}" footer.

### File: `components/fitness-agent/types.ts`
Purpose:
Defines frontend-only chat message types for the UI.

Important logic:
- `ChatMessage` includes `id`, `role`, `content`, and optional agent metadata
- `ChatHistoryMessage` is derived from `ChatMessage`

## 5. Backend API explanation

### File: `app/api/agent/route.ts`
Purpose:
This is the main backend route that receives chat messages from the frontend and orchestrates the full agent flow.

Step-by-step request handling:
1. Accepts a `POST` request.
2. Parses JSON safely inside a `try/catch`.
3. Validates that the body is an object.
4. Validates that `message` exists and is a string.
5. Trims the message and rejects empty text.
6. Rejects messages over 2000 characters.
7. Validates that `history`, if present, is an array.
8. Calls `selectAgent(message)` to choose the agent.
9. Calls `getAgent(agentId)` to load the agent config.
10. Calls `buildAgentMessages({ agent, message, history })`.
11. Calls `createGroqChatCompletion({ agent, messages })`.
12. Returns `{ reply, agent: { id, name } }`.

Important validation:
- `app/api/agent/route.ts` lines 32-79 implement request validation.
- lines 41-47 reject non-string messages.
- lines 49-57 reject empty messages.
- lines 59-65 reject oversize messages.
- lines 67-73 reject non-array history input.

Important security behavior:
- line 30 forces Node.js runtime for this route.
- line 88 logs malformed JSON on the server with `console.error`.
- lines 105-111 do not trust the client to choose an agent or supply a system prompt.
- lines 129-145 return safe error messages without exposing provider internals or secrets.

### File: `app/api/fitness-agent/route.ts`
Purpose:
This is not the main route anymore. It is a compatibility wrapper.

Important logic:
- line 1 sets `runtime = "nodejs"`
- line 3 re-exports `POST` from `../agent/route`

This means older frontend code can still call `/api/fitness-agent`, but the real logic lives in `/api/agent`.

Request body shape used by the backend:

```ts
{
  message: string;
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
}
```

Response body shape:

```ts
{
  reply: string;
  agent: {
    id: string;
    name: string;
  };
}
```

## 6. Agents architecture explanation

The multi-agent architecture lives entirely under `lib/agents/`.

Each agent has four files:

- `agent.ts`: final typed config
- `prompt.ts`: main persona/system prompt
- `rules.ts`: safety rules and response style arrays
- `examples.ts`: example questions or starter prompts

### Agent: `fitness-coach`
Files:
- `lib/agents/fitness-coach/agent.ts`
- `lib/agents/fitness-coach/prompt.ts`
- `lib/agents/fitness-coach/rules.ts`
- `lib/agents/fitness-coach/examples.ts`

Purpose:
General gym, fitness, strength, muscle building, fat loss, cardio, recovery, and healthy habits.

Persona:
FitCoach AI is practical, supportive, honest, clear, and motivating. It speaks like an experienced gym coach and is meant to help beginners through advanced trainees.

Safety rules:
- does not diagnose medical conditions
- redirects health-risk topics to qualified professionals
- refuses unsafe topics such as steroid cycles, SARMs, starvation diets, dehydration methods, purging, and extreme rapid weight-loss plans

Example questions:
- "How do I start going to the gym?"
- "How long does it take to build muscle?"
- "What is progressive overload?"

When router selects it:
This is the default agent when no other specialist keyword group matches.

### Agent: `nutrition-coach`
Files:
- `lib/agents/nutrition-coach/agent.ts`
- `lib/agents/nutrition-coach/prompt.ts`
- `lib/agents/nutrition-coach/rules.ts`
- `lib/agents/nutrition-coach/examples.ts`

Purpose:
Calories, macros, protein, hydration, meal planning, grocery choices, supplement basics, and sustainable eating habits.

Persona:
Clear, realistic, non-judgmental, practical, and supportive. It focuses on helping users understand food without fear or confusion.

Safety rules:
- does not diagnose or treat medical conditions
- redirects diabetes, eating disorders, pregnancy, kidney disease, heart disease, medication issues, severe allergies, and digestive disease
- refuses starvation diets, purging, dehydration methods, dangerous supplement protocols, and extreme rapid weight loss

Example questions:
- "How much protein should I eat?"
- "Give me a fat-loss meal plan"
- "Is creatine worth taking?"

When router selects it:
When the user message contains nutrition keywords such as `calories`, `protein`, `macros`, `meal`, `diet`, `food`, `supplement`, `creatine`, `whey`, `cut`, or `bulk`.

### Agent: `workout-planner`
Files:
- `lib/agents/workout-planner/agent.ts`
- `lib/agents/workout-planner/prompt.ts`
- `lib/agents/workout-planner/rules.ts`
- `lib/agents/workout-planner/examples.ts`

Purpose:
Structured workout plans, weekly splits, routines, progression plans, and program design.

Persona:
Organized, practical, clear, and realistic. It behaves like a coach building a training program.

Safety rules:
- does not recommend training through serious pain
- redirects injury, severe pain, chest pain, dizziness, fainting, surgery recovery, and serious conditions
- asks for goal, schedule, equipment, routine, and limitations before generating detailed plans

Example questions:
- "Create a beginner workout plan for muscle gain"
- "Build me a 4-day upper lower split"
- "Create a push pull legs routine"

When router selects it:
When the user message contains plan/program/routine keywords such as `plan`, `program`, `routine`, `split`, `schedule`, `ppl`, `upper lower`, `full body`, or `training plan`.

### Agent: `exercise-form-coach`
Files:
- `lib/agents/exercise-form-coach/agent.ts`
- `lib/agents/exercise-form-coach/prompt.ts`
- `lib/agents/exercise-form-coach/rules.ts`
- `lib/agents/exercise-form-coach/examples.ts`

Purpose:
Exercise technique, movement cues, breathing, common mistakes, setup, range of motion, and alternatives.

Persona:
Precise, clear, calm, and practical. It explains movement like a good trainer.

Safety rules:
- does not diagnose injuries
- tells users to stop and consult a professional for pain, injury, numbness, severe discomfort, dizziness, or medical issues
- can provide alternatives when a movement is not suitable

Example questions:
- "Explain proper squat form"
- "How do I deadlift safely?"
- "What are common bench press mistakes?"

When router selects it:
When the user message contains technique keywords such as `form`, `technique`, `squat`, `deadlift`, `bench press`, `overhead press`, `row`, `lunge`, `rdl`, or `hip thrust`.

### Agent: `safety-guard`
Files:
- `lib/agents/safety-guard/agent.ts`
- `lib/agents/safety-guard/prompt.ts`
- `lib/agents/safety-guard/rules.ts`
- `lib/agents/safety-guard/examples.ts`

Purpose:
High-risk medical, injury, eating disorder, steroid, SARMs, extreme dieting, and unsafe training questions.

Persona:
Calm, direct, supportive, and careful. Its job is to keep the user safe.

Safety rules:
- does not diagnose
- does not provide medical treatment plans
- refuses steroid cycles and SARMs cycles
- refuses starvation, purging, and dehydration instructions
- tells users to seek urgent medical help for emergency symptoms such as chest pain, fainting, severe shortness of breath, or severe allergic reaction

Example questions:
- "My chest hurts during cardio. What should I do?"
- "Can you give me a steroid cycle?"
- "Should I train through sharp knee pain?"

When router selects it:
When the message contains safety keywords such as `pain`, `injury`, `chest pain`, `dizziness`, `pregnancy`, `medication`, `steroids`, `sarms`, `dehydration`, `starvation`, or `extreme weight loss`.

## 7. Router explanation

File:
- `lib/agents/router.ts`

How the router decides:
- It lowercases the message.
- It checks keyword groups in priority order.
- The first matching group wins.

Priority order in code:
1. safety
2. nutrition
3. exercise form
4. workout planner
5. default to fitness coach

Why safety guard is highest priority:
If a message contains risk indicators such as pain, chest pain, dizziness, steroids, or eating disorder terms, the project should prefer a safety-oriented answer over a general coaching answer.

Keyword matching logic:
- `includesKeyword()` in `lib/agents/router.ts` lines 97-99 uses `message.includes(keyword)`.
- `selectAgent()` in lines 101-120 checks the keyword arrays in order and returns the first matching `AgentId`.

Routing examples based on actual code:

- `"How much protein should I eat?"` -> `nutrition-coach`
- `"Create a workout plan"` -> `workout-planner`
- `"Explain squat form"` -> `exercise-form-coach`
- `"My chest hurts"` -> `safety-guard`
- `"How do I build muscle?"` -> `fitness-coach`

## 8. Message builder explanation

File:
- `lib/agents/message-builder.ts`

How it builds final AI messages:
- It accepts `{ agent, message, history }`.
- It always prepends the server-owned `agent.systemPrompt`.
- It filters history so only `{ role: "user" | "assistant", content: string }` entries survive.
- It trims history content and removes empty items.
- It slices history to the latest `agent.maxHistoryMessages`.
- It appends the current user message at the end.

Important blocks:
- lines 13-26 validate one history entry.
- lines 28-43 sanitize and limit history.
- lines 45-60 build the final message array.

Why the system prompt comes from the server:
The client never sends a system prompt. The route chooses the agent and the message builder injects `agent.systemPrompt` on the server side. That prevents a browser client from overriding the agent persona or safety instructions.

Why this matters for safety and hallucination reduction:
- the model is always grounded in the selected specialist's scope
- malicious or accidental client-side prompt injection is reduced
- empty or malformed history does not reach the provider
- the context window is kept smaller and more predictable

## 9. Types explanation

### File: `lib/agents/types.ts`

Important types:

- `AgentId`:
  Defines the five supported agent IDs:
  `fitness-coach`, `nutrition-coach`, `workout-planner`, `exercise-form-coach`, and `safety-guard`.

- `ChatRole`:
  Restricts message roles to `system`, `user`, or `assistant`.

- `ChatMessage`:
  Represents the provider-facing message shape:
  ```ts
  { role: ChatRole; content: string }
  ```

- `ClientHistoryMessage`:
  Represents the allowed history coming from the browser:
  ```ts
  { role: "user" | "assistant"; content: string }
  ```

- `AgentConfig`:
  This is the core agent definition type. It combines:
  agent identity, user-facing metadata, system prompt, safety rules, response style, example questions, model name, temperature, and max history length.

Why these are useful:
- they make the agent registry type-safe
- they ensure the router returns only valid agents
- they keep provider input and client input separated
- they reduce accidental misuse when building LLM messages

### File: `lib/ai/types.ts`

Important types:

- `AIChatCompletionInput`:
  Bundles the selected `agent` and final `messages` before a provider call.

- `AIChatCompletionResult`:
  Standardizes provider output to:
  ```ts
  { reply: string }
  ```

This makes the route code simpler and helps future provider swaps remain consistent.

## 10. AI providers explanation

### File: `lib/ai/providers/groq.ts`

How Groq client is initialized:
- lines 24-39 read `process.env.GROQ_API_KEY`, validate it, and lazily create a singleton Groq client.
- lines 94-121 send chat completions using the selected agent's `model` and `temperature`.

Important behavior:
- `createGroqChatCompletion()` is the active provider function used by `app/api/agent/route.ts`.
- It extracts the assistant text from `completion.choices[0].message.content`.
- It maps authentication, rate-limit, timeout, connection, and generic API errors into safe app-level errors.

Required environment variable:
- `GROQ_API_KEY`

### File: `lib/ai/providers/gemini.ts`

How Gemini client is initialized:
- `getGeminiApiKey()` reads `process.env.GEMINI_API_KEY`
- `getGeminiClient()` lazily creates a `GoogleGenAI` instance

Important caveat:
- Gemini exists in the repo, but it is not wired into `app/api/agent/route.ts`.
- The active multi-agent route uses Groq only.
- `assertGeminiProviderUnavailable()` makes that explicit.

Required environment variable if Gemini is ever activated:
- `GEMINI_API_KEY`

Why keys must stay server-side:
- both providers are marked `import "server-only"`
- provider files read keys from `process.env`
- frontend code never references provider keys

Why `NEXT_PUBLIC_` must not be used:
- `NEXT_PUBLIC_*` variables are exposed to the browser bundle in Next.js
- LLM provider API keys must never be exposed in client-side JavaScript

## 11. Environment variables explanation

File:
- `.env.local.example`

Expected variable names:

```env
GROQ_API_KEY=
GEMINI_API_KEY=
```

What this means:
- real keys should go into `.env.local` for local development or into deployment environment variables such as Vercel project settings
- `.env.local.example` should contain names only, never real values
- `.env.local` should not be committed

Important note:
- In the current workspace, the real project template file is safe because it only contains variable names with blank values.

## 12. Package and dependency explanation

File:
- `package.json`

Important dependencies:

- `next`:
  The web framework, including App Router and API route handlers.

- `react` and `react-dom`:
  The frontend UI framework.

- `groq-sdk`:
  The active LLM provider SDK used in `lib/ai/providers/groq.ts`.

- `@google/genai`:
  Gemini SDK, present but not active in the main route.

- `clsx`:
  Utility for conditional class names, used in `components/fitness-agent/MessageBubble.tsx`.

- `tailwindcss`, `postcss`, `autoprefixer`:
  Styling pipeline for Tailwind CSS.

- `typescript`, `@types/node`, `@types/react`, `@types/react-dom`:
  TypeScript and type support.

Available npm scripts:

- `npm run dev`: runs the local Next.js dev server
- `npm run build`: builds the app for production
- `npm run start`: starts the production server after build
- `npm run lint`: currently points to `next lint`

How to run the project:

```bash
npm install
npm run dev
```

How to build the project:

```bash
npm run build
```

## 13. AI agent concept explanation

In this specific project:

- Agent:
  A typed configuration object that contains persona, system prompt, mission, safety rules, example questions, model, temperature, and history limit.

- Router:
  Decides which specialist should answer the user's message.

- Message builder:
  Converts `{ agent, message, history }` into the final LLM input while keeping the system prompt server-controlled.

- Provider:
  Sends the final messages to Groq.

- LLM:
  Generates the final text reply.

Difference between a normal chatbot and this project:

- A normal chatbot often has one generic system prompt for every question.
- This project uses multiple specialist agents and a router, so nutrition questions, workout-plan questions, form questions, and risky medical questions are handled differently.

That makes the system more organized, safer, and easier to evolve.

## 14. Hallucination and safety explanation

This architecture reduces hallucination risk, but it does not eliminate hallucination completely.

It reduces risk by:

- using scoped specialist agents instead of a single catch-all prompt
- using strict prompts that explicitly define each agent's domain
- routing risky questions to `safety-guard`
- validating and sanitizing client input
- keeping the system prompt server-controlled
- limiting history and preventing client-side system prompt override
- requiring agents to ask follow-up questions when context is missing
- telling agents to avoid medical diagnosis, exact guarantees, unsupported scientific claims, and unsafe instructions

The `safety-guard` agent is the dedicated safety layer for injury, chest pain, steroids, SARMs, eating disorders, dehydration methods, purging, and extreme dieting.

## 15. End-to-end examples

### Example 1
User asks: `"How much protein should I eat?"`

Frontend:
`components/fitness-agent/ChatBox.tsx` sends `POST /api/agent`.

API:
`app/api/agent/route.ts` validates the message.

Router:
`lib/agents/router.ts` matches `protein`.

Selected agent:
`nutrition-coach`

Message builder:
Prepends the nutrition coach system prompt and appends the user message.

Provider:
`lib/ai/providers/groq.ts` sends the messages to Groq with the nutrition coach model settings.

Final response behavior:
The answer should focus on protein, macros, context gathering, and practical nutrition guidance.

### Example 2
User asks: `"Create a beginner workout plan for muscle gain"`

Frontend:
The starter question can be clicked directly in `ChatBox.tsx`.

API:
Validates and routes the message.

Router:
Matches `plan`.

Selected agent:
`workout-planner`

Message builder:
Uses the workout planner prompt and includes recent history.

Provider:
Groq receives the planner prompt and message list.

Final response behavior:
The answer should ask for missing context if needed, then give a weekly structure, exercises, sets, reps, rest times, and progression.

### Example 3
User asks: `"Explain proper squat form"`

Frontend:
Sends the typed message to `/api/agent`.

API:
Validates the request and selects an agent.

Router:
Matches both `squat` and `form`.

Selected agent:
`exercise-form-coach`

Message builder:
Prepends the exercise form prompt.

Provider:
Groq generates the answer.

Final response behavior:
The response should be step-by-step, covering setup, movement, breathing, common mistakes, and safety cues.

### Example 4
User asks: `"My chest hurts during cardio"`

Frontend:
Sends message and current history.

API:
Validates request.

Router:
Matches `hurt`, which appears in the safety keyword list.

Selected agent:
`safety-guard`

Message builder:
Uses the safety guard system prompt.

Provider:
Groq receives a safety-focused prompt.

Final response behavior:
The answer should avoid diagnosis, stop unsafe guidance, and advise urgent professional or emergency care if appropriate.

### Example 5
User asks: `"How do I build muscle?"`

Frontend:
Sends the message to the agent API.

API:
Validates, routes, builds messages, and calls Groq.

Router:
No specialist keyword group necessarily wins.

Selected agent:
`fitness-coach`

Message builder:
Uses the general fitness prompt.

Provider:
Groq returns the answer.

Final response behavior:
The answer should focus on training consistency, progressive overload, recovery, and realistic expectations.

## 16. Manager-ready explanation

### Short version

This project is a Next.js AI fitness and nutrition assistant with a multi-agent backend. The frontend is a React chat UI, and the backend exposes a single API route that validates user input, routes the request to the best specialist agent, builds a safe prompt on the server, and then calls Groq. The agent system is modular, so nutrition questions, workout planning questions, exercise-form questions, and risky health-related questions are handled by different personas with different prompts and safety rules.

### Detailed version

This project is built as a Next.js App Router application with a React chat frontend and a server-side AI orchestration layer. When the user opens the app, they land on a dedicated chat page and interact with a `ChatBox` component that manages local message state, loading state, error handling, and starter prompts. When the user submits a message, the frontend sends a structured request to `/api/agent` containing the message and recent conversation history.

On the backend, the route validates the request carefully, including message type, emptiness, length, and history shape. It then runs a rule-based router that chooses one of five specialist agents: a general fitness coach, nutrition coach, workout planner, exercise form coach, or safety guard. Each agent has its own config object, persona, mission, prompt, safety rules, and model settings stored in separate files under `lib/agents`.

After the agent is selected, the server builds the final LLM messages itself so the system prompt is always controlled on the backend. That matters for safety, because the client cannot override the prompt. The final messages are sent through the Groq provider, which initializes the Groq SDK with a server-side environment variable and maps provider failures into safe error messages. The API returns both the reply and the selected agent identity, and the frontend displays the answer and can show which agent handled it.

## 17. Architecture diagram

```txt
React Chat UI
  components/fitness-agent/ChatBox.tsx
            ->
POST /api/agent
  app/api/agent/route.ts
            ->
Input validation
  validateRequest()
            ->
Agent Router
  lib/agents/router.ts
            ->
Selected Agent Config
  lib/agents/index.ts
            ->
Message Builder
  lib/agents/message-builder.ts
            ->
Groq Provider
  lib/ai/providers/groq.ts
            ->
Groq Model
  agent.model
            ->
API response { reply, agent }
            ->
Frontend renders reply
  components/fitness-agent/MessageBubble.tsx
```

## 18. Code quality review

### Issue:
Gemini is present but not actually integrated into the active multi-agent route.

File:
- `lib/ai/providers/gemini.ts`
- `app/api/agent/route.ts`

Why it matters:
The repo suggests multi-provider support, but the production route hardcodes Groq. That can confuse future maintainers or documentation consumers.

Recommended fix:
Either wire a provider selection layer into `app/api/agent/route.ts` or explicitly document Gemini as dormant scaffolding only.

### Issue:
The router uses simple substring matching, which can misroute ambiguous messages.

File:
- `lib/agents/router.ts`

Why it matters:
`message.includes(keyword)` is easy to implement, but it can produce false positives and does not understand context or word boundaries.

Recommended fix:
Move to token-aware matching, regex word boundaries, weighted scoring, or a small server-side intent classifier.

### Issue:
The `lint` script is not CI-ready because `next lint` opens an interactive setup prompt.

File:
- `package.json`

Why it matters:
Automated linting cannot run reliably in CI or scripted verification until ESLint is fully configured.

Recommended fix:
Add an actual ESLint configuration and migrate from deprecated `next lint` to direct ESLint CLI usage.

### Issue:
`ChatHistoryMessage` is broader than the API contract because it is derived from `ChatMessage`, which includes optional agent metadata.

File:
- `components/fitness-agent/types.ts`

Why it matters:
The UI currently maps only `role` and `content` before sending history, so runtime behavior is fine, but the type definition is looser than the backend contract.

Recommended fix:
Define `ChatHistoryMessage` explicitly as `{ role: "user" | "assistant"; content: string }`.

### Issue:
Shared constants are duplicated between frontend and backend.

File:
- `components/fitness-agent/ChatBox.tsx`
- `app/api/agent/route.ts`

Why it matters:
Both files define `MAX_MESSAGE_LENGTH = 2000`. If one changes and the other does not, frontend and backend validation drift apart.

Recommended fix:
Move shared limits into a small constants module used by both sides.

### Issue:
There are no automated tests for routing, message building, or API validation.

File:
- no test files found in the inspected project structure

Why it matters:
The multi-agent system has logic-heavy behavior in routing, sanitization, and safety flow, which is exactly the kind of code that benefits from tests.

Recommended fix:
Add focused unit tests for `selectAgent`, `buildAgentMessages`, and request validation in `app/api/agent/route.ts`.

### Issue:
`README.md` contains a stray trailing string at the end of the file.

File:
- `README.md`

Why it matters:
This does not break runtime behavior, but it makes the documentation look unfinished.

Recommended fix:
Remove the trailing `"# Fitness_Agent"` text from the end of the README.

## 19. Missing or unclear areas

I could not find:
- any automated test suite for the routing, validation, or provider flow
- any active Gemini completion path in the main API route
- any persistent chat storage or session restoration logic

This seems incomplete because:
- the architecture is modular enough to support tests and provider abstraction, but only Groq is actually live
- the repo includes a Gemini provider helper, but the main route does not use it
- the chat experience is currently client-memory only, so a page refresh resets the conversation

Recommended next step:
- add unit tests for agent routing and message building
- either complete a provider selection layer or keep Gemini out of the repo until it is needed
- decide whether chat history should remain ephemeral or be stored server-side

## 20. Final summary

This project is a Next.js App Router application that implements a multi-agent AI fitness and nutrition assistant. The frontend is a React chat interface, the backend is a server route that validates input and orchestrates the AI flow, and the agent system lives in `lib/agents`, where each specialist has its own persona, mission, prompt, rules, examples, and model settings.

The architecture is good because it separates concerns clearly:
- UI logic lives in `components/fitness-agent/`
- API orchestration lives in `app/api/agent/route.ts`
- agent selection lives in `lib/agents/router.ts`
- prompt construction lives in `lib/agents/message-builder.ts`
- provider integration lives in `lib/ai/providers/`

The strongest parts of the design are:
- server-controlled system prompts
- clear separation between specialist agents
- safety-first routing for risky topics
- provider error handling
- clean request/response flow

The next improvements should be:
- add tests
- improve router precision beyond substring matching
- decide whether Gemini should become a real selectable provider or stay out of the main path
- configure non-interactive linting for CI and deployment readiness

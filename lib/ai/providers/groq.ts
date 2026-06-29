import "server-only";

import Groq from "groq-sdk";
import type {
  AIChatCompletionInput,
  AIChatCompletionResult
} from "@/lib/ai/types";

const GROQ_TIMEOUT_MS = 20_000;
const MAX_COMPLETION_TOKENS = 900;

type GroqChatMessage = Groq.Chat.Completions.ChatCompletionMessageParam;

let groqClient: Groq | null = null;

export class AIProviderConfigurationError extends Error {}

export class AIProviderServiceError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
  }
}

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new AIProviderConfigurationError(
      "GROQ_API_KEY is missing. Add it to your .env.local file before using FitCoach AI."
    );
  }

  groqClient ??= new Groq({
    apiKey,
    timeout: GROQ_TIMEOUT_MS
  });

  return groqClient;
}

function extractReplyText(
  completion: Groq.Chat.Completions.ChatCompletion
): string {
  const reply = completion.choices[0]?.message?.content?.trim();

  if (!reply) {
    throw new AIProviderServiceError("The AI provider returned an empty response.");
  }

  return reply;
}

function mapGroqError(
  error: unknown
): AIProviderConfigurationError | AIProviderServiceError {
  if (
    error instanceof Groq.AuthenticationError ||
    error instanceof Groq.PermissionDeniedError
  ) {
    return new AIProviderConfigurationError(
      "Groq is not configured correctly on the server. Check GROQ_API_KEY."
    );
  }

  if (error instanceof Groq.RateLimitError) {
    return new AIProviderServiceError(
      "The AI coach is busy right now. Please try again shortly.",
      503
    );
  }

  if (
    error instanceof Groq.APIConnectionTimeoutError ||
    error instanceof Groq.APIConnectionError
  ) {
    return new AIProviderServiceError(
      "The AI coach could not reach Groq right now. Please try again in a moment.",
      503
    );
  }

  if (error instanceof Groq.APIError) {
    return new AIProviderServiceError(
      "The AI coach could not generate a response right now. Please try again in a moment."
    );
  }

  return new AIProviderServiceError(
    "Unable to reach the AI coach right now. Please try again shortly.",
    500
  );
}

export async function createGroqChatCompletion({
  agent,
  messages
}: AIChatCompletionInput): Promise<AIChatCompletionResult> {
  const client = getGroqClient();

  try {
    const completion = await client.chat.completions.create({
      model: agent.model,
      messages: messages satisfies GroqChatMessage[],
      temperature: agent.temperature,
      max_completion_tokens: MAX_COMPLETION_TOKENS
    });

    return {
      reply: extractReplyText(completion)
    };
  } catch (error) {
    if (
      error instanceof AIProviderConfigurationError ||
      error instanceof AIProviderServiceError
    ) {
      throw error;
    }

    throw mapGroqError(error);
  }
}

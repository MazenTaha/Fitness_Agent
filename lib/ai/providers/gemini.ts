import "server-only";

import { GoogleGenAI } from "@google/genai";

export class GeminiProviderUnavailableError extends Error {}
export class GeminiProviderConfigurationError extends Error {}

let geminiClient: GoogleGenAI | null = null;

export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiProviderConfigurationError(
      "GEMINI_API_KEY is missing. Gemini is not active for the multi-agent API."
    );
  }

  return apiKey;
}

export function getGeminiClient(): GoogleGenAI {
  geminiClient ??= new GoogleGenAI({
    apiKey: getGeminiApiKey()
  });

  return geminiClient;
}

export function assertGeminiProviderUnavailable(): never {
  throw new GeminiProviderUnavailableError(
    "Gemini is not configured for the active multi-agent API. The current provider is Groq."
  );
}

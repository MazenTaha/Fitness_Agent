import type { AgentConfig, ChatMessage } from "@/lib/agents/types";

export type AIChatCompletionInput = {
  agent: AgentConfig;
  messages: ChatMessage[];
};

export type AIChatCompletionResult = {
  reply: string;
};

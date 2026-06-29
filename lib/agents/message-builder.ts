import type {
  AgentConfig,
  ChatMessage,
  ClientHistoryMessage
} from "./types";
import { METRIC_UNITS_POLICY } from "./unit-policy";

type BuildAgentMessagesInput = {
  agent: AgentConfig;
  message: string;
  history?: unknown;
};

function isClientHistoryMessage(value: unknown): value is ClientHistoryMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const role = "role" in value ? value.role : undefined;
  const content = "content" in value ? value.content : undefined;

  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.trim().length > 0
  );
}

function sanitizeHistory(
  history: unknown,
  maxHistoryMessages: number
): ClientHistoryMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(isClientHistoryMessage)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim()
    }))
    .slice(-maxHistoryMessages);
}

export function buildAgentMessages({
  agent,
  message,
  history
}: BuildAgentMessagesInput): ChatMessage[] {
  const systemPrompt = [agent.systemPrompt, METRIC_UNITS_POLICY].join("\n\n");

  return [
    {
      role: "system",
      content: systemPrompt
    },
    ...sanitizeHistory(history, agent.maxHistoryMessages),
    {
      role: "user",
      content: message.trim()
    }
  ];
}

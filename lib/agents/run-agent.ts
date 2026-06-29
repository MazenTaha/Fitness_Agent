import "server-only";

import {
  AIProviderConfigurationError,
  AIProviderServiceError,
  createGroqChatCompletion
} from "@/lib/ai/providers/groq";
import { getAgent } from "@/lib/agents";
import { buildAgentMessages } from "@/lib/agents/message-builder";
import { selectAgent } from "@/lib/agents/router";
import type { ClientHistoryMessage } from "@/lib/agents/types";

export const MAX_AGENT_MESSAGE_LENGTH = 2000;

export class AgentInputValidationError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

export type RunAgentInput = {
  message: string;
  history?: ClientHistoryMessage[];
};

export type RunAgentResult = {
  reply: string;
  agent: {
    id: string;
    name: string;
  };
};

function normalizeMessage(message: string): string {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new AgentInputValidationError("Message cannot be empty.", 400);
  }

  if (normalizedMessage.length > MAX_AGENT_MESSAGE_LENGTH) {
    throw new AgentInputValidationError(
      `Message must be ${MAX_AGENT_MESSAGE_LENGTH} characters or fewer.`,
      413
    );
  }

  return normalizedMessage;
}

export async function runAgent({
  message,
  history
}: RunAgentInput): Promise<RunAgentResult> {
  const normalizedMessage = normalizeMessage(message);
  const agentId = selectAgent(normalizedMessage);
  const agent = getAgent(agentId);
  const messages = buildAgentMessages({
    agent,
    message: normalizedMessage,
    history
  });
  const { reply } = await createGroqChatCompletion({
    agent,
    messages
  });

  return {
    reply,
    agent: {
      id: agent.id,
      name: agent.name
    }
  };
}

export {
  AIProviderConfigurationError,
  AIProviderServiceError
} from "@/lib/ai/providers/groq";

import { NextResponse } from "next/server";
import {
  AIProviderConfigurationError,
  AIProviderServiceError,
  createGroqChatCompletion
} from "@/lib/ai/providers/groq";
import { getAgent } from "@/lib/agents";
import { buildAgentMessages } from "@/lib/agents/message-builder";
import { selectAgent } from "@/lib/agents/router";

const MAX_MESSAGE_LENGTH = 2000;

type AgentRequest = {
  message?: unknown;
  history?: unknown;
};

type ValidationSuccess = {
  success: true;
  message: string;
  history?: unknown;
};

type ValidationFailure = {
  success: false;
  error: string;
  status: number;
};

export const runtime = "nodejs";

function validateRequest(payload: AgentRequest): ValidationSuccess | ValidationFailure {
  if (!payload || typeof payload !== "object") {
    return {
      success: false,
      error: "Request body must be a JSON object.",
      status: 400
    };
  }

  if (typeof payload.message !== "string") {
    return {
      success: false,
      error: "Message is required.",
      status: 400
    };
  }

  const message = payload.message.trim();

  if (!message) {
    return {
      success: false,
      error: "Message cannot be empty.",
      status: 400
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      status: 413
    };
  }

  if (payload.history !== undefined && !Array.isArray(payload.history)) {
    return {
      success: false,
      error: "History must be an array when provided.",
      status: 400
    };
  }

  return {
    success: true,
    message,
    history: payload.history
  };
}

export async function POST(request: Request) {
  let payload: AgentRequest;

  try {
    payload = (await request.json()) as AgentRequest;
  } catch (error) {
    console.error("Invalid /api/agent JSON body", error);

    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const validation = validateRequest(payload);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status }
    );
  }

  const agentId = selectAgent(validation.message);
  const agent = getAgent(agentId);
  const messages = buildAgentMessages({
    agent,
    message: validation.message,
    history: validation.history
  });

  try {
    const { reply } = await createGroqChatCompletion({
      agent,
      messages
    });

    return NextResponse.json({
      reply,
      agent: {
        id: agent.id,
        name: agent.name
      }
    });
  } catch (error) {
    console.error("Agent API error", error);

    if (error instanceof AIProviderConfigurationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (error instanceof AIProviderServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "The AI coach is unavailable right now. Please try again shortly." },
      { status: 500 }
    );
  }
}

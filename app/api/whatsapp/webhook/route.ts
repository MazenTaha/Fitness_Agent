import { NextResponse } from "next/server";
import {
  AgentInputValidationError,
  runAgent
} from "@/lib/agents/run-agent";
import { getWhatsAppVerifyToken } from "@/lib/whatsapp/config";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/send-message";
import { splitWhatsAppMessage } from "@/lib/whatsapp/split-message";

const WHATSAPP_FALLBACK_REPLY =
  "Sorry, I had trouble generating a response. Please try again in a moment.";
const DEDUPE_TTL_MS = 10 * 60 * 1000;

type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        messages?: Array<{
          from?: string;
          id?: string;
          type?: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
};

type IncomingWhatsAppTextMessage = {
  from: string;
  messageId?: string;
  text: string;
};

const processedMessageIds = new Map<string, number>();

export const runtime = "nodejs";

function cleanupProcessedMessageIds(now: number) {
  for (const [messageId, timestamp] of processedMessageIds) {
    if (now - timestamp > DEDUPE_TTL_MS) {
      processedMessageIds.delete(messageId);
    }
  }
}

function markMessageAsProcessed(messageId?: string): boolean {
  if (!messageId) {
    return true;
  }

  const now = Date.now();
  cleanupProcessedMessageIds(now);

  if (processedMessageIds.has(messageId)) {
    return false;
  }

  processedMessageIds.set(messageId, now);
  return true;
}

function extractIncomingTextMessages(
  payload: WhatsAppWebhookPayload
): IncomingWhatsAppTextMessage[] {
  const messages: IncomingWhatsAppTextMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") {
        continue;
      }

      for (const message of change.value?.messages ?? []) {
        if (message.type !== "text") {
          continue;
        }

        const text = message.text?.body?.trim();
        const from = message.from?.trim();

        if (!from || !text) {
          continue;
        }

        messages.push({
          from,
          messageId: message.id?.trim(),
          text
        });
      }
    }
  }

  return messages;
}

async function replyToWhatsAppMessage({
  from,
  text
}: IncomingWhatsAppTextMessage): Promise<boolean> {
  let reply = WHATSAPP_FALLBACK_REPLY;

  try {
    const result = await runAgent({ message: text });
    reply = result.reply;
  } catch (error) {
    if (!(error instanceof AgentInputValidationError)) {
      console.error("WhatsApp agent execution failed", error);
    }
  }

  try {
    const replyChunks = splitWhatsAppMessage(reply);

    for (const chunk of replyChunks) {
      await sendWhatsAppTextMessage({
        to: from,
        text: chunk
      });
    }

    return true;
  } catch (error) {
    console.error("WhatsApp send failed", error);
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  try {
    const expectedVerifyToken = getWhatsAppVerifyToken();

    if (mode === "subscribe" && verifyToken === expectedVerifyToken && challenge) {
      return new Response(challenge, {
        status: 200,
        headers: {
          "Content-Type": "text/plain"
        }
      });
    }

    return NextResponse.json(
      { error: "Webhook verification failed." },
      { status: 403 }
    );
  } catch (error) {
    console.error("WhatsApp webhook verification error", error);

    return NextResponse.json(
      { error: "Webhook verification is not configured." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let payload: WhatsAppWebhookPayload;

  try {
    payload = (await request.json()) as WhatsAppWebhookPayload;
  } catch (error) {
    console.error("Invalid WhatsApp webhook JSON body", error);

    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const incomingMessages = extractIncomingTextMessages(payload);

  if (incomingMessages.length === 0) {
    return NextResponse.json({
      received: true,
      processed: 0
    });
  }

  let processedCount = 0;

  for (const message of incomingMessages) {
    if (!markMessageAsProcessed(message.messageId)) {
      continue;
    }

    const sent = await replyToWhatsAppMessage(message);

    if (sent) {
      processedCount += 1;
    }
  }

  return NextResponse.json({
    received: true,
    processed: processedCount
  });
}

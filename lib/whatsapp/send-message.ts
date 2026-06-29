import "server-only";

import { getWhatsAppConfig } from "@/lib/whatsapp/config";

const WHATSAPP_API_BASE_URL = "https://graph.facebook.com";
const WHATSAPP_API_VERSION = "v21.0";

export class WhatsAppSendMessageError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
  }
}

type WhatsAppApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export async function sendWhatsAppTextMessage({
  to,
  text
}: {
  to: string;
  text: string;
}): Promise<void> {
  const trimmedText = text.trim();

  if (!to.trim() || !trimmedText) {
    throw new WhatsAppSendMessageError(
      "Cannot send a WhatsApp message without both a recipient and text.",
      400
    );
  }

  const { accessToken, phoneNumberId } = getWhatsAppConfig();
  const endpoint = `${WHATSAPP_API_BASE_URL}/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.trim(),
        type: "text",
        text: {
          body: trimmedText
        }
      })
    });
  } catch (error) {
    throw new WhatsAppSendMessageError(
      "Unable to reach the WhatsApp Cloud API right now.",
      503
    );
  }

  if (response.ok) {
    return;
  }

  let errorPayload: WhatsAppApiErrorResponse | null = null;

  try {
    errorPayload = (await response.json()) as WhatsAppApiErrorResponse;
  } catch {
    errorPayload = null;
  }

  const providerMessage = errorPayload?.error?.message?.trim();

  throw new WhatsAppSendMessageError(
    providerMessage
      ? `WhatsApp Cloud API error: ${providerMessage}`
      : "WhatsApp Cloud API rejected the outgoing message.",
    response.status
  );
}

export { WhatsAppConfigurationError } from "@/lib/whatsapp/config";

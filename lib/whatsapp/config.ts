import "server-only";

type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
};

export class WhatsAppConfigurationError extends Error {}

function readRequiredEnv(name: "WHATSAPP_ACCESS_TOKEN" | "WHATSAPP_PHONE_NUMBER_ID" | "WHATSAPP_VERIFY_TOKEN"): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new WhatsAppConfigurationError(
      `${name} is missing. Add it to your .env.local file before using the WhatsApp webhook.`
    );
  }

  return value;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    accessToken: readRequiredEnv("WHATSAPP_ACCESS_TOKEN"),
    phoneNumberId: readRequiredEnv("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: readRequiredEnv("WHATSAPP_VERIFY_TOKEN")
  };
}

export function getWhatsAppVerifyToken(): string {
  return readRequiredEnv("WHATSAPP_VERIFY_TOKEN");
}

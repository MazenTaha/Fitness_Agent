# WhatsApp Setup

This project supports two channels that share the same FitCoach AI agent system:

- Website chat at `/fitness-agent`
- WhatsApp bot at `/api/whatsapp/webhook`

The WhatsApp integration uses the official WhatsApp Business Cloud API through Meta.

## Prerequisites

You need:

- a Meta developer account
- a Meta app with the WhatsApp product enabled
- the project running locally or deployed
- a Groq API key for the AI response path

## 1. Create or open your Meta developer account

1. Go to the Meta for Developers dashboard.
2. Sign in with your Meta account.
3. Create a developer account if you do not already have one.

## 2. Create a Meta app

1. In Meta for Developers, create a new app.
2. Choose an app type that supports WhatsApp.
3. Finish the app creation flow.

## 3. Add the WhatsApp product

1. Open your Meta app dashboard.
2. Add the WhatsApp product to the app.
3. Open the WhatsApp API Setup or Getting Started section.

This page gives you the initial test credentials and the test business phone setup.

## 4. Collect the required WhatsApp credentials

From the WhatsApp API Setup or Getting Started page, copy:

- Access Token
- Phone Number ID

You also need to create your own verify token value for webhook verification.

Example local env values:

```env
GROQ_API_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
```

Notes:

- Meta temporary access tokens expire, so they are fine for testing but not ideal for production.
- `WHATSAPP_VERIFY_TOKEN` is your own secret string. Meta does not generate it for you.

## 5. Add the env vars locally

Create or update your `.env.local` file with:

```env
GROQ_API_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
```

Do not use `NEXT_PUBLIC_` for these values.

## 6. Add your test recipient phone number

In the Meta WhatsApp setup screen:

1. Add a recipient phone number for testing.
2. Complete any verification Meta asks for.
3. Make sure the phone number can receive WhatsApp messages.

## 7. Run the app locally

Start the Next.js app:

```bash
npm run dev
```

The website chat should still work at:

```txt
http://localhost:3000/fitness-agent
```

## 8. Expose localhost with ngrok

Start ngrok:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL from ngrok.

Example:

```txt
https://YOUR_NGROK_DOMAIN
```

## 9. Configure the webhook in Meta

In the Meta app dashboard:

1. Open the WhatsApp webhook configuration section.
2. Set the callback URL to:

```txt
https://YOUR_NGROK_DOMAIN/api/whatsapp/webhook
```

3. Set the verify token to the same exact value as:

```env
WHATSAPP_VERIFY_TOKEN=
```

4. Save and verify the webhook.

If verification succeeds, Meta calls:

```txt
GET /api/whatsapp/webhook
```

and the app returns the `hub.challenge` value as plain text.

## 10. Subscribe to message events

After webhook verification:

1. Subscribe the app to WhatsApp message events.
2. Confirm that message delivery is enabled for the phone number you are testing with.

The current implementation supports text messages only.

## 11. Test the bot

Send a WhatsApp message to the test or business phone number.

Example messages:

- `How much protein should I eat if I weigh 82 kg?`
- `Create a beginner workout plan for muscle gain.`
- `My chest hurts during cardio.`

Expected flow:

1. Meta sends a webhook request to:
   `POST /api/whatsapp/webhook`
2. The backend extracts the sender and text message.
3. The backend calls `runAgent()`.
4. The existing multi-agent system generates the answer.
5. The backend sends the reply through the WhatsApp Cloud API.

## 12. Deploy to Vercel

In your Vercel project settings, add:

```env
GROQ_API_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
```

Deploy the app.

After deployment, configure the Meta webhook callback URL as:

```txt
https://YOUR_VERCEL_DOMAIN/api/whatsapp/webhook
```

Use the same verify token value that you stored in:

```env
WHATSAPP_VERIFY_TOKEN=
```

## 13. Routes that should work

After setup, these routes should remain available:

- `/fitness-agent`
- `/api/agent`
- `/api/fitness-agent`
- `/api/whatsapp/webhook`

## 14. Current limitations

- Only text messages are supported right now.
- No database-backed chat memory exists yet.
- Duplicate message protection is only in-memory for development convenience.
- Production duplicate protection should use a database or cache.
- Temporary Meta access tokens expire.
- Business-initiated WhatsApp messages may require approved templates outside the customer service window.
- The safety guard remains active for medical, injury, steroid, SARMs, eating disorder, and extreme dieting topics.

## 15. Troubleshooting

If webhook verification fails:

- make sure the callback URL is correct
- make sure ngrok is running
- make sure `WHATSAPP_VERIFY_TOKEN` exactly matches the token entered in Meta

If the bot does not reply:

- confirm `WHATSAPP_ACCESS_TOKEN` is valid
- confirm `WHATSAPP_PHONE_NUMBER_ID` is correct
- check the server logs for webhook parsing or send-message failures
- confirm the recipient phone number is approved for testing

If the AI provider fails:

- confirm `GROQ_API_KEY` is present
- check whether the provider is rate-limited or temporarily unavailable
- the WhatsApp bot will send a safe fallback response instead of exposing internal errors

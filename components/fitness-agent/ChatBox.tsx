"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import type { ChatHistoryMessage, ChatMessage } from "./types";

const WELCOME_MESSAGE =
  "Hi, I'm FitCoach AI. Ask me about workouts, nutrition, fat loss, muscle gain, exercise form, or meal planning.";

const MAX_MESSAGE_LENGTH = 2000;
const STARTER_QUESTIONS = [
  "Create a beginner workout plan for muscle gain",
  "How much protein should I eat?",
  "Give me a fat-loss meal plan",
  "Explain proper squat form",
  "How do I build muscle at home?"
];

function createMessage(
  role: ChatMessage["role"],
  content: string,
  agent?: ChatMessage["agent"]
): ChatMessage {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    content,
    agent
  };
}

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", WELCOME_MESSAGE)
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const remainingCharacters = MAX_MESSAGE_LENGTH - input.length;
  const history: ChatHistoryMessage[] = messages
    .slice(1)
    .map(({ role, content }) => ({
      role,
      content
    }));

  async function handleSubmit() {
    const message = input.trim();

    if (!message) {
      setError("Type a fitness or nutrition question before sending.");
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      setError(`Messages must stay under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    const userMessage = createMessage("user", message);
    const previousMessages = messages;
    const optimisticMessages = [...previousMessages, userMessage];

    setMessages(optimisticMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          history
        })
      });

      const data = (await response.json()) as {
        agent?: {
          id: string;
          name: string;
        };
        error?: string;
        reply?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Something went wrong while contacting FitCoach AI.");
      }

      setMessages([
        ...optimisticMessages,
        createMessage("assistant", data.reply, data.agent)
      ]);
    } catch (submissionError) {
      const messageText =
        submissionError instanceof Error
          ? submissionError.message
          : "Network error. Please check your connection and try again.";

      setMessages(previousMessages);
      setInput(message);
      setError(messageText);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!isLoading) {
        void handleSubmit();
      }
    }
  }

  function handleStarterQuestion(question: string) {
    setInput(question);
    setError(null);
  }

  return (
    <section className="flex min-h-[65vh] flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-[var(--surface)] shadow-soft backdrop-blur">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-slate-950">
              Chat with your coach
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ask for workout ideas, meal structure, macro targets, or form tips.
            </p>
          </div>
          <div className="hidden rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-slate-700 sm:inline-flex">
            Server-only Groq calls
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {messages.length === 1 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTER_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleStarterQuestion(question)}
                  disabled={isLoading}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}

          {isLoading ? (
            <div className="self-start rounded-[1.75rem] rounded-bl-md border border-white/70 bg-[var(--surface-strong)] px-4 py-3 text-sm text-slate-500">
              FitCoach AI is thinking...
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-white/70 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-4xl">
          <label className="sr-only" htmlFor="fitness-agent-input">
            Ask FitCoach AI
          </label>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
            <textarea
              id="fitness-agent-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Example: Build me a 4-day fat loss workout plan with dumbbells and a high-protein meal outline."
              className="min-h-[110px] w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              disabled={isLoading}
              maxLength={MAX_MESSAGE_LENGTH}
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1 text-xs text-slate-500">
                <p>Press Enter to send. Use Shift + Enter for a new line.</p>
                <p>{remainingCharacters} characters remaining.</p>
                {error ? <p className="font-medium text-red-600">{error}</p> : null}
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import clsx from "clsx";
import type { ChatMessage } from "./types";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <article
      className={clsx(
        "max-w-[88%] rounded-[1.75rem] px-4 py-3 shadow-sm sm:px-5",
        isAssistant
          ? "self-start rounded-bl-md border border-white/70 bg-[var(--surface-strong)] text-slate-800"
          : "self-end rounded-br-md bg-slate-950 text-white"
      )}
    >
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {isAssistant ? message.agent?.name ?? "FitCoach AI" : "You"}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-7 sm:text-[15px]">
        {message.content}
      </p>
      {isAssistant && message.agent ? (
        <p className="mt-3 text-xs font-medium text-slate-500">
          Answered by {message.agent.name}
        </p>
      ) : null}
    </article>
  );
}

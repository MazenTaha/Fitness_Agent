export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  agent?: {
    id: string;
    name: string;
  };
};

export type ChatHistoryMessage = Omit<ChatMessage, "id">;

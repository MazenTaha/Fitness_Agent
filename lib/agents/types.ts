export type AgentId =
  | "fitness-coach"
  | "nutrition-coach"
  | "workout-planner"
  | "exercise-form-coach"
  | "safety-guard";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ClientHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentConfig = {
  id: AgentId;
  name: string;
  description: string;
  mission: string;
  systemPrompt: string;
  safetyRules: string[];
  responseStyle: string[];
  exampleQuestions: string[];
  model: string;
  temperature: number;
  maxHistoryMessages: number;
};

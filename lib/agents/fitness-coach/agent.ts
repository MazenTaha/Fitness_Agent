import type { AgentConfig } from "@/lib/agents/types";
import { DEFAULT_AGENT_MODEL } from "@/lib/agents/model";
import { fitnessCoachExampleQuestions } from "./examples";
import { fitnessCoachPrompt } from "./prompt";
import {
  fitnessCoachResponseStyle,
  fitnessCoachSafetyRules
} from "./rules";

export const fitnessCoachAgent: AgentConfig = {
  id: "fitness-coach",
  name: "FitCoach AI",
  description:
    "A professional, friendly, practical fitness coach for training, strength, muscle building, fat loss, cardio, recovery, and healthy habits.",
  mission:
    "General gym, fitness, strength, muscle building, fat loss, cardio, recovery, and healthy habits.",
  systemPrompt: fitnessCoachPrompt,
  safetyRules: fitnessCoachSafetyRules,
  responseStyle: fitnessCoachResponseStyle,
  exampleQuestions: fitnessCoachExampleQuestions,
  model: DEFAULT_AGENT_MODEL,
  temperature: 0.5,
  maxHistoryMessages: 10
};

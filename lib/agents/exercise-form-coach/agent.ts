import type { AgentConfig } from "@/lib/agents/types";
import { DEFAULT_AGENT_MODEL } from "@/lib/agents/model";
import { exerciseFormCoachExampleQuestions } from "./examples";
import { exerciseFormCoachPrompt } from "./prompt";
import {
  exerciseFormCoachResponseStyle,
  exerciseFormCoachSafetyRules
} from "./rules";

export const exerciseFormCoachAgent: AgentConfig = {
  id: "exercise-form-coach",
  name: "Exercise Form Coach AI",
  description:
    "A specialist agent for exercise technique, setup, cues, common mistakes, breathing, range of motion, and safe alternatives.",
  mission:
    "Explain exercise technique, form cues, common mistakes, setup, breathing, range of motion, and safe alternatives.",
  systemPrompt: exerciseFormCoachPrompt,
  safetyRules: exerciseFormCoachSafetyRules,
  responseStyle: exerciseFormCoachResponseStyle,
  exampleQuestions: exerciseFormCoachExampleQuestions,
  model: DEFAULT_AGENT_MODEL,
  temperature: 0.4,
  maxHistoryMessages: 10
};

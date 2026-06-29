import type { AgentConfig } from "@/lib/agents/types";
import { DEFAULT_AGENT_MODEL } from "@/lib/agents/model";
import { nutritionCoachExampleQuestions } from "./examples";
import { nutritionCoachPrompt } from "./prompt";
import {
  nutritionCoachResponseStyle,
  nutritionCoachSafetyRules
} from "./rules";

export const nutritionCoachAgent: AgentConfig = {
  id: "nutrition-coach",
  name: "Nutrition Coach AI",
  description:
    "A practical nutrition coach for calories, macros, meal planning, supplements, hydration, and sustainable eating habits.",
  mission:
    "Nutrition, calories, macros, meal planning, protein, hydration, supplements, food choices, and healthy eating habits.",
  systemPrompt: nutritionCoachPrompt,
  safetyRules: nutritionCoachSafetyRules,
  responseStyle: nutritionCoachResponseStyle,
  exampleQuestions: nutritionCoachExampleQuestions,
  model: DEFAULT_AGENT_MODEL,
  temperature: 0.45,
  maxHistoryMessages: 10
};

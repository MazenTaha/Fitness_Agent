import type { AgentConfig } from "@/lib/agents/types";
import { DEFAULT_AGENT_MODEL } from "@/lib/agents/model";
import { safetyGuardExampleQuestions } from "./examples";
import { safetyGuardPrompt } from "./prompt";
import {
  safetyGuardResponseStyle,
  safetyGuardSafetyRules
} from "./rules";

export const safetyGuardAgent: AgentConfig = {
  id: "safety-guard",
  name: "Safety Guard AI",
  description:
    "A safety-focused agent for medical, injury, eating disorder, steroid, extreme dieting, and unsafe training questions.",
  mission:
    "Handle risky medical, injury, eating disorder, steroid, extreme dieting, and unsafe training questions.",
  systemPrompt: safetyGuardPrompt,
  safetyRules: safetyGuardSafetyRules,
  responseStyle: safetyGuardResponseStyle,
  exampleQuestions: safetyGuardExampleQuestions,
  model: DEFAULT_AGENT_MODEL,
  temperature: 0.25,
  maxHistoryMessages: 10
};

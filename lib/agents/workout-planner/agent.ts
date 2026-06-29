import type { AgentConfig } from "@/lib/agents/types";
import { DEFAULT_AGENT_MODEL } from "@/lib/agents/model";
import { workoutPlannerExampleQuestions } from "./examples";
import { workoutPlannerPrompt } from "./prompt";
import {
  workoutPlannerResponseStyle,
  workoutPlannerSafetyRules
} from "./rules";

export const workoutPlannerAgent: AgentConfig = {
  id: "workout-planner",
  name: "Workout Planner AI",
  description:
    "A specialist agent for structured workout plans, weekly splits, home workouts, gym routines, and progression plans.",
  mission:
    "Create structured workout plans, weekly splits, home workouts, gym routines, progression plans, and beginner/intermediate/advanced programs.",
  systemPrompt: workoutPlannerPrompt,
  safetyRules: workoutPlannerSafetyRules,
  responseStyle: workoutPlannerResponseStyle,
  exampleQuestions: workoutPlannerExampleQuestions,
  model: DEFAULT_AGENT_MODEL,
  temperature: 0.45,
  maxHistoryMessages: 10
};

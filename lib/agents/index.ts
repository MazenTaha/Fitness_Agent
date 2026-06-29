import { exerciseFormCoachAgent } from "./exercise-form-coach/agent";
import { fitnessCoachAgent } from "./fitness-coach/agent";
import { nutritionCoachAgent } from "./nutrition-coach/agent";
import { safetyGuardAgent } from "./safety-guard/agent";
import type { AgentConfig, AgentId } from "./types";
import { workoutPlannerAgent } from "./workout-planner/agent";

export const agents: Record<AgentId, AgentConfig> = {
  "fitness-coach": fitnessCoachAgent,
  "nutrition-coach": nutritionCoachAgent,
  "workout-planner": workoutPlannerAgent,
  "exercise-form-coach": exerciseFormCoachAgent,
  "safety-guard": safetyGuardAgent
};

export function getAgent(agentId: AgentId): AgentConfig {
  return agents[agentId] ?? agents["fitness-coach"];
}

export {
  exerciseFormCoachAgent,
  fitnessCoachAgent,
  nutritionCoachAgent,
  safetyGuardAgent,
  workoutPlannerAgent
};

export type { AgentConfig, AgentId } from "./types";

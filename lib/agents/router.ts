import type { AgentId } from "./types";

const safetyKeywords = [
  "pain",
  "injury",
  "hurt",
  "injured",
  "chest pain",
  "dizzy",
  "dizziness",
  "faint",
  "fainting",
  "pregnant",
  "pregnancy",
  "diabetes",
  "heart",
  "medication",
  "surgery",
  "eating disorder",
  "anorexia",
  "bulimia",
  "purge",
  "purging",
  "steroids",
  "steroid cycle",
  "sarms",
  "clenbuterol",
  "dehydration",
  "starve",
  "starvation",
  "extreme weight loss"
];

const nutritionKeywords = [
  "calories",
  "calorie",
  "protein",
  "carbs",
  "carbohydrates",
  "fat",
  "fats",
  "macros",
  "meal",
  "meals",
  "diet",
  "nutrition",
  "food",
  "foods",
  "supplement",
  "supplements",
  "creatine",
  "whey",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "cut",
  "bulk"
];

const exerciseFormKeywords = [
  "form",
  "technique",
  "posture",
  "squat",
  "deadlift",
  "bench press",
  "overhead press",
  "shoulder press",
  "pull up",
  "pull-up",
  "push up",
  "push-up",
  "row",
  "lunge",
  "romanian deadlift",
  "rdl",
  "hip thrust"
];

const workoutPlannerKeywords = [
  "plan",
  "program",
  "routine",
  "split",
  "schedule",
  "workout plan",
  "ppl",
  "push pull legs",
  "upper lower",
  "full body",
  "home workout",
  "gym routine",
  "training plan"
];

function includesKeyword(message: string, keywords: string[]): boolean {
  return keywords.some((keyword) => message.includes(keyword));
}

export function selectAgent(message: string): AgentId {
  const normalizedMessage = message.toLowerCase();

  if (includesKeyword(normalizedMessage, safetyKeywords)) {
    return "safety-guard";
  }

  if (includesKeyword(normalizedMessage, nutritionKeywords)) {
    return "nutrition-coach";
  }

  if (includesKeyword(normalizedMessage, exerciseFormKeywords)) {
    return "exercise-form-coach";
  }

  if (includesKeyword(normalizedMessage, workoutPlannerKeywords)) {
    return "workout-planner";
  }

  return "fitness-coach";
}

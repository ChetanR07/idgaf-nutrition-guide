import type { UserProfile } from "@/lib/onboarding-store";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // litres
}

export interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const emptyTotals = (): Totals => ({ calories: 0, protein: 0, carbs: 0, fat: 0 });

const ACTIVITY_FACTOR: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
};

const round = (n: number, step = 1) => Math.round(n / step) * step;

function ageFrom(dob: string): number {
  if (!dob) return 28;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 28;
  const diff = Date.now() - d.getTime();
  const age = diff / (365.25 * 24 * 3600 * 1000);
  return age > 12 && age < 100 ? Math.floor(age) : 28;
}

function weightKg(profile: UserProfile): number {
  const w = profile.currentWeight ?? 70;
  return profile.weightUnit === "lb" ? w * 0.4536 : w;
}

function heightCm(profile: UserProfile): number {
  const h = profile.height ?? 170;
  return profile.heightUnit === "ftin" ? h * 2.54 : h;
}

/** Personalized daily targets derived from the onboarding profile. */
export function computeTargets(profile: UserProfile): MacroTargets {
  const kg = weightKg(profile);
  const cm = heightCm(profile);
  const age = ageFrom(profile.dateOfBirth);
  const sexOffset = profile.gender === "female" ? -161 : profile.gender === "male" ? 5 : -78;

  const bmr = 10 * kg + 6.25 * cm - 5 * age + sexOffset;
  const tdee = bmr * (ACTIVITY_FACTOR[profile.activityLevel ?? "moderate"] ?? 1.55);

  let calories = tdee;
  let proteinPerKg = 1.6;
  let fatPct = 0.28;

  switch (profile.primaryGoal) {
    case "lose_weight":
      calories = tdee - 450;
      proteinPerKg = 1.9;
      break;
    case "gain_weight":
      calories = tdee + 400;
      proteinPerKg = 1.7;
      break;
    case "build_muscle":
      calories = tdee + 300;
      proteinPerKg = 2.0;
      fatPct = 0.25;
      break;
    default:
      calories = tdee;
  }

  calories = Math.min(Math.max(calories, 1300), 4200);
  const protein = Math.min(round(proteinPerKg * kg, 5), round((calories * 0.4) / 4, 5));
  const fat = round((calories * fatPct) / 9, 5);
  const carbs = round(Math.max((calories - protein * 4 - fat * 9) / 4, 60), 5);
  const water = Math.round(Math.min(Math.max(kg * 0.033, 1.8), 4) * 10) / 10;

  return { calories: round(calories, 10), protein, carbs, fat, water };
}

export const GOAL_LABEL: Record<string, string> = {
  lose_weight: "Lose weight",
  gain_weight: "Gain weight",
  build_muscle: "Build muscle",
  maintain_weight: "Maintain weight",
  improve_health: "Improve overall health",
  improve_habits: "Improve eating habits",
  other: "Personal goal",
};

export function greeting(name: string, hour = new Date().getHours()) {
  const first = name.trim().split(" ")[0] || "there";
  if (hour < 12) return { title: `Good morning, ${first}`, sub: "Ready to start strong?" };
  if (hour < 17) return { title: `Good afternoon, ${first}`, sub: "How's the day going?" };
  return { title: `Good evening, ${first}`, sub: "Let's see how you did today." };
}

export function nextMealSlot(hour = new Date().getHours()) {
  if (hour < 10) return "Breakfast";
  if (hour < 15) return "Lunch";
  if (hour < 18) return "Snack";
  return "Dinner";
}

export const pct = (value: number, target: number) =>
  target <= 0 ? 0 : Math.min(Math.round((value / target) * 100), 100);

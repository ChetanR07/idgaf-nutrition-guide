import type { UserProfile, Diet } from "@/lib/onboarding-store";
import type { MacroTargets, Totals } from "@/lib/nutrition";

export interface MealSuggestion {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  diets: Diet[];
  profile: "high_protein" | "light" | "balanced";
  allergens: string[];
}

const MEALS: MealSuggestion[] = [
  {
    id: "paneer-tikka",
    name: "Paneer tikka + 2 rotis + salad",
    emoji: "🧆",
    calories: 520,
    protein: 32,
    carbs: 55,
    fat: 18,
    tags: ["High protein", "Vegetarian"],
    diets: ["vegetarian", "eggetarian", "no_preference"],
    profile: "high_protein",
    allergens: ["dairy", "gluten"],
  },
  {
    id: "grilled-chicken",
    name: "Grilled chicken + rice + greens",
    emoji: "🍗",
    calories: 610,
    protein: 48,
    carbs: 62,
    fat: 16,
    tags: ["High protein", "Lean"],
    diets: ["non_vegetarian", "no_preference"],
    profile: "high_protein",
    allergens: [],
  },
  {
    id: "tofu-bowl",
    name: "Tofu stir-fry bowl + brown rice",
    emoji: "🥡",
    calories: 480,
    protein: 28,
    carbs: 58,
    fat: 14,
    tags: ["Plant protein", "Fibre"],
    diets: ["vegan", "vegetarian", "no_preference"],
    profile: "high_protein",
    allergens: ["soy"],
  },
  {
    id: "grilled-fish",
    name: "Grilled fish + quinoa + veggies",
    emoji: "🐟",
    calories: 540,
    protein: 42,
    carbs: 48,
    fat: 18,
    tags: ["Omega-3", "High protein"],
    diets: ["pescatarian", "non_vegetarian", "no_preference"],
    profile: "high_protein",
    allergens: ["fish"],
  },
  {
    id: "khichdi",
    name: "Moong dal khichdi + curd",
    emoji: "🍲",
    calories: 420,
    protein: 20,
    carbs: 62,
    fat: 9,
    tags: ["Light", "Easy on the gut"],
    diets: ["vegetarian", "eggetarian", "no_preference"],
    profile: "light",
    allergens: ["dairy"],
  },
  {
    id: "veg-soup",
    name: "Veg soup + chickpea salad",
    emoji: "🥗",
    calories: 340,
    protein: 18,
    carbs: 40,
    fat: 10,
    tags: ["Light", "Fibre-rich"],
    diets: ["vegan", "vegetarian", "eggetarian", "no_preference"],
    profile: "light",
    allergens: [],
  },
  {
    id: "egg-bowl",
    name: "Egg bhurji + multigrain toast",
    emoji: "🍳",
    calories: 450,
    protein: 30,
    carbs: 38,
    fat: 20,
    tags: ["Quick", "High protein"],
    diets: ["eggetarian", "non_vegetarian", "no_preference"],
    profile: "balanced",
    allergens: ["eggs", "gluten"],
  },
  {
    id: "rajma-rice",
    name: "Rajma + rice + cucumber salad",
    emoji: "🍛",
    calories: 560,
    protein: 22,
    carbs: 88,
    fat: 10,
    tags: ["Balanced", "Comfort"],
    diets: ["vegan", "vegetarian", "eggetarian", "no_preference"],
    profile: "balanced",
    allergens: [],
  },
];

function allowed(meal: MealSuggestion, profile: UserProfile) {
  const diet = profile.dietPreference ?? "no_preference";
  if (!meal.diets.includes(diet)) return false;
  const blocked = [...profile.allergies, profile.allergyOther]
    .filter(Boolean)
    .map((a) => a.toLowerCase());
  if (meal.allergens.some((a) => blocked.some((b) => b.includes(a) || a.includes(b)))) return false;
  const excluded = profile.excludedFoods.map((f) => f.toLowerCase()).filter(Boolean);
  if (excluded.some((f) => meal.name.toLowerCase().includes(f))) return false;
  return true;
}

export interface Recommendation {
  slot: string;
  reason: string;
  meal: MealSuggestion;
}

/** Profile + today's intake + remaining targets -> a single actionable suggestion. */
export function recommendMeal(
  profile: UserProfile,
  totals: Totals,
  targets: MacroTargets,
  slot: string,
): Recommendation {
  const remaining = {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    carbs: targets.carbs - totals.carbs,
    fat: targets.fat - totals.fat,
  };

  const proteinShort = remaining.protein > targets.protein * 0.3;
  const caloriesTight = remaining.calories < targets.calories * 0.22;

  let wanted: MealSuggestion["profile"] = "balanced";
  let reason = "You're tracking well. Keep this one balanced.";
  if (caloriesTight) {
    wanted = "light";
    reason = `Only ~${Math.max(Math.round(remaining.calories), 0)} kcal left, so keep it light.`;
  } else if (proteinShort) {
    wanted = "high_protein";
    reason = `You're ${Math.round(remaining.protein)}g short on protein today.`;
  }

  const pool = MEALS.filter((m) => allowed(m, profile));
  const candidates = pool.filter((m) => m.profile === wanted);
  const list = (candidates.length ? candidates : pool.length ? pool : MEALS).slice();
  const best = list.sort(
    (a, b) => Math.abs(a.calories - Math.max(remaining.calories, 300)) - Math.abs(b.calories - Math.max(remaining.calories, 300)),
  )[0]!;

  return { slot, reason, meal: best };
}

export function mealOptions(profile: UserProfile): MealSuggestion[] {
  const pool = MEALS.filter((m) => allowed(m, profile));
  return pool.length ? pool : MEALS;
}

/** IDGAF's daily read on the data — interpretation, not just numbers. */
export function dailyInsight(totals: Totals, targets: MacroTargets, mealCount: number) {
  if (mealCount === 0) {
    return {
      headline: "I can't analyze air.",
      body: "Tell me what you ate and I'll do the maths, the macros and the nagging.",
      why: "No meals logged yet, so there's nothing to read into.",
    };
  }
  const proteinPct = totals.protein / targets.protein;
  const caloriePct = totals.calories / targets.calories;

  if (caloriePct > 1.08) {
    return {
      headline: "You're above today's target.",
      body: "One day doesn't define your progress. Keep the next meal light and move a little.",
      why: `You're at ${Math.round(totals.calories)} kcal against a ${targets.calories} kcal target.`,
    };
  }
  if (proteinPct < 0.6) {
    return {
      headline: "Protein's looking a little weak today.",
      body: "Add a protein anchor to your next meal — paneer, eggs, chicken, tofu, dal. Carbs are fine.",
      why: `${Math.round(totals.protein)}g of ${targets.protein}g protein so far.`,
    };
  }
  if (caloriePct > 0.85) {
    return {
      headline: "You're all but set for today.",
      body: "Macros are close to target. A light dinner or a snack finishes this cleanly.",
      why: `${Math.round(totals.calories)} of ${targets.calories} kcal, protein at ${Math.round(proteinPct * 100)}%.`,
    };
  }
  return {
    headline: "Solid day so far.",
    body: "You've got room left. Use it on something with protein and fibre, not just carbs.",
    why: `${Math.round(targets.calories - totals.calories)} kcal and ${Math.round(targets.protein - totals.protein)}g protein still available.`,
  };
}

/** Contextual mascot line based on real state. */
export function mascotLine(opts: {
  hour: number;
  mealCount: number;
  totals: Totals;
  targets: MacroTargets;
  streak: number;
}) {
  const { hour, mealCount, totals, targets, streak } = opts;
  if (mealCount === 0) {
    return hour < 12 ? "Morning. What are we eating today?" : "You haven't told me what you ate today.";
  }
  if (targets.protein - totals.protein > targets.protein * 0.35) {
    return `You're ${Math.round(targets.protein - totals.protein)}g short on protein. Want some ideas?`;
  }
  if (streak >= 7) return `${streak} days in a row. Don't mess it up now.`;
  if (totals.calories / targets.calories > 0.8) return "Look at you. Actually sticking to the plan.";
  return "Not bad so far. Keep the next meal honest.";
}

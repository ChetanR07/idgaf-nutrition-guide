import { computeTargets, type MacroTargets } from "@/lib/nutrition";
import type { AppSettings } from "@/lib/food-store";
import type { UserProfile } from "@/lib/onboarding-store";

/** Computed targets with any user overrides from Settings applied. */
export function resolveTargets(profile: UserProfile, settings: AppSettings): MacroTargets {
  const base = computeTargets(profile);
  const o = settings.targetOverrides;
  return {
    calories: o.calories ?? base.calories,
    protein: o.protein ?? base.protein,
    carbs: o.carbs ?? base.carbs,
    fat: o.fat ?? base.fat,
    fiber: o.fiber ?? base.fiber,
    water: base.water,
  };
}

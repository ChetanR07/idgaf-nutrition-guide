import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Gender = "male" | "female" | "other" | "undisclosed";
export type Goal =
  | "lose_weight"
  | "gain_weight"
  | "build_muscle"
  | "maintain_weight"
  | "improve_health"
  | "improve_habits"
  | "other";
export type Commitment = "exploring" | "somewhat" | "very_important" | "serious";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extreme";
export type Diet =
  | "vegan"
  | "vegetarian"
  | "eggetarian"
  | "non_vegetarian"
  | "pescatarian"
  | "no_preference";
export type MealsPerDay = "1-2" | "3" | "4" | "5+";
export type SnackFrequency = "rarely" | "once" | "2-3" | "frequently";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender | null;
  primaryGoal: Goal | null;
  goalCommitment: Commitment | null;
  height: number | null;
  heightUnit: "cm" | "ftin";
  currentWeight: number | null;
  weightUnit: "kg" | "lb";
  targetWeight: number | null;
  activityLevel: ActivityLevel | null;
  dietPreference: Diet | null;
  excludedFoods: string[];
  allergies: string[];
  allergyOther: string;
  mealsPerDay: MealsPerDay | null;
  snackFrequency: SnackFrequency | null;
  onboardingComplete: boolean;
  created_at: string;
  updated_at: string;
}

export const emptyProfile = (): UserProfile => ({
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: null,
  primaryGoal: null,
  goalCommitment: null,
  height: null,
  heightUnit: "cm",
  currentWeight: null,
  weightUnit: "kg",
  targetWeight: null,
  activityLevel: null,
  dietPreference: null,
  excludedFoods: [],
  allergies: [],
  allergyOther: "",
  mealsPerDay: null,
  snackFrequency: null,
  onboardingComplete: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const STORAGE_KEY = "idgaf.profile.v1";

interface Ctx {
  profile: UserProfile;
  update: (patch: Partial<UserProfile>) => void;
  reset: () => void;
  hydrated: boolean;
}

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...emptyProfile(), ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* storage unavailable */
    }
  }, [profile, hydrated]);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfile((p) => ({ ...p, ...patch, updated_at: new Date().toISOString() }));
  }, []);

  const reset = useCallback(() => setProfile(emptyProfile()), []);

  const value = useMemo(() => ({ profile, update, reset, hydrated }), [profile, update, reset, hydrated]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}

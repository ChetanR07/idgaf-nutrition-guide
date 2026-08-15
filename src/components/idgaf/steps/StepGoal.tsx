import { Activity, Apple, Dumbbell, HeartPulse, Scale, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

import { OnboardingLayout, SelectCard } from "@/components/idgaf/OnboardingUI";
import { useOnboarding, type Goal } from "@/lib/onboarding-store";

const GOALS: { value: Goal; title: string; description: string; icon: React.ReactNode }[] = [
  { value: "lose_weight", title: "Lose weight", description: "Steady fat loss. No crash diets.", icon: <TrendingDown className="h-5 w-5" /> },
  { value: "gain_weight", title: "Gain weight", description: "Add weight in a healthy way.", icon: <TrendingUp className="h-5 w-5" /> },
  { value: "build_muscle", title: "Build muscle", description: "Enough protein, enough fuel.", icon: <Dumbbell className="h-5 w-5" /> },
  { value: "maintain_weight", title: "Maintain weight", description: "Stay where you are, eat better.", icon: <Scale className="h-5 w-5" /> },
  { value: "improve_health", title: "Improve overall health", description: "Feel better day to day.", icon: <HeartPulse className="h-5 w-5" /> },
  { value: "improve_habits", title: "Improve eating habits", description: "Fix the routine, not just the meal.", icon: <Apple className="h-5 w-5" /> },
  { value: "other", title: "Something else", description: "You'll tell us as we go.", icon: <Sparkles className="h-5 w-5" /> },
];

export function StepGoal({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  return (
    <OnboardingLayout
      step={2}
      title="What are you trying to achieve?"
      subtitle="Pick the goal that matters most to you right now."
      onBack={onBack}
      error={error}
      onContinue={() => (profile.primaryGoal ? onNext() : setError("Choose one goal to continue."))}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {GOALS.map((g) => (
          <SelectCard
            key={g.value}
            icon={g.icon}
            title={g.title}
            description={g.description}
            selected={profile.primaryGoal === g.value}
            onClick={() => {
              update({ primaryGoal: g.value });
              setError(null);
            }}
          />
        ))}
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3.5 w-3.5" /> You can change this later, your plan adapts with you.
      </p>
    </OnboardingLayout>
  );
}

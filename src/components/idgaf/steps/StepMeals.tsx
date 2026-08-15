import { useState } from "react";

import { Chip, OnboardingLayout, SelectCard } from "@/components/idgaf/OnboardingUI";
import { useOnboarding, type MealsPerDay, type SnackFrequency } from "@/lib/onboarding-store";

const MEALS: { value: MealsPerDay; title: string; description: string }[] = [
  { value: "1-2", title: "1–2 meals", description: "Fewer, larger meals." },
  { value: "3", title: "3 meals", description: "The classic routine." },
  { value: "4", title: "4 meals", description: "An extra meal keeps you steady." },
  { value: "5+", title: "5+ meals", description: "Smaller meals through the day." },
];

const SNACKS: { value: SnackFrequency; label: string }[] = [
  { value: "rarely", label: "Rarely" },
  { value: "once", label: "Once a day" },
  { value: "2-3", label: "2–3 times a day" },
  { value: "frequently", label: "Frequently" },
];

export function StepMeals({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  return (
    <OnboardingLayout
      step={8}
      title="How many meals do you usually eat?"
      subtitle="We'll use this to make your recommendations fit your routine."
      onBack={onBack}
      error={error}
      continueLabel="Finish"
      onContinue={() => (profile.mealsPerDay ? onNext() : setError("Pick how many meals you usually eat."))}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {MEALS.map((m) => (
          <SelectCard
            key={m.value}
            title={m.title}
            description={m.description}
            selected={profile.mealsPerDay === m.value}
            onClick={() => {
              update({ mealsPerDay: m.value });
              setError(null);
            }}
          />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-bold">How often do you snack?</h2>
        <p className="mt-1 text-xs text-muted-foreground">Optional — but it helps.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SNACKS.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              selected={profile.snackFrequency === s.value}
              onClick={() =>
                update({ snackFrequency: profile.snackFrequency === s.value ? null : s.value })
              }
            />
          ))}
        </div>
      </div>
    </OnboardingLayout>
  );
}

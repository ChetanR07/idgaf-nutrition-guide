import { Beef, Carrot, Egg, Fish, Leaf, Plus, Utensils } from "lucide-react";
import { useState } from "react";

import { Chip, OnboardingLayout, SelectCard } from "@/components/idgaf/OnboardingUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding, type Diet } from "@/lib/onboarding-store";

const DIETS: { value: Diet; title: string; icon: React.ReactNode }[] = [
  { value: "vegan", title: "Vegan", icon: <Leaf className="h-5 w-5" /> },
  { value: "vegetarian", title: "Vegetarian", icon: <Carrot className="h-5 w-5" /> },
  { value: "eggetarian", title: "Eggetarian", icon: <Egg className="h-5 w-5" /> },
  { value: "non_vegetarian", title: "Non-vegetarian", icon: <Beef className="h-5 w-5" /> },
  { value: "pescatarian", title: "Pescatarian", icon: <Fish className="h-5 w-5" /> },
  { value: "no_preference", title: "No specific preference", icon: <Utensils className="h-5 w-5" /> },
];

const COMMON_EXCLUSIONS = ["Dairy", "Eggs", "Chicken", "Fish", "Seafood", "Nuts", "Gluten", "Spicy food"];

export function StepFood({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  const toggleFood = (food: string) => {
    const has = profile.excludedFoods.includes(food);
    update({
      excludedFoods: has
        ? profile.excludedFoods.filter((f) => f !== food)
        : [...profile.excludedFoods, food],
    });
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v || profile.excludedFoods.includes(v)) return setCustom("");
    update({ excludedFoods: [...profile.excludedFoods, v] });
    setCustom("");
  };

  const customFoods = profile.excludedFoods.filter((f) => !COMMON_EXCLUSIONS.includes(f));

  return (
    <OnboardingLayout
      step={6}
      title="What's your relationship with food?"
      subtitle="Tell us what kind of diet works for you."
      onBack={onBack}
      error={error}
      onContinue={() => (profile.dietPreference ? onNext() : setError("Pick one diet type to continue."))}
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {DIETS.map((d) => (
          <SelectCard
            key={d.value}
            icon={d.icon}
            title={d.title}
            selected={profile.dietPreference === d.value}
            onClick={() => {
              update({ dietPreference: d.value });
              setError(null);
            }}
          />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-bold">Any foods you absolutely don't eat?</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional. This is about preference — allergies come next, and we handle them separately.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {COMMON_EXCLUSIONS.map((f) => (
            <Chip
              key={f}
              label={f}
              selected={profile.excludedFoods.includes(f)}
              onClick={() => toggleFood(f)}
            />
          ))}
          {customFoods.map((f) => (
            <Chip key={f} label={f} selected onClick={() => toggleFood(f)} />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add your own"
            className="h-11 rounded-xl"
          />
          <Button type="button" variant="outline" onClick={addCustom} className="h-11 rounded-xl px-4">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

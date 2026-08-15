import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Chip, OnboardingLayout, SelectCard } from "@/components/idgaf/OnboardingUI";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/lib/onboarding-store";

const ALLERGIES = [
  "Peanuts",
  "Tree nuts",
  "Milk / Dairy",
  "Eggs",
  "Fish",
  "Shellfish",
  "Soy",
  "Wheat / Gluten",
  "Other",
];

const NONE = "None";

export function StepAllergies({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  const none = profile.allergies.includes(NONE);

  const toggle = (a: string) => {
    setError(null);
    if (none) {
      update({ allergies: [a] });
      return;
    }
    update({
      allergies: profile.allergies.includes(a)
        ? profile.allergies.filter((x) => x !== a)
        : [...profile.allergies, a],
    });
  };

  const handleContinue = () => {
    if (profile.allergies.length === 0)
      return setError("Select your allergies, or tell us you don't have any.");
    if (profile.allergies.includes("Other") && !profile.allergyOther.trim())
      return setError("Tell us which other allergy you have.");
    onNext();
  };

  return (
    <OnboardingLayout
      step={7}
      title="Any allergies we should know about?"
      subtitle="We'll use this information to avoid recommending foods that may be unsafe for you."
      onBack={onBack}
      error={error}
      onContinue={handleContinue}
    >
      <div className="flex flex-wrap gap-2">
        {ALLERGIES.map((a) => (
          <Chip key={a} label={a} selected={!none && profile.allergies.includes(a)} onClick={() => toggle(a)} />
        ))}
      </div>

      {!none && profile.allergies.includes("Other") ? (
        <Input
          value={profile.allergyOther}
          onChange={(e) => update({ allergyOther: e.target.value })}
          placeholder="Tell us more"
          className="mt-4 h-12 rounded-xl bg-card text-base"
        />
      ) : null}

      <div className="mt-5">
        <SelectCard
          compact
          icon={<ShieldCheck className="h-5 w-5" />}
          title="I don't have any known food allergies."
          selected={none}
          onClick={() => {
            setError(null);
            update({ allergies: none ? [] : [NONE], allergyOther: "" });
          }}
        />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        IDGAF provides nutrition guidance and is not a substitute for professional medical advice.
      </p>
    </OnboardingLayout>
  );
}

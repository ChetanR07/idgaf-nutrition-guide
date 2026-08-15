import { Bike, Dumbbell, Footprints, Mountain, Sofa } from "lucide-react";
import { useState } from "react";

import { OnboardingLayout, SelectCard } from "@/components/idgaf/OnboardingUI";
import { useOnboarding, type ActivityLevel } from "@/lib/onboarding-store";

const LEVELS: { value: ActivityLevel; title: string; description: string; icon: React.ReactNode }[] = [
  { value: "sedentary", title: "Mostly sedentary", description: "Mostly sitting with little intentional exercise.", icon: <Sofa className="h-5 w-5" /> },
  { value: "light", title: "Lightly active", description: "Some walking or light exercise during the week.", icon: <Footprints className="h-5 w-5" /> },
  { value: "moderate", title: "Moderately active", description: "Regular exercise or an active daily routine.", icon: <Bike className="h-5 w-5" /> },
  { value: "very", title: "Very active", description: "Frequent exercise or a physically active lifestyle.", icon: <Dumbbell className="h-5 w-5" /> },
  { value: "extreme", title: "Extremely active", description: "Intense training or highly physical work.", icon: <Mountain className="h-5 w-5" /> },
];

export function StepActivity({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  return (
    <OnboardingLayout
      step={5}
      title="How active are you?"
      subtitle="Think about your usual week, not your best week."
      onBack={onBack}
      error={error}
      onContinue={() => (profile.activityLevel ? onNext() : setError("Pick your usual activity level."))}
    >
      <div className="grid gap-2.5">
        {LEVELS.map((l) => (
          <SelectCard
            key={l.value}
            icon={l.icon}
            title={l.title}
            description={l.description}
            selected={profile.activityLevel === l.value}
            onClick={() => {
              update({ activityLevel: l.value });
              setError(null);
            }}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}

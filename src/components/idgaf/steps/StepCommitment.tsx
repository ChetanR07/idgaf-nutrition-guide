import { Compass, Flame, Rocket, Target } from "lucide-react";
import { useState } from "react";

import { OnboardingLayout, SelectCard } from "@/components/idgaf/OnboardingUI";
import { useOnboarding, type Commitment } from "@/lib/onboarding-store";

const LEVELS: { value: Commitment; title: string; description: string; icon: React.ReactNode }[] = [
  { value: "exploring", title: "Just exploring", description: "I'm curious and want to learn.", icon: <Compass className="h-5 w-5" /> },
  { value: "somewhat", title: "Somewhat important", description: "I want to make some changes.", icon: <Target className="h-5 w-5" /> },
  { value: "very_important", title: "Very important", description: "I'm actively working toward my goal.", icon: <Flame className="h-5 w-5" /> },
  { value: "serious", title: "Very serious", description: "I'm committed and ready to stay consistent.", icon: <Rocket className="h-5 w-5" /> },
];

export function StepCommitment({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  return (
    <OnboardingLayout
      step={3}
      title="How serious are you about this goal?"
      subtitle="Be honest. There are no wrong answers."
      onBack={onBack}
      error={error}
      onContinue={() => (profile.goalCommitment ? onNext() : setError("Pick the option that fits you best."))}
    >
      <div className="grid gap-2.5">
        {LEVELS.map((l) => (
          <SelectCard
            key={l.value}
            icon={l.icon}
            title={l.title}
            description={l.description}
            selected={profile.goalCommitment === l.value}
            onClick={() => {
              update({ goalCommitment: l.value });
              setError(null);
            }}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}

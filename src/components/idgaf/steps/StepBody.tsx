import { Info } from "lucide-react";
import { useState } from "react";

import { Field, OnboardingLayout, UnitToggle } from "@/components/idgaf/OnboardingUI";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/lib/onboarding-store";

export function StepBody({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const maintaining = profile.primaryGoal === "maintain_weight";

  const feet = profile.height ? Math.floor(profile.height / 12) : "";
  const inches = profile.height ? Math.round(profile.height % 12) : "";

  const setFtIn = (f: number, i: number) => update({ height: f * 12 + i });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!profile.height || profile.height <= 0) e.height = "Add your height to continue.";
    if (!profile.currentWeight || profile.currentWeight <= 0) e.current = "Add your current weight.";
    if (!maintaining && (!profile.targetWeight || profile.targetWeight <= 0))
      e.target = "Add a target weight, or switch your goal to maintain.";
    setErrors(e);
    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <OnboardingLayout
      step={4}
      title="Let's understand your body."
      subtitle="This helps IDGAF estimate your nutrition and calorie requirements."
      onBack={onBack}
      onContinue={validate}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Height</span>
            <UnitToggle
              value={profile.heightUnit}
              options={[
                { value: "cm", label: "cm" },
                { value: "ftin", label: "ft/in" },
              ]}
              onChange={(v) => update({ heightUnit: v, height: null })}
            />
          </div>
          {profile.heightUnit === "cm" ? (
            <Input
              inputMode="numeric"
              placeholder="172"
              value={profile.height ?? ""}
              onChange={(e) => update({ height: e.target.value ? Number(e.target.value) : null })}
              className="h-12 rounded-xl text-base"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input
                inputMode="numeric"
                placeholder="ft"
                value={feet}
                onChange={(e) => setFtIn(Number(e.target.value || 0), Number(inches || 0))}
                className="h-12 rounded-xl text-base"
              />
              <Input
                inputMode="numeric"
                placeholder="in"
                value={inches}
                onChange={(e) => setFtIn(Number(feet || 0), Number(e.target.value || 0))}
                className="h-12 rounded-xl text-base"
              />
            </div>
          )}
          {errors.height ? <p className="mt-2 text-xs font-medium text-destructive">{errors.height}</p> : null}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Weight</span>
            <UnitToggle
              value={profile.weightUnit}
              options={[
                { value: "kg", label: "kg" },
                { value: "lb", label: "lb" },
              ]}
              onChange={(v) => update({ weightUnit: v })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current weight" error={errors.current}>
              <Input
                inputMode="decimal"
                placeholder={profile.weightUnit === "kg" ? "68" : "150"}
                value={profile.currentWeight ?? ""}
                onChange={(e) => update({ currentWeight: e.target.value ? Number(e.target.value) : null })}
                className="h-12 rounded-xl text-base"
              />
            </Field>
            <Field
              label={maintaining ? "Target weight (optional)" : "Target weight"}
              error={errors.target}
            >
              <Input
                inputMode="decimal"
                placeholder={profile.weightUnit === "kg" ? "64" : "140"}
                value={profile.targetWeight ?? ""}
                onChange={(e) => update({ targetWeight: e.target.value ? Number(e.target.value) : null })}
                className="h-12 rounded-xl text-base"
              />
            </Field>
          </div>
        </div>

        <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          These numbers are used to estimate your daily energy requirements and personalize
          recommendations.
        </p>
      </div>
    </OnboardingLayout>
  );
}

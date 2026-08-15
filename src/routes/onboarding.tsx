import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { StepActivity } from "@/components/idgaf/steps/StepActivity";
import { StepAllergies } from "@/components/idgaf/steps/StepAllergies";
import { StepBasics } from "@/components/idgaf/steps/StepBasics";
import { StepBody } from "@/components/idgaf/steps/StepBody";
import { StepCommitment } from "@/components/idgaf/steps/StepCommitment";
import { StepFood } from "@/components/idgaf/steps/StepFood";
import { StepGoal } from "@/components/idgaf/steps/StepGoal";
import { StepMeals } from "@/components/idgaf/steps/StepMeals";
import { useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Create your IDGAF profile — Onboarding" },
      {
        name: "description",
        content:
          "Set up your IDGAF profile in eight quick steps: goals, body information, activity, diet, allergies and meal routine.",
      },
      { property: "og:title", content: "Create your IDGAF profile" },
      {
        property: "og:description",
        content: "Eight quick steps to personalized nutrition guidance. No crash diets.",
      },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { update } = useOnboarding();
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));
  const backOrLogin = () => (step === 1 ? navigate({ to: "/" }) : back());

  const finish = () => {
    update({ onboardingComplete: true });
    navigate({ to: "/how-it-helps" });
  };

  const props = { onNext: next, onBack: back };

  return (
    <main>
      {step === 1 && <StepBasics onNext={next} onBack={backOrLogin} />}
      {step === 2 && <StepGoal {...props} />}
      {step === 3 && <StepCommitment {...props} />}
      {step === 4 && <StepBody {...props} />}
      {step === 5 && <StepActivity {...props} />}
      {step === 6 && <StepFood {...props} />}
      {step === 7 && <StepAllergies {...props} />}
      {step === 8 && <StepMeals onNext={finish} onBack={back} />}
    </main>
  );
}

import { useState } from "react";

import { Field, OnboardingLayout, SelectCard, TextField } from "@/components/idgaf/OnboardingUI";
import { Input } from "@/components/ui/input";
import { useOnboarding, type Gender } from "@/lib/onboarding-store";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
];

export function StepBasics({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { profile, update } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!profile.name.trim()) e.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) e.email = "Enter a valid email address.";
    if (!/^[+\d][\d\s-]{6,17}$/.test(profile.phone.trim())) e.phone = "Enter a valid phone number.";
    if (!profile.dateOfBirth) e.dob = "Please add your date of birth.";
    if (!profile.gender) e.gender = "Pick an option to continue.";
    setErrors(e);
    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <OnboardingLayout
      step={1}
      title="Let's get to know you."
      subtitle="We'll use this information to personalize your IDGAF experience."
      onBack={onBack}
      onContinue={validate}
    >
      <div className="space-y-5">
        <TextField
          id="name"
          label="Full name"
          placeholder="Alex Mercer"
          value={profile.name}
          error={errors.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={profile.email}
          error={errors.email}
          onChange={(e) => update({ email: e.target.value })}
        />
        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          placeholder="+91 98765 43210"
          value={profile.phone}
          error={errors.phone}
          onChange={(e) => update({ phone: e.target.value })}
        />
        <Field label="Date of birth" htmlFor="dob" error={errors.dob}>
          <Input
            id="dob"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={profile.dateOfBirth}
            onChange={(e) => update({ dateOfBirth: e.target.value })}
            className="h-12 rounded-xl bg-card px-4 text-base"
          />
        </Field>
        <Field label="Gender" error={errors.gender}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {GENDERS.map((g) => (
              <SelectCard
                key={g.value}
                compact
                title={g.label}
                selected={profile.gender === g.value}
                onClick={() => update({ gender: g.value })}
              />
            ))}
          </div>
        </Field>
      </div>
    </OnboardingLayout>
  );
}

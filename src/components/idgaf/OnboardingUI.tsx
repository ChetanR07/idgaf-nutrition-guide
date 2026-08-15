import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const TOTAL_STEPS = 8;

export function ProgressIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-1 items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < step ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
        Step {step} of {TOTAL_STEPS}
      </span>
    </div>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string | undefined }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h1>
      {subtitle ? <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export function OnboardingLayout({
  step,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  error,
}: {
  step: number;
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  error?: string | null;
}) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-5 py-6 sm:px-8 sm:py-10">
      <ProgressIndicator step={step} />
      <div key={step} className="step-enter mt-8 flex-1">
        <SectionHeading title={title} subtitle={subtitle} />
        <div className="mt-7">{children}</div>
      </div>
      {error ? (
        <p role="alert" className="mt-6 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
      <div className="sticky bottom-0 mt-8 flex gap-3 bg-background/85 py-4 backdrop-blur">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            className="h-12 rounded-xl px-5"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        ) : null}
        <Button
          type="button"
          size="lg"
          onClick={onContinue}
          className="h-12 flex-1 rounded-xl bg-primary-deep text-base font-semibold hover:bg-primary"
        >
          {continueLabel} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  htmlFor?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

export function TextField({
  label,
  error,
  hint,
  id,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; error?: string | undefined; hint?: string | undefined; id: string }) {
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id}>
      <Input
        id={id}
        {...props}
        className={cn(
          "h-12 rounded-xl border-border bg-card px-4 text-base shadow-none focus-visible:ring-primary/40",
          error && "border-destructive",
          props.className,
        )}
      />
    </Field>
  );
}

export function SelectCard({
  selected,
  title,
  description,
  icon,
  onClick,
  compact,
}: {
  selected: boolean;
  title: string;
  description?: string | undefined;
  icon?: ReactNode;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-soft",
        selected
          ? "border-primary bg-primary-soft/60 shadow-soft"
          : "border-border hover:border-primary/50",
        compact && "p-3.5",
      )}
    >
      {icon ? (
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold sm:text-[0.95rem]">{title}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

export function Chip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50",
      )}
    >
      {label}
    </button>
  );
}

export function UnitToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
            value === o.value
              ? "bg-card text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

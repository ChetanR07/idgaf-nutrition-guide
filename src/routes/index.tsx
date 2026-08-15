import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Logo } from "@/components/idgaf/Logo";
import { TextField } from "@/components/idgaf/OnboardingUI";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IDGAF — Log in to your nutrition companion" },
      {
        name: "description",
        content:
          "Log in to IDGAF, the AI nutrition companion that tells you what to eat, tracks macros and works with your lifestyle.",
      },
      { property: "og:title", content: "IDGAF — Eat better. Feel better. No nonsense." },
      {
        property: "og:description",
        content: "Personalized nutrition guidance, macro tracking and meal plans without the nonsense.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!email.trim()) next["email"] = "Enter your email or username.";
    if (password.length < 6) next["password"] = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) navigate({ to: "/onboarding" });
  };

  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <div className="step-enter w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Eat better. Feel better. No nonsense.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-7"
        >
          <TextField
            id="login-email"
            label="Email or username"
            placeholder="you@example.com"
            value={email}
            error={errors["email"]}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            error={errors["password"]}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <button type="button" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl bg-primary-deep text-base font-semibold hover:bg-primary"
          >
            Log in
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" size="lg" className="h-12 w-full rounded-xl font-semibold">
            <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden>
              <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
              <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3a12 12 0 0 0 10.2 6.3Z" />
              <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.7l3.8-3Z" />
              <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.8 6.1l3.8 3C6.5 6.7 9 4.8 12 4.8Z" />
            </svg>
            Continue with Google
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/onboarding" className="font-bold text-primary-deep underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

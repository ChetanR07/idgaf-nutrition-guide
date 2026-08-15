import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Flame, Plus, Utensils } from "lucide-react";

import { Logo } from "@/components/idgaf/Logo";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your IDGAF dashboard" },
      {
        name: "description",
        content: "Your personalized IDGAF home: today's macros, meals and quick food logging.",
      },
      { property: "og:title", content: "Your IDGAF dashboard" },
      {
        property: "og:description",
        content: "Track macros, log meals and stay on top of your nutrition goals.",
      },
    ],
  }),
  component: Dashboard,
});

const GOAL_LABEL: Record<string, string> = {
  lose_weight: "Lose weight",
  gain_weight: "Gain weight",
  build_muscle: "Build muscle",
  maintain_weight: "Maintain weight",
  improve_health: "Improve overall health",
  improve_habits: "Improve eating habits",
  other: "Personal goal",
};

function Dashboard() {
  const { profile } = useOnboarding();
  const firstName = profile.name.trim().split(" ")[0] || "there";

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <Logo />
        <Button variant="outline" className="h-10 rounded-xl">
          <Plus className="mr-1 h-4 w-4" /> Log food
        </Button>
      </header>

      <section className="step-enter mt-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Hey {firstName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {profile.primaryGoal
            ? `Working on: ${GOAL_LABEL[profile.primaryGoal]}. We work with your lifestyle, not against it.`
            : "Your food. Your goals. Let's keep it simple."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Calories today", value: "—", icon: Flame },
            { label: "Meals planned", value: profile.mealsPerDay ?? "—", icon: Utensils },
            { label: "Photos analyzed", value: "—", icon: Camera },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <s.icon className="h-5 w-5 text-primary-deep" />
              <p className="mt-3 text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="text-sm font-semibold">Your AI nutrition coach is warming up.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Meal recommendations and photo analysis land here next.
          </p>
          <Link
            to="/how-it-helps"
            className="mt-4 inline-block text-xs font-bold text-primary-deep underline-offset-4 hover:underline"
          >
            See what IDGAF can do
          </Link>
        </div>
      </section>
    </main>
  );
}

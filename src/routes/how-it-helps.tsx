import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, CalendarRange, LineChart, PieChart, Replace, Utensils } from "lucide-react";

import { Logo } from "@/components/idgaf/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-helps")({
  head: () => ({
    meta: [
      { title: "How IDGAF helps you eat better" },
      {
        name: "description",
        content:
          "Personalized food recommendations, food photo analysis, macro tracking, healthier alternatives, meal plans and progress tracking.",
      },
      { property: "og:title", content: "Here's how IDGAF can help." },
      {
        property: "og:description",
        content: "Your profile is ready. Now let's make eating better a little easier.",
      },
    ],
  }),
  component: HowItHelps,
});

const FEATURES = [
  {
    icon: Utensils,
    title: "Tell you what to eat",
    body: "Get personalized meal and food recommendations based on your goals and preferences.",
  },
  {
    icon: Camera,
    title: "Analyze food photos",
    body: "Take a picture of your food and let IDGAF analyze what you're eating.",
  },
  {
    icon: PieChart,
    title: "Track macros",
    body: "Keep track of calories, protein, carbohydrates, fats and other nutrition information.",
  },
  {
    icon: Replace,
    title: "Suggest healthier alternatives",
    body: "Get practical alternatives instead of simply being told what you \u201cshouldn't\u201d eat.",
  },
  {
    icon: CalendarRange,
    title: "Create meal plans",
    body: "Generate meal plans based on your goals, dietary preferences and routine.",
  },
  {
    icon: LineChart,
    title: "Track progress",
    body: "Monitor progress toward your goals over time.",
  },
];

function HowItHelps() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-12">
      <div className="step-enter flex-1">
        <Logo />
        <div className="mt-8">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Here's how IDGAF can help.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Your profile is ready. Now let's make eating better a little easier.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-soft"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-bold">{f.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 mt-8 bg-background/85 py-4 backdrop-blur">
        <Button
          asChild
          size="lg"
          className="h-12 w-full rounded-xl bg-primary-deep text-base font-semibold hover:bg-primary"
        >
          <Link to="/dashboard">
            Let's get started <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}

import { cn } from "@/lib/utils";

export function CalorieRing({
  consumed,
  target,
  size = 220,
}: {
  consumed: number;
  target: number;
  size?: number;
}) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = target > 0 ? Math.min(consumed / target, 1) : 0;
  const remaining = Math.max(target - consumed, 0);
  const over = consumed > target;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${Math.round(consumed)} of ${target} kcal consumed`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? "var(--destructive)" : "var(--primary)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - c * ratio}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-extrabold tabular-nums tracking-tight">
          {Math.round(consumed).toLocaleString()}
        </p>
        <p className="text-xs font-semibold text-muted-foreground">
          / {target.toLocaleString()} kcal
        </p>
        <p
          className={cn(
            "mt-2 rounded-full px-3 py-1 text-xs font-bold",
            over ? "bg-destructive/10 text-destructive" : "bg-primary-soft text-accent-foreground",
          )}
        >
          {over
            ? `${Math.round(consumed - target)} kcal over`
            : `${Math.round(remaining)} kcal left`}
        </p>
      </div>
    </div>
  );
}

export function MacroCard({
  label,
  value,
  target,
  unit = "g",
  tone = "primary",
}: {
  label: string;
  value: number;
  target: number;
  unit?: string;
  tone?: "primary" | "carbs" | "fat" | "fiber";
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const barColor = {
    primary: "bg-primary",
    carbs: "bg-chart-3",
    fat: "bg-chart-5",
    fiber: "bg-chart-4",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-muted-foreground">{Math.round(pct)}%</p>
      </div>
      <p className="mt-2 text-xl font-extrabold tabular-nums">
        {Math.round(value)}
        <span className="text-sm font-semibold text-muted-foreground">
          {unit} / {Math.round(target)}
          {unit}
        </span>
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

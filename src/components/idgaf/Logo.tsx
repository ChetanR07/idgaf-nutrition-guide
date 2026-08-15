import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[60%] w-[60%]">
        <path
          d="M12 21c4.5-2.4 7-6 7-10.2A6.8 6.8 0 0 0 12 4a6.8 6.8 0 0 0-7 6.8C5 15 7.5 18.6 12 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 21V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 13.5 9 11M12 12l3-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark className={size === "lg" ? "h-14 w-14" : "h-10 w-10"} />
      <span
        className={cn(
          "font-extrabold tracking-tight text-foreground",
          size === "lg" ? "text-3xl" : "text-xl",
        )}
      >
        IDGAF
      </span>
    </div>
  );
}

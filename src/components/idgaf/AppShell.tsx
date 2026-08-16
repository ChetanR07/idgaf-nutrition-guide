import { Link } from "@tanstack/react-router";
import { History, Home, ScanLine, Settings, User } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid w-full max-w-2xl grid-cols-5 items-end px-2 pt-2 pb-2">
        {ITEMS.slice(0, 2).map((i) => (
          <NavItem key={i.to} {...i} />
        ))}

        <div className="flex justify-center">
          <Link
            to="/scan"
            aria-label="Scan food"
            className="-mt-7 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift ring-4 ring-background transition-transform active:scale-95"
          >
            <ScanLine className="h-6 w-6" />
            <span className="mt-0.5 text-[10px] font-bold">Scan</span>
          </Link>
        </div>

        {ITEMS.slice(2).map((i) => (
          <NavItem key={i.to} {...i} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Home;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col items-center gap-1 rounded-xl py-1.5 text-muted-foreground transition-colors"
      activeProps={{ className: "text-primary-deep" }}
      activeOptions={{ exact: false }}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-svh bg-background">
      <main
        className={cn("mx-auto w-full max-w-2xl px-4 pt-5 pb-32 sm:px-6 sm:pt-8", className)}
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

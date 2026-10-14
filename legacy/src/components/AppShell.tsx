import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { FlaskConical, Flame, NotebookPen, LogIn, LogOut } from "lucide-react";
import { CafeBackdrop } from "@/components/CafeBackdrop";
import { useBrandLogo, useFaviconSync } from "@/lib/branding";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/brew", label: "Brew Lab", icon: FlaskConical },
  { to: "/roast", label: "Roast Lab", icon: Flame },
  { to: "/notebook", label: "Notebook", icon: NotebookPen },
] as const;

export function AppShell({
  children,
  backdrop = true,
}: {
  children: React.ReactNode;
  backdrop?: boolean;
}) {
  const { user } = useAuth();
  const logo = useBrandLogo();
  useFaviconSync();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="lab-surface relative min-h-screen">
      {backdrop ? <CafeBackdrop /> : null}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="The Bean Professor logo"
              className="h-9 w-9 rounded-full border border-primary/40 bg-primary/10 object-contain p-0.5"
            />
            <span className="font-display text-base leading-none">
              The Bean Professor
              <span className="label-mono mt-1 block">Coffee Research Lab</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname === item.to && "bg-secondary text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto" />



          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur-md sm:hidden">
        <div className="flex">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-[0.65rem] tracking-wide",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { AppShell } from "@/components/AppShell";
import { Field, LabButton, LabInput } from "@/components/LabField";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — The Bean Professor" },
      {
        name: "description",
        content:
          "Create an account to save your brewing and roasting sessions, tasting notes and ratings in your lab notebook.",
      },
      { property: "og:title", content: "Sign in — The Bean Professor" },
      {
        property: "og:description",
        content: "Save your brew and roast sessions with notes and ratings.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [resetSent, setResetSent] = useState(false);


  useEffect(() => {
    if (user) navigate({ to: "/notebook", replace: true });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("Reset link sent — check your email");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created — welcome to the lab");
        } else {
          setPendingConfirm(true);
          toast.success("Check your email to confirm your account");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Google sign-in failed");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md pt-6">
        <span className="label-mono">Lab access</span>
        <h1 className="mt-2 flex items-center gap-3 font-display text-3xl">
          <FlaskConical className="h-6 w-6 text-primary" />
          {mode === "signin"
            ? "Sign in"
            : mode === "signup"
              ? "Create your account"
              : "Reset your password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "forgot"
            ? "Enter your account email and we'll send you a link to set a new password."
            : "Your notebook keeps every brew and roast session, with your own notes and ratings."}
        </p>

        {pendingConfirm ? (
          <div className="lab-card mt-6 p-5 text-sm text-muted-foreground">
            Confirmation email sent to <strong className="text-foreground">{email}</strong>. Click the
            link to activate your notebook.
          </div>
        ) : resetSent ? (
          <div className="lab-card mt-6 space-y-4 p-5 text-sm text-muted-foreground">
            <p>
              If an account exists for <strong className="text-foreground">{email}</strong>, a
              password reset link is on its way. The link opens a page where you can set a new
              password.
            </p>
            <button
              type="button"
              onClick={() => {
                setResetSent(false);
                setMode("signin");
              }}
              className="text-xs underline-offset-4 hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="lab-card mt-6 space-y-4 p-5">
            {mode === "signup" ? (
              <Field label="Display name">
                <LabInput
                  value={displayName}
                  maxLength={60}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Prof. Bean"
                />
              </Field>
            ) : null}
            <Field label="Email">
              <LabInput
                type="email"
                required
                autoComplete="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            {mode === "forgot" ? null : (
              <Field label="Password" hint="min 8 characters">
                <LabInput
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            )}

            <LabButton type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
            </LabButton>

            {mode === "signin" ? (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot your password?
              </button>
            ) : null}

            {mode === "forgot" ? null : (
              <>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="label-mono">or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <LabButton type="button" variant="ghost" onClick={google} className="w-full">
                  Continue with Google
                </LabButton>
              </>
            )}

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {mode === "signin"
                ? "No account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>
        )}

      </div>
    </AppShell>
  );
}

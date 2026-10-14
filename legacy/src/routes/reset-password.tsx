import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Field, LabButton, LabInput } from "@/components/LabField";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — The Bean Professor" },
      {
        name: "description",
        content:
          "Set a new password for your Bean Professor lab account and get back to your saved brew and roast sessions.",
      },
      { property: "og:title", content: "Reset password — The Bean Professor" },
      {
        property: "og:description",
        content: "Choose a new password to regain access to your lab notebook.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — you're signed in");
      navigate({ to: "/notebook", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md pt-6">
        <span className="label-mono">Lab access</span>
        <h1 className="mt-2 flex items-center gap-3 font-display text-3xl">
          <KeyRound className="h-6 w-6 text-primary" />
          Set a new password
        </h1>

        {!ready ? (
          <div className="lab-card mt-6 p-5 text-sm text-muted-foreground">
            Open this page from the reset link in your email. If you landed here directly, request a
            new link from the sign-in page.
          </div>
        ) : (
          <form onSubmit={submit} className="lab-card mt-6 space-y-4 p-5">
            <Field label="New password" hint="min 8 characters">
              <LabInput
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm new password">
              <LabInput
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <LabButton type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update password
            </LabButton>
          </form>
        )}
      </div>
    </AppShell>
  );
}

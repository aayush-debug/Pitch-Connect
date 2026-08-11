import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — LetsPitch" },
      {
        name: "description",
        content:
          "Forgot your LetsPitch password? Enter your email and we'll send you a secure link to set a new one.",
      },
      { property: "og:title", content: "Reset your password — LetsPitch" },
      {
        property: "og:description",
        content: "Send yourself a secure link to set a new LetsPitch password.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <Link to="/" className="relative mb-8 font-display text-lg font-bold">
        Lets<span className="text-primary">Pitch</span>
      </Link>
      <Card className="relative w-full max-w-md border-border bg-card p-8">
        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto size-8 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Check your inbox</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a password reset link to{" "}
              <span className="text-foreground">{email}</span>. Open it to choose a new password.
            </p>
            <Button className="mt-6 w-full" asChild>
              <Link to="/auth" search={{ mode: "login" }}>
                Back to log in
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <KeyRound className="size-7 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Forgot your password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email on your account and we'll send a secure link to reset it.
            </p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="font-medium text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </>
        )}
      </Card>
    </main>
  );
}

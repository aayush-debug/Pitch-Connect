import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Rocket, Target, MailCheck } from "lucide-react";
import type { UserRole } from "@/lib/letspitch";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).catch("signup"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or join — LetsPitch" },
      {
        name: "description",
        content:
          "Create your LetsPitch account as a founder or an investor, or log back in to your pitch room.",
      },
      { property: "og:title", content: "Sign in or join — LetsPitch" },
      {
        property: "og:description",
        content: "Create your LetsPitch account as a founder or an investor.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const [role, setRole] = useState<UserRole>("founder");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { role, full_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: role === "founder" ? "/onboarding/founder" : "/onboarding/investor" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <Shell>
        <Card className="w-full max-w-md border-border bg-card p-8 text-center">
          <MailCheck className="mx-auto size-8 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">Confirm your email</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it
            to activate your account, then come back and log in to finish your{" "}
            {role === "founder" ? "startup profile" : "investing preferences"}.
          </p>
          <Button className="mt-6 w-full" asChild>
            <Link to="/auth" search={{ mode: "login" }} onClick={() => setCheckEmail(false)}>
              Go to log in
            </Link>
          </Button>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card className="w-full max-w-md border-border bg-card p-8">
        <h1 className="text-2xl font-bold">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup
            ? "Pick your side of the table — we'll tailor your onboarding."
            : "Log in to your pitch room."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {isSignup && (
            <div className="space-y-2">
              <Label>I am a…</Label>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  active={role === "founder"}
                  onClick={() => setRole("founder")}
                  icon={<Rocket className="size-4" />}
                  title="Founder"
                  body="Raising capital"
                />
                <RoleCard
                  active={role === "investor"}
                  onClick={() => setRole("investor")}
                  icon={<Target className="size-4" />}
                  title="Investor"
                  body="Writing cheques"
                />
              </div>
            </div>
          )}

          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
              />
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "New to LetsPitch?"}{" "}
          <Link
            to="/auth"
            search={{ mode: isSignup ? "login" : "signup" }}
            className="font-medium text-primary hover:underline"
          >
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </p>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <Link to="/" className="relative mb-8 font-display text-lg font-bold">
        Lets<span className="text-primary">Pitch</span>
      </Link>
      <div className="relative flex w-full justify-center">{children}</div>
    </main>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border p-3 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-input"
      }`}
    >
      <span className={active ? "text-primary" : ""}>{icon}</span>
      <span className="mt-2 block text-sm font-semibold text-foreground">{title}</span>
      <span className="block text-xs text-muted-foreground">{body}</span>
    </button>
  );
}

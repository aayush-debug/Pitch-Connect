import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney } from "@/lib/letspitch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your pitch room — LetsPitch" },
      {
        name: "description",
        content:
          "Founders track their startup profiles and investor interest; investors review deals that match their thesis.",
      },
      { property: "og:title", content: "Your pitch room — LetsPitch" },
      {
        property: "og:description",
        content: "Track your startup profiles or review deals that match your thesis.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();

  const founderId = profile?.founder?.id ?? null;
  const investorId = profile?.investor?.id ?? null;

  const startups = useQuery({
    queryKey: ["my-startups", founderId],
    enabled: !!founderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startups")
        .select("id, name, one_liner, sector, stage, ask_amount, created_at")
        .eq("founder_id", founderId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const preferences = useQuery({
    queryKey: ["my-preferences", investorId],
    enabled: !!investorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_preferences")
        .select("sectors, stages, min_ticket, max_ticket")
        .eq("investor_id", investorId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const deals = useQuery({
    queryKey: ["deal-flow", investorId, preferences.data],
    enabled: !!investorId && !!preferences.data,
    queryFn: async () => {
      let query = supabase
        .from("startups")
        .select("id, name, one_liner, sector, stage, ask_amount")
        .order("created_at", { ascending: false })
        .limit(20);
      const prefs = preferences.data!;
      if (prefs.sectors.length > 0) query = query.in("sector", prefs.sectors);
      if (prefs.stages.length > 0) query = query.in("stage", prefs.stages);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-40 w-full" />
      </main>
    );
  }

  const needsOnboarding = !profile?.founder && !profile?.investor;

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <header className="relative mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-lg font-bold">
          Lets<span className="text-primary">Pitch</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{profile?.email}</span>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="relative mx-auto max-w-4xl px-6 pb-20">
        {needsOnboarding && (
          <Card className="border-border bg-card p-7">
            <h1 className="text-2xl font-bold">Finish setting up</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us which side of the table you're on.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/onboarding/founder">I'm a founder</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/onboarding/investor">I'm an investor</Link>
              </Button>
            </div>
          </Card>
        )}

        {profile?.founder && (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-primary uppercase">Founder</p>
                <h1 className="mt-1 text-3xl font-bold">Hi {profile.founder.name}</h1>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" asChild>
                  <Link to="/requests">Investor requests</Link>
                </Button>
                <Button asChild>
                  <Link to="/onboarding/founder">Add a startup</Link>
                </Button>
              </div>
            </div>

            <div className="mt-7 grid gap-4">
              {startups.isLoading && <Skeleton className="h-28 w-full" />}
              {startups.data?.length === 0 && (
                <Card className="border-border bg-card p-7 text-sm text-muted-foreground">
                  No startup profiles yet.
                </Card>
              )}
              {startups.data?.map((s) => (
                <Card key={s.id} className="border-border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{s.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{s.one_liner}</p>
                    </div>
                    <span className="font-display text-lg text-primary">
                      {formatMoney(s.ask_amount)}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Badge variant="secondary">{s.sector}</Badge>
                    <Badge variant="secondary">{s.stage}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {profile?.investor && (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-primary uppercase">Investor</p>
                <h1 className="mt-1 text-3xl font-bold">Hi {profile.investor.name}</h1>
              </div>
              <Button variant="secondary" asChild>
                <Link to="/onboarding/investor">Edit preferences</Link>
              </Button>
            </div>

            {preferences.data ? (
              <Card className="mt-7 border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-muted-foreground">Your thesis</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {preferences.data.sectors.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                  {preferences.data.stages.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Ticket range {formatMoney(preferences.data.min_ticket)} –{" "}
                  {formatMoney(preferences.data.max_ticket)}
                </p>
              </Card>
            ) : (
              <Card className="mt-7 border-border bg-card p-6 text-sm text-muted-foreground">
                You haven't set preferences yet.{" "}
                <Link to="/onboarding/investor" className="text-primary hover:underline">
                  Set them now
                </Link>
                .
              </Card>
            )}

            <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Matching deal flow</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {deals.isLoading
                    ? "Checking for new startups…"
                    : `${deals.data?.length ?? 0} startup${deals.data?.length === 1 ? "" : "s"} match your sectors and stages.`}
                </p>
              </div>
              <Button asChild>
                <Link to="/discover">Open discovery feed</Link>
              </Button>
            </div>

          </section>
        )}
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney } from "@/lib/letspitch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "Investor requests — LetsPitch" },
      {
        name: "description",
        content:
          "Review investors who saved your startup, see their thesis, and accept or decline to unlock your data room.",
      },
      { property: "og:title", content: "Investor requests — LetsPitch" },
      {
        property: "og:description",
        content: "Accept or decline investor interest and control who sees your pitch deck.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Requests,
});

type MatchRow = {
  id: string;
  status: "pending" | "matched" | "passed";
  created_at: string;
  startups: { id: string; name: string; sector: string; stage: string; ask_amount: number | null };
  investors: {
    id: string;
    name: string;
    investor_preferences: Array<{
      sectors: string[];
      stages: string[];
      min_ticket: number | null;
      max_ticket: number | null;
    }>;
  };
};

function Requests() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const founderId = profile?.founder?.id ?? null;
  const queryClient = useQueryClient();

  const matches = useQuery({
    queryKey: ["founder-matches", founderId],
    enabled: !!founderId,
    queryFn: async () => {
      const { data: mine, error: startupError } = await supabase
        .from("startups")
        .select("id")
        .eq("founder_id", founderId!);
      if (startupError) throw startupError;
      const ids = (mine ?? []).map((s) => s.id);
      if (ids.length === 0) return [] as MatchRow[];

      const { data, error } = await supabase
        .from("matches")
        .select(
          `id, status, created_at,
           startups!inner(id, name, sector, stage, ask_amount),
           investors!inner(id, name, investor_preferences(sectors, stages, min_ticket, max_ticket))`,
        )
        .in("startup_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MatchRow[];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ matchId, accept }: { matchId: string; accept: boolean }) => {
      const { error } = await supabase.rpc("decide_match", {
        _match_id: matchId,
        _accept: accept,
      });
      if (error) throw error;
      return accept;
    },
    onSuccess: (accept) => {
      queryClient.invalidateQueries({ queryKey: ["founder-matches"] });
      toast.success(
        accept ? "Matched — your data room is now open to them" : "Request declined",
      );
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save that decision"),
  });

  if (profileLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-48 w-full" />
      </main>
    );
  }

  if (!profile?.founder) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-2xl font-bold">Founders only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This inbox is for founder accounts.{" "}
          <Link to="/dashboard" className="text-primary hover:underline">
            Back to your dashboard
          </Link>
          .
        </p>
      </main>
    );
  }

  const pending = (matches.data ?? []).filter((m) => m.status === "pending");
  const matched = (matches.data ?? []).filter((m) => m.status === "matched");

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">Inbox</p>
            <h1 className="mt-1 text-3xl font-bold">Investor requests</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your deck stays private until you accept.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>

        <Tabs defaultValue="pending" className="mt-8">
          <TabsList>
            <TabsTrigger value="pending">
              Pending{pending.length ? ` (${pending.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="matched">
              Matched{matched.length ? ` (${matched.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6 grid gap-5">
            {matches.isLoading && <Skeleton className="h-40 w-full" />}
            {!matches.isLoading && pending.length === 0 && (
              <Card className="border-border bg-card p-6 text-sm text-muted-foreground">
                No investor requests yet. Investors who save your startup show up here.
              </Card>
            )}
            {pending.map((m) => (
              <RequestCard
                key={m.id}
                match={m}
                busy={decide.isPending}
                onAccept={() => decide.mutate({ matchId: m.id, accept: true })}
                onDecline={() => decide.mutate({ matchId: m.id, accept: false })}
              />
            ))}
          </TabsContent>

          <TabsContent value="matched" className="mt-6 grid gap-5">
            {matched.length === 0 && (
              <Card className="border-border bg-card p-6 text-sm text-muted-foreground">
                No accepted matches yet.
              </Card>
            )}
            {matched.map((m) => (
              <RequestCard key={m.id} match={m} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function RequestCard({
  match,
  onAccept,
  onDecline,
  busy,
}: {
  match: MatchRow;
  onAccept?: () => void;
  onDecline?: () => void;
  busy?: boolean;
}) {
  const prefs = match.investors.investor_preferences?.[0];

  return (
    <Card className="border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{match.investors.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Interested in <span className="text-foreground">{match.startups.name}</span> ·{" "}
            {match.startups.sector} · {match.startups.stage}
          </p>
        </div>
        {match.status === "matched" ? (
          <Badge>Matched</Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        )}
      </div>

      <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Their thesis
        </h3>
        {prefs ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {prefs.sectors.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
              {prefs.stages.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Ticket range {formatMoney(prefs.min_ticket)} – {formatMoney(prefs.max_ticket)}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            This investor hasn't published a thesis yet.
          </p>
        )}
      </div>

      {match.status === "matched" ? (
        <p className="mt-5 text-xs text-muted-foreground">
          Data room unlocked — this investor can now view your pitch deck.
        </p>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={onDecline} disabled={busy}>
            Decline
          </Button>
          <Button onClick={onAccept} disabled={busy}>
            Accept
          </Button>
        </div>
      )}
    </Card>
  );
}

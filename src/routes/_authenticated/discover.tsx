import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { formatMoney } from "@/lib/letspitch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => ({
    meta: [
      { title: "Discover startups — LetsPitch" },
      {
        name: "description",
        content:
          "Review startups matched to your sectors, stages and ticket range. Watch the pitch video, then save or pass.",
      },
      { property: "og:title", content: "Discover startups — LetsPitch" },
      {
        property: "og:description",
        content: "Startups matched to your thesis — watch the pitch, then save or pass.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Discover,
});

type Deal = {
  id: string;
  name: string;
  one_liner: string;
  sector: string;
  stage: string;
  ask_amount: number | null;
  video_url: string | null;
  videoSignedUrl: string | null;
  deckSignedUrl?: string | null;
};

async function withSignedVideos(
  rows: Array<Omit<Deal, "videoSignedUrl">>,
): Promise<Deal[]> {
  const paths = rows.map((r) => r.video_url).filter((p): p is string => !!p);
  const signedByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage.from("videos").createSignedUrls(paths, 60 * 60);
    data?.forEach((entry) => {
      if (entry.path && entry.signedUrl) signedByPath.set(entry.path, entry.signedUrl);
    });
  }
  return rows.map((r) => ({
    ...r,
    videoSignedUrl: r.video_url ? (signedByPath.get(r.video_url) ?? null) : null,
  }));
}

const SELECT_COLS = "id, name, one_liner, sector, stage, ask_amount, video_url";

function Discover() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const investorId = profile?.investor?.id ?? null;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("feed");

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

  const feed = useQuery({
    queryKey: ["discover-feed", investorId, preferences.data],
    enabled: !!investorId && preferences.isSuccess,
    queryFn: async () => {
      const prefs = preferences.data;

      const { data: existing, error: matchError } = await supabase
        .from("matches")
        .select("startup_id")
        .eq("investor_id", investorId!);
      if (matchError) throw matchError;
      const seen = new Set((existing ?? []).map((m) => m.startup_id));

      let query = supabase
        .from("startups")
        .select(SELECT_COLS)
        .order("created_at", { ascending: false })
        .limit(60);
      if (prefs?.sectors?.length) query = query.in("sector", prefs.sectors);
      if (prefs?.stages?.length) query = query.in("stage", prefs.stages);

      const { data, error } = await query;
      if (error) throw error;

      const filtered = (data ?? []).filter((s) => {
        if (seen.has(s.id)) return false;
        if (s.ask_amount === null) return true;
        if (prefs?.min_ticket != null && s.ask_amount < prefs.min_ticket) return false;
        if (prefs?.max_ticket != null && s.ask_amount > prefs.max_ticket) return false;
        return true;
      });

      return withSignedVideos(filtered);
    },
  });

  const saved = useQuery({
    queryKey: ["saved-startups", investorId],
    enabled: !!investorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`id, created_at, startups!inner(${SELECT_COLS})`)
        .eq("investor_id", investorId!)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []).map((m) => m.startups);
      return withSignedVideos(rows);
    },
  });

  const matched = useQuery({
    queryKey: ["matched-startups", investorId],
    enabled: !!investorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(`id, created_at, startups!inner(${SELECT_COLS}, deck_url)`)
        .eq("investor_id", investorId!)
        .eq("status", "matched")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []).map((m) => m.startups);
      const withVideos = await withSignedVideos(
        rows.map(({ deck_url: _deck, ...rest }) => rest),
      );
      const deckPaths = rows.map((r) => r.deck_url).filter((p): p is string => !!p);
      const deckByPath = new Map<string, string>();
      if (deckPaths.length > 0) {
        const { data: signed } = await supabase.storage
          .from("decks")
          .createSignedUrls(deckPaths, 60 * 60);
        signed?.forEach((entry) => {
          if (entry.path && entry.signedUrl) deckByPath.set(entry.path, entry.signedUrl);
        });
      }
      return withVideos.map((deal, i) => ({
        ...deal,
        deckSignedUrl: rows[i]?.deck_url ? (deckByPath.get(rows[i]!.deck_url!) ?? null) : null,
      }));
    },
  });

  const notifications = useQuery({
    queryKey: ["notifications", profile?.userId],
    enabled: !!profile?.userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, read, created_at")
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const dismissNotifications = useMutation({
    mutationFn: async () => {
      const ids = (notifications.data ?? []).map((n) => n.id);
      if (ids.length === 0) return;
      const { error } = await supabase.from("notifications").update({ read: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const decide = useMutation({
    mutationFn: async ({
      startupId,
      status,
    }: {
      startupId: string;
      status: "pending" | "passed";
    }) => {
      const { error } = await supabase.from("matches").insert({
        startup_id: startupId,
        investor_id: investorId!,
        status,
      });
      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ["discover-feed"] });
      queryClient.invalidateQueries({ queryKey: ["saved-startups"] });
      toast.success(status === "pending" ? "Saved to your list" : "Passed");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not record that"),
  });

  if (profileLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-56 w-full" />
      </main>
    );
  }

  if (!profile?.investor) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-2xl font-bold">Investors only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This feed is for investor accounts.{" "}
          <Link to="/dashboard" className="text-primary hover:underline">
            Back to your dashboard
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">Deal flow</p>
            <h1 className="mt-1 text-3xl font-bold">Discover startups</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Matched to your sectors, stages and ticket range.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>

        {!preferences.data && preferences.isSuccess && (
          <Card className="mt-7 border-border bg-card p-6 text-sm text-muted-foreground">
            You haven't set a thesis yet, so you're seeing everything.{" "}
            <Link to="/onboarding/investor" className="text-primary hover:underline">
              Set preferences
            </Link>
            .
          </Card>
        )}

        {(notifications.data?.length ?? 0) > 0 && (
          <Card className="mt-7 border-primary/40 bg-primary/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-primary">New matches</h2>
                <ul className="mt-2 grid gap-2">
                  {notifications.data?.map((n) => (
                    <li key={n.id} className="text-sm">
                      <span className="font-medium">{n.title}</span>
                      {n.body ? (
                        <span className="text-muted-foreground"> — {n.body}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dismissNotifications.mutate()}
                disabled={dismissNotifications.isPending}
              >
                Mark read
              </Button>
            </div>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab} className="mt-8">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="saved">
              Saved{saved.data?.length ? ` (${saved.data.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="matched">
              Matched{matched.data?.length ? ` (${matched.data.length})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6 grid gap-5">
            {feed.isLoading && <Skeleton className="h-64 w-full" />}
            {feed.data?.length === 0 && (
              <Card className="border-border bg-card p-6 text-sm text-muted-foreground">
                You're all caught up — no new startups match your thesis right now.
              </Card>
            )}
            {feed.data?.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                busy={decide.isPending}
                onSave={() => decide.mutate({ startupId: deal.id, status: "pending" })}
                onPass={() => decide.mutate({ startupId: deal.id, status: "passed" })}
              />
            ))}
          </TabsContent>

          <TabsContent value="saved" className="mt-6 grid gap-5">
            {saved.isLoading && <Skeleton className="h-64 w-full" />}
            {saved.data?.length === 0 && (
              <Card className="border-border bg-card p-6 text-sm text-muted-foreground">
                Nothing saved yet. Save a startup from the feed to review it here.
              </Card>
            )}
            {saved.data?.map((deal) => (
              <DealCard key={deal.id} deal={deal} savedView />
            ))}
          </TabsContent>

          <TabsContent value="matched" className="mt-6 grid gap-5">
            {matched.isLoading && <Skeleton className="h-64 w-full" />}
            {matched.data?.length === 0 && (
              <Card className="border-border bg-card p-6 text-sm text-muted-foreground">
                No accepted matches yet. Founders unlock their data room once they accept you.
              </Card>
            )}
            {matched.data?.map((deal) => (
              <DealCard key={deal.id} deal={deal} matchedView />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function DealCard({
  deal,
  onSave,
  onPass,
  busy,
  savedView,
  matchedView,
}: {
  deal: Deal;
  onSave?: () => void;
  onPass?: () => void;
  busy?: boolean;
  savedView?: boolean;
  matchedView?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{deal.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{deal.one_liner}</p>
          </div>
          <span className="font-display text-lg text-primary">
            {formatMoney(deal.ask_amount)}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{deal.sector}</Badge>
          <Badge variant="secondary">{deal.stage}</Badge>
          {matchedView && <Badge>Matched</Badge>}
        </div>
      </div>

      {deal.videoSignedUrl ? (
        <video
          src={deal.videoSignedUrl}
          controls
          preload="metadata"
          className="aspect-video w-full bg-black"
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center border-y border-border bg-muted/30 text-sm text-muted-foreground">
          No pitch video uploaded yet
        </div>
      )}

      {matchedView && (
        <div className="border-b border-border p-6">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Data room · pitch deck
          </h3>
          {deal.deckSignedUrl ? (
            <>
              <iframe
                src={deal.deckSignedUrl}
                title={`${deal.name} pitch deck`}
                className="mt-3 h-[520px] w-full rounded-lg border border-border bg-muted/20"
              />
              <a
                href={deal.deckSignedUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-primary hover:underline"
              >
                Open deck in a new tab
              </a>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              This founder hasn't uploaded a pitch deck yet.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 p-6">
        {savedView ? (
          <p className="text-xs text-muted-foreground">
            Saved — pitch deck stays private until the founder accepts the match.
          </p>
        ) : matchedView ? (
          <p className="text-xs text-muted-foreground">
            Matched — the founder unlocked their data room for you.
          </p>
        ) : (
          <>
            <Button variant="secondary" onClick={onPass} disabled={busy}>
              Pass
            </Button>
            <Button onClick={onSave} disabled={busy}>
              Save
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

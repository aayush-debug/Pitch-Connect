import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, profileQueryKey } from "@/hooks/use-profile";
import { SECTORS, STAGES } from "@/lib/letspitch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/onboarding/investor")({
  head: () => ({
    meta: [
      { title: "Set your investing preferences — LetsPitch" },
      {
        name: "description",
        content:
          "Choose the sectors, stages and ticket size range you invest in so LetsPitch only shows relevant startups.",
      },
      { property: "og:title", content: "Set your investing preferences — LetsPitch" },
      {
        property: "og:description",
        content: "Choose the sectors, stages and ticket size range you invest in.",
      },
    ],
  }),
  component: InvestorOnboarding,
});

function InvestorOnboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const [investorName, setInvestorName] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [minTicket, setMinTicket] = useState("");
  const [maxTicket, setMaxTicket] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    if (sectors.length === 0 || stages.length === 0) {
      toast.error("Pick at least one sector and one stage");
      return;
    }
    setLoading(true);
    try {
      let investorId = profile.investor?.id;
      if (!investorId) {
        const { data, error } = await supabase
          .from("investors")
          .insert({
            user_id: profile.userId,
            name: investorName || profile.email || "Investor",
          })
          .select("id")
          .single();
        if (error) throw error;
        investorId = data.id;
      }

      const { error: prefError } = await supabase.from("investor_preferences").upsert(
        {
          investor_id: investorId,
          sectors,
          stages,
          min_ticket: minTicket ? Number(minTicket) : null,
          max_ticket: maxTicket ? Number(maxTicket) : null,
        },
        { onConflict: "investor_id" },
      );
      if (prefError) throw prefError;

      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      toast.success("Preferences saved");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your preferences");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-14">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Investor onboarding
        </p>
        <h1 className="mt-2 text-3xl font-bold">Set your thesis</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll only surface startups that fit these filters.
        </p>

        <Card className="mt-8 border-border bg-card p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!profile?.investor && (
              <div className="space-y-2">
                <Label htmlFor="investorName">Your name or fund</Label>
                <Input
                  id="investorName"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  placeholder="Northwind Ventures"
                  required
                />
              </div>
            )}

            <div className="space-y-3">
              <Label>Sectors</Label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={sectors.includes(s)}
                    onClick={() => toggle(sectors, setSectors, s)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Stages</Label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={stages.includes(s)}
                    onClick={() => toggle(stages, setStages, s)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minTicket">Min ticket (USD)</Label>
                <Input
                  id="minTicket"
                  type="number"
                  min="0"
                  step="1000"
                  value={minTicket}
                  onChange={(e) => setMinTicket(e.target.value)}
                  placeholder="25000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTicket">Max ticket (USD)</Label>
                <Input
                  id="maxTicket"
                  type="number"
                  min="0"
                  step="1000"
                  value={maxTicket}
                  onChange={(e) => setMaxTicket(e.target.value)}
                  placeholder="500000"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Save preferences"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary bg-primary/15 text-foreground"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-input"
      }`}
    >
      {label}
    </button>
  );
}

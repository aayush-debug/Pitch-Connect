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
import { Textarea } from "@/components/ui/textarea";
import { PitchFileUpload } from "@/components/pitch-file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/onboarding/founder")({
  head: () => ({
    meta: [
      { title: "Create your startup profile — LetsPitch" },
      {
        name: "description",
        content:
          "Add your startup name, one-liner, sector, stage and raise amount so investors can find you.",
      },
      { property: "og:title", content: "Create your startup profile — LetsPitch" },
      {
        property: "og:description",
        content: "Add your startup name, one-liner, sector, stage and raise amount.",
      },
    ],
  }),
  component: FounderOnboarding,
});

function FounderOnboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const [founderName, setFounderName] = useState("");
  const [name, setName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [sector, setSector] = useState<string>("");
  const [stage, setStage] = useState<string>("");
  const [ask, setAsk] = useState("");
  const [deckPath, setDeckPath] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      let founderId = profile.founder?.id;
      if (!founderId) {
        const { data, error } = await supabase
          .from("founders")
          .insert({
            user_id: profile.userId,
            name: founderName || profile.email || "Founder",
          })
          .select("id")
          .single();
        if (error) throw error;
        founderId = data.id;
      }

      const { error: startupError } = await supabase.from("startups").insert({
        founder_id: founderId,
        name,
        one_liner: oneLiner,
        sector,
        stage,
        ask_amount: ask ? Number(ask) : null,
        deck_url: deckPath,
        video_url: videoPath,
      });
      if (startupError) throw startupError;

      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      toast.success("Startup profile created");
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your startup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-14">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="relative">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Founder onboarding
        </p>
        <h1 className="mt-2 text-3xl font-bold">Create your startup profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is what investors see first. Deck and video uploads come next.
        </p>

        <Card className="mt-8 border-border bg-card p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!profile?.founder && (
              <div className="space-y-2">
                <Label htmlFor="founderName">Your name</Label>
                <Input
                  id="founderName"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  placeholder="Ada Lovelace"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Startup name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Analytical Engines Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oneLiner">One-liner</Label>
              <Textarea
                id="oneLiner"
                value={oneLiner}
                onChange={(e) => setOneLiner(e.target.value)}
                placeholder="We help X do Y without Z."
                rows={3}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Sector</Label>
                <Select value={sector} onValueChange={setSector} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={stage} onValueChange={setStage} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ask">Ask amount (USD)</Label>
              <Input
                id="ask"
                type="number"
                min="0"
                step="1000"
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                placeholder="1500000"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !sector || !stage}>
              {loading ? "Saving…" : "Publish startup profile"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { askDeckQuestion } from "@/lib/pitch-ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

/** Investor-facing async Q&A on a matched startup's data room. */
export function DeckQa({ startupId }: { startupId: string }) {
  const [question, setQuestion] = useState("");
  const queryClient = useQueryClient();
  const ask = useServerFn(askDeckQuestion);

  const history = useQuery({
    queryKey: ["deck-qa", startupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("startup_questions")
        .select("id, question, answer, created_at")
        .eq("startup_id", startupId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: (q: string) => ask({ data: { startupId, question: q } }),
    onSuccess: () => {
      setQuestion("");
      queryClient.invalidateQueries({ queryKey: ["deck-qa", startupId] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not answer that question"),
  });

  return (
    <div className="border-b border-border p-6">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Ask the data room
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Answers come from this startup's deck and founder-provided details only.
      </p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const q = question.trim();
          if (q.length < 3) {
            toast.error("Type a question first");
            return;
          }
          submit.mutate(q);
        }}
      >
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="What's your CAC?"
          disabled={submit.isPending}
        />
        <Button type="submit" size="sm" disabled={submit.isPending}>
          {submit.isPending ? "Reading the deck…" : "Ask"}
        </Button>
      </form>

      <div className="mt-5 grid gap-4">
        {history.isLoading && <Skeleton className="h-16 w-full" />}
        {submit.isPending && <Skeleton className="h-16 w-full" />}
        {history.data?.map((row) => (
          <div key={row.id} className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm font-medium">{row.question}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {row.answer ?? "No answer recorded."}
            </p>
          </div>
        ))}
        {history.isSuccess && history.data.length === 0 && !submit.isPending && (
          <p className="text-sm text-muted-foreground">No questions asked yet.</p>
        )}
      </div>
    </div>
  );
}

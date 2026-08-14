import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { generateDeckSummary } from "@/lib/pitch-ai.functions";
import { Button } from "@/components/ui/button";

type Props = {
  startupId: string;
  hasDeck: boolean;
  summary: string | null;
  status: string | null;
  onDone: () => void;
};

/** Founder-facing view of the AI deck summary, with a regenerate action. */
export function StartupAiSummary({ startupId, hasDeck, summary, status, onDone }: Props) {
  const generate = useServerFn(generateDeckSummary);

  const run = useMutation({
    mutationFn: () => generate({ data: { startupId } }),
    onSuccess: () => {
      toast.success("AI summary updated");
      onDone();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not generate the summary"),
  });

  return (
    <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          AI summary for investors
        </h3>
        {hasDeck && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => run.mutate()}
            disabled={run.isPending}
          >
            {run.isPending ? "Generating…" : summary ? "Regenerate" : "Generate"}
          </Button>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {!hasDeck
          ? "Upload a pitch deck to get an AI summary."
          : run.isPending
            ? "Reading your deck and writing the summary…"
            : (summary ??
              (status === "failed"
                ? "The last attempt failed — try generating it again."
                : "No summary yet."))}
      </p>
    </div>
  );
}

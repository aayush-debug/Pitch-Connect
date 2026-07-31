import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LetsPitch — Founders meet investors, fast" },
      {
        name: "description",
        content:
          "LetsPitch matches founders raising capital with investors by sector, stage and ticket size. Build a startup profile or set your investing preferences in minutes.",
      },
      { property: "og:title", content: "LetsPitch — Founders meet investors, fast" },
      {
        property: "og:description",
        content:
          "Matching founders raising capital with investors by sector, stage and ticket size.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-bold tracking-tight">
          Lets<span className="text-primary">Pitch</span>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth" search={{ mode: "login" }}>
              Log in
            </Link>
          </Button>
          <Button asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Get started
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-3xl px-6 pt-16 pb-20 text-center">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Zap className="size-3.5 text-primary" /> Two-sided fundraising, minus the cold emails
        </p>
        <h1 className="text-5xl leading-[1.05] font-bold sm:text-6xl">
          The pitch room where <span className="text-gradient">capital finds conviction</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Founders publish a sharp one-liner, sector and ask. Investors set the sectors, stages and
          ticket sizes they write. LetsPitch does the introductions.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Join as a founder
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Join as an investor
            </Link>
          </Button>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            icon: Rocket,
            title: "Founders",
            body: "One profile per startup: name, one-liner, sector, stage and the amount you're raising.",
          },
          {
            icon: Target,
            title: "Investors",
            body: "Tell us your thesis once — sectors, stages, ticket range — and review only relevant deals.",
          },
          {
            icon: Zap,
            title: "Matches",
            body: "Every intro has a clear state: pending, matched or passed. No ghosting, no guessing.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title} className="border-border bg-card/70 p-6 backdrop-blur">
            <Icon className="size-5 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}

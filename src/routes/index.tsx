import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  Filter,
  Gauge,
  Handshake,
  LineChart,
  Lock,
  MailX,
  MessageSquare,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, CountUp, MatchBar, DemoTag } from "@/components/landing/reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LetsPitch — Startup discovery matched to your investment thesis" },
      {
        name: "description",
        content:
          "LetsPitch is the operating system for startup–investor deal flow: thesis-based matching, AI startup briefs, founder verification, data rooms and private deal rooms.",
      },
      {
        property: "og:title",
        content: "LetsPitch — Startup discovery matched to your investment thesis",
      },
      {
        property: "og:description",
        content:
          "Discover, evaluate and connect with startups matched to your thesis — without the noise of traditional fundraising.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-display text-xl font-bold text-foreground sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function VerifiedChip({ label, dim = false }: { label: string; dim?: boolean }) {
  return (
    <span
      className={
        dim
          ? "inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] text-muted-foreground"
          : "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
      }
    >
      <BadgeCheck className="size-3.5" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: "#how-it-works", label: "Product" },
  { href: "#founders", label: "For founders" },
  { href: "#investors", label: "For investors" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#vision", label: "About" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-display text-lg font-bold tracking-tight">
          Lets<span className="text-primary">Pitch</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
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

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground sm:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-4 bg-foreground" />
            <span className="block h-0.5 w-4 bg-foreground" />
          </div>
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-6 py-4 sm:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-3 grid gap-2">
            <Button variant="secondary" asChild>
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
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 radial-fade" />

      <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <Reveal>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Zap className="size-3.5 text-primary" /> Two-sided fundraising, minus the cold emails
          </p>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="font-display text-4xl leading-[1.05] font-bold sm:text-6xl">
            The pitch room where <span className="text-gradient">capital finds conviction</span>
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Discover, evaluate and connect with startups matched to your investment thesis — without
            the noise of traditional fundraising.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="glow-ring w-full sm:w-auto" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Join as an investor <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Join as a founder
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Investor access is a paid membership. Founder profiles are free to publish.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mx-auto mt-14 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[
              { icon: Building2, t: "Founders", b: "Publish a structured, verifiable opportunity." },
              { icon: Target, t: "Investors", b: "Define a thesis once — see only what fits." },
              { icon: Handshake, t: "LetsPitch", b: "Matches, evaluates and routes to a deal room." },
            ].map(({ icon: Icon, t, b }) => (
              <div key={t} className="surface-card rounded-xl p-4 text-left">
                <Icon className="size-4 text-primary" />
                <p className="mt-3 text-sm font-semibold">{t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Problem                                                             */
/* ------------------------------------------------------------------ */

function Problem() {
  const items = [
    { icon: MailX, t: "Cold emails", b: "Hundreds sent, a handful opened, almost none relevant." },
    { icon: Filter, t: "Irrelevant pitches", b: "Investors triage inboxes instead of evaluating." },
    { icon: Search, t: "Endless searching", b: "Deal flow lives in spreadsheets, DMs and screenshots." },
    { icon: Gauge, t: "Poor fit", b: "Wrong sector, wrong stage, wrong cheque, wrong time." },
  ];
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel>The problem</SectionLabel>
        <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          Traditional fundraising is a volume game that wastes both sides
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, t, b }, i) => (
          <Reveal key={t} delay={i * 70}>
            <div className="surface-card h-full rounded-xl p-5">
              <Icon className="size-5 text-destructive" />
              <p className="mt-4 font-semibold">{t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{b}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={140}>
        <div className="glow-ring mt-8 rounded-2xl bg-card/60 p-6 sm:p-8">
          <p className="font-display text-2xl font-bold sm:text-3xl">
            LetsPitch changes the equation.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Investors don&apos;t need more deal flow. They need better deal flow. Every startup you
            see is scored against the thesis you defined — and every founder knows exactly who is
            actually looking for what they&apos;re building.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works: Discover / Decide / Deal                              */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: Search,
      t: "Discover",
      b: "Investors define an investment thesis — sector, stage, geography, cheque size, revenue, business model — and LetsPitch surfaces only the startups that fit it.",
    },
    {
      n: "02",
      icon: LineChart,
      t: "Decide",
      b: "Evaluate fast with structured metrics, an AI startup brief, the founder video, the pitch deck and credibility signals — minutes, not weeks.",
    },
    {
      n: "03",
      icon: Handshake,
      t: "Deal",
      b: "Signal interest and move into a private deal room for messaging, document sharing, due diligence and meetings.",
    },
  ];
  return (
    <section id="how-it-works" className="relative border-y border-border/60 bg-card/20">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <SectionLabel>How it works</SectionLabel>
          <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            Discover <span className="text-muted-foreground">→</span> Decide{" "}
            <span className="text-muted-foreground">→</span>{" "}
            <span className="text-gradient">Deal</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map(({ n, icon: Icon, t, b }, i) => (
            <Reveal key={t} delay={i * 90}>
              <div className="surface-card h-full rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <Icon className="size-5 text-primary" />
                  <span className="font-display text-sm text-muted-foreground">{n}</span>
                </div>
                <p className="mt-5 font-display text-xl font-bold">{t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Preferences engine + matching                                       */
/* ------------------------------------------------------------------ */

const THESIS = [
  ["Industry", "SaaS"],
  ["Stage", "Seed"],
  ["Geography", "India"],
  ["Business model", "B2B"],
  ["Cheque size", "₹25L – ₹1Cr"],
  ["Revenue", "₹5L+ MRR"],
  ["Growth", "10%+ MoM"],
  ["Risk appetite", "Moderate"],
];

const MATCH_REASONS = [
  "Sector match",
  "Stage match",
  "Geography match",
  "Cheque size match",
  "Business model match",
];

function MatchingEngine() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel>Investor preferences engine</SectionLabel>
        <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          Define your thesis once. See only what fits it.
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Twelve preference dimensions — from industry and stage to revenue range, risk appetite and
          founder profile — turn your mandate into a filter that runs continuously.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal>
          <div className="surface-card h-full rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-bold">Investment thesis</p>
              <DemoTag />
            </div>
            <dl className="mt-5 divide-y divide-border/70">
              {THESIS.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-semibold text-primary">
                <CountUp to={12} /> startups match your thesis
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="surface-card h-full rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold">FINTECHOS</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Compliance infrastructure for India&apos;s next generation of financial companies.
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-primary">
                  <CountUp to={92} suffix="%" />
                </p>
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Match</p>
              </div>
            </div>

            <MatchBar value={92} className="mt-5" />

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {MATCH_REASONS.map((reason, i) => (
                <Reveal as="li" key={reason} delay={i * 60}>
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    {reason}
                  </span>
                </Reveal>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/70 pt-5 sm:grid-cols-4">
              <Stat label="Stage" value="Seed" />
              <Stat label="Geography" value="India" />
              <Stat label="Raising" value="₹75L" />
              <Stat label="Revenue" value="₹8L MRR" />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <DemoTag>Demo company</DemoTag>
              <span className="text-xs text-muted-foreground">Match scoring in preview</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Startup discovery cards                                             */
/* ------------------------------------------------------------------ */

type DemoStartup = {
  name: string;
  initials: string;
  line: string;
  industry: string;
  stage: string;
  geo: string;
  raising: string;
  revenue: string;
  growth: string;
  team: string;
  match: number;
  badges: string[];
};

const DEMO_STARTUPS: DemoStartup[] = [
  {
    name: "FINTECHOS",
    initials: "FO",
    line: "Compliance infrastructure for India's next generation of financial companies.",
    industry: "Fintech",
    stage: "Seed",
    geo: "India",
    raising: "₹50L – ₹1Cr",
    revenue: "₹8L MRR",
    growth: "+21% MoM",
    team: "11 people",
    match: 92,
    badges: ["Verified Founder", "Company Verified", "Revenue Verified"],
  },
  {
    name: "GRIDLOOP",
    initials: "GL",
    line: "Battery analytics that squeeze 18% more life out of commercial storage fleets.",
    industry: "Climate",
    stage: "Seed",
    geo: "India",
    raising: "₹60L",
    revenue: "₹4.2L MRR",
    growth: "+14% MoM",
    team: "7 people",
    match: 81,
    badges: ["Verified Founder", "Company Verified"],
  },
  {
    name: "CLINQ",
    initials: "CQ",
    line: "Revenue-cycle automation for multi-clinic healthcare groups.",
    industry: "Healthtech",
    stage: "Pre-seed",
    geo: "India",
    raising: "₹35L",
    revenue: "₹1.8L MRR",
    growth: "+31% MoM",
    team: "5 people",
    match: 74,
    badges: ["Verified Founder"],
  },
];

function StartupCard({ s }: { s: DemoStartup }) {
  return (
    <div className="surface-card flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-sm font-bold text-primary">
          {s.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display truncate font-bold">{s.name}</p>
            <span className="font-display text-sm font-bold text-primary">{s.match}%</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{s.line}</p>
        </div>
      </div>

      <MatchBar value={s.match} className="mt-4" />

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{s.industry}</Badge>
        <Badge variant="secondary">{s.stage}</Badge>
        <Badge variant="secondary">{s.geo}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Stat label="Funding sought" value={s.raising} />
        <Stat label="Revenue" value={s.revenue} />
        <Stat label="Growth" value={s.growth} />
        <Stat label="Team" value={s.team} />
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {s.badges.map((b) => (
          <VerifiedChip key={b} label={b} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border/70 pt-4">
        <Button size="sm" asChild>
          <Link to="/auth" search={{ mode: "signup" }}>
            Interested
          </Link>
        </Button>
        <Button size="sm" variant="secondary" asChild>
          <Link to="/auth" search={{ mode: "signup" }}>
            View startup
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/auth" search={{ mode: "signup" }}>
            Save
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/auth" search={{ mode: "signup" }}>
            Pass
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Discovery() {
  return (
    <section className="border-y border-border/60 bg-card/20">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel>Startup discovery</SectionLabel>
              <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
                A feed built for judgement, not scrolling
              </h2>
            </div>
            <DemoTag>Demo companies — illustrative data</DemoTag>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DEMO_STARTUPS.map((s, i) => (
            <Reveal key={s.name} delay={i * 90}>
              <StartupCard s={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* AI brief + founder video + deck                                     */
/* ------------------------------------------------------------------ */

function QuickView() {
  const metrics = [
    ["Revenue", "₹8L MRR"],
    ["Growth", "+21% MoM"],
    ["Customers", "126"],
    ["Funding sought", "₹75L"],
    ["Runway", "14 months"],
  ];
  const chapters = [
    ["0:00", "Problem"],
    ["2:00", "Solution"],
    ["4:00", "Product"],
    ["6:00", "Traction"],
    ["8:00", "Business model"],
    ["9:00", "Team"],
    ["10:00", "Funding ask"],
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel>Evaluate in 60 seconds</SectionLabel>
        <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          The AI brief first. The ten-minute video when it earns your time.
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="surface-card h-full rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 font-display text-lg font-bold">
                <Sparkles className="size-4 text-primary" /> AI brief
              </p>
              <DemoTag>Demo</DemoTag>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              FINTECHOS sells compliance infrastructure to Indian fintechs that must file with
              multiple regulators. The product replaces spreadsheet-driven reporting with automated
              controls and audit trails. It serves 126 paying customers at ₹8L MRR, growing 21%
              month over month, and is raising ₹75L to expand its integrations team. Key risks:
              regulatory dependency and concentration in early-stage customers.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/70 pt-5 sm:grid-cols-3">
              {metrics.map(([k, v]) => (
                <Stat key={k} label={k} value={v} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {["What it does", "Market", "Business model", "Traction", "Team", "Key risks"].map(
                (t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ),
              )}
            </div>

            <p className="mt-5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              AI-generated analysis. Informational only — not financial advice, and no substitute
              for your own diligence.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="surface-card h-full rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 font-display text-lg font-bold">
                <Video className="size-4 text-primary" /> Founder pitch — 09:42
              </p>
              <DemoTag>Demo</DemoTag>
            </div>

            <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-border bg-background">
              <div className="absolute inset-0 bg-grid opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="glow-ring flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Play className="size-5" />
                </span>
              </div>
              <div className="absolute right-4 bottom-4 left-4">
                <div className="h-1 rounded-full bg-muted">
                  <div className="h-1 w-1/3 rounded-full bg-primary" />
                </div>
              </div>
            </div>

            <ul className="mt-5 grid gap-1.5 sm:grid-cols-2">
              {chapters.map(([time, label]) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  <span className="font-display w-12 text-xs text-muted-foreground">{time}</span>
                  <span className="text-foreground">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-2 border-t border-border/70 pt-5 sm:grid-cols-2">
              {[
                { icon: FileText, t: "Pitch deck viewer" },
                { icon: LineChart, t: "Financial summary" },
                { icon: Play, t: "Product demo" },
                { icon: Building2, t: "Company & market" },
              ].map(({ icon: Icon, t }) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground"
                >
                  <Icon className="size-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Read documents in-browser — no downloads required to understand a company.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Verification                                                        */
/* ------------------------------------------------------------------ */

function Verification() {
  const badges = [
    { label: "Identity Verified", live: true },
    { label: "Company Verified", live: false },
    { label: "Founder Verified", live: true },
    { label: "Revenue Verified", live: false },
    { label: "Product Verified", live: false },
    { label: "Traction Verified", live: false },
  ];
  return (
    <section className="border-y border-border/60 bg-card/20">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal>
            <SectionLabel>Trust &amp; verification</SectionLabel>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Credibility signals, never claims
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              A badge appears only once the underlying information has actually been checked.
              Unverified fields stay visibly unverified — that honesty is what makes the verified
              ones worth something.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-3">
              <ShieldCheck className="size-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Identity and founder checks are live. Company, revenue, product and traction
                verification are in build.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="surface-card rounded-2xl p-6">
              <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                Verification status
              </p>
              <ul className="mt-4 space-y-2.5">
                {badges.map((b, i) => (
                  <Reveal as="li" key={b.label} delay={i * 60}>
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
                      <VerifiedChip label={b.label} dim={!b.live} />
                      <span className="text-xs text-muted-foreground">
                        {b.live ? "Available" : "Coming soon"}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Data room + deal room                                               */
/* ------------------------------------------------------------------ */

function Rooms() {
  const docs = [
    ["Pitch deck", "Available"],
    ["Financial statements", "Available"],
    ["Cap table", "On request"],
    ["Legal documents", "On request"],
    ["Company registration", "Verified"],
    ["Customer metrics", "Available"],
    ["Product information", "Available"],
    ["Market research", "Available"],
    ["Founder information", "Verified"],
  ];
  const dealTabs = ["Messages", "Documents", "Due diligence", "Meetings", "Financials", "Deal info"];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel>Data room &amp; deal room</SectionLabel>
        <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          Interest becomes a process, not an email thread
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="surface-card h-full rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 font-display text-lg font-bold">
                <Lock className="size-4 text-primary" /> Secure data room
              </p>
              <DemoTag>Preview</DemoTag>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Access unlocks only when the founder accepts your interest. You always see what exists
              before you ask for it.
            </p>
            <ul className="mt-5 divide-y divide-border/70">
              {docs.map(([name, state]) => (
                <li key={name} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <FileText className="size-4 text-muted-foreground" />
                    {name}
                  </span>
                  <span
                    className={
                      state === "Verified"
                        ? "text-xs font-medium text-primary"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="surface-card h-full rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-bold">FINTECHOS × Investor</p>
              <DemoTag>Preview</DemoTag>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {dealTabs.map((t, i) => (
                <span
                  key={t}
                  className={
                    i === 0
                      ? "rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                      : "rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground"
                  }
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">Founder</p>
                <p className="mt-1 text-sm">
                  Happy to walk through the compliance roadmap and unit economics this week.
                </p>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <p className="text-xs text-primary">You</p>
                <p className="mt-1 text-sm">
                  Sharing our diligence checklist — starting with cohort retention.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                { icon: CalendarClock, t: "Request meeting" },
                { icon: MessageSquare, t: "Send message" },
                { icon: FileText, t: "View data room" },
                { icon: ShieldCheck, t: "Start due diligence" },
              ].map(({ icon: Icon, t }) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground"
                >
                  <Icon className="size-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Deal rooms are in preview. Today, accepted matches unlock the deck and a private Q&amp;A
              with the founder.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Investor transparency                                               */
/* ------------------------------------------------------------------ */

function InvestorTransparency() {
  const rows = [
    ["Sectors", "SaaS · Fintech · Climate"],
    ["Preferred stages", "Pre-seed · Seed"],
    ["Typical cheque", "₹25L – ₹1Cr"],
    ["Geography", "India"],
    ["Investments", "18"],
    ["Recent activity", "3 in the last quarter"],
    ["Avg. response time", "36 hours"],
  ];
  return (
    <section className="border-y border-border/60 bg-card/20">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>Investor transparency</SectionLabel>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Founders get to qualify investors too
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Before spending a week on diligence, a founder can see the mandate, cheque range,
              activity level and typical response time of the person on the other side.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="surface-card rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-sm font-bold text-primary">
                    AV
                  </div>
                  <div>
                    <p className="font-display font-bold">Anchor Ventures</p>
                    <p className="text-xs text-muted-foreground">Early-stage · India</p>
                  </div>
                </div>
                <DemoTag>Demo profile</DemoTag>
              </div>

              <dl className="mt-5 divide-y divide-border/70">
                {rows.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-4 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                Illustrative figures for a fictional firm — not real investment statistics.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Syndicates                                                          */
/* ------------------------------------------------------------------ */

function Syndicates() {
  const participants = [
    ["Lead investor", "₹75L", 100],
    ["Investor 2", "₹25L", 33],
    ["Investor 3", "₹20L", 27],
    ["Investor 4", "₹15L", 20],
    ["Investor 5", "₹10L", 13],
  ] as const;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <SectionLabel>On the roadmap</SectionLabel>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Invest together. Build stronger rounds.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Syndicates let a lead investor set terms and allow others to join the same round on the
            platform. This is a planned expansion of LetsPitch — the interface below is a concept
            preview, not a live feature.
          </p>
          <Badge variant="secondary" className="mt-5">
            Coming soon
          </Badge>
        </Reveal>

        <Reveal delay={100}>
          <div className="surface-card rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Startup is raising</p>
                <p className="font-display text-2xl font-bold">₹2Cr</p>
              </div>
              <DemoTag>Concept preview</DemoTag>
            </div>

            <ul className="mt-6 space-y-3">
              {participants.map(([label, amount, width], i) => (
                <Reveal as="li" key={label} delay={i * 70}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={i === 0 ? "font-medium text-primary" : "text-muted-foreground"}>
                      {label}
                    </span>
                    <span className="font-medium">{amount}</span>
                  </div>
                  <MatchBar value={width} className="mt-1.5" />
                </Reveal>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
              <span className="text-sm text-muted-foreground">Total committed</span>
              <span className="font-display text-xl font-bold text-primary">₹1.45Cr</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Audience sections                                                   */
/* ------------------------------------------------------------------ */

function Audiences() {
  return (
    <section className="border-y border-border/60 bg-card/20">
      <div className="mx-auto grid max-w-6xl gap-4 px-6 py-20 sm:py-28 lg:grid-cols-2">
        <Reveal>
          <div id="founders" className="surface-card h-full scroll-mt-24 rounded-2xl p-7">
            <Building2 className="size-5 text-primary" />
            <h2 className="mt-5 font-display text-2xl font-bold">For founders</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Get discovered by investors who are actually looking for what you&apos;re building.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Publish one structured profile instead of a hundred cold emails",
                "Add a founder video and pitch deck investors can read in-browser",
                "Control who unlocks your data room — you accept every match",
                "See each investor's mandate before you spend time on them",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-7" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Join as a founder <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div id="investors" className="surface-card h-full scroll-mt-24 rounded-2xl p-7">
            <Users className="size-5 text-primary" />
            <h2 className="mt-5 font-display text-2xl font-bold">For investors</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Stop searching through noise. Discover startups matched to your thesis.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "A thesis-scored feed — sector, stage, geography, cheque, revenue",
                "AI briefs and structured metrics so a first pass takes a minute",
                "Verification signals that separate substance from storytelling",
                "Private deal rooms for messaging, documents and diligence",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
            <Button className="glow-ring mt-7" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Join as an investor <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Vision + final CTA + footer                                         */
/* ------------------------------------------------------------------ */

const PIPELINE = [
  "Discovery",
  "Matching",
  "Evaluation",
  "Verification",
  "Communication",
  "Due diligence",
  "Deal room",
  "Syndication",
];

function Vision() {
  return (
    <section id="vision" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <Reveal>
        <SectionLabel>The vision</SectionLabel>
        <h2 className="max-w-3xl font-display text-3xl font-bold sm:text-4xl">
          LetsPitch is the infrastructure connecting startups with the{" "}
          <span className="text-gradient">right capital</span>
        </h2>
      </Reveal>

      <div className="mt-10 flex flex-wrap gap-2">
        {PIPELINE.map((step, i) => (
          <Reveal key={step} delay={i * 60}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">
              <span className="font-display text-xs text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              {step}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border/60">
      <div className="pointer-events-none absolute inset-0 radial-fade" />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <Reveal>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            Don&apos;t pitch everyone.
            <br />
            <span className="text-gradient">Pitch the right investor.</span>
          </h2>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="glow-ring w-full sm:w-auto" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
              <Link to="/auth" search={{ mode: "login" }}>
                Log in
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display font-bold">
            Lets<span className="text-primary">Pitch</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Startups, investors and the process between them.
          </p>
        </div>
        <p className="max-w-md text-xs text-muted-foreground">
          Companies, metrics and investor profiles shown on this page are fictional demo data used
          to illustrate the product. Nothing here is financial advice or an offer to invest.
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <MatchingEngine />
        <Discovery />
        <QuickView />
        <Verification />
        <Rooms />
        <InvestorTransparency />
        <Syndicates />
        <Audiences />
        <Vision />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

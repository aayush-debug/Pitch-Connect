import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { useProfile, hasActiveSubscription, profileQueryKey } from "@/hooks/use-profile";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  MONTHLY_PLAN,
} from "@/lib/razorpay.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/subscribe")({
  head: () => ({
    meta: [
      { title: "Investor membership — LetsPitch" },
      {
        name: "description",
        content:
          "Subscribe to the LetsPitch investor membership for unlimited access to the curated startup discovery feed.",
      },
      { property: "og:title", content: "Investor membership — LetsPitch" },
      {
        property: "og:description",
        content: "One monthly plan for unlimited access to vetted startup deal flow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Subscribe,
});

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PERKS = [
  "Unlimited access to the startup discovery feed",
  "Filtered to your sectors, stages and ticket range",
  "Watch founder pitch videos in-app",
  "Save startups and unlock data rooms on match",
];

function Subscribe() {
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const createOrder = useServerFn(createSubscriptionOrder);
  const verifyPayment = useServerFn(verifySubscriptionPayment);

  const investor = profile?.investor ?? null;
  const expired = investor?.subscription_status === "expired" || 
    (investor?.subscription_status === "active" && !hasActiveSubscription(investor));

  const pay = useMutation({
    mutationFn: async () => {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load the payment window. Check your connection.");

      const order = await createOrder({});

      await new Promise<void>((resolve, reject) => {
        const RazorpayCtor = (
          window as unknown as {
            Razorpay: new (options: Record<string, unknown>) => { open: () => void };
          }
        ).Razorpay;

        const rzp = new RazorpayCtor({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "LetsPitch",
          description: "Investor membership — monthly",
          order_id: order.orderId,
          prefill: { name: order.investorName, email: profile?.email ?? undefined },
          theme: { color: "#c2f542" },
          handler: (response: RazorpayResponse) => {
            verifyPayment({
              data: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            })
              .then(() => resolve())
              .catch(reject);
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        });
        rzp.open();
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      toast.success("You're subscribed — welcome to the deal flow.");
      navigate({ to: "/discover" });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Payment could not be completed"),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-14">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-72 w-full" />
      </main>
    );
  }

  if (!investor) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="text-2xl font-bold">Investors only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Memberships are for investor accounts.{" "}
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
      <div className="relative mx-auto max-w-2xl px-6 py-14">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Membership</p>
        <h1 className="mt-1 text-3xl font-bold">
          {expired ? "Your membership expired" : "Unlock the deal flow"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {expired
            ? "Renew to get back into the discovery feed. Everything you saved and matched is still here, waiting."
            : "One simple monthly plan. Cancel any time — more tiers coming soon."}
        </p>

        <Card className="mt-8 border-border bg-card p-8">
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl font-bold text-primary">
              {MONTHLY_PLAN.label}
            </span>
            <span className="pb-1 text-sm text-muted-foreground">/ {MONTHLY_PLAN.period}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Investor membership · billed monthly</p>

          <ul className="mt-6 grid gap-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <Button
            className="mt-8 w-full"
            size="lg"
            onClick={() => pay.mutate()}
            disabled={pay.isPending}
          >
            {pay.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Opening checkout…
              </>
            ) : expired ? (
              "Renew membership"
            ) : (
              "Subscribe now"
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secure payment via Razorpay (test mode).
          </p>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="secondary" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

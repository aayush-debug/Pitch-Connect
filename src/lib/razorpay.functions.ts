import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const MONTHLY_PLAN = {
  amount: 299900, // paise
  currency: "INR",
  label: "₹2,999",
  period: "month",
} as const;

function basicAuth(keyId: string, keySecret: string) {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

async function hmacSha256Hex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Public: the browser needs the key id to open Razorpay Checkout. */
export const getRazorpayConfig = createServerFn({ method: "GET" }).handler(async () => {
  const keyId = process.env["RAZORPAY_KEY_ID"] ?? null;
  return {
    keyId,
    amount: MONTHLY_PLAN.amount,
    currency: MONTHLY_PLAN.currency,
  };
});

export const createSubscriptionOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Payments are not configured yet.");

    const { data: investor, error } = await context.supabase
      .from("investors")
      .select("id, name")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!investor) throw new Error("Only investor accounts can subscribe.");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: basicAuth(keyId, keySecret),
      },
      body: JSON.stringify({
        amount: MONTHLY_PLAN.amount,
        currency: MONTHLY_PLAN.currency,
        receipt: `inv_${investor.id.slice(0, 8)}_${Date.now()}`,
        notes: { investor_id: investor.id },
      }),
    });

    if (!res.ok) {
      console.error("Razorpay order failed", res.status, await res.text());
      throw new Error("Could not start the payment. Please try again.");
    }

    const order = (await res.json()) as { id: string; amount: number; currency: string };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insertError } = await supabaseAdmin.from("investor_payments").insert({
      investor_id: investor.id,
      order_id: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      status: "created",
    });
    if (insertError) throw insertError;

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      investorName: investor.name,
    };
  });

export const verifySubscriptionPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string; paymentId: string; signature: string }) => {
    if (!data?.orderId || !data?.paymentId || !data?.signature) {
      throw new Error("Missing payment details");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) throw new Error("Payments are not configured yet.");

    const expected = await hmacSha256Hex(keySecret, `${data.orderId}|${data.paymentId}`);
    if (expected !== data.signature) throw new Error("Payment could not be verified.");

    const { data: investor, error } = await context.supabase
      .from("investors")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!investor) throw new Error("Only investor accounts can subscribe.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("investor_payments")
      .select("id, investor_id, status")
      .eq("order_id", data.orderId)
      .maybeSingle();
    if (paymentError) throw paymentError;
    if (!payment || payment.investor_id !== investor.id) {
      throw new Error("Payment record not found for this account.");
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await supabaseAdmin
      .from("investor_payments")
      .update({ payment_id: data.paymentId, status: "paid" })
      .eq("id", payment.id);

    const { error: updateError } = await supabaseAdmin
      .from("investors")
      .update({
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", investor.id);
    if (updateError) throw updateError;

    return { subscriptionExpiresAt: expiresAt.toISOString() };
  });

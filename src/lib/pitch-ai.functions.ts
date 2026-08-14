import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Generates the investor-facing AI summary for a startup from its uploaded deck.
 * Callable by the founder who owns the startup.
 */
export const generateDeckSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { startupId: string }) => {
    if (!data?.startupId) throw new Error("Missing startup id");
    return data;
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env["HUGGINGFACE_API_KEY"];
    if (!apiKey) throw new Error("AI summaries are not configured yet.");

    const { data: startup, error } = await context.supabase
      .from("startups")
      .select("id, name, one_liner, sector, stage, ask_amount, deck_url, founder_id")
      .eq("id", data.startupId)
      .maybeSingle();
    if (error) throw error;
    if (!startup) throw new Error("Startup not found.");

    const { data: founder, error: founderError } = await context.supabase
      .from("founders")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (founderError) throw founderError;
    if (!founder || founder.id !== startup.founder_id) {
      throw new Error("Only the founder of this startup can generate its summary.");
    }
    if (!startup.deck_url) throw new Error("Upload a pitch deck first.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const {
      extractPdfText,
      chat,
      SUMMARY_SYSTEM_PROMPT,
      buildMaterials,
    } = await import("./pitch-ai.server");

    await supabaseAdmin
      .from("startups")
      .update({ ai_summary_status: "generating" })
      .eq("id", startup.id);

    try {
      const download = await supabaseAdmin.storage.from("decks").download(startup.deck_url);
      if (download.error || !download.data) {
        throw new Error("Could not read the uploaded deck.");
      }
      const deckText = await extractPdfText(new Uint8Array(await download.data.arrayBuffer()));
      if (deckText.length < 40) {
        throw new Error(
          "We couldn't read any text from that PDF — it may be a scanned image deck.",
        );
      }

      await supabaseAdmin
        .from("startup_deck_text")
        .upsert({ startup_id: startup.id, content: deckText }, { onConflict: "startup_id" });

      const summary = await chat(apiKey, [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${buildMaterials({ ...startup, deckText })}\n\nWrite the summary now.`,
        },
      ]);

      const { error: updateError } = await supabaseAdmin
        .from("startups")
        .update({ ai_summary: summary, ai_summary_status: "ready" })
        .eq("id", startup.id);
      if (updateError) throw updateError;

      return { summary };
    } catch (err) {
      await supabaseAdmin
        .from("startups")
        .update({ ai_summary_status: "failed" })
        .eq("id", startup.id);
      throw err;
    }
  });

/**
 * Answers an investor question grounded only in the deck text and founder-provided fields.
 * Callable by an investor the founder has already matched with.
 */
export const askDeckQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { startupId: string; question: string }) => {
    const question = data?.question?.trim() ?? "";
    if (!data?.startupId) throw new Error("Missing startup id");
    if (question.length < 3) throw new Error("Please type a question first.");
    if (question.length > 500) throw new Error("Please keep the question under 500 characters.");
    return { startupId: data.startupId, question };
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env["HUGGINGFACE_API_KEY"];
    if (!apiKey) throw new Error("AI answers are not configured yet.");

    const { data: investor, error: investorError } = await context.supabase
      .from("investors")
      .select("id, subscription_status, subscription_expires_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (investorError) throw investorError;
    if (!investor) throw new Error("Only investor accounts can ask questions.");

    const activeSubscription =
      investor.subscription_status === "active" &&
      !!investor.subscription_expires_at &&
      new Date(investor.subscription_expires_at).getTime() > Date.now();
    if (!activeSubscription) throw new Error("An active membership is required.");

    const { data: match, error: matchError } = await context.supabase
      .from("matches")
      .select("id")
      .eq("startup_id", data.startupId)
      .eq("investor_id", investor.id)
      .eq("status", "matched")
      .maybeSingle();
    if (matchError) throw matchError;
    if (!match) throw new Error("The data room opens once the founder accepts your interest.");

    const { data: startup, error: startupError } = await context.supabase
      .from("startups")
      .select("id, name, one_liner, sector, stage, ask_amount")
      .eq("id", data.startupId)
      .maybeSingle();
    if (startupError) throw startupError;
    if (!startup) throw new Error("Startup not found.");

    const { data: deckRow, error: deckError } = await context.supabase
      .from("startup_deck_text")
      .select("content")
      .eq("startup_id", data.startupId)
      .maybeSingle();
    if (deckError) throw deckError;

    const { chat, QA_SYSTEM_PROMPT, buildMaterials } = await import("./pitch-ai.server");

    const answer = await chat(
      apiKey,
      [
        { role: "system", content: QA_SYSTEM_PROMPT },
        {
          role: "user",
          content: `${buildMaterials({ ...startup, deckText: deckRow?.content ?? null })}\n\nInvestor question: ${data.question}`,
        },
      ],
      300,
    );

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: insertError } = await supabaseAdmin
      .from("startup_questions")
      .insert({
        startup_id: startup.id,
        investor_id: investor.id,
        question: data.question,
        answer,
        status: "answered",
      })
      .select("id, question, answer, created_at")
      .single();
    if (insertError) throw insertError;

    return row;
  });

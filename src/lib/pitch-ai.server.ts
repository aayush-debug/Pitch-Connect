/**
 * Server-only helpers for the pitch-deck AI features.
 * Text extraction runs locally; generation goes to open-source models on
 * Hugging Face's OpenAI-compatible inference router.
 */

const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";

/** Open-source instruct models, tried in order. */
const MODELS = [
  "Qwen/Qwen2.5-72B-Instruct",
  "meta-llama/Llama-3.3-70B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
];

export const MAX_DECK_CHARS = 24000;

export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: true });
  return String(text ?? "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_DECK_CHARS);
}

export async function chat(
  apiKey: string,
  messages: Array<{ role: "system" | "user"; content: string }>,
  maxTokens = 400,
): Promise<string> {
  let lastError = "";

  for (const model of MODELS) {
    const res = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.2,
        stream: false,
      }),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (text) return text;
      lastError = "The model returned an empty response.";
      continue;
    }

    lastError = `${res.status} ${await res.text()}`;
    console.error(`[pitch-ai] ${model} failed:`, lastError);

    if (res.status === 401 || res.status === 403) {
      throw new Error("The AI credentials were rejected. Check the Hugging Face token.");
    }
    if (res.status === 429) {
      throw new Error("The AI service is rate limited right now — please try again shortly.");
    }
  }

  throw new Error(`AI request failed. ${lastError.slice(0, 200)}`);
}

export const SUMMARY_SYSTEM_PROMPT = [
  "You write concise, factual summaries of startup pitch decks for investors.",
  "Write 3 to 4 plain sentences covering, in order: the problem, the solution,",
  "the market, and the raise/ask. Use only facts present in the provided material.",
  "If something is missing, skip it rather than inventing it. No headings, no bullet",
  "points, no preamble — just the sentences.",
].join(" ");

export const QA_SYSTEM_PROMPT = [
  "You answer investor questions about a startup strictly from the supplied materials",
  "(pitch deck text and founder-provided profile fields).",
  'If the materials do not contain the answer, reply exactly: "Not specified in the materials."',
  "Never guess, estimate, extrapolate, or use outside knowledge.",
  "Answer in at most 3 sentences and quote figures exactly as they appear.",
].join(" ");

export function buildMaterials(input: {
  name: string;
  one_liner: string;
  sector: string;
  stage: string;
  ask_amount: number | null;
  deckText: string | null;
}) {
  return [
    "FOUNDER-PROVIDED PROFILE",
    `Startup name: ${input.name}`,
    `One-liner: ${input.one_liner}`,
    `Sector: ${input.sector}`,
    `Stage: ${input.stage}`,
    `Ask amount (USD): ${input.ask_amount ?? "not specified"}`,
    "",
    "PITCH DECK TEXT",
    input.deckText?.trim() ? input.deckText : "(no pitch deck text available)",
  ].join("\n");
}

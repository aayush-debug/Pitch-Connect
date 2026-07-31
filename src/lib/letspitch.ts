export const SECTORS = [
  "AI / ML",
  "Fintech",
  "Healthtech",
  "Climate",
  "SaaS",
  "Marketplace",
  "Consumer",
  "Deeptech",
] as const;

export const STAGES = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Growth",
] as const;

export type UserRole = "founder" | "investor";

export function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

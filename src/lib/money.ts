export const HQ = {
  code: "HQ$",
  decimals: 2,
} as const;

export function formatHqCents(cents: number) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);

  const value = abs / 100;
  const formatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${sign}${HQ.code} ${formatted}`;
}

/**
 * - "10,50"
 * - "10.50"
 * - "1.234,56"
 * - "HQ$ 10,50"
 * - "hq$10,50"
 * Rejeita valores <= 0
 */
export function parseHqToCents(input: string) {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  const cleaned = raw.replace(/hq\$/gi, "").trim();

  const safe = cleaned.replace(/[^\d.,-]/g, "");
  if (!safe) return null;

  const hasComma = safe.includes(",");
  const hasDot = safe.includes(".");

  let normalized = safe;

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  } else {
  }

  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;

  const cents = Math.round(num * 100);

  return cents;
}

export function assertValidCents(v: number) {
  if (!Number.isInteger(v)) throw new Error("amount_cents must be an integer");
}

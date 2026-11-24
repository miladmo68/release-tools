import type { FinanceTerms } from "./types";

export const TERMS = [36, 48, 60, 72] as const;
export const DEFAULT_TERMS: FinanceTerms = { down: 3000, months: 60, apr: 5.9, tradeIn: 0 };

export function financed(price: number, t: FinanceTerms): number {
  return Math.max(0, price - t.down - t.tradeIn);
}

/** Standard amortised monthly payment. */
export function monthlyPayment(price: number, t: FinanceTerms): number {
  const principal = financed(price, t);
  if (principal === 0) return 0;
  const r = t.apr / 100 / 12;
  if (r === 0) return principal / t.months;
  return (principal * r) / (1 - Math.pow(1 + r, -t.months));
}

export function totalInterest(price: number, t: FinanceTerms): number {
  return Math.max(0, monthlyPayment(price, t) * t.months - financed(price, t));
}

export function money(n: number): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);
}

export function clampTerms(t: FinanceTerms, price: number): FinanceTerms {
  return { ...t, down: Math.min(Math.max(0, t.down), price), tradeIn: Math.min(Math.max(0, t.tradeIn), price), apr: Math.min(Math.max(0, t.apr), 19.9) };
}

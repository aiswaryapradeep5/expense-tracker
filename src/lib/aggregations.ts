import { parseISO } from "date-fns";
import type { Transaction } from "./expense-store";
import { CATEGORIES, getCategory } from "./categories";

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export function totalsFor(txs: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

export function inMonth(t: Transaction, year: number, month: number) {
  const d = parseISO(t.date);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function inYear(t: Transaction, year: number) {
  return parseISO(t.date).getFullYear() === year;
}

export interface MonthlyPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export function monthlyBreakdown(txs: Transaction[], year: number): MonthlyPoint[] {
  const months: MonthlyPoint[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    return {
      key: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      income: 0,
      expense: 0,
      net: 0,
    };
  });
  for (const t of txs) {
    const d = parseISO(t.date);
    if (d.getFullYear() !== year) continue;
    const m = months[d.getMonth()];
    if (t.type === "income") m.income += t.amount;
    else m.expense += t.amount;
  }
  for (const m of months) m.net = m.income - m.expense;
  return months;
}

export interface CategorySlice {
  categoryId: string;
  name: string;
  emoji: string;
  color: string;
  value: number;
  pct: number;
}

export function categoryBreakdown(
  txs: Transaction[],
  type: "income" | "expense",
): CategorySlice[] {
  const map = new Map<string, number>();
  let total = 0;
  for (const t of txs) {
    if (t.type !== type) continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    total += t.amount;
  }
  const slices: CategorySlice[] = [];
  for (const [categoryId, value] of map) {
    const c = getCategory(categoryId);
    slices.push({
      categoryId,
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      value,
      pct: total > 0 ? value / total : 0,
    });
  }
  return slices.sort((a, b) => b.value - a.value);
}

export function listYears(txs: Transaction[]): number[] {
  const set = new Set<number>();
  set.add(new Date().getFullYear());
  for (const t of txs) set.add(parseISO(t.date).getFullYear());
  return Array.from(set).sort((a, b) => b - a);
}

export const ALL_CATEGORIES = CATEGORIES;
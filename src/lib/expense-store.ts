import { useSyncExternalStore } from "react";
import type { TxType } from "./categories";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // ISO YYYY-MM-DD
  createdAt: number;
}

const STORAGE_KEY = "expense-tracker::transactions::v1";
const listeners = new Set<() => void>();
let state: Transaction[] = [];
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw) as Transaction[];
    else state = seed();
  } catch {
    state = [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function seed(): Transaction[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const mk = (
    daysAgo: number,
    type: TxType,
    amount: number,
    categoryId: string,
    note: string,
  ): Transaction => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      id: crypto.randomUUID(),
      type,
      amount,
      categoryId,
      note,
      date: iso(d),
      createdAt: d.getTime(),
    };
  };
  return [
    mk(1, "expense", 42.5, "food", "Groceries"),
    mk(2, "expense", 18, "transport", "Metro pass"),
    mk(3, "expense", 120, "shopping", "New shoes"),
    mk(5, "expense", 65, "entertainment", "Concert tickets"),
    mk(8, "expense", 950, "housing", "Rent"),
    mk(10, "expense", 85, "utilities", "Electricity"),
    mk(12, "expense", 30, "food", "Dinner out"),
    mk(15, "income", 3200, "salary", "Monthly salary"),
    mk(20, "income", 450, "freelance", "Logo design"),
    mk(40, "income", 3200, "salary", "Monthly salary"),
    mk(45, "expense", 950, "housing", "Rent"),
    mk(50, "expense", 210, "food", "Groceries"),
    mk(55, "expense", 75, "transport", "Fuel"),
    mk(70, "income", 3200, "salary", "Monthly salary"),
    mk(80, "expense", 320, "travel", "Weekend trip"),
  ];
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  hydrate();
  return state;
}

function getServerSnapshot(): Transaction[] {
  return [];
}

export function useTransactions() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const txActions = {
  add(input: Omit<Transaction, "id" | "createdAt">) {
    hydrate();
    state = [
      { ...input, id: crypto.randomUUID(), createdAt: Date.now() },
      ...state,
    ];
    emit();
  },
  update(id: string, patch: Partial<Omit<Transaction, "id" | "createdAt">>) {
    hydrate();
    state = state.map((t) => (t.id === id ? { ...t, ...patch } : t));
    emit();
  },
  remove(id: string) {
    hydrate();
    state = state.filter((t) => t.id !== id);
    emit();
  },
  clear() {
    state = [];
    emit();
  },
};
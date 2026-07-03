import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/lib/expense-store";
import { CATEGORIES } from "@/lib/categories";
import { totalsFor } from "@/lib/aggregations";
import { currency } from "@/lib/format";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Ledgerly" },
      { name: "description", content: "Search, filter, and manage your income and expenses." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const txs = useTransactions();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return [...txs]
      .filter((t) => (type === "all" ? true : t.type === type))
      .filter((t) => (cat === "all" ? true : t.categoryId === cat))
      .filter((t) => (query ? t.note.toLowerCase().includes(query) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [txs, q, type, cat]);

  const totals = totalsFor(filtered);

  return (
    <AppShell>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} entr{filtered.length === 1 ? "y" : "ies"} · Income{" "}
            <span className="font-medium text-[var(--income)]">{currency(totals.income)}</span> ·
            Expenses{" "}
            <span className="font-medium text-[var(--expense)]">{currency(totals.expense)}</span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TransactionList items={filtered} emptyLabel="No transactions match your filters." />
    </AppShell>
  );
}
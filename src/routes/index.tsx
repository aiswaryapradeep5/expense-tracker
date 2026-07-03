import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTransactions } from "@/lib/expense-store";
import {
  categoryBreakdown,
  inMonth,
  monthlyBreakdown,
  totalsFor,
} from "@/lib/aggregations";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const txs = useTransactions();
  const [open, setOpen] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthTx = useMemo(
    () => txs.filter((t) => inMonth(t, year, month)),
    [txs, year, month],
  );
  const totals = useMemo(() => totalsFor(monthTx), [monthTx]);
  const monthly = useMemo(() => monthlyBreakdown(txs, year), [txs, year]);
  const expenseByCat = useMemo(
    () => categoryBreakdown(monthTx, "expense").slice(0, 6),
    [monthTx],
  );
  const recent = useMemo(
    () => [...txs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
    [txs],
  );

  return (
    <AppShell>
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Your money, at a glance.
          </h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" /> New transaction
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

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Balance"
          value={totals.balance}
          tone="balance"
          icon={<PiggyBank className="h-5 w-5" />}
        />
        <StatCard
          label="Income this month"
          value={totals.income}
          tone="income"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
        <StatCard
          label="Expenses this month"
          value={totals.expense}
          tone="expense"
          icon={<ArrowDownRight className="h-5 w-5" />}
        />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border/60 bg-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Monthly trend</h2>
              <p className="text-xs text-muted-foreground">Income vs. expenses in {year}</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barCategoryGap={12}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `$${Math.round(v / 100) / 10}k`}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                  formatter={(v) => currency(Number(v))}
                />
                <Bar dataKey="income" fill="var(--income)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Where it went</h2>
          <p className="text-xs text-muted-foreground">Top categories this month</p>
          {expenseByCat.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
              No expenses yet this month.
            </div>
          ) : (
            <>
              <div className="mt-2 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCat}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {expenseByCat.map((s) => (
                        <Cell key={s.categoryId} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                        fontSize: 12,
                      }}
                      formatter={(v) => currency(Number(v))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {expenseByCat.map((s) => (
                  <li key={s.categoryId} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="flex-1 truncate">
                      {s.emoji} {s.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {Math.round(s.pct * 100)}%
                    </span>
                    <span className="tabular-nums font-medium">{currency(s.value)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent activity</h2>
        </div>
        <TransactionList items={recent} emptyLabel="Add your first transaction to get started." />
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "balance";
  icon: React.ReactNode;
}) {
  const toneColor =
    tone === "income"
      ? "text-[var(--income)]"
      : tone === "expense"
        ? "text-[var(--expense)]"
        : value >= 0
          ? "text-foreground"
          : "text-[var(--expense)]";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            tone === "income" && "bg-[color-mix(in_oklch,var(--income)_15%,transparent)] text-[var(--income)]",
            tone === "expense" && "bg-[color-mix(in_oklch,var(--expense)_15%,transparent)] text-[var(--expense)]",
            tone === "balance" && "bg-accent text-accent-foreground",
          )}
        >
          {icon}
        </span>
      </div>
      <p className={cn("mt-3 text-3xl font-bold tracking-tight tabular-nums", toneColor)}>
        {currency(value)}
      </p>
    </div>
  );
}
